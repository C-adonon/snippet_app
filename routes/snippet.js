import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { snippetValidator } from "../validators/snippetValidator.js";
import createHttpError from "http-errors";
import { expressjwt } from "express-jwt";

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
    modifiedSnippet = snippetValidator.parse(req.body);
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

  // Met à jour la BDD et modifie le snippet
  const editSnippet = await prisma.snippets.update({
    where: {
      id: snippet_id,
    },
    data: modifiedSnippet,
  });
  res.json({ message: "Snippet successfully modified!" });
});

//
// LISTE LES SNIPPETS
//
router.get("/", auth, async (req, res, next) => {});

//
// SUPPRESSION DES SNIPPETS
//
router.delete("/:id([0-9]+)", auth, async (req, res, next) => {});
export default router;
