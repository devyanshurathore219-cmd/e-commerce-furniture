const db = require("../database/db");
const bcrypt = require("bcrypt");

exports.login = (req,res)=>{

    const {email,password} = req.body;

    db.get(
        "SELECT * FROM admins WHERE email=?",
        [email],
        async (err,user)=>{

            if(err){
                return res.status(500).json(err);
            }

            if(!user){
                return res.status(401).json({
                    message:"User Not Found"
                });
            }

            const match =
            await bcrypt.compare(
                password,
                user.password
            );

            if(!match){
                return res.status(401).json({
                    message:"Wrong Password"
                });
            }

            // Generate a simple session token
            var token = Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);

            res.json({
                success:true,
                user:user.name,
                token: token
            });

        }
    );

};