const mongoose = require("mongoose");


// ============================================================
// CACHED MONGODB CONNECTION
// Reused across requests (and warm serverless invocations)
// ============================================================

let connectionPromise = null;


async function connectDB() {

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const MONGO_URI =
        process.env.MONGO_URI;

    if (!MONGO_URI) {
        throw new Error(
            "MONGO_URI environment variable is missing"
        );
    }

    if (!connectionPromise) {

        connectionPromise = mongoose
            .connect(MONGO_URI)
            .then(() => {
                console.log(
                    "✅ MongoDB Connected Successfully"
                );
                return mongoose.connection;
            })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });

    }

    return connectionPromise;

}

module.exports = connectDB;
