const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./database/furniture.db");

async function createAdmin() {

    const password = await bcrypt.hash("admin123", 10);

    db.run(
        `
        INSERT INTO admins
        (name,email,password)
        VALUES (?,?,?)
        `,
        [
            "Administrator",
            "admin@example.com",
            password
        ],
        (err) => {

            if(err){
                console.log(err.message);
            } else {
                console.log("Admin Created");
            }

            db.close();
        }
    );
}

createAdmin();