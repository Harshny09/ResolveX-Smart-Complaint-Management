const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");


// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();


// =====================================================
// IMPORT ROUTES
// =====================================================

const authRoutes =
    require("./backend/routes/authRoutes");

const complaintRoutes =
    require("./backend/routes/complaintRoutes");

const notificationRoutes =
    require("./backend/routes/notificationRoutes");


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
// SERVE FRONTEND
// =====================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// =====================================================
// MONGODB CONNECTION
// =====================================================

const MONGO_URI =
    process.env.MONGO_URI;


if (!MONGO_URI) {

    console.error("");
    console.error(
        "❌ ERROR: MONGO_URI is missing from .env"
    );
    console.error("");

} else {

    console.log("");
    console.log(
        "Connecting to MongoDB..."
    );


    mongoose
        .connect(MONGO_URI)

        .then(() => {

            console.log("");
            console.log(
                "======================================"
            );

            console.log(
                "✅ MongoDB Connected Successfully"
            );

            console.log(
                "Database: smartComplaintDB"
            );

            console.log(
                "======================================"
            );

            console.log("");

        })

        .catch((error) => {

            console.error("");
            console.error(
                "======================================"
            );

            console.error(
                "❌ MongoDB Connection Failed"
            );

            console.error(
                "======================================"
            );

            console.error(
                error.message
            );

            console.error("");

        });

}


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


// =====================================================
// SERVER PORT
// =====================================================

const PORT =
    process.env.PORT || 5000;


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "======================================"
        );

        console.log(
            `🚀 ResolveX running at http://localhost:${PORT}`
        );

        console.log(
            "======================================"
        );

        console.log("");

    }
);