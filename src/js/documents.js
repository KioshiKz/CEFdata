import { api } from "./api.js";
import {
    documentDefinitions,
    downloadFileByKey,
    fileMapping,
    templateBasePath
} from "./config.js";
import {
    formatDateTime,
    localizedDocumentName,
    localizedStatus,
    pdfDropText,
    tr
} from "./i18n.js";
import { statusLabels } from "./labels.js";
import { appState, isAdmin } from "./state.js";
import { escapeHtml, setInlineMessage } from "./utils.js";

let uploadEventsBound = false;
let templateDocuments = [];
let editingTemplateId = null;

async function readSubmissions() {
    try {
        return await api.getSubmissions();
    } catch {
        return [];
    }
}

async function readTemplates() {
    try {
        templateDocuments = await api.getTemplates();
        return templateDocuments;
    } catch {
        templateDocuments = [];
        return [];
    }
}

function staticTemplateLinks() {
    const templateWord = appState.currentLanguage === "ru" ? "шаблон" : "шаблоны";
    return Object.entries(downloadFileByKey).map(([key, fileName]) => {
        const fullFileName = `${fileName}_${appState.currentLanguage}.docx`;
        const href = `${templateBasePath}/${fullFileName}`;
        return `
            <li>
                <a href="${href}" class="template-download-link" data-template-file="${fullFileName}" download>
                    ${escapeHtml(localizedDocumentName(key))} ${templateWord}
                </a>
            </li>
        `;
    });
}

function customTemplateLinks(templates) {
    return templates.map((template) => `
        <li>
            <a href="${api.templateFileUrl(template.id)}" class="template-download-link" data-template-id="${escapeHtml(template.id)}" download>
                ${escapeHtml(template.documentName)}
            </a>
        </li>
    `);
}

function uploadDocumentDefinitions(templates = templateDocuments) {
    return [
        ...documentDefinitions.map((doc) => ({
            key: doc.key,
            title: localizedDocumentName(doc.key)
        })),
        ...templates.map((template) => ({
            key: template.id,
            title: template.documentName
        }))
    ];
}

function displaySubmissionDocumentName(item) {
    const documentKey = item.documentKey || item.documentName;
    if (item.documentName && item.documentName !== documentKey) {
        return item.documentName;
    }
    return localizedDocumentName(documentKey);
}

function templateFormElements() {
    return {
        title: document.getElementById("templateFormTitle"),
        name: document.getElementById("templateDocumentName"),
        file: document.getElementById("templateFile"),
        save: document.querySelector(".template-save-button"),
        cancel: document.querySelector(".template-cancel-button"),
        message: document.getElementById("templateFormMessage")
    };
}

function isAllowedTemplateFile(file) {
    return /\.(doc|docx|pdf)$/i.test(file?.name || "");
}

export async function renderTemplateLinks() {
    const list = document.querySelector(".document-list");
    if (!list) {
        return;
    }

    const templates = await readTemplates();
    list.innerHTML = [...staticTemplateLinks(), ...customTemplateLinks(templates)].join("");
}

export function downloadFile(documentKey) {
    const fileName = downloadFileByKey[documentKey] || fileMapping[documentKey];
    if (!fileName) {
        return;
    }

    window.location.href = `${templateBasePath}/${fileName}_${appState.currentLanguage}.docx`;
}

export async function renderDocumentUploadList() {
    const container = document.getElementById("documentUploadList");
    if (!container) {
        return;
    }

    const templates = await readTemplates();
    container.innerHTML = uploadDocumentDefinitions(templates).map((doc) => `
        <div class="document-upload-card">
            <div>
                <h4>${escapeHtml(doc.title)}</h4>
                <p>${tr("uploadHint")}</p>
            </div>
            <div class="document-upload-actions">
                <input type="file" id="upload-${doc.key}" class="hidden-file-input pdf-upload-input" data-document-key="${escapeHtml(doc.key)}" accept="application/pdf">
                <label for="upload-${doc.key}" class="pdf-drop-zone" data-document-key="${escapeHtml(doc.key)}">
                    <span class="pdf-drop-title">${pdfDropText("title")}</span>
                    <span class="pdf-drop-hint">${pdfDropText("hint")}</span>
                    <span class="file-picker-button">${pdfDropText("choose")}</span>
                    <span id="file-name-${doc.key}" class="selected-file-name">${tr("noFileSelected")}</span>
                </label>
            </div>
        </div>
    `).join("");
}

