import { api } from "./api.js";
import { tr } from "./i18n.js";
import { isAdmin } from "./state.js";
import { escapeHtml, setInlineMessage } from "./utils.js";

let records = [];
let editingId = null;

function getFormFields() {
    return {
        bin: document.getElementById("binRecordBin"),
        url: document.getElementById("binRecordUrl"),
        name: document.getElementById("binRecordName"),
        address: document.getElementById("binRecordAddress"),
        director: document.getElementById("binRecordDirector"),
        region: document.getElementById("binRecordRegion")
    };
}

function readForm() {
    const fields = getFormFields();
    return {
        bin: fields.bin.value.trim(),
        url: fields.url.value.trim(),
        name: fields.name.value.trim(),
        address: fields.address.value.trim(),
        director: fields.director.value.trim(),
        region: fields.region.value.trim()
    };
}

function clearForm() {
    const fields = getFormFields();
    Object.values(fields).forEach((input) => {
        input.value = "";
    });
    setInlineMessage(document.getElementById("binRecordFormError"), "", false);
}

function isValidUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function setEditMode(id) {
    editingId = id;
    const record = records.find((item) => item.id === id);
    if (!record) {
        return;
    }

    const fields = getFormFields();
    fields.bin.value = record.bin;
    fields.url.value = record.url;
    fields.name.value = record.name;
    fields.address.value = record.address;
    fields.director.value = record.director;
    fields.region.value = record.region;

    document.querySelector(".bin-save-button").textContent = tr("saveBin");
    document.querySelector(".bin-cancel-button").style.display = "";
    document.getElementById("binFormTitle").textContent = tr("editBin");
    fields.bin.focus();
}

function resetToCreateMode() {
    editingId = null;
    document.querySelector(".bin-save-button").textContent = tr("addBin");
    document.querySelector(".bin-cancel-button").style.display = "none";
    document.getElementById("binFormTitle").textContent = tr("binFormTitleCreate");
}

function renderTable() {
    const tbody = document.getElementById("binRecordsTableBody");
    const emptyMessage = document.getElementById("noBinRecordsMessage");
    if (!tbody) {
        return;
    }

    if (!records.length) {
        tbody.innerHTML = "";
        if (emptyMessage) emptyMessage.style.display = "";
        return;
    }

    if (emptyMessage) emptyMessage.style.display = "none";

    tbody.innerHTML = records.map((record) => `
        <tr>
            <td>${escapeHtml(record.bin)}</td>
            <td>${record.url ? `<a href="${escapeHtml(record.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(record.url)}</a>` : ""}</td>
            <td>${escapeHtml(record.name)}</td>
            <td>${escapeHtml(record.address)}</td>
            <td>${escapeHtml(record.director)}</td>
            <td>${escapeHtml(record.region)}</td>
            <td>
                <button type="button" class="bin-edit-button" onclick="window.editBinRecord('${escapeHtml(record.id)}')">${tr("editBin")}</button>
                <button type="button" class="bin-delete-button" onclick="window.removeBinRecord('${escapeHtml(record.id)}')">${tr("delete")}</button>
            </td>
        </tr>
    `).join("");
}

export async function loadBinRecords() {
    if (!isAdmin()) {
        return;
    }

    try {
        records = await api.getBinRecords();
        renderTable();
    } catch (error) {
        setInlineMessage(document.getElementById("binRecordFormError"), error.message || tr("loadFailed"), true);
    }
}

function validate(data) {
    const errorElement = document.getElementById("binRecordFormError");

    if (!data.bin) {
        setInlineMessage(errorElement, tr("binRequired"), true);
        return false;
    }
    if (!/^\d+$/.test(data.bin)) {
        setInlineMessage(errorElement, tr("binDigitsOnly"), true);
        return false;
    }
    if (!data.url) {
        setInlineMessage(errorElement, tr("urlRequired"), true);
        return false;
    }
    if (!isValidUrl(data.url)) {
        setInlineMessage(errorElement, tr("urlInvalid"), true);
        return false;
    }

    return true;
}

export async function saveBinRecord() {
    if (!isAdmin()) {
        return;
    }

    const data = readForm();
    if (!validate(data)) {
        return;
    }

    const errorElement = document.getElementById("binRecordFormError");

    try {
        if (editingId) {
            await api.updateBinRecord(editingId, data);
        } else {
            await api.createBinRecord(data);
        }
        clearForm();
        resetToCreateMode();
        await loadBinRecords();
    } catch (error) {
        setInlineMessage(errorElement, error.message || tr("saveFailed"), true);
    }
}

export function cancelEdit() {
    clearForm();
    resetToCreateMode();
}

export async function editBinRecord(id) {
    if (!isAdmin()) {
        return;
    }
    setEditMode(id);
}

export async function removeBinRecord(id) {
    if (!isAdmin()) {
        return;
    }

    if (!confirm(tr("confirmDeleteBin"))) {
        return;
    }

    const errorElement = document.getElementById("binRecordFormError");
    try {
        await api.deleteBinRecord(id);
        if (editingId === id) {
            clearForm();
            resetToCreateMode();
        }
        await loadBinRecords();
    } catch (error) {
        setInlineMessage(errorElement, error.message || tr("deleteFailed"), true);
    }
}

export function bindBinRecordEvents() {
    document.querySelector(".bin-save-button")?.addEventListener("click", saveBinRecord);
    document.querySelector(".bin-cancel-button")?.addEventListener("click", cancelEdit);

    const binInput = document.getElementById("binRecordBin");
    binInput?.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });

    const formFields = ["binRecordBin", "binRecordUrl", "binRecordName", "binRecordAddress", "binRecordDirector", "binRecordRegion"];
    formFields.forEach((fieldId) => {
        document.getElementById(fieldId)?.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                saveBinRecord();
            }
        });
    });
}
