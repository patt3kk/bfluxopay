const express = require("express");
const { register, login, uploadPicture, userAccounts, updateAccountStatus, handleRefreshToken, adminRegister, adminLogin, logout, userCheckToken } = require("../controllers/account.controller");
const { userRequired, adminRequired } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/user/register", register)

router.post("/user/login", login)
// Add simplified login endpoint as requested
router.post("/login", login)
// 
router.post("/user/uploadPicture", userRequired, uploadPicture )
router.get("/user/accounts", adminRequired,  userAccounts)
router.put("/user/update-state", adminRequired, updateAccountStatus)
router.post("/user/logout", userRequired, logout)
router.post("/user/handleRefreshToken", handleRefreshToken)
router.post("/admin/adminRegister", adminRegister)
router.post("/admin/adminLogin", adminLogin)
router.post("/user/usertoken", userRequired, userCheckToken)

module.exports = router;