export function updateSelectedFileName(documentKey) {
    const input = document.getElementById(`upload-${documentKey}`);
    const label = document.getElementById(`file-name-${documentKey}`);
    if (!label) {
        return;
    }
    label.textContent = input?.files?.length ? input.files[0].name : tr("noFileSelected");
}

export function handleFileSelection(documentKey) {
    const input = document.getElementById(`upload-${documentKey}`);
    const file = input?.files?.[0];
    updateSelectedFileName(documentKey);

    if (file) {
        uploadStudentDocumentFile(documentKey, file);
    }
}

export async function uploadStudentDocument(documentKey) {
    const fileInput = document.getElementById(`upload-${documentKey}`);
    const file = fileInput?.files?.[0];
    if (!file) {
        setInlineMessage(document.getElementById("documentsMessage"), tr("choosePdf"), true);
        return;
    }

    await uploadStudentDocumentFile(documentKey, file);
}

export async function uploadStudentDocumentFile(documentKey, file) {
    const message = document.getElementById("documentsMessage");
    const input = document.getElementById(`upload-${documentKey}`);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setInlineMessage(message, tr("onlyPdf"), true);
        if (input) {
            input.value = "";
        }
        updateSelectedFileName(documentKey);
        return;
    }

    try {
        const submission = await api.uploadSubmission(documentKey, file);
        if (input) {
            input.value = "";
        }
        updateSelectedFileName(documentKey);
        setInlineMessage(message, `${submission.fileName} ${tr("uploadSuccess")}`, false);
        renderStudentUploadedFiles();
        renderAdminDocuments();
    } catch (error) {
        setInlineMessage(message, error.message || tr("downloadError"), true);
    }
}

export function openSubmissionFile(submissionId, fileType = "submission") {
    window.open(api.submissionFileUrl(submissionId, fileType), "_blank");
}

function setReportMessage(submissionId, text, isError) {
    setInlineMessage(document.getElementById(`report-message-${submissionId}`), text, isError);
}

export async function uploadAdminReport(submissionId) {
    if (!isAdmin()) {
        return;
    }

    const input = document.getElementById(`report-${submissionId}`);
    if (!input?.files?.length) {
        input?.click();
        setReportMessage(submissionId, tr("chooseReportPdf"), true);
        return;
    }

    const file = input.files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setReportMessage(submissionId, tr("reportMustBePdf"), true);
        return;
    }

    const button = document.getElementById(`report-button-${submissionId}`);
    if (button) {
        button.disabled = true;
    }

    try {
        const submission = await api.uploadReport(submissionId, file);
        input.value = "";
        setReportMessage(submissionId, `${submission.reviewReportFileName} ${tr("uploadSuccess")}`, false);
        await renderStudentUploadedFiles();
        await renderAdminDocuments();
    } catch (error) {
        setReportMessage(submissionId, error.message || tr("downloadError"), true);
    } finally {
        const currentButton = document.getElementById(`report-button-${submissionId}`);
        if (currentButton) {
            currentButton.disabled = false;
        }
    }
}

export async function updateSubmissionStatus(submissionId, status) {
    if (!isAdmin()) {
        return;
    }

    await api.updateSubmission(submissionId, { status });
    renderStudentUploadedFiles();
    renderAdminDocuments();
}

export async function updateSubmissionComment(submissionId, value) {
    if (!isAdmin()) {
        return;
    }

    await api.updateSubmission(submissionId, { adminComment: value });
    renderStudentUploadedFiles();
}

