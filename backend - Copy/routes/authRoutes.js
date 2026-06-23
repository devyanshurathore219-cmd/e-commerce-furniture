const express = require("express");
const router = express.Router();

const auth =
require("../controllers/authController");

router.get("/test", (req,res)=>{
    res.json({
        success:true,
        message:"Auth Route Working"
    });
});

router.post("/login", auth.login);

module.exports = router;