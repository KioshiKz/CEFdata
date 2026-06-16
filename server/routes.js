const fs = require("fs/promises");
const {
    clearSessionCookie,
    createSession,
    destroySession,
    findUser,
    getSession,
    requireAdmin,
    requireAuth,
    sessionCookie
} = require("./auth");
const { binDatabasePath, documentKeys, statusKeys } = require("./config");
const {
    addGroup,
    addBinRecord,
    addSubmission,
    attachReport,
    binRecordExists,
    deleteBinRecord,
    deleteGroup,
    deleteSubmission,
    findBinRecord,
    getSubmissionFile,
    listBinRecords,
    listGroups,
    listSubmissions,
    updateBinRecord,
    updateGroup,
    updatePractice,
    updateSubmission
} = require("./data-store");
const { readJsonBody, sendError, sendFile, sendJson } = require("./http-utils");
const { parseMultipart } = require("./multipart");

let binDatabasePromise = null;

function routePattern(pathname, pattern) {
    const match = pathname.match(pattern);
    return match ? match.groups || match : null;
}

async function getBinDatabase() {
    if (!binDatabasePromise) {
        binDatabasePromise = fs.readFile(binDatabasePath, "utf8").then(JSON.parse);
    }
    return binDatabasePromise;
}

function assertPdfFile(file) {
    if (!file) {
        return "PDF file is required";
    }

    const isPdf = file.mimeType === "application/pdf" || file.filename.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
        return "Only PDF files are accepted";
    }

    return "";
}

async function handleAuthRoutes(request, response, url) {
    if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const body = await readJsonBody(request);
        const user = findUser(String(body.username || ""), String(body.password || ""));

        if (!user) {
            sendError(response, 401, "Invalid username or password");
            return true;
        }

        const token = createSession(user);
        sendJson(
            response,
            200,
            { role: user.role, username: user.username },
            { "Set-Cookie": sessionCookie(token) }
        );
        return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        const session = getSession(request);
        if (session) {
            destroySession(session.token);
        }
        sendJson(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
        return true;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/me") {
        const session = getSession(request);
        sendJson(response, 200, {
            authenticated: Boolean(session),
            role: session?.role || null,
            username: session?.username || null
        });
        return true;
    }

    return false;
}

async function handleGroupRoutes(request, response, url) {
    if (url.pathname === "/api/groups" && request.method === "GET") {
        if (!requireAdmin(request, response)) return true;
        sendJson(response, 200, { groups: await listGroups() });
        return true;
    }

    if (url.pathname === "/api/groups" && request.method === "POST") {
        if (!requireAdmin(request, response)) return true;
        const body = await readJsonBody(request);
        const name = String(body.name || "").trim();
        if (!name) {
            sendError(response, 400, "Group name is required");
            return true;
        }
        sendJson(response, 201, { group: await addGroup(name) });
        return true;
    }

    const groupMatch = routePattern(url.pathname, /^\/api\/groups\/(?<id>[^/]+)$/);
    if (groupMatch && request.method === "PATCH") {
        if (!requireAdmin(request, response)) return true;
        const group = await updateGroup(groupMatch.id, await readJsonBody(request));
        if (!group) {
            sendError(response, 404, "Group not found");
            return true;
        }
        sendJson(response, 200, { group });
        return true;
    }

    if (groupMatch && request.method === "DELETE") {
        if (!requireAdmin(request, response)) return true;
        if (!await deleteGroup(groupMatch.id)) {
            sendError(response, 404, "Group not found");
            return true;
        }
        sendJson(response, 200, { ok: true });
        return true;
    }

    const practiceMatch = routePattern(url.pathname, /^\/api\/groups\/(?<id>[^/]+)\/practice$/);
    if (practiceMatch && request.method === "PATCH") {
        if (!requireAdmin(request, response)) return true;
        const body = await readJsonBody(request);
        const practiceType = String(body.practiceType || "");
        const group = await updatePractice(practiceMatch.id, practiceType, body);
        if (!group) {
            sendError(response, 404, "Group or practice not found");
            return true;
        }
        sendJson(response, 200, { group });
        return true;
    }

    return false;
}

async function handleSubmissionRoutes(request, response, url) {
    if (url.pathname === "/api/submissions" && request.method === "GET") {
        if (!requireAuth(request, response)) return true;
        sendJson(response, 200, { submissions: await listSubmissions() });
        return true;
    }

    if (url.pathname === "/api/submissions" && request.method === "POST") {
        if (!requireAuth(request, response)) return true;
        const { fields, files } = await parseMultipart(request);
        const documentKey = String(fields.documentKey || "");
        if (!documentKeys.has(documentKey)) {
            sendError(response, 400, "Unknown document type");
            return true;
        }

        const fileError = assertPdfFile(files.file);
        if (fileError) {
            sendError(response, 400, fileError);
            return true;
        }

        sendJson(response, 201, { submission: await addSubmission({ documentKey, file: files.file }) });
        return true;
    }

    const submissionMatch = routePattern(url.pathname, /^\/api\/submissions\/(?<id>[^/]+)$/);
    if (submissionMatch && request.method === "PATCH") {
        if (!requireAdmin(request, response)) return true;
        const body = await readJsonBody(request);
        if (body.status && !statusKeys.has(body.status)) {
            sendError(response, 400, "Unknown status");
            return true;
        }

        const submission = await updateSubmission(submissionMatch.id, body);
        if (!submission) {
            sendError(response, 404, "Submission not found");
            return true;
        }
        sendJson(response, 200, { submission });
        return true;
    }

    if (submissionMatch && request.method === "DELETE") {
        if (!requireAdmin(request, response)) return true;
        if (!await deleteSubmission(submissionMatch.id)) {
            sendError(response, 404, "Submission not found");
            return true;
        }
        sendJson(response, 200, { ok: true });
        return true;
    }

    const reportMatch = routePattern(url.pathname, /^\/api\/submissions\/(?<id>[^/]+)\/report$/);
    if (reportMatch && request.method === "POST") {
        if (!requireAdmin(request, response)) return true;
        const { files } = await parseMultipart(request);
        const fileError = assertPdfFile(files.file);
        if (fileError) {
            sendError(response, 400, fileError);
            return true;
        }

        const submission = await attachReport(reportMatch.id, files.file);
        if (!submission) {
            sendError(response, 404, "Submission not found");
            return true;
        }
        sendJson(response, 200, { submission });
        return true;
    }

    const fileMatch = routePattern(url.pathname, /^\/api\/submissions\/(?<id>[^/]+)\/file$/);
    if (fileMatch && request.method === "GET") {
        if (!requireAuth(request, response)) return true;
        const type = url.searchParams.get("type") === "report" ? "report" : "submission";
        const file = await getSubmissionFile(fileMatch.id, type);
        if (!file) {
            sendError(response, 404, "File not found");
            return true;
        }
        await sendFile(response, file.path, file.fileName);
        return true;
    }

    return false;
}

