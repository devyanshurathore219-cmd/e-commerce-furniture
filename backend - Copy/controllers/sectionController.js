const db = require("../database/db");

// GET ALL SECTIONS OF A PRODUCT

exports.getSections = (req, res) => {

    const productId = req.params.productId;

    db.all(
        `
        SELECT *
        FROM product_sections
        WHERE product_id = ?
        ORDER BY sort_order ASC
        `,
        [productId],
        (err, rows) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(rows);
        }
    );
};


// CREATE SECTION

exports.createSection = (req, res) => {

    const {
        product_id,
        section_type,
        title,
        subtitle,
        content,
        image,
        button_text,
        button_link,
        sort_order
    } = req.body;

    db.run(
        `
        INSERT INTO product_sections
        (
            product_id,
            section_type,
            title,
            subtitle,
            content,
            image,
            button_text,
            button_link,
            sort_order
        )
        VALUES (?,?,?,?,?,?,?,?,?)
        `,
        [
            product_id,
            section_type,
            title,
            subtitle,
            content,
            image,
            button_text,
            button_link,
            sort_order
        ],
        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                success:true,
                sectionId:this.lastID
            });

        }
    );

};

// UPDATE SECTION

exports.updateSection = (req, res) => {

    const sectionId = req.params.id;
    const {
        product_id,
        section_type,
        title,
        subtitle,
        content,
        image,
        button_text,
        button_link,
        sort_order
    } = req.body;

    db.run(
        `
        UPDATE product_sections
        SET
            product_id = ?,
            section_type = ?,
            title = ?,
            subtitle = ?,
            content = ?,
            image = ?,
            button_text = ?,
            button_link = ?,
            sort_order = ?
        WHERE id = ?
        `,
        [
            product_id,
            section_type,
            title,
            subtitle,
            content,
            image,
            button_text,
            button_link,
            sort_order,
            sectionId
        ],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Section not found" });
            }

            res.json({
                success: true,
                changes: this.changes
            });

        }
    );

};

// DELETE SECTION

exports.deleteSection = (req, res) => {

    const sectionId = req.params.id;

    db.run(
        "DELETE FROM product_sections WHERE id = ?",
        [sectionId],
        function(err){

            if(err){
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Section not found" });
            }

            res.json({
                success: true,
                message: "Section deleted successfully"
            });

        }
    );

};
