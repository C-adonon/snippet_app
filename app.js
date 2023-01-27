// import express
import express from "express";
import cors from "cors";
import user from "./routes/user.js";
import category from "./routes/category.js";

// initialize app
const app = express();

// port parameter, used at the end
const port = 3000;

// CORS
app.use(cors({}));

// for parsing application/json
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Router
app.use("/user", user);
app.use("/category", category);
// app.use("/snippet", snippet);

// Middlewear d'erreurs
app.use((err, req, res, next) => {
  // Erreurs auth
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ msg: "Vous n'avez pas accès à cette page" });
  }
  // autres erreurs à gérer
  return res.status(err.status).json({ error: err.message });
});

// run the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
