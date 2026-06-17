import { login, logout, restoreSession } from "./auth.js";
import { bindBinRecordEvents, cancelEdit, editBinRecord, loadBinRecords, removeBinRecord, saveBinRecord } from "./bin-records.js";
import { searchBIN } from "./bin-search.js";
import {
    bindDocumentUploadEvents,
    deleteSubmission,
    downloadFile,
    handleFileSelection,
    openSubmissionFile,
    renderAdminDocuments,
    renderDocumentUploadList,
    renderStudentUploadedFiles,
    renderTemplateAdminPanel,
    renderTemplateLinks,
    resetTemplateForm,
    saveTemplateDocument,
    updateSubmissionComment,
    updateSubmissionStatus,
    uploadAdminReport,
    uploadStudentDocument,
    uploadStudentDocumentFile
} from "./documents.js";
import {
    addGroup,
    bindGroupEvents,
    changeSelectedPracticeType,
    loadGroups,
    removeGroup,
    selectPractice,
    toggleGroupPractices,
    updateGroupName,
    updatePracticeField
} from "./groups.js";
import { applyStaticTranslations, setLanguageValue } from "./i18n.js";
import { bindNavigation, refreshNavigationAuthState, showSection } from "./navigation.js";
import { appState, isAdmin } from "./state.js";

function setLanguage(language) {
    setLanguageValue(language);
    applyStaticTranslations();
    refreshNavigationAuthState();
    renderTemplateLinks();
    renderDocumentUploadList();
    renderStudentUploadedFiles();
    renderAdminDocuments();
    renderTemplateAdminPanel();
    if (isAdmin()) {
        loadGroups();
        loadBinRecords();
    }
}

function bindLanguageSwitcher() {
    document.querySelectorAll(".language-button").forEach((button) => {
        button.addEventListener("click", function () {
            setLanguage(this.dataset.lang);
        });
    });
}

function bindPageActionButtons() {
    document.querySelector(".login-button")?.addEventListener("click", login);
    document.querySelector(".add-group-button")?.addEventListener("click", addGroup);
    document.querySelector(".bin-search-button")?.addEventListener("click", searchBIN);
    document.querySelector(".bin-save-button")?.addEventListener("click", saveBinRecord);

    document.getElementById("usernameInput")?.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            login();
        }
    });

    document.getElementById("passwordInput")?.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            login();
        }
    });

    document.getElementById("newGroupName")?.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addGroup();
        }
    });

    document.getElementById("binInput")?.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            searchBIN();
        }
    });
}

function exposeGlobals() {
    Object.assign(window, {
        addGroup,
        cancelEdit,
        changeSelectedPracticeType,
        downloadFile,
        deleteSubmission,
        editBinRecord,
        handleFileSelection,
        login,
        logout,
        openSubmissionFile,
        removeBinRecord,
        removeGroup,
        resetTemplateForm,
        saveBinRecord,
        saveTemplateDocument,
        searchBIN,
        selectPractice,
        setLanguage,
        showSection,
        toggleGroupPractices,
        updateGroupName,
        updatePracticeField,
        updateSubmissionComment,
        updateSubmissionStatus,
        uploadAdminReport,
        uploadStudentDocument,
        uploadStudentDocumentFile
    });
}

function initApp() {
    exposeGlobals();
    bindNavigation();
    bindLanguageSwitcher();
    bindPageActionButtons();
    bindDocumentUploadEvents();
    bindGroupEvents();
    bindBinRecordEvents();
    setLanguage(appState.currentLanguage);
    restoreSession();
}

document.addEventListener("DOMContentLoaded", initApp);