async function handleBinRoutes(request, response, url) {
    const binMatch = routePattern(url.pathname, /^\/api\/bin\/(?<bin>\d+)$/);
    if (!binMatch || request.method !== "GET") {
        return false;
    }

    if (!requireAdmin(request, response)) return true;

    // Приоритет: записи, добавленные админом → fallback на статичную базу
    const adminRecord = await findBinRecord(binMatch.bin);
    if (adminRecord) {
        sendJson(response, 200, { bin: binMatch.bin, record: adminRecord, source: "admin" });
        return true;
    }

    const database = await getBinDatabase();
    const record = database[binMatch.bin];
    if (!record) {
        sendError(response, 404, "BIN not found");
        return true;
    }

    sendJson(response, 200, { bin: binMatch.bin, record, source: "local" });
    return true;
}

function isValidUrl(value) {
    if (!value) {
        return false;
    }
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

async function handleBinRecordRoutes(request, response, url) {
    if (url.pathname === "/api/bin-records" && request.method === "GET") {
        if (!requireAdmin(request, response)) return true;
        sendJson(response, 200, { binRecords: await listBinRecords() });
        return true;
    }

    if (url.pathname === "/api/bin-records" && request.method === "POST") {
        if (!requireAdmin(request, response)) return true;
        const body = await readJsonBody(request);
        const bin = String(body.bin || "").replace(/\D/g, "");
        const urlValue = String(body.url || "").trim();

        if (!bin) {
            sendError(response, 400, "BIN is required and must contain digits only");
            return true;
        }
        if (!urlValue) {
            sendError(response, 400, "URL is required");
            return true;
        }
        if (!isValidUrl(urlValue)) {
            sendError(response, 400, "URL must start with http:// or https://");
            return true;
        }
        if (await binRecordExists(bin)) {
            sendError(response, 409, "A record with this BIN already exists");
            return true;
        }

        sendJson(response, 201, {
            binRecord: await addBinRecord({
                bin,
                url: urlValue,
                name: body.name,
                address: body.address,
                director: body.director,
                region: body.region
            })
        });
        return true;
    }

    const recordMatch = routePattern(url.pathname, /^\/api\/bin-records\/(?<id>[^/]+)$/);
    if (recordMatch && request.method === "PATCH") {
        if (!requireAdmin(request, response)) return true;
        const body = await readJsonBody(request);

        if (typeof body.bin === "string") {
            const normalizedBin = body.bin.replace(/\D/g, "");
            if (!normalizedBin) {
                sendError(response, 400, "BIN must contain digits only");
                return true;
            }
            if (await binRecordExists(normalizedBin, recordMatch.id)) {
                sendError(response, 409, "A record with this BIN already exists");
                return true;
            }
            body.bin = normalizedBin;
        }
        if (typeof body.url === "string") {
            const urlValue = body.url.trim();
            if (!urlValue) {
                sendError(response, 400, "URL cannot be empty");
                return true;
            }
            if (!isValidUrl(urlValue)) {
                sendError(response, 400, "URL must start with http:// or https://");
                return true;
            }
            body.url = urlValue;
        }

        const record = await updateBinRecord(recordMatch.id, body);
        if (!record) {
            sendError(response, 404, "BIN record not found");
            return true;
        }
        sendJson(response, 200, { binRecord: record });
        return true;
    }

    if (recordMatch && request.method === "DELETE") {
        if (!requireAdmin(request, response)) return true;
        if (!await deleteBinRecord(recordMatch.id)) {
            sendError(response, 404, "BIN record not found");
            return true;
        }
        sendJson(response, 200, { ok: true });
        return true;
    }

    return false;
}

async function handleApi(request, response, url) {
    if (url.pathname === "/api/health" && request.method === "GET") {
        sendJson(response, 200, { ok: true });
        return;
    }

    if (
        await handleAuthRoutes(request, response, url) ||
        await handleGroupRoutes(request, response, url) ||
        await handleSubmissionRoutes(request, response, url) ||
        await handleBinRecordRoutes(request, response, url) ||
        await handleBinRoutes(request, response, url)
    ) {
        return;
    }

    sendError(response, 404, "API route not found");
}

module.exports = {
    handleApi
};
