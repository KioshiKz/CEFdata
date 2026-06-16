const fs = require("fs/promises");
const path = require("path");
const { mimeTypes } = require("./config");

function sendJson(response, statusCode, payload, headers = {}) {
    response.writeHead(statusCode, {
        "Content-Type": mimeTypes[".json"],
        ...headers
    });
    response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message, details) {
    sendJson(response, statusCode, {
        error: message,
        ...(details ? { details } : {})
    });
}

function parseCookies(request) {
    const header = request.headers.cookie || "";
    return Object.fromEntries(
        header
            .split(";")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => {
                const separatorIndex = item.indexOf("=");
                if (separatorIndex === -1) {
                    return [item, ""];
                }
                return [
                    decodeURIComponent(item.slice(0, separatorIndex)),
                    decodeURIComponent(item.slice(separatorIndex + 1))
                ];
            })
    );
}

function readRequestBuffer(request, limitBytes) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let totalBytes = 0;

        request.on("data", (chunk) => {
            totalBytes += chunk.length;
            if (totalBytes > limitBytes) {
                reject(Object.assign(new Error("Request body is too large"), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });

        request.on("end", () => resolve(Buffer.concat(chunks)));
        request.on("error", reject);
    });
}

async function readJsonBody(request, limitBytes = 1024 * 1024) {
    const buffer = await readRequestBuffer(request, limitBytes);
    if (!buffer.length) {
        return {};
    }

    try {
        return JSON.parse(buffer.toString("utf8"));
    } catch {
        const error = new Error("Invalid JSON body");
        error.statusCode = 400;
        throw error;
    }
}

async function sendFile(response, filePath, downloadName) {
    const content = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const headers = {
        "Content-Type": mimeTypes[extension] || "application/octet-stream"
    };

    if (downloadName) {
        headers["Content-Disposition"] = `inline; filename="${encodeURIComponent(downloadName)}"`;
    }

    response.writeHead(200, headers);
    response.end(content);
}

module.exports = {
    parseCookies,
    readJsonBody,
    readRequestBuffer,
    sendError,
    sendFile,
    sendJson
};
