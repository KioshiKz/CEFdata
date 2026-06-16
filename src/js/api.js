async function request(path, options = {}) {
    const response = await fetch(path, {
        credentials: "same-origin",
        ...options,
        headers: {
            ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(options.headers || {})
        }
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
        throw new Error(payload?.error || `Request failed: ${response.status}`);
    }

    return payload;
}

export const api = {
    async login(username, password) {
        return request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        });
    },

    async logout() {
        return request("/api/auth/logout", { method: "POST", body: "{}" });
    },

    async me() {
        return request("/api/auth/me");
    },

    async getGroups() {
        const payload = await request("/api/groups");
        return payload.groups || [];
    },

    async createGroup(name) {
        const payload = await request("/api/groups", {
            method: "POST",
            body: JSON.stringify({ name })
        });
        return payload.group;
    },

    async updateGroup(id, patch) {
        const payload = await request(`/api/groups/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(patch)
        });
        return payload.group;
    },

    async updatePractice(id, practicePatch) {
        const payload = await request(`/api/groups/${encodeURIComponent(id)}/practice`, {
            method: "PATCH",
            body: JSON.stringify(practicePatch)
        });
        return payload.group;
    },

    async deleteGroup(id) {
        return request(`/api/groups/${encodeURIComponent(id)}`, { method: "DELETE" });
    },

    async getSubmissions() {
        const payload = await request("/api/submissions");
        return payload.submissions || [];
    },

    async uploadSubmission(documentKey, file) {
        const formData = new FormData();
        formData.append("documentKey", documentKey);
        formData.append("file", file);
        const payload = await request("/api/submissions", {
            method: "POST",
            body: formData
        });
        return payload.submission;
    },

    async updateSubmission(id, patch) {
        const payload = await request(`/api/submissions/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(patch)
        });
        return payload.submission;
    },

    async deleteSubmission(id) {
        return request(`/api/submissions/${encodeURIComponent(id)}`, { method: "DELETE" });
    },

    async uploadReport(id, file) {
        const formData = new FormData();
        formData.append("file", file);
        const payload = await request(`/api/submissions/${encodeURIComponent(id)}/report`, {
            method: "POST",
            body: formData
        });
        return payload.submission;
    },

    submissionFileUrl(id, type = "submission") {
        return `/api/submissions/${encodeURIComponent(id)}/file?type=${encodeURIComponent(type)}`;
    }
};
