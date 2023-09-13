const User = require("../models/User");
const Profile = require("../models/Profile");

// update profile
exports.updateProfile = async (req, res) => {
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
            message:"Profile updated successfully!"
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

// delete account
exports.deleteAccount = async (req, res) => {
    try {
        const id =await req.user.id;
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

// get user details
exports.getUserData = async (req, res) => {
    console.log("userDetails");
    try {
        const id =await req.user.id;
        const userDetails = await User.findById({ _id: id }, {
            password:false
        })
            .populate("additionalDetails")
            .exec();
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

// get all user details
exports.getAllUserDetails = async (req, res) => {
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