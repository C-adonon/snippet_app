// import express
import express from "express";
import user from "./routes/user.js";
import categories from "./routes/categories.js";
import tags from "./routes/tags.js";
import snippets from "./routes/snippets.js";

// initialize app
export const app = express();

// for parsing application/json
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Router
app.use("/user", user);
app.use("/categories", categories);
app.use("/tags", tags);
app.use("/snippets", snippets);

// Middlewear d'erreurs
app.use((err, req, res, next) => {
  // Erreurs auth
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ msg: "Vous n'avez pas accès à cette page" });
  }
  if (err.name === "ErrorDocument") {
    return res.status(404).json({ msg: "Cette page n'existe pas" });
  }
  // autres erreurs à gérer
  return res.status(err.status).json({ error: err.message });
});
