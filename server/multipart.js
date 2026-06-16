const { maxUploadBytes } = require("./config");
const { readRequestBuffer } = require("./http-utils");

function getBoundary(contentType) {
    const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
    return match?.[1] || match?.[2] || null;
}

function parseContentDisposition(value) {
    const result = {};
    String(value || "").split(";").forEach((part) => {
        const [rawKey, rawValue] = part.trim().split("=");
        if (!rawValue) {
            return;
        }
        result[rawKey] = rawValue.replace(/^"|"$/g, "");
    });
    return result;
}

async function parseMultipart(request) {
    const boundary = getBoundary(request.headers["content-type"]);
    if (!boundary) {
        const error = new Error("Multipart boundary is missing");
        error.statusCode = 400;
        throw error;
    }

    const buffer = await readRequestBuffer(request, maxUploadBytes);
    const body = buffer.toString("latin1");
    const delimiter = `--${boundary}`;
    const fields = {};
    const files = {};

    body.split(delimiter).forEach((part) => {
        if (!part || part === "--\r\n" || part === "--") {
            return;
        }

        const cleanPart = part.replace(/^\r\n/, "").replace(/\r\n--$/, "");
        const headerEnd = cleanPart.indexOf("\r\n\r\n");
        if (headerEnd === -1) {
            return;
        }

        const headerText = cleanPart.slice(0, headerEnd);
        let content = cleanPart.slice(headerEnd + 4);
        if (content.endsWith("\r\n")) {
            content = content.slice(0, -2);
        }

        const headers = Object.fromEntries(
            headerText.split("\r\n").map((line) => {
                const separatorIndex = line.indexOf(":");
                if (separatorIndex === -1) {
                    return [line.toLowerCase(), ""];
                }
                return [
                    line.slice(0, separatorIndex).trim().toLowerCase(),
                    line.slice(separatorIndex + 1).trim()
                ];
            })
        );

        const disposition = parseContentDisposition(headers["content-disposition"]);
        if (!disposition.name) {
            return;
        }

        if (disposition.filename) {
            files[disposition.name] = {
                content: Buffer.from(content, "latin1"),
                filename: disposition.filename,
                mimeType: headers["content-type"] || "application/octet-stream"
            };
            return;
        }

        fields[disposition.name] = Buffer.from(content, "latin1").toString("utf8");
    });

    return { fields, files };
}

module.exports = {
    parseMultipart
};
