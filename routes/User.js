// Import the required modules
const express = require("express")
const router = express.Router()

const {auth} = require("../middlewares/authMiddleware")

const { signup, login, changePassword } = require("../controllers/Auth");


// Routes for Login, Signup, and

// ********************************************************************************************************
//                                       routes
// ********************************************************************************************************

// route for login
router.post("/login", login);

// route for signup
router.post("/signup", signup);

// route for changing password
router.post("/change-password",auth, changePassword);

// Export the router for use in the main application
module.exports = router