export async function deleteSubmission(submissionId) {
    if (!isAdmin()) {
        return;
    }

    await api.deleteSubmission(submissionId);
    renderStudentUploadedFiles();
    renderAdminDocuments();
}

export function resetTemplateForm() {
    const elements = templateFormElements();
    editingTemplateId = null;
    if (elements.name) {
        elements.name.value = "";
    }
    if (elements.file) {
        elements.file.value = "";
    }
    if (elements.title) {
        elements.title.textContent = tr("templateFormTitleCreate");
    }
    if (elements.save) {
        elements.save.textContent = tr("addTemplate");
        elements.save.disabled = false;
    }
    if (elements.cancel) {
        elements.cancel.style.display = "none";
    }
    if (elements.message) {
        elements.message.textContent = "";
        elements.message.className = "inline-message";
    }
}

export async function renderTemplateAdminPanel() {
    const panel = document.getElementById("templateAdminPanel");
    if (!panel) {
        return;
    }

    panel.style.display = isAdmin() ? "" : "none";
    if (!isAdmin()) {
        return;
    }

    const templates = await readTemplates();
    const tbody = document.getElementById("templateTableBody");
    const emptyMessage = document.getElementById("noTemplatesMessage");
    if (!tbody || !emptyMessage) {
        return;
    }

    emptyMessage.style.display = templates.length ? "none" : "block";
    tbody.innerHTML = templates.map((template) => `
        <tr>
            <td>
                <a href="${api.templateFileUrl(template.id)}" download>${escapeHtml(template.documentName)}</a>
            </td>
            <td>${escapeHtml(template.fileName || template.originalFileName || "")}</td>
            <td>${formatDateTime(template.updatedAt || template.uploadedAt)}</td>
            <td>
                <button type="button" class="template-edit-button" data-template-action="edit" data-template-id="${escapeHtml(template.id)}">${tr("editTemplate")}</button>
                <button type="button" class="template-delete-button" data-template-action="delete" data-template-id="${escapeHtml(template.id)}">${tr("delete")}</button>
            </td>
        </tr>
    `).join("");
}

export async function saveTemplateDocument() {
    if (!isAdmin()) {
        return;
    }

    const elements = templateFormElements();
    const documentName = elements.name?.value.trim() || "";
    const file = elements.file?.files?.[0] || null;

    if (!documentName) {
        setInlineMessage(elements.message, tr("templateNameRequired"), true);
        elements.name?.focus();
        return;
    }

    if (!editingTemplateId && !file) {
        setInlineMessage(elements.message, tr("templateFileRequired"), true);
        return;
    }

    if (file && !isAllowedTemplateFile(file)) {
        setInlineMessage(elements.message, tr("templateAllowedFile"), true);
        return;
    }

    if (elements.save) {
        elements.save.disabled = true;
    }

    try {
        if (editingTemplateId) {
            await api.updateTemplate(editingTemplateId, { documentName, file });
        } else {
            await api.createTemplate(documentName, file);
        }
        resetTemplateForm();
        setInlineMessage(templateFormElements().message, tr("templateSaved"), false);
        await renderTemplateLinks();
        await renderDocumentUploadList();
        await renderTemplateAdminPanel();
    } catch (error) {
        setInlineMessage(elements.message, error.message || tr("templateSaveFailed"), true);
    } finally {
        const currentSaveButton = templateFormElements().save;
        if (currentSaveButton) {
            currentSaveButton.disabled = false;
        }
    }
}

export function editTemplateDocument(templateId) {
    if (!isAdmin()) {
        return;
    }

    const template = templateDocuments.find((item) => item.id === templateId);
    if (!template) {
        return;
    }

    const elements = templateFormElements();
    editingTemplateId = templateId;
    if (elements.name) {
        elements.name.value = template.documentName;
        elements.name.focus();
    }
    if (elements.file) {
        elements.file.value = "";
    }
    if (elements.title) {
        elements.title.textContent = tr("templateFormTitleEdit");
    }
    if (elements.save) {
        elements.save.textContent = tr("saveTemplate");
    }
    if (elements.cancel) {
        elements.cancel.style.display = "";
    }
    if (elements.message) {
        elements.message.textContent = "";
        elements.message.className = "inline-message";
    }
}

