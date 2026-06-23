const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// GET ALL CATEGORIES
router.get("/", categoryController.getCategories);

// GET SINGLE CATEGORY BY ID
router.get("/:id", categoryController.getCategoryById);

// ADD CATEGORY
router.post("/", categoryController.createCategory);

// UPDATE CATEGORY
router.put("/:id", categoryController.updateCategory);

// DELETE CATEGORY
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;