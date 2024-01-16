const express = require("express")
const router = express.Router();
const categoryController = require("../controllers/category");
const isAdmin = require("../middlewares/isAdmin");



router.get("/add-category",isAdmin,categoryController.getAddCategory)
router.post("/add-category",isAdmin,categoryController.postAddCategory)

router.get("/admin",isAdmin,categoryController.getAdmin)
router.get("/messages",isAdmin,categoryController.getMessages)

router.get("/categories",categoryController.getCategories)

router.get("/edit-category/:categoryid",isAdmin,categoryController.getEditCategory)
router.post("/edit-category",isAdmin,categoryController.postEditCategory)

router.get("/category/:categoryid",categoryController.getTheCategoryPage)

module.exports = router;    