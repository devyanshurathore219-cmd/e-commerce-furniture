const db = require("../database/db");

// GET SPECIFICATIONS FOR A PRODUCT
exports.getSpecs = (req, res) => {

    const productId = req.params.productId;

    db.all(
        `SELECT * FROM product_specifications WHERE product_id = ?`,
        [productId],
        (err, rows) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
};

// CREATE SPECIFICATION
exports.createSpec = (req, res) => {

    const { product_id, spec_name, spec_value } = req.body;

    db.run(
        `
        INSERT INTO product_specifications
        (product_id, spec_name, spec_value)
        VALUES (?, ?, ?)
        `,
        [product_id, spec_name, spec_value],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                specId: this.lastID
            });

        }
    );
};

// DELETE SPECIFICATION
exports.deleteSpec = (req, res) => {

    const specId = req.params.id;

    db.run(
        "DELETE FROM product_specifications WHERE id = ?",
        [specId],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Specification not found" });
            }

            res.json({
                success: true,
                message: "Specification deleted successfully"
            });

        }
    );
};