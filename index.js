const express = require("express");
const app = express();

const adminRoutes = require("./routes/Admin")
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 5000;

// database connection
database.connect();


// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/admin",adminRoutes);


// def routes
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running...."
    })
});

app.listen(PORT, () => {
    console.log(`Server is running at port no. ${PORT}`);
})