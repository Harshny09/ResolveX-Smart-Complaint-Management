const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");


// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();

const connectDB =
    require("./db");


// =====================================================
// IMPORT ROUTES
// =====================================================

const authRoutes =
    require("./routes/authRoutes");

const complaintRoutes =
    require("./routes/complaintRoutes");

const notificationRoutes =
    require("./routes/notificationRoutes");


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// ENSURE DATABASE CONNECTION FOR API REQUESTS
// =====================================================

app.use(
    "/api",
    async (req, res, next) => {

        if (req.path === "/test") {
            return next();
        }

        try {

            await connectDB();

            next();

        } catch (error) {

            console.error(
                "❌ MongoDB Connection Failed:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Database connection failed"

            });

        }

    }
);


// =====================================================
// SERVE FRONTEND
// =====================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "..",
            "public"
        )
    )
);


// =====================================================
// AUTH API
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);


// =====================================================
// COMPLAINT API
// =====================================================

app.use(
    "/api/complaints",
    complaintRoutes
);


// =====================================================
// NOTIFICATION API
// =====================================================

app.use(
    "/api/notifications",
    notificationRoutes
);


// =====================================================
// BACKEND TEST API
// =====================================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "ResolveX backend is working!"

        });

    }
);


// =====================================================
// HOME PAGE
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "..",
                "public",
                "index.html"
            )
        );

    }
);


// =====================================================
// API 404 HANDLER
// =====================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        });

    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
);


module.exports = app;
