const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// Admin signup
exports.adminSignup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, secretKey, accountType } = req.body;
        if (!name || !email || !password || !confirmPassword || !secretKey || !accountType) {
            return res.status(401).json({
                success: false,
                message:"All field required!"
            })
        }
        // 2 password match kr lo
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password  does not match, please try again"
            })
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:"User is already registered!"
            })
        }

        if (accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message:"Unauthorized access!"
            })
        }

        if (await secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(401).json({
                success: false,
                message:"wrong secret key!"
            })
        }

        // password hashed
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user

        // Create the Additional Profile For User
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber:null
        })
        // create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            accountType:accountType,
            additionalDetails:profileDetails.id
        })

        // return response
        res.status(200).json({
            success: true,
            message: "User registered Successfully!",
            user,
        })


     
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "User can't be registered, Please try again! ",
            error: error.message,
        })
    }
}

// Admin login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password , secretKey, accountType} = req.body;
        // check validation
        if (!email || !password || !secretKey || !accountType) {
           return res.status(400).json({
                success: false,
                message:"All field required!"
            })
        }

        // user exist or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message:"User is not registered, Please signup first"
            })
        }

        if (accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message:"Unauthorized access!"
            })
        }

        if (await secretKey !== process.env.ADMIN_SECRET_KEY) {
             return res.status(401).json({
                success: false,
                message:"wrong secret key!"
            })
        }

         // Generate JWT token and Compare Password
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                {
                    email: email, id: user._id, accountType: user.accountType
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            );

            // Save token to user document in database

            user.token = token;
            user.password = undefined;

            // Set cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
			    user,
			    message: `User Login Success`,
            })
        }
        else {
            return res.status(200).json({
            success: false,
			message: `Wrong password`,
        })
        }
    } catch (error) {
        console.log(error);
         console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Login failure, Please try again! ",
        })
    }
}

// update Admin Profile
exports.updateAdminProfile = async (req, res) => {
    try {
        console.log("userID",req.user.id);
        const {gender, dateOfBirth = "", about = "", contactNumber } = req.body;
        const id = req.user.id;

        // find the profile by id
        const userDetails = await User.findById({_id:id});
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message:"User not found!",
            })
        }
        const profile = await Profile.findById(userDetails.additionalDetails);

        // update the profile field
        profile.gender = gender;
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber

        // save the updated profile
        await profile.save();

        // return response 
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            profile
        })
    } catch (error) {
        console.log(error);
		return res.status(500).json({
            success: false,
            message:"something went wrong!",
			error: error.message,
		});
    }
}

// get all user details
exports.getAllUsers = async (req, res) => {
    try {
        const userDetails = await User.find({})
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
    } catch (error) {
       return res.status(500).json({
			success: false,
			message: error.message,
		}); 
    }
}

// change Admin password
exports.changeAdminPassword = async (req, res) => {
    try {
        // Get user data from req.user
		// const userDetails = await User.findById(req.user.id);

        // Get old password, new password, and confirm new password from req.body
        const { email, oldPassword, newPassword, confirmNewPassword,secretKey } = req.body;
        const userDetails = await User.findOne({ email: email });
        if (!userDetails) {
            return res.status(402).json({
                success: false,
                message: "user does not exist",
            })
        }

        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            // If secret key does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The secret key is incorrect" });
        }

        // Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
        );
        
        if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
        }
        
        // Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
        }
        
        // Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
        );

        // optional -> send verification mail
        
        // Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
}

// get user details by id
exports.getUserDetails = async (req, res) => {
    // console.log(req.user);
    try {
        const { id } = req.body;
        // const id = req.user.id;
        console.log("id", id);
        
        const user = await User.findById({ _id: id })
            .populate("additionalDetails")
            .exec();
        
        if (!user) {
            return res.status(500).json({
            success: false,
            message:"something went wrong!"
        })
        }
        
        return res.status(200).json({
            success: true,
            user,
            message:"fetch data successfully"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message:"something went wrong!"
        })
    }
}

// update user Profile by admin
exports.updateUserProfile = async (req, res) => {
    try {
        
        const {gender, dateOfBirth = "", about = "", contactNumber,id } = req.body;

        // find the profile by id
        const userDetails = await User.findById({_id:id});
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message:"User not found!",
            })
        }
        const profile = await Profile.findById(userDetails.additionalDetails);

        // update the profile field
        profile.gender = gender;
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber

        // save the updated profile
        await profile.save();

        // return response 
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            profile
        })
    } catch (error) {
        console.log(error);
		return res.status(500).json({
            success: false,
            message:"something went wrong!",
			error: error.message,
		});
    }
}

// delete user by id
exports.deleteUserAccount = async (req, res) => {
    try {
        const { id } = req.body;
		console.log(req.user.id);
        const user = await User.findById({ _id: id });
        
        if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
        }
        await Profile.findByIdAndDelete({ _id: user._id });
        // Now Delete User
		await User.findByIdAndDelete({ _id: id });
		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false, message: "User Cannot be deleted successfully"
        });
    }
}