export async function deleteTemplateDocument(templateId) {
    if (!isAdmin() || !confirm(tr("confirmDeleteTemplate"))) {
        return;
    }

    const elements = templateFormElements();
    try {
        await api.deleteTemplate(templateId);
        if (editingTemplateId === templateId) {
            resetTemplateForm();
        }
        setInlineMessage(elements.message, tr("templateDeleted"), false);
        await renderTemplateLinks();
        await renderDocumentUploadList();
        await renderTemplateAdminPanel();
    } catch (error) {
        setInlineMessage(elements.message, error.message || tr("templateDeleteFailed"), true);
    }
}

export async function renderStudentUploadedFiles() {
    const container = document.getElementById("studentUploadedFiles");
    if (!container) {
        return;
    }

    const submissions = (await readSubmissions()).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    if (!submissions.length) {
        container.innerHTML = `<p class="note">${tr("noStudentFiles")}</p>`;
        return;
    }

    container.innerHTML = submissions.map((item) => {
        return `
            <div class="student-file-card">
                <div>
                    <h5>${escapeHtml(displaySubmissionDocumentName(item))}</h5>
                    <p><strong>${tr("file")}</strong> ${escapeHtml(item.fileName)}</p>
                    <p><strong>${tr("uploadedAt")}</strong> ${formatDateTime(item.uploadedAt)}</p>
                    <p><strong>${tr("status")}</strong> ${escapeHtml(localizedStatus(item.status))}</p>
                </div>
                <div class="student-file-actions">
                    <a class="button-link" href="${api.submissionFileUrl(item.id)}" target="_blank" rel="noopener">${tr("openFile")}</a>
                    ${item.reviewReportFileName ? `<a class="button-link" href="${api.submissionFileUrl(item.id, "report")}" target="_blank" rel="noopener">${tr("openReport")}</a>` : ""}
                </div>
            </div>
        `;
    }).join("");
}

export async function renderAdminDocuments() {
    const container = document.getElementById("adminDocumentsList");
    if (!container) {
        return;
    }

    if (!isAdmin()) {
        container.innerHTML = "";
        return;
    }

    const submissions = (await readSubmissions()).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    if (!submissions.length) {
        container.innerHTML = `<p class="note">${tr("noAdminDocuments")}</p>`;
        return;
    }

    const statuses = Object.keys(statusLabels);
    container.innerHTML = submissions.map((item) => {
        return `
            <div class="admin-document-card">
                <div class="admin-document-header">
                    <div>
                        <h4>${escapeHtml(displaySubmissionDocumentName(item))}</h4>
                        <p><strong>${tr("file")}</strong> ${escapeHtml(item.fileName)}</p>
                        <p><strong>${tr("originalName")}</strong> ${escapeHtml(item.originalFileName || item.fileName)}</p>
                        <p><strong>${tr("uploadedAt")}</strong> ${formatDateTime(item.uploadedAt)}</p>
                    </div>
                    <span class="status-badge">${escapeHtml(localizedStatus(item.status))}</span>
                </div>

                <div class="admin-document-actions">
                    <a class="button-link" href="${api.submissionFileUrl(item.id)}" target="_blank" rel="noopener">${tr("openPdf")}</a>
                    <button type="button" data-submission-action="delete" data-submission-id="${escapeHtml(item.id)}">${tr("delete")}</button>
                    <select class="submission-status-select" data-submission-id="${escapeHtml(item.id)}">
                        ${statuses.map((status) => `<option value="${escapeHtml(status)}" ${item.status === status ? "selected" : ""}>${escapeHtml(localizedStatus(status))}</option>`).join("")}
                    </select>
                </div>

                <textarea class="admin-comment admin-comment-input" data-submission-id="${escapeHtml(item.id)}" placeholder="${tr("adminComment")}">${escapeHtml(item.adminComment || "")}</textarea>

                <div class="admin-report-box">
                    <label class="small-note">${tr("attachReport")}</label>
                    <input type="file" id="report-${item.id}" class="report-upload-input" data-submission-id="${escapeHtml(item.id)}" accept="application/pdf">
                    <button type="button" id="report-button-${item.id}" data-submission-action="upload-report" data-submission-id="${escapeHtml(item.id)}">${tr("uploadReport")}</button>
                    <div id="report-message-${item.id}" class="inline-message"></div>
                    ${item.reviewReportFileName ? `
                        <p><strong>${tr("uploadedReport")}</strong> ${escapeHtml(item.reviewReportFileName)}</p>
                        <a class="button-link" href="${api.submissionFileUrl(item.id, "report")}" target="_blank" rel="noopener">${tr("openReport")}</a>
                    ` : ""}
                </div>
            </div>
        `;
    }).join("");
}

