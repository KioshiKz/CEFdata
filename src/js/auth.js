import { api } from "./api.js";
import { renderAdminDocuments, renderDocumentUploadList, renderStudentUploadedFiles } from "./documents.js";
import { loadGroups } from "./groups.js";
import { tr } from "./i18n.js";
import { refreshNavigationAuthState, showSection } from "./navigation.js";
import { isAdmin, setCurrentUser } from "./state.js";

function setLoggedInUi() {
    document.getElementById("login").style.display = "none";
    document.getElementById("mainContent").style.display = "block";

    document.querySelectorAll(".admin-link").forEach((element) => {
        element.style.display = isAdmin() ? "inline-block" : "none";
    });
    refreshNavigationAuthState();
}

export async function login() {
    const username = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();
    const errorDiv = document.getElementById("loginError");

    try {
        const user = await api.login(username, password);
        setCurrentUser(user);
    } catch {
        errorDiv.textContent = tr("loginFailed");
        return;
    }

    setLoggedInUi();
    errorDiv.textContent = "";

    loadGroups();
    renderDocumentUploadList();
    renderStudentUploadedFiles();
    renderAdminDocuments();
    showSection(isAdmin() ? "groups" : "documents");
}

export async function restoreSession() {
    const session = await api.me();
    if (!session.authenticated) {
        setCurrentUser(null);
        return false;
    }

    setCurrentUser(session);
    setLoggedInUi();
    loadGroups();
    renderDocumentUploadList();
    renderStudentUploadedFiles();
    renderAdminDocuments();
    showSection(isAdmin() ? "groups" : "documents");
    return true;
}

export async function logout() {
    await api.logout();
    setCurrentUser(null);
    refreshNavigationAuthState();
    showSection("login");
}
