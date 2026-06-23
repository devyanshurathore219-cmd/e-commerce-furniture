const db = require("../database/db");

// GET GALLERY IMAGES
exports.getGallery = (req, res) => {

    const productId = req.params.productId;

    db.all(
        `SELECT * FROM product_gallery WHERE product_id = ? ORDER BY sort_order ASC`,
        [productId],
        (err, rows) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
};

// CREATE GALLERY IMAGE
exports.createGallery = (req, res) => {

    const { product_id, image, sort_order } = req.body;

    db.run(
        `
        INSERT INTO product_gallery
        (product_id, image, sort_order)
        VALUES (?, ?, ?)
        `,
        [product_id, image, sort_order],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                galleryId: this.lastID
            });

        }
    );
};

// DELETE GALLERY IMAGE
exports.deleteGallery = (req, res) => {

    const galleryId = req.params.id;

    db.run(
        "DELETE FROM product_gallery WHERE id = ?",
        [galleryId],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Gallery image not found" });
            }

            res.json({
                success: true,
                message: "Gallery image deleted successfully"
            });

        }
    );
};