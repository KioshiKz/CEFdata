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

async function readSubmissions() {
    try {
        return await api.getSubmissions();
    } catch {
        return [];
    }
}

export function renderTemplateLinks() {
    const list = document.querySelector(".document-list");
    if (!list) {
        return;
    }

    const templateWord = appState.currentLanguage === "ru" ? "шаблон" : "шаблоны";
    list.innerHTML = Object.entries(downloadFileByKey).map(([key, fileName]) => {
        const fullFileName = `${fileName}_${appState.currentLanguage}.docx`;
        const href = `${templateBasePath}/${fullFileName}`;
        return `
            <li>
                <a href="${href}" class="template-download-link" data-template-file="${fullFileName}" download>
                    ${escapeHtml(localizedDocumentName(key))} ${templateWord}
                </a>
            </li>
        `;
    }).join("");
}

export function downloadFile(documentKey) {
    const fileName = downloadFileByKey[documentKey] || fileMapping[documentKey];
    if (!fileName) {
        return;
    }

    window.location.href = `${templateBasePath}/${fileName}_${appState.currentLanguage}.docx`;
}

export function renderDocumentUploadList() {
    const container = document.getElementById("documentUploadList");
    if (!container) {
        return;
    }

    container.innerHTML = documentDefinitions.map((doc) => `
        <div class="document-upload-card">
            <div>
                <h4>${escapeHtml(localizedDocumentName(doc.key))}</h4>
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
        const documentKey = item.documentKey || item.documentName;
        return `
            <div class="student-file-card">
                <div>
                    <h5>${escapeHtml(localizedDocumentName(documentKey))}</h5>
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
        const documentKey = item.documentKey || item.documentName;
        return `
            <div class="admin-document-card">
                <div class="admin-document-header">
                    <div>
                        <h4>${escapeHtml(localizedDocumentName(documentKey))}</h4>
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
}
