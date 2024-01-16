const express = require("express")
const router = express.Router();
const accountController = require("../controllers/account")

const loginRegisterEngelleme = require("../middlewares/loginRegisterEngelleme")
const authenticationEngelleme = require("../middlewares/authenticationEngelleme")

router.get("/register",loginRegisterEngelleme,accountController.getRegister)
router.post("/register",loginRegisterEngelleme,accountController.postRegister)

router.get("/login",loginRegisterEngelleme,accountController.getLogin)
router.post("/login",loginRegisterEngelleme,accountController.postLogin)

router.get("/logout",authenticationEngelleme,accountController.getLogout)

router.get("/dashboard",authenticationEngelleme,accountController.getDashboard)


const userKendiMiDegilMi = require("../middlewares/userKendiMiDegilMi")
router.get("/user/:userid",userKendiMiDegilMi,accountController.getTheUser)

router.get("/profil-photo",authenticationEngelleme,accountController.getProfilPhoto)
router.post("/profil-photo",authenticationEngelleme,accountController.postProfilPhoto)

router.post("/send-message",authenticationEngelleme,accountController.postSendMessage)

router.get("/follow/:userid",authenticationEngelleme,accountController.getFollow)
router.get("/unfollow/:userid",authenticationEngelleme,accountController.getUnfollow)

router.get("/followings",authenticationEngelleme,accountController.getFollowings)
router.get("/followers",authenticationEngelleme,accountController.getFollowers)

router.get("/user/followings/:userid",authenticationEngelleme,accountController.getUserFollowings)
router.get("/user/followers/:userid",authenticationEngelleme,accountController.getUserFollowers)
module.exports = router