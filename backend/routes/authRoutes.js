const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// ==========================================
// REGISTER USER
// POST /api/auth/register
// ==========================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        // Check required fields
        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }

        // Password validation
        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });

        }

        // Normalize email
        const normalizedEmail =
            email.toLowerCase().trim();

        // Check existing user
        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });

        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Default role
        let role = "student";

        // Admin account
        if (
            normalizedEmail ===
            "admin@resolvex.com"
        ) {
            role = "admin";
        }

        // Create user
        const user = await User.create({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: role

        });

        // Response
        res.status(201).json({

            success: true,

            message: "Account created successfully",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });

    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Registration failed"

        });

    }

});


// ==========================================
// LOGIN USER
// POST /api/auth/login
// ==========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }

        const normalizedEmail =
            email.toLowerCase().trim();

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }

        // Create JWT
        const token = jwt.sign(

            {
                userId:
                    user._id.toString(),

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        res.json({

            success: true,

            message:
                "Login successful",

            token: token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Login failed"

        });

    }

});


module.exports = router;