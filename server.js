const http = require("http");
const { port } = require("./server/config");
const { sendError } = require("./server/http-utils");
const { handleApi } = require("./server/routes");
const { handleStatic } = require("./server/static-files");

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    try {
        if (url.pathname.startsWith("/api/")) {
            await handleApi(request, response, url);
            return;
        }

        await handleStatic(response, url);
    } catch (error) {
        console.error(error);
        sendError(response, error.statusCode || 500, error.message || "Server error");
    }
});

server.listen(port, () => {
    console.log(`Official website is running at http://localhost:${port}`);
});
