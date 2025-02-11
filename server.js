require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const users = []; // Temporary storage (Use a database in production)

const ADMIN_CREDENTIALS = {
    studentID: "admin",
    password: "Admin@123" // Change this to any password you like
};

// Register User
app.post("/register", async (req, res) => {
    const { studentID, password, role } = req.body;

    // Check if student already exists
    const existingUser = users.find((user) => user.studentID === studentID);
    if (existingUser) return res.status(400).json({ message: "Student ID already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ studentID, password: hashedPassword, role: role || "student" });

    res.status(201).json({ message: "Registration successful" });
});

// Login User (Admin & Student)
app.post("/login", async (req, res) => {
    const { studentID, password } = req.body;

    // Check if user is admin
    if (studentID === ADMIN_CREDENTIALS.studentID && password === ADMIN_CREDENTIALS.password) {
        const token = jwt.sign({ studentID, role: "admin" }, "your_jwt_secret", { expiresIn: "1h" });
        return res.json({ message: "Admin login successful", token, role: "admin" });
    }

    // Check user existence
    const user = users.find((user) => user.studentID === studentID);
    if (!user) return res.status(400).json({ message: "Invalid Student ID or Password" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Student ID or Password" });

    // Generate a JWT token
    const token = jwt.sign({ studentID, role: user.role }, "your_jwt_secret", { expiresIn: "1h" });

    res.json({ message: "Login successful", token, role: user.role });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

