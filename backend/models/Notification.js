const mongoose = require("mongoose");


// ============================================================
// NOTIFICATION SCHEMA
// ============================================================

const notificationSchema = new mongoose.Schema(
    {

        // ----------------------------------------------------
        // USER WHO SHOULD RECEIVE THE NOTIFICATION
        // ----------------------------------------------------

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ----------------------------------------------------
        // RELATED COMPLAINT
        // ----------------------------------------------------

        complaint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint",
            required: true
        },


        // ----------------------------------------------------
        // NOTIFICATION TITLE
        // ----------------------------------------------------

        title: {
            type: String,
            required: true,
            trim: true
        },


        // ----------------------------------------------------
        // NOTIFICATION MESSAGE
        // ----------------------------------------------------

        message: {
            type: String,
            required: true,
            trim: true
        },


        // ----------------------------------------------------
        // CURRENT COMPLAINT STATUS
        // ----------------------------------------------------

        status: {
            type: String,
            enum: [
                "Submitted",
                "Under Review",
                "In Progress",
                "Resolved"
            ],
            required: true
        },


        // ----------------------------------------------------
        // NOTIFICATION TYPE
        // ----------------------------------------------------

        type: {
            type: String,

            enum: [
                "submitted",
                "under_review",
                "in_progress",
                "resolved"
            ],

            default: "submitted"
        },


        // ----------------------------------------------------
        // READ / UNREAD
        // ----------------------------------------------------

        isRead: {
            type: Boolean,
            default: false
        }

    },

    {
        timestamps: true
    }
);


// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);