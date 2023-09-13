const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/authMiddleware");

const { updateProfile, deleteAccount, getUserData, getAllUserDetails } = require("../controllers/Profile");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// update profie route
router.put("/updateProfile", auth, updateProfile);

// delete profile
router.delete("/deleteProfile", auth, deleteAccount);

// get user details route
router.post("/getUserData", auth, getUserData);

// get all user details
router.get("/getAllUserDetails", auth, getAllUserDetails);


// Export the router for use in the main application
module.exports = router