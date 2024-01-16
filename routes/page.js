const express = require("express")
const router = express.Router();

const pageController = require("../controllers/page")

router.get("/",pageController.getIndex)
router.get("/about",pageController.getAbout)
router.get("/contact",pageController.getContact)
router.post("/contact",pageController.postContact)
module.exports = router