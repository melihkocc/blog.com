const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog")
const isAdmin = require("../middlewares/isAdmin");
const authenticationEngelleme = require("../middlewares/authenticationEngelleme")

router.get("/add-blog",authenticationEngelleme,blogController.getAddBlog)
router.post("/add-blog",authenticationEngelleme,blogController.postAddBlog)

const blogSilmeEngelleme = require("../middlewares/blogSilmeEngelleme");
router.get("/delete-blog/:blogid",authenticationEngelleme,blogSilmeEngelleme,blogController.getDeleteBlog)

router.get("/blog/:blogid",blogController.getTheBlog);

router.get("/like-blog/:blogid",authenticationEngelleme,blogController.getLikeBlog)
router.get("/remove-like-blog/:blogid",authenticationEngelleme,blogController.getRemoveLikeBlog)
router.get("/my-likes-blogs",authenticationEngelleme,blogController.getMyLikesBlogs)

router.get("/followings-user-blogs",authenticationEngelleme,blogController.getFollowingsBlog)


module.exports = router;
