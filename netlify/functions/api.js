const serverless = require("serverless-http");

const app = require("../../backend/app");


// ============================================================
// RUN THE EXPRESS API AS A NETLIFY FUNCTION
// Requests to /api/* are routed here via netlify.toml
// ============================================================

module.exports.handler = serverless(app, {

    // Direct calls arrive as /.netlify/functions/api/...;
    // map them back to the /api/... routes Express expects
    request(req) {
        req.url = req.url.replace(
            /^\/\.netlify\/functions\/api/,
            "/api"
        );
    }

});
