import express from "express";
import { PrismaClient } from "@prisma/client";
import { categoryValidator } from "../validators/categoryValidator.js";
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
// CREATION DE CATEGORIE
//

router.post("/", auth, async (req, res, next) => {
  // Stocke l'id du user de la session
  const currentUserId = req.auth.id;

  // Validation zod + Récupère l'id user + le nom de la catégorie
  let newCategory;
  try {
    newCategory = categoryValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  // Vérifie s'il existe déja une catégorie avec le même nom
  const category = await prisma.categories.findFirst({
    where: {
      name: newCategory.name,
      usersId: currentUserId,
    },
  });
  if (category)
    return next(createHttpError(400, "This category already exists."));

  // Crée la nouvelle category
  await prisma.categories.create({
    data: {
      name: newCategory.name,
      usersId: currentUserId,
    },
  });
  res.json({ message: "Category successfully created!" });
});

//
// CREATION DE CATEGORIE
//

router.patch("/:id([0-9]+)", auth, async (req, res, next) => {
  const category_id = parseInt(req.params.id);
  const currentUserId = req.auth.id;

  let modifiedCategory;

  // Validation zod + récupère les informations à modifier
  try {
    modifiedCategory = categoryValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  // Vérifie s'il existe déja une catégorie avec le même nom
  // Si oui erreur sinon on continue
  const category = await prisma.categories.findFirst({
    where: {
      id: category_id,
      name: modifiedCategory.name,
      usersId: currentUserId,
    },
  });
  if (category)
    return next(createHttpError(400, "This category already exists."));

  // Met à jour la BDD et modifie la catégorie
  const editCategory = await prisma.categories.update({
    where: {
      id: category_id,
    },
    data: modifiedCategory,
  });
  res.json({ message: "Category successfully modified!" });
});

//
// LISTE LES CATEGORIES
//

router.get("/", auth, async (req, res, next) => {
  const currentUserId = req.auth.id;

  // Récupère toutes les catégories de l'utilisateur
  const categories = await prisma.categories.findMany({
    where: {
      usersId: currentUserId,
    },
  });
  res.json(categories);
});

//
// SUPPRESSION DES CATEGORIES
//

router.delete("/:id([0-9]+)", auth, async (req, res, next) => {
  const category_id = parseInt(req.params.id);
  const currentUserId = req.auth.id;

  // Vérifie si la catégorie existe
  const category = await prisma.categories.findFirst({
    where: {
      id: category_id,
      usersId: currentUserId,
    },
  });
  if (!category)
    return next(createHttpError(400, "This category does not exist."));

  // Supprime la catégorie
  const deletcategory = await prisma.categories.delete({
    where: {
      id: category_id,
    },
  });
  res.json({ message: "Category successfully deleted!" });
});

export default router;
