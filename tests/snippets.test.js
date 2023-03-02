import { it, describe, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjc3Nzc4NTA4LCJleHAiOjE2Nzc4Mzg1MDh9.Hk_X8J_5RuK7RzrBEVATJzNzQbzDsHHHZDvBw6ckIzE";

// je décris sur quel endpoint je tape
describe("GET /snippets/1", () => {
  // on décrit ensuite ce qu'on teste
  it("responds with the correct JSON data", async () => {
    const response = await request(app)
      .get("/snippets/1")
      .set({ Authorization: `Bearer ${token}` })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
  });
});

// je décris sur quel endpoint je tape
describe("GET /snippets/12345", () => {
  // on décrit ensuite ce qu'on teste
  it("returns a 404 if snippet does not exist", async () => {
    const response = await request(app)
      .get("/snippets/12345")
      .set({ Authorization: `Bearer ${token}` })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(404, { error: "This snippet does not exist!" });
  });
});




