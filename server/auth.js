const crypto = require("crypto");
const { credentials } = require("./config");
const { parseCookies, sendError } = require("./http-utils");

const sessions = new Map();
const sessionMaxAgeMs = 8 * 60 * 60 * 1000;

function createSession(user) {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, {
        createdAt: Date.now(),
        role: user.role,
        username: user.username
    });
    return token;
}

function getSession(request) {
    const token = parseCookies(request).session;
    if (!token) {
        return null;
    }

    const session = sessions.get(token);
    if (!session) {
        return null;
    }

    if (Date.now() - session.createdAt > sessionMaxAgeMs) {
        sessions.delete(token);
        return null;
    }

    return { ...session, token };
}

function findUser(username, password) {
    return Object.values(credentials).find((user) => user.username === username && user.password === password) || null;
}

function sessionCookie(token) {
    return `session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionMaxAgeMs / 1000}`;
}

function clearSessionCookie() {
    return "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

function requireAuth(request, response) {
    const session = getSession(request);
    if (!session) {
        sendError(response, 401, "Authentication required");
        return null;
    }
    return session;
}

function requireAdmin(request, response) {
    const session = requireAuth(request, response);
    if (!session) {
        return null;
    }

    if (session.role !== "admin") {
        sendError(response, 403, "Admin access required");
        return null;
    }

    return session;
}

function destroySession(token) {
    sessions.delete(token);
}

module.exports = {
    clearSessionCookie,
    createSession,
    destroySession,
    findUser,
    getSession,
    requireAdmin,
    requireAuth,
    sessionCookie
};
