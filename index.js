const express = require("express");
const app = express();

const userRoutes = require("./routes/User");

const database = require("./config/database");

const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 5000;

// database connection
database.connect();


// middlewares
app.use(express.json());

// routes
app.use("/api/v1/auth",userRoutes);


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