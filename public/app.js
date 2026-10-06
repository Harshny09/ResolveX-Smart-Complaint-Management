/* =========================================================
   RESOLVEX - MAIN JAVASCRIPT
   Homepage + Navigation + Common Functions
   + Real-Time In-App Notifications
========================================================= */


/* =========================================================
   1. PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeRevealAnimations();

    initializeCounters();

    initializeSmoothNavigation();

    initializeSelectedCategory();

    if (
    !window.disableResolveXGlobalNotifications
) {
    initializeNotifications();
}

});


/* =========================================================
   2. REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {

    const revealElements =
        document.querySelectorAll(".reveal");

    if (!revealElements.length) {
        return;
    }

    const observer =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach((element) => {

        observer.observe(element);

    });

}


/* =========================================================
   3. COUNTER ANIMATION
========================================================= */

function initializeCounters() {

    const counters =
        document.querySelectorAll("[data-count]");

    if (!counters.length) {
        return;
    }


    counters.forEach((counter) => {

        const target =
            Number(counter.getAttribute("data-count"));

        let current = 0;

        const duration = 1200;

        const startTime = performance.now();


        function updateCounter(currentTime) {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(elapsed / duration, 1);

            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            current =
                Math.floor(target * easedProgress);

            counter.textContent = current;


            if (progress < 1) {

                requestAnimationFrame(
                    updateCounter
                );

            } else {

                counter.textContent = target;

            }

        }


        requestAnimationFrame(updateCounter);

    });

}


/* =========================================================
   4. HOMEPAGE NAVIGATION
========================================================= */

function initializeSmoothNavigation() {

    const navLinks =
        document.querySelectorAll(
            '.nav-links a[href^="#"]'
        );


    navLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");


            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }


            const target =
                document.querySelector(targetId);


            if (!target) {
                return;
            }


            event.preventDefault();


            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

}


/* =========================================================
   5. CATEGORY → SUBMIT PAGE
========================================================= */

function goToSubmitPage(category) {

    localStorage.setItem(
        "selectedComplaintCategory",
        category
    );


    window.location.href =
        "submit.html";

}


/* =========================================================
   6. LOAD SELECTED CATEGORY
========================================================= */

function initializeSelectedCategory() {

    const categorySelect =
        document.querySelector(
            "#category"
        );


    if (!categorySelect) {
        return;
    }


    const selectedCategory =
        localStorage.getItem(
            "selectedComplaintCategory"
        );


    if (!selectedCategory) {
        return;
    }


    const options =
        Array.from(
            categorySelect.options
        );


    const matchingOption =
        options.find(
            (option) =>
                option.value.toLowerCase() ===
                selectedCategory.toLowerCase()
                ||
                option.textContent.trim().toLowerCase() ===
                selectedCategory.toLowerCase()
        );


    if (matchingOption) {

        categorySelect.value =
            matchingOption.value;

    }

}


/* =========================================================
   7. LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem(
        "selectedComplaintCategory"
    );

    localStorage.removeItem(
        "shownNotificationIds"
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   8. PROTECTED PAGE CHECK
========================================================= */

function requireLogin() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}


/* =========================================================
   9. GET CURRENT USER
========================================================= */

function getCurrentUser() {

    try {

        const user =
            localStorage.getItem("user");


        if (!user) {
            return null;
        }


        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Unable to read user data:",
            error
        );

        return null;

    }

}


/* =========================================================
   10. API HELPER
========================================================= */

async function apiRequest(
    url,
    options = {}
) {

    const token =
        localStorage.getItem("token");


    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    try {

        const response =
            await fetch(url, {
                ...options,
                headers
            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Something went wrong"
            );

        }


        return data;

    } catch (error) {

        console.error(
            "API Error:",
            error
        );

        throw error;

    }

}


/* =========================================================
   11. NOTIFICATION SYSTEM
========================================================= */

/*
    ResolveX notification system.

    Notifications are stored in MongoDB.

    This frontend checks the backend every 5 seconds.

    When a new unread notification is found,
    a professional popup is displayed.
*/

function initializeNotifications() {

    const token =
        localStorage.getItem("token");


    /*
        Don't check notifications
        if the user is not logged in.
    */

    if (!token) {
        return;
    }


    /*
        Create notification popup container.
    */

    createNotificationContainer();


    /*
        Check immediately.
    */

    checkNotifications();


    /*
        Check every 5 seconds.
    */

    setInterval(
        checkNotifications,
        5000
    );

}


/* =========================================================
   12. CREATE NOTIFICATION CONTAINER
========================================================= */

function createNotificationContainer() {

    if (
        document.getElementById(
            "resolveXNotificationContainer"
        )
    ) {
        return;
    }


    const container =
        document.createElement("div");


    container.id =
        "resolveXNotificationContainer";


    container.innerHTML = `

        <div
            id="resolveXNotificationToast"
            class="resolveX-notification-toast"
        >

            <div class="resolveX-notification-icon">
                🔔
            </div>

            <div class="resolveX-notification-content">

                <div
                    id="resolveXNotificationTitle"
                    class="resolveX-notification-title"
                >
                    Notification
                </div>

                <div
                    id="resolveXNotificationMessage"
                    class="resolveX-notification-message"
                >
                    You have a new notification.
                </div>

            </div>

            <button
                type="button"
                class="resolveX-notification-close"
                onclick="closeResolveXNotification()"
            >
                ×
            </button>

        </div>

    `;


    document.body.appendChild(
        container
    );

}


