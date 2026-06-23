const db = require("../database/db");

// GET ALL PRODUCTS (with optional category filter)
exports.getProducts = (req, res) => {

    const { category_id } = req.query;

    let query = "SELECT * FROM products";
    let params = [];

    if (category_id) {
        query += " WHERE category_id = ?";
        params.push(category_id);
    }

    query += " ORDER BY created_at DESC";

    db.all(
        query,
        params,
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
};

// GET SINGLE PRODUCT BY ID
exports.getProductById = (req, res) => {

    const productId = req.params.id;

    db.get(
        "SELECT * FROM products WHERE id = ?",
        [productId],
        (err, row) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (!row) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            res.json(row);
        }
    );
};

// GET GALLERY FOR A PRODUCT
exports.getGallery = (req, res) => {

    const productId = req.params.id;

    db.all(
        "SELECT * FROM product_gallery WHERE product_id = ? ORDER BY sort_order ASC",
        [productId],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
};

// GET FAQS FOR A PRODUCT
exports.getFaqs = (req, res) => {

    const productId = req.params.id;

    db.all(
        "SELECT * FROM product_faqs WHERE product_id = ?",
        [productId],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
};

// GET SPECIFICATIONS FOR A PRODUCT
exports.getSpecs = (req, res) => {

    const productId = req.params.id;

    db.all(
        "SELECT * FROM product_specifications WHERE product_id = ?",
        [productId],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
};

// ADD PRODUCT
exports.createProduct = (req, res) => {

    const {
        name,
        slug,
        brand,
        price,
        sale_price,
        short_description,
        sku,
        category_id,
        status,
        featured
    } = req.body;

    db.run(
        `
        INSERT INTO products
        (name, slug, brand, price, sale_price, short_description, sku, category_id, status, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            name || "",
            slug || "",
            brand || "",
            price || 0,
            sale_price || null,
            short_description || "",
            sku || "",
            category_id || null,
            status || "draft",
            featured || 0
        ],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                productId: this.lastID
            });

        }
    );

};

// UPDATE PRODUCT
exports.updateProduct = (req, res) => {

    const productId = req.params.id;
    const {
        name,
        slug,
        brand,
        price,
        sale_price,
        short_description,
        sku,
        category_id,
        status,
        featured
    } = req.body;

    db.run(
        `
        UPDATE products
        SET name = ?, slug = ?, brand = ?, price = ?, sale_price = ?,
            short_description = ?, sku = ?, category_id = ?, status = ?, featured = ?
        WHERE id = ?
        `,
        [
            name || "",
            slug || "",
            brand || "",
            price || 0,
            sale_price || null,
            short_description || "",
            sku || "",
            category_id || null,
            status || "draft",
            featured || 0,
            productId
        ],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.json({
                success: true,
                changes: this.changes
            });

        }
    );

};

// DELETE PRODUCT
exports.deleteProduct = (req, res) => {

    const productId = req.params.id;

    // Delete related data first
    db.serialize(() => {
        db.run("DELETE FROM product_sections WHERE product_id = ?", [productId]);
        db.run("DELETE FROM product_gallery WHERE product_id = ?", [productId]);
        db.run("DELETE FROM product_faqs WHERE product_id = ?", [productId]);
        db.run("DELETE FROM product_specifications WHERE product_id = ?", [productId]);
        db.run("DELETE FROM products WHERE id = ?", [productId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.json({
                success: true,
                message: "Product deleted successfully"
            });
        });
    });

};
