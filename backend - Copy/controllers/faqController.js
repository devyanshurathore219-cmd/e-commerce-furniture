const db = require("../database/db");

// GET FAQS FOR A PRODUCT
exports.getFaqs = (req, res) => {

    const productId = req.params.productId;

    db.all(
        `SELECT * FROM product_faqs WHERE product_id = ?`,
        [productId],
        (err, rows) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
};

// CREATE FAQ
exports.createFaq = (req, res) => {

    const { product_id, question, answer } = req.body;

    db.run(
        `
        INSERT INTO product_faqs
        (product_id, question, answer)
        VALUES (?, ?, ?)
        `,
        [product_id, question, answer],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                faqId: this.lastID
            });

        }
    );
};

// DELETE FAQ
exports.deleteFaq = (req, res) => {

    const faqId = req.params.id;

    db.run(
        "DELETE FROM product_faqs WHERE id = ?",
        [faqId],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "FAQ not found" });
            }

            res.json({
                success: true,
                message: "FAQ deleted successfully"
            });

        }
    );
};