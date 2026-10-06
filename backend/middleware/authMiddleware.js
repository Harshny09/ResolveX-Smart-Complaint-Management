const jwt = require("jsonwebtoken");


// =====================================================
// PROTECT ROUTES
// =====================================================

function protect(req, res, next) {

    const authHeader =
        req.headers.authorization;


    // Check Authorization header
    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return res.status(401).json({

            message:
                "Authentication required"

        });

    }


    // Extract token
    const token =
        authHeader.split(" ")[1];


    try {

        // Verify token
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Store user information
        // inside request
        req.user = decoded;


        next();


    } catch (error) {

        return res.status(401).json({

            message:
                "Invalid or expired token"

        });

    }

}


// =====================================================
// ADMIN ONLY
// =====================================================

function adminOnly(req, res, next) {

    if (
        !req.user ||
        req.user.role !== "admin"
    ) {

        return res.status(403).json({

            message:
                "Admin access required"

        });

    }


    next();

}


module.exports = {

    protect,

    adminOnly

};