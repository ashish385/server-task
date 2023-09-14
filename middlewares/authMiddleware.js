const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User")
// auth
exports.auth = async (req, res, next) => {
    // console.log("cookie",req.cookies.token,"body",req.body,"heade," );
    try {
        // check json web token
        // console.log(req.cookies.token);
        // extract token
        console.log("cookie:",req.cookies.token,"body:",req.body,);
        const token = await req.cookies.token || req.body   ;
        console.log("token:",token);

        // if token is missing , then return response
        if (!token) {
             return res.status(401).json({
                success: false,
                message:'Token is missing',
            })
        }

        // verify token
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log("decode", decode);
            if (!decode) {
                return res.status(401).json({
                    success: false,
                    message:"wrong token"
                })
            }
            req.user = decode  /* set user data to req.user me */
        } catch (error) {
            // verification - issue
            console.log(error);
		console.log(error.message);
            return res.status(401).json({
                success: false,
                message:'token is missing'
            })
        }
        next();
    } catch (error) {
         console.log(error);
        console.log(error.message);
        return res.status(401).json({
            success: false,
            message:"Something went wrong while validating the token",
        })
    }
}

exports.isUser = async (req, res) => {
    try {
        if (req.user.accountType !== "User") {
           return res.status(401).json({
                success: false,
                message:"This is a protected route for User only"
            }) 
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:"User role cannot be verified, try again",
        })
    }
}

exports.isAdmin = async (req, res) => {
    try {
        if (req.user.accountType !== "Admin") {
             return res.status(401).json({
                success: false,
                message:"This is a protected route for Admin only"
            }) 
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:"User role cannot be verified, try again",
        })
    }
}

