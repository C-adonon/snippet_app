import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { credentialsValidator } from "../validators/credentialsValidator.js";
import { editedInfoValidator } from "../validators/editedInfoValidator.js";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { expressjwt } from "express-jwt";

const router = express.Router();
const prisma = new PrismaClient();

// Middlewear d'authentification
const auth = expressjwt({
  secret: process.env["JWT_KEY"],
  algorithms: ["HS256"],
});

router.get("/all", auth, async (req, res, next) => {});

export default router;
