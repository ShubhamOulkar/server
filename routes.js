const express = require("express");
const Joi = require("joi");
const {
  getAllDocuments,
  getDocumentByName,
  storeInDb,
  updateCategory,
  deleteCategory,
} = require("./db");
const router = express.Router();

function validateRequest(body) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });

  return schema.validate(body);
}

router.get("/api/category", async (req, res) => {
  await getAllDocuments(res);
});

router.get("/api/category/:name", async (req, res) => {
  await getDocumentByName(req, res);
});

router.post("/api/category", async (req, res) => {
  const { error } = validateRequest(req.body);
  if (error) return res.status(400).send(JSON.stringify(error));

  const newCat = {
    name: req.body.name,
  };

  await storeInDb(res, newCat);
});

router.put("/api/category/:name", async (req, res) => {
  const { error } = validateRequest(req.body);
  if (error) return res.status(400).send(JSON.stringify(error));

  await updateCategory(req, res);
});

router.delete("/api/category/delete/:name", async (req, res) => {
  await deleteCategory(req, res);
});

module.exports = router;