export function bindDocumentUploadEvents() {
    if (uploadEventsBound) {
        return;
    }
    uploadEventsBound = true;

    document.addEventListener("dragover", function (event) {
        const dropZone = event.target.closest(".pdf-drop-zone");
        if (!dropZone) {
            return;
        }

        event.preventDefault();
        dropZone.classList.add("drag-over");
    });

    document.addEventListener("dragleave", function (event) {
        const dropZone = event.target.closest(".pdf-drop-zone");
        if (dropZone) {
            dropZone.classList.remove("drag-over");
        }
    });

    document.addEventListener("drop", function (event) {
        const dropZone = event.target.closest(".pdf-drop-zone");
        if (!dropZone) {
            return;
        }

        event.preventDefault();
        dropZone.classList.remove("drag-over");
        const documentKey = dropZone.dataset.documentKey;
        const file = event.dataTransfer?.files?.[0];
        if (documentKey && file) {
            uploadStudentDocumentFile(documentKey, file);
        }
    });

    document.addEventListener("change", function (event) {
        const input = event.target.closest(".pdf-upload-input");
        if (input) {
            const documentKey = input.dataset.documentKey;
            const file = input.files?.[0];
            updateSelectedFileName(documentKey);
            if (documentKey && file) {
                uploadStudentDocumentFile(documentKey, file);
            }
            return;
        }

        const statusSelect = event.target.closest(".submission-status-select");
        if (statusSelect) {
            updateSubmissionStatus(statusSelect.dataset.submissionId, statusSelect.value);
            return;
        }

        const reportInput = event.target.closest(".report-upload-input");
        if (reportInput) {
            uploadAdminReport(reportInput.dataset.submissionId);
            return;
        }

        const commentInput = event.target.closest(".admin-comment-input");
        if (commentInput) {
            updateSubmissionComment(commentInput.dataset.submissionId, commentInput.value);
        }
    });

    document.addEventListener("click", function (event) {
        const templateSaveButton = event.target.closest(".template-save-button");
        if (templateSaveButton) {
            saveTemplateDocument();
            return;
        }

        const templateCancelButton = event.target.closest(".template-cancel-button");
        if (templateCancelButton) {
            resetTemplateForm();
            return;
        }

        const templateActionButton = event.target.closest("[data-template-action]");
        if (templateActionButton) {
            const templateId = templateActionButton.dataset.templateId;
            if (templateActionButton.dataset.templateAction === "edit") {
                editTemplateDocument(templateId);
                return;
            }
            if (templateActionButton.dataset.templateAction === "delete") {
                deleteTemplateDocument(templateId);
                return;
            }
        }

        const actionButton = event.target.closest("[data-submission-action]");
        if (!actionButton) {
            return;
        }

        const submissionId = actionButton.dataset.submissionId;
        if (actionButton.dataset.submissionAction === "delete") {
            deleteSubmission(submissionId);
            return;
        }

        if (actionButton.dataset.submissionAction === "upload-report") {
            uploadAdminReport(submissionId);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" || event.target.id !== "templateDocumentName") {
            return;
        }

        event.preventDefault();
        saveTemplateDocument();
    });
}
