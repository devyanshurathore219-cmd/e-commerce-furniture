const express = require("express");

const router = express.Router();

const faq = require("../controllers/faqController");

// GET /api/faqs/:productId - Get FAQs for a product
router.get(
    "/:productId",
    faq.getFaqs
);

// POST /api/faqs - Create a new FAQ
router.post(
    "/",
    faq.createFaq
);

// DELETE /api/faqs/:id - Delete a FAQ
router.delete(
    "/:id",
    faq.deleteFaq
);

module.exports = router;