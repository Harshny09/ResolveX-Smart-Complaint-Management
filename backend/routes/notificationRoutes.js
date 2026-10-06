const express = require("express");

const Notification =
    require("../models/Notification");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
// ============================================================

router.get(
    "/",
    protect,
    async (req, res) => {

        try {

            const notifications =
                await Notification
                    .find({
                        user: req.user.userId
                    })

                    .populate(
                        "complaint",
                        "title category status"
                    )

                    .sort({
                        createdAt: -1
                    });


            res.json(
                notifications
            );


        } catch (error) {

            console.error(
                "Notification fetch error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch notifications"

            });

        }

    }
);


// ============================================================
// GET UNREAD NOTIFICATION COUNT
// ============================================================

router.get(
    "/unread-count",
    protect,
    async (req, res) => {

        try {

            const count =
                await Notification.countDocuments({

                    user:
                        req.user.userId,

                    isRead:
                        false

                });


            res.json({

                count:
                    count

            });


        } catch (error) {

            console.error(
                "Unread count error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to get notification count"

            });

        }

    }
);


// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

router.put(
    "/:id/read",
    protect,
    async (req, res) => {

        try {

            const notification =
                await Notification.findOneAndUpdate(

                    {
                        _id:
                            req.params.id,

                        user:
                            req.user.userId
                    },

                    {
                        isRead:
                            true
                    },

                    {
                        new:
                            true
                    }

                );


            if (!notification) {

                return res.status(404).json({

                    message:
                        "Notification not found"

                });

            }


            res.json({

                message:
                    "Notification marked as read",

                notification:
                    notification

            });


        } catch (error) {

            console.error(
                "Mark notification error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to update notification"

            });

        }

    }
);


// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

router.put(
    "/read-all",
    protect,
    async (req, res) => {

        try {

            await Notification.updateMany(

                {
                    user:
                        req.user.userId,

                    isRead:
                        false
                },

                {
                    isRead:
                        true
                }

            );


            res.json({

                message:
                    "All notifications marked as read"

            });


        } catch (error) {

            console.error(
                "Read all error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to update notifications"

            });

        }

    }
);


module.exports = router;