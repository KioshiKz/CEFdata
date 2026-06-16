import { adminSections, pageSections } from "./config.js";
import { api } from "./api.js";
import { tr } from "./i18n.js";
import { isAdmin, isAuthenticated, setCurrentUser } from "./state.js";

export function showSection(sectionId) {
    const loginSection = document.getElementById("login");
    const mainContent = document.getElementById("mainContent");

    if (adminSections.has(sectionId) && !isAdmin()) {
        sectionId = "documents";
    }

    if (sectionId === "login") {
        loginSection.style.display = "block";
        mainContent.style.display = "none";
        pageSections.forEach((id) => {
            document.getElementById(id).style.display = "none";
        });
        return;
    }

    loginSection.style.display = "none";
    mainContent.style.display = "block";

    pageSections.forEach((id) => {
        document.getElementById(id).style.display = id === sectionId ? "block" : "none";
    });
}

export function bindNavigation() {
    document.querySelectorAll("nav a").forEach((link) => {
        link.addEventListener("click", async function (event) {
            event.preventDefault();
            const sectionId = this.getAttribute("href").replace("#", "");

            if (sectionId === "login" && isAuthenticated()) {
                await api.logout();
                setCurrentUser(null);
                refreshNavigationAuthState();
                showSection("login");
                return;
            }

            if (sectionId !== "login" && document.getElementById("mainContent").style.display === "none") {
                alert(tr("loginRequired"));
                return;
            }

            if (adminSections.has(sectionId) && !isAdmin()) {
                alert(tr("noAccess"));
                return;
            }

            showSection(sectionId);
        });
    });
}

export function refreshNavigationAuthState() {
    const loginLink = document.querySelector('nav a[href="#login"]');
    if (loginLink) {
        loginLink.textContent = isAuthenticated() ? tr("logoutButton") : tr("navLogin");
    }
}
