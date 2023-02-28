import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { modifiedSnippetValidator } from "../validators/modifiedSnippetValidator.js";
import { snippetValidator } from "../validators/snippetValidator.js";
import createHttpError from "http-errors";
import { expressjwt } from "express-jwt";
import { snippetPagination } from "../utils/pagination.js";

const router = express.Router();
const prisma = new PrismaClient();

// Middlewear d'authentification
const auth = expressjwt({
  secret: process.env["JWT_KEY"],
  algorithms: ["HS256"],
});

//
// CREATION DE SNIPPETS
//
router.post("/", auth, async (req, res, next) => {
  const currentUserId = req.auth.id;
  // Validation zod + Récupère des datas du snippet
  let snippet;
  try {
    snippet = snippetValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  // Vérifie si le snippet possède un titre
  // Si non, on retourne une erreur
  // Sinon, on continue
  if (!snippet.title)
    return next(createHttpError(400, "You must provide a title!"));

  // Vérifie si le tableau de snippet.tags est de type Undefined
  // Si oui, on retourne un tableau vide
  // Sinon, on continue
  if (!snippet.tags ?? undefined) {
    snippet.tags = [];
  }

  // Vérifie si tous les tags dans snippet.tags existent tous dans la BDD
  const checkTags = await prisma.tags.findMany({
    where: {
      id: {
        in: snippet.tags,
      },
    },
  });
  if (checkTags.length !== snippet.tags.length)
    return next(
      createHttpError(
        404,
        "One or more tags you are looking for does not exist!"
      )
    );

  // Vérifie si la catégorie existe
  const checkCategory = await prisma.categories.findFirst({
    where: {
      id: snippet.category_id,
    },
  });
  if (!checkCategory)
    return next(
      createHttpError(404, "The category you are looking for does not exist!")
    );

  // Crée un snippet à partir des données reçues et envoie dans la BDD
  const newSnippet = await prisma.snippets.create({
    data: {
      title: snippet.title,
      content: snippet.content,
      user_id: { connect: { id: currentUserId } },
      category_id: { connect: { id: snippet.category_id } },
      tags: {
        connect: snippet.tags.map((id) => {
          return { id };
        }),
      },
    },
  });
  res.json({ msg: "You have successfully created a snippet!" });
});

//
// MODIFICATION DES SNIPPETS
//

router.patch("/:id([0-9]+)", auth, async (req, res, next) => {
  const snippet_id = parseInt(req.params.id);
  const currentUserId = req.auth.id;
  let modifiedSnippet;

  // Validation zod + Récupère des datas à mofifier dans le snippet
  try {
    modifiedSnippet = modifiedSnippetValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  // Vérifie si le snippet existe
  const checkSnippet = await prisma.snippets.findFirst({
    where: {
      id: snippet_id,
      usersId: currentUserId,
    },
  });
  if (!checkSnippet)
    return next(createHttpError(404, "This snippet does not exist!"));

  // Vérifie que le champs categorie existe lorsque l'on change la catégorie du snippet
  const checkCategory = await prisma.categories.findFirst({
    where: {
      id: modifiedSnippet.category_id,
    },
  });
  if (!checkCategory)
    return next(
      createHttpError(404, "The category you are looking for does not exist!")
    );

  // Vérifie que tous les champs tags existe lorsque l'on change les tags du snippet
  if (modifiedSnippet.tags !== undefined) {
    // Vérifie si tous les tags dans snippet.tags existent tous dans la BDD
    const checkTags = await prisma.tags.findMany({
      where: {
        id: {
          in: modifiedSnippet.tags,
        },
      },
    });
    if (checkTags.length !== modifiedSnippet.tags.length)
      return next(
        createHttpError(
          404,
          "One or more tags you are looking for does not exist!"
        )
      );
  }

  // Vérifie que le champs titre ne soit pas vide lorsque l'on change le titre du snippet
  if (modifiedSnippet.title !== undefined) {
    if (modifiedSnippet.title === "")
      return next(createHttpError(400, "You must provide a valid title!"));
  }

  // 
  let connectOptions = {};

  if (modifiedSnippet.category_id) {
    connectOptions["category_id"] = {
      connect: {
        id: modifiedSnippet.category_id,
      },
    };
  }

  if (modifiedSnippet.tags) {
    connectOptions["tags"] = {
      set: modifiedSnippet.tags.map((id) => {
        return { id };
      }),
    };
  }

  // Update les tags du snippet en fonction des données reçues
  const updateSnippetTags = await prisma.snippets.update({
    where: {
      id: snippet_id,
    },
    data: {
      title: modifiedSnippet.title,
      content: modifiedSnippet.content,
      updated_at: new Date(),
      ...connectOptions,
    },
  });
  res.json({ updateSnippetTags, message: "Snippet successfully modified!" });
});


//
// LISTE LES SNIPPETS
//

// Gets all the snippets of the currents user
router.get("/", auth, async (req, res, next) => {
  const currentUserId = req.auth.id;
  const snippets = await prisma.snippets.findMany({
    where: {
      usersId: currentUserId,
    },
    include: {
      tags: true,
      category_id: true,
    },
  });
  res.json(snippets);
});

// Gets a specified snippets
router.get("/:id([0-9]+)", auth, async (req, res, next) => {
  const currentUserId = req.auth.id;
  const snippet_id = parseInt(req.params.id);
  // Récupérer le snippet
  const checkSnippet = await prisma.snippets.findFirst({
    where: {
      id: snippet_id,
      usersId: currentUserId,
    },
    include: {
      tags: true,
      category_id: true,
    },
  });
  if (!checkSnippet)
    return next(createHttpError(404, "This snippet does not exist!"));
  res.json(checkSnippet);
});


//
// SUPPRESSION DES SNIPPETS
//
router.delete("/:id([0-9]+)", auth, async (req, res, next) => {
  const snippet_id = parseInt(req.params.id);
  const currentUserId = req.auth.id;

  // Vérifie si le snippet existe
  const checkSnippet = await prisma.snippets.findFirst({
    where: {
      id: snippet_id,
      usersId: currentUserId,
    },
  });
  if (!checkSnippet)
    return next(createHttpError(404, "This snippet does not exist!"));

  // Supprime le snippet
  const deleteSnippet = await prisma.snippets.delete({
    where: {
      id: snippet_id,
    },
  });
  res.json({ message: "Snippet successfully deleted!" });
});
export default router;
