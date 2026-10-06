const express = require("express");

const Complaint =
    require("../models/Complaint");

const Notification =
    require("../models/Notification");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// CREATE NEW COMPLAINT
// ============================================================

router.post(
    "/",
    protect,
    async (req, res) => {

        try {

            const {
                title,
                category,
                priority,
                department,
                description
            } = req.body;


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (
                !title ||
                !category ||
                !description
            ) {

                return res.status(400).json({

                    message:
                        "Title, category and description are required"

                });

            }


            // ------------------------------------------------
            // CREATE COMPLAINT
            // ------------------------------------------------

            const complaint =
                await Complaint.create({

                    title:
                        title.trim(),

                    category:
                        category.trim(),

                    priority:
                        priority || "Medium",

                    department:
                        department || "General",

                    description:
                        description.trim(),

                    status:
                        "Submitted",

                    user:
                        req.user.userId

                });


            // ------------------------------------------------
            // CREATE SUBMISSION NOTIFICATION
            // ------------------------------------------------

            await Notification.create({

                user:
                    req.user.userId,

                complaint:
                    complaint._id,

                title:
                    "Complaint Submitted",

                message:
                    `Your complaint "${complaint.title}" has been successfully submitted and is waiting for review.`,

                status:
                    "Submitted",

                type:
                    "submitted",

                isRead:
                    false

            });


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            res.status(201).json({

                message:
                    "Complaint submitted successfully",

                complaint:
                    complaint

            });


        } catch (error) {

            console.error(
                "Complaint creation error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to submit complaint"

            });

        }

    }
);


// ============================================================
// GET COMPLAINTS
//
// STUDENT:
// Only their own complaints
//
// ADMIN:
// All complaints
// ============================================================

router.get(
    "/",
    protect,
    async (req, res) => {

        try {

            let complaints;


            // ------------------------------------------------
            // ADMIN
            // ------------------------------------------------

            if (
                req.user.role === "admin"
            ) {

                complaints =
                    await Complaint
                        .find()
                        .populate(
                            "user",
                            "name email"
                        )
                        .sort({
                            createdAt: -1
                        });

            }

            // ------------------------------------------------
            // STUDENT
            // ------------------------------------------------

            else {

                complaints =
                    await Complaint
                        .find({
                            user:
                                req.user.userId
                        })
                        .sort({
                            createdAt: -1
                        });

            }


            res.json(
                complaints
            );


        } catch (error) {

            console.error(
                "Complaint fetch error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch complaints"

            });

        }

    }
);


// ============================================================
// GET SINGLE COMPLAINT
// ============================================================

router.get(
    "/:id",
    protect,
    async (req, res) => {

        try {

            const complaint =
                await Complaint
                    .findById(
                        req.params.id
                    )
                    .populate(
                        "user",
                        "name email"
                    );


            if (!complaint) {

                return res.status(404).json({

                    message:
                        "Complaint not found"

                });

            }


            // ------------------------------------------------
            // STUDENT CAN ONLY VIEW THEIR OWN COMPLAINT
            // ------------------------------------------------

            if (
                req.user.role !== "admin" &&
                complaint.user._id.toString() !==
                req.user.userId
            ) {

                return res.status(403).json({

                    message:
                        "You are not authorized to view this complaint"

                });

            }


            res.json(
                complaint
            );


        } catch (error) {

            console.error(
                "Single complaint error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch complaint"

            });

        }

    }
);


// ============================================================
// UPDATE COMPLAINT STATUS
//
// ADMIN ONLY
// ============================================================

router.put(
    "/:id",
    protect,
    adminOnly,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            // ------------------------------------------------
            // ALLOWED STATUS VALUES
            // ------------------------------------------------

            const allowedStatuses = [

                "Submitted",

                "Under Review",

                "In Progress",

                "Resolved"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid status"

                });

            }


            // ------------------------------------------------
            // FIND COMPLAINT
            // ------------------------------------------------

            const complaint =
                await Complaint.findById(
                    req.params.id
                );


            if (!complaint) {

                return res.status(404).json({

                    message:
                        "Complaint not found"

                });

            }


            // ------------------------------------------------
            // CHECK WHETHER STATUS ACTUALLY CHANGED
            // ------------------------------------------------

            const oldStatus =
                complaint.status;


            if (
                oldStatus === status
            ) {

                return res.status(400).json({

                    message:
                        "Complaint is already in this status"

                });

            }


            // ------------------------------------------------
            // UPDATE STATUS
            // ------------------------------------------------

            complaint.status =
                status;


            await complaint.save();


            // ------------------------------------------------
            // NOTIFICATION VARIABLES
            // ------------------------------------------------

            let notificationTitle =
                "Complaint Updated";


            let notificationMessage =
                `Your complaint "${complaint.title}" status has been updated to ${status}.`;


            let notificationType =
                "submitted";


            // ------------------------------------------------
            // UNDER REVIEW
            // ------------------------------------------------

            if (
                status === "Under Review"
            ) {

                notificationTitle =
                    "Complaint Under Review";


                notificationMessage =
                    `Your complaint "${complaint.title}" is now under review by the concerned department.`;


                notificationType =
                    "under_review";

            }


            // ------------------------------------------------
            // IN PROGRESS
            // ------------------------------------------------

            else if (
                status === "In Progress"
            ) {

                notificationTitle =
                    "Complaint In Progress";


                notificationMessage =
                    `Your complaint "${complaint.title}" is currently being worked on by the concerned department.`;


                notificationType =
                    "in_progress";

            }


            // ------------------------------------------------
            // RESOLVED
            // ------------------------------------------------

            else if (
                status === "Resolved"
            ) {

                notificationTitle =
                    "Complaint Resolved";


                notificationMessage =
                    `Your complaint "${complaint.title}" has been successfully resolved.`;


                notificationType =
                    "resolved";

            }


            // ------------------------------------------------
            // CREATE NOTIFICATION
            // ------------------------------------------------

            const notification =
                await Notification.create({

                    user:
                        complaint.user,

                    complaint:
                        complaint._id,

                    title:
                        notificationTitle,

                    message:
                        notificationMessage,

                    status:
                        status,

                    type:
                        notificationType,

                    isRead:
                        false

                });


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            res.json({

                message:
                    "Complaint updated successfully",

                complaint:
                    complaint,

                notification:
                    notification

            });


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to update complaint"

            });

        }

    }
);


module.exports = router;