// Import the required modules
const express = require("express")
const router = express.Router()

const { signup, login } = require("../controllers/Auth");

// Routes for Login, Signup, and

// ********************************************************************************************************
//                                       routes
// ********************************************************************************************************

// route for login
router.post("/login", login);

// route for signup
router.post("/signup", signup);

// Export the router for use in the main application
module.exports = router