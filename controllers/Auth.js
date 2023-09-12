const User = require("../models/User");
require("dotenv").config();

// signup handler function
exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmpassword } = req.body;

        // validation
        if (!name || !email || !password || !confirmpassword) {
            return res.status(400).json({
                success: false,
                message:"All field required!"
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

        // create user
        const user = await User.create({
            name,
            email,
            password
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
        const user = await User.findOne({ email });
        if (!user) {
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message:"User is not registered, Please signup first"
            })
        }

        return res.status(200).json({
            success: true,
			user,
			message: `User Login Success`,
        })
    } catch (error) {
        console.log(error);
         console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Login failure, Please try again! ",
        })
    }
}


