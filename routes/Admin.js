// Import the required modules
const express = require("express")
const router = express.Router()

const { auth } = require("../middlewares/authMiddleware");

const {adminSignup,
    adminLogin,
    updateAdminProfile,
    getAllUsers,
    getUserDetails,
    changeAdminPassword,
    updateUserProfile,
    deleteUserAccount
} = require('../controllers/Admin');
const { route } = require("./User");


// Routes for Login, Signup, and

// ********************************************************************************************************
//                                       routes
// ********************************************************************************************************

// route for admin signup
router.post("/admin-signup", adminSignup);

// route for admin login
router.post("/admin-login", adminLogin);

// route for get user details by id
router.post("/user-details", auth, getUserDetails);

// route for change Admin password
router.put("/change-admin-password", changeAdminPassword);

// route for update admimn profile
router.put("/update-admin-profile",auth, updateAdminProfile);

// route for all user details
router.get("/all-user", auth, getAllUsers);

// delete user account
router.delete("/delete-user",auth,deleteUserAccount)



// route for update user Profile by admin
router.put("/update-user-profile", updateUserProfile);

// Export the router for use in the main application
module.exports = router