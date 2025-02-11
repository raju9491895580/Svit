require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const users = []; // Temporary storage (Use a database in production)

// Register User
app.post("/register", async (req, res) => {
    const { studentID, password } = req.body;

    // Check if student already exists
    const existingUser = users.find((user) => user.studentID === studentID);
    if (existingUser) return res.status(400).json({ message: "Student ID already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ studentID, password: hashedPassword });

    res.status(201).json({ message: "Registration successful" });
});

// Login User
app.post("/login", async (req, res) => {
    const { studentID, password } = req.body;

    // Check user existence
    const user = users.find((user) => user.studentID === studentID);
    if (!user) return res.status(400).json({ message: "Invalid Student ID or Password" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Student ID or Password" });

    // Generate a JWT token
    const token = jwt.sign({ studentID }, "your_jwt_secret", { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
