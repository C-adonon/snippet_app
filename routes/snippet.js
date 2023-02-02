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

  // Vérifie si le snippet est de type Undefined
  // Si oui, on retourne un tableau vide
  // Sinon, on continue
  if (!snippet.tags) {
    snippet.tags = [];
  }

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
router.patch("/:id([0-9]+)", auth, async (req, res, next) => {});

//
// LISTE LES SNIPPETS
//
router.get("/", auth, async (req, res, next) => {});

//
// SUPPRESSION DES SNIPPETS
//
router.delete("/:id([0-9]+)", auth, async (req, res, next) => {});
export default router;
