const fs = require("fs/promises");
const path = require("path");
const { mimeTypes, rootDir } = require("./config");
const { sendError } = require("./http-utils");

function resolveStaticPath(urlPath) {
    const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
    const requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
    const staticPath = path.normalize(path.join(rootDir, requestedPath));
    const relativePath = path.relative(rootDir, staticPath);
    const normalizedRelativePath = relativePath.split(path.sep).join("/");

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return null;
    }

    if (normalizedRelativePath.startsWith("storage/") || normalizedRelativePath === "data/app-data.json") {
        return null;
    }

    return staticPath;
}

async function handleStatic(response, url) {
    const staticPath = resolveStaticPath(url.pathname);
    if (!staticPath) {
        sendError(response, 403, "Forbidden");
        return;
    }

    try {
        const content = await fs.readFile(staticPath);
        const extension = path.extname(staticPath).toLowerCase();
        const headers = { "Content-Type": mimeTypes[extension] || "application/octet-stream" };
        if ([".html", ".js", ".css"].includes(extension)) {
            headers["Cache-Control"] = "no-cache";
        }
        response.writeHead(200, headers);
        response.end(content);
    } catch (error) {
        if (error.code === "ENOENT") {
            sendError(response, 404, "File not found");
            return;
        }

        throw error;
    }
}

module.exports = {
    handleStatic
};
