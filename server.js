const app =
    require("./backend/app");


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