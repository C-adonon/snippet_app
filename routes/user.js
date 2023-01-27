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

//
// ROUTE D'INSCRIPTION
//

router.post("/register", async (req, res, next) => {
  // Validation zod + Récupère indentifiants + mdp du formulaire
  let credentials;
  try {
    credentials = credentialsValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  // Vérifie s'il existe un user avec le même email
  const user = await prisma.users.findFirst({
    where: {
      email: credentials.email,
    },
  });
  if (user) return next(createHttpError(400, "This account already exists."));

  const hashedPassword = await bcrypt.hash(credentials.password, 10);

  await prisma.users.create({
    data: {
      photo: credentials.photo,
      email: credentials.email,
      password: hashedPassword,
    },
  });

  res.json({ msg: "You have successfully created an account!" });
});

//
// ROUTE DE CONNEXION
//

router.post("/login", async (req, res, next) => {
  // Validation zod + Récupère indentifiants + mdp du formulaire
  let credentials;
  try {
    credentials = credentialsValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }


  // Récupère indentifiants + mdp dans la BDD
  const user = await prisma.users.findFirst({
    where: {
      email: credentials.email,
    },
  });

  // Vérifie si l'email existe
  if (!user)
    return next(
      createHttpError(
        403,
        "Incorrect credentials : email/password is incorrect."
      )
    );

  // Vérifie le mdp
  const passwordIsGood = await bcrypt.compare(
    credentials.password,
    user.password
  );

  // Si le mdp est faux -> erreur
  if (!passwordIsGood)
    return next(
      createHttpError(
        403,
        "Incorrect credentials : email/password is incorrect."
      )
    );

  // Sinon crée un token
  res.json({
    token: jwt.sign(
      // payload
      { id: user.id },
      // clef pour signer le token
      process.env["JWT_KEY"],
      // durée du token
      {
        expiresIn: "70m",
      }
    ),
  });
});

//
// ROUTE DE MODIFICATION DES INFOS
//

router.patch("/", auth, async (req, res, next) => {
  const id = req.auth.id;
  let editedInfo;

  // Validation zod + récupère les informations à modifier
  try {
    editedInfo = editedInfoValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  //  Si on modifie le mdp -> Chiffre le mdp
  if (editedInfo.password) {
    editedInfo.password = await bcrypt.hash(editedInfo.password, 10);
  }

  // Met à jour la BDD
  const userInfo = await prisma.users.update({
    where: {
      id: id,
    },
    data: editedInfo,
  });

  res.json({ message: "Account successfully modified!" });
});

export default router;
