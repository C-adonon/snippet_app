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
router.post("/", auth, async (req, res, next) => {});
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
