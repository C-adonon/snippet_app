import express from "express";
import { PrismaClient } from "@prisma/client";
import { tagValidator } from "../validators/tagValidator.js";
import { expressjwt } from "express-jwt";
import createHttpError from "http-errors";

const router = express.Router();
const prisma = new PrismaClient();

// Middlewear d'authentification
const auth = expressjwt({
  secret: process.env["JWT_KEY"],
  algorithms: ["HS256"],
});

//
// CREATION DE TAGS
//

router.post("/", auth, async (req, res, next) => {
  // Stocke l'id du user de la session
  const currentUserId = req.auth.id;

  // Validation zod + Récupère le nom du tag
  let newTag;
  try {
    newTag = tagValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  // Vérifie s'il existe déja un tag avec le même nom
  const tag = await prisma.tags.findFirst({
    where: {
      name: newTag.name,
      usersId: currentUserId,
    },
  });
  if (tag) return next(createHttpError(400, "This tag already exists."));

  // Crée un nouveau tag
  await prisma.tags.create({
    data: {
      name: newTag.name,
      usersId: currentUserId,
    },
  });
  res.json({ message: "Tag successfully created!" });
});

//
// MODIFICATION DES TAGS
//

router.patch("/:id([0-9]+)", auth, async (req, res, next) => {
  const tag_id = parseInt(req.params.id);
  const currentUserId = req.auth.id;

  let modifiedTag;

  // Validation zod + récupère les informations à modifier
  try {
    modifiedTag = tagValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  // Vérifie s'il existe déja une catégorie avec le même nom
  // Si oui erreur sinon on continue
  const tag = await prisma.tags.findFirst({
    where: {
      id: tag_id,
      name: modifiedTag.name,
      usersId: currentUserId,
    },
  });
  if (tag) return next(createHttpError(400, "This tag already exists."));

  // Met à jour la BDD et modifie la catégorie
  const editTag = await prisma.tags.update({
    where: {
      id: tag_id,
    },
    data: modifiedTag,
  });
  res.json({ message: "Tag successfully modified!" });
});

//
// LISTE LES TAGS
//

router.get("/", auth, async (req, res, next) => {
  const currentUserId = req.auth.id;

  // Récupère toutes les catégories de l'utilisateur
  const tags = await prisma.tags.findMany({
    where: {
      usersId: currentUserId,
    },
  });
  res.json(tags);
});

export default router;
