import { storageKeys } from "./config.js";

export const appState = {
    selectedGroupIndex: null,
    selectedPracticeType: null,
    expandedGroupIndex: null,
    currentUserRole: null,
    currentUsername: null,
    currentLanguage: localStorage.getItem(storageKeys.language) || "kk"
};

export function isAdmin() {
    return appState.currentUserRole === "admin";
}

export function isAuthenticated() {
    return Boolean(appState.currentUserRole);
}

export function setCurrentUser(user) {
    appState.currentUserRole = user?.role || null;
    appState.currentUsername = user?.username || null;
}

export function setCurrentLanguage(language) {
    appState.currentLanguage = language === "ru" ? "ru" : "kk";
    localStorage.setItem(storageKeys.language, appState.currentLanguage);
}