/* =========================================================
   13. CHECK NOTIFICATIONS
========================================================= */

async function checkNotifications() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/notifications",
                {
                    method: "GET",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            console.warn(
                "Unable to fetch notifications"
            );

            return;
        }


        const notifications =
            await response.json();


        if (
            !Array.isArray(
                notifications
            )
        ) {
            return;
        }


        /*
            Only unread notifications.
        */

        const unreadNotifications =
            notifications.filter(
                (notification) =>
                    notification.isRead === false
            );


        if (
            unreadNotifications.length === 0
        ) {
            return;
        }


        /*
            Get notification IDs
            already displayed on this browser.
        */

        let shownNotificationIds = [];

        try {

            shownNotificationIds =
                JSON.parse(
                    localStorage.getItem(
                        "shownNotificationIds"
                    )
                ) || [];

        } catch (error) {

            shownNotificationIds = [];

        }


        /*
            Find a notification that
            has not been displayed yet.
        */

        const newNotification =
            unreadNotifications.find(
                (notification) =>
                    !shownNotificationIds.includes(
                        notification._id
                    )
            );


        if (!newNotification) {
            return;
        }


        /*
            Show popup.
        */

        showResolveXNotification(
            newNotification
        );


        /*
            Remember that this notification
            has already been displayed.
        */

        shownNotificationIds.push(
            newNotification._id
        );


        /*
            Keep only the latest 50 IDs.
        */

        if (
            shownNotificationIds.length > 50
        ) {

            shownNotificationIds =
                shownNotificationIds.slice(
                    -50
                );

        }


        localStorage.setItem(
            "shownNotificationIds",
            JSON.stringify(
                shownNotificationIds
            )
        );


        /*
            Mark notification as read
            after displaying it.
        */

        await markNotificationAsRead(
            newNotification._id
        );


    } catch (error) {

        console.error(
            "Notification check error:",
            error
        );

    }

}


/* =========================================================
   14. SHOW NOTIFICATION POPUP
========================================================= */

function showResolveXNotification(
    notification
) {

    createNotificationContainer();


    const toast =
        document.getElementById(
            "resolveXNotificationToast"
        );


    const title =
        document.getElementById(
            "resolveXNotificationTitle"
        );


    const message =
        document.getElementById(
            "resolveXNotificationMessage"
        );


    if (
        !toast ||
        !title ||
        !message
    ) {
        return;
    }


    /*
        Set notification content.
    */

    title.textContent =
        notification.title ||
        "ResolveX Notification";


    message.textContent =
        notification.message ||
        "You have a new notification.";


    /*
        Change icon depending on status.
    */

    const icon =
        toast.querySelector(
            ".resolveX-notification-icon"
        );


    if (icon) {

        if (
            notification.status ===
            "Resolved"
        ) {

            icon.textContent = "🎉";

        } else if (
            notification.status ===
            "In Progress"
        ) {

            icon.textContent = "🔄";

        } else if (
            notification.status ===
            "Under Review"
        ) {

            icon.textContent = "🔍";

        } else {

            icon.textContent = "🔔";

        }

    }


    /*
        Display popup.
    */

    toast.classList.add(
        "show"
    );


    /*
        Automatically hide after 6 seconds.
    */

    clearTimeout(
        window.resolveXNotificationTimer
    );


    window.resolveXNotificationTimer =
        setTimeout(() => {

            closeResolveXNotification();

        }, 6000);

}


/* =========================================================
   15. CLOSE NOTIFICATION POPUP
========================================================= */

function closeResolveXNotification() {

    const toast =
        document.getElementById(
            "resolveXNotificationToast"
        );


    if (!toast) {
        return;
    }


    toast.classList.remove(
        "show"
    );

}


/* =========================================================
   16. MARK NOTIFICATION AS READ
========================================================= */

async function markNotificationAsRead(
    notificationId
) {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        await fetch(
            `/api/notifications/${notificationId}/read`,
            {
                method: "PUT",

                headers: {
                    "Authorization":
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json"
                }
            }
        );

    } catch (error) {

        console.error(
            "Unable to mark notification as read:",
            error
        );

    }

}


/* =========================================================
   17. GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(
    "error",
    (event) => {

        console.error(
            "ResolveX error:",
            event.error
        );

    }
);


/* =========================================================
   18. MAKE FUNCTIONS AVAILABLE TO HTML
========================================================= */

window.goToSubmitPage =
    goToSubmitPage;

window.logout =
    logout;

window.requireLogin =
    requireLogin;

window.getCurrentUser =
    getCurrentUser;

window.apiRequest =
    apiRequest;

window.closeResolveXNotification =
    closeResolveXNotification;