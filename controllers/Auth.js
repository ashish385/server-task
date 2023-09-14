const User = require("../models/User");
const Profile = require("../models/Profile");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// signup handler function
exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword,accountType, } = req.body;

        // validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
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

        // check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:"User is already registered!"
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // check validation
        if (!email || !password) {
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

// Controller for Changing Password
exports.changePassword =async (req, res) => {
    try {
        // Get user data from req.user
		// const userDetails = await User.findById(req.user.id);

        // Get old password, new password, and confirm new password from req.body
        const { email, oldPassword, newPassword, confirmNewPassword } = req.body;
        const userDetails = await User.findOne({ email: email });
        if (!userDetails) {
            return res.status(402).json({
                success: false,
                message: "user does not exist",
            })
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


