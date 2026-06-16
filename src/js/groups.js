import { api } from "./api.js";
import { practiceTypeOptions } from "./config.js";
import { localizedPracticeName, tr } from "./i18n.js";
import { appState, isAdmin } from "./state.js";
import { escapeHtml } from "./utils.js";
import { showSection } from "./navigation.js";

let groupEventsBound = false;

export function createEmptyPractice(practiceType) {
    return { practiceType, startDate: "", endDate: "", hours: 0 };
}

async function fetchGroups() {
    if (!isAdmin()) {
        return [];
    }

    try {
        return await api.getGroups();
    } catch {
        return [];
    }
}

function resetSelectionIfNeeded(groups) {
    if (appState.selectedGroupIndex !== null && !groups[appState.selectedGroupIndex]) {
        appState.selectedGroupIndex = null;
        appState.selectedPracticeType = null;
    }
}

export async function loadGroups() {
    const groups = await fetchGroups();
    resetSelectionIfNeeded(groups);

    if (isAdmin()) {
        renderGroupsList(groups);
        renderAdminTable(groups);
    } else {
        document.getElementById("groupList").innerHTML = "";
        document.getElementById("groupTableBody").innerHTML = "";
        document.getElementById("selectedPracticeInfo").innerHTML = "";
    }
}

export function renderGroupsList(groups) {
    if (!isAdmin()) {
        return;
    }

    const list = document.getElementById("groupList");
    const noGroupsMessage = document.getElementById("noGroupsMessage");
    list.innerHTML = "";

    if (!groups.length) {
        noGroupsMessage.style.display = "block";
        return;
    }

    noGroupsMessage.style.display = "none";

    groups.forEach((group, index) => {
        const item = document.createElement("li");
        item.className = "group-card";
        const practiceButtons = practiceTypeOptions.map((practiceType) => `
            <button type="button" class="practice-item ${appState.selectedGroupIndex === index && appState.selectedPracticeType === practiceType ? "active" : ""}" data-group-action="select-practice" data-group-index="${index}" data-practice-type="${escapeHtml(practiceType)}">
                ${escapeHtml(localizedPracticeName(practiceType))}
            </button>
        `).join("");

        item.innerHTML = `
            <button type="button" class="group-item ${appState.expandedGroupIndex === index ? "expanded" : ""}" data-group-action="toggle" data-group-index="${index}">
                <span>${escapeHtml(group.name || tr("unnamedGroup"))}</span>
                <span class="group-item-indicator">${appState.expandedGroupIndex === index ? "-" : "+"}</span>
            </button>
            <div class="practice-list ${appState.expandedGroupIndex === index ? "open" : ""}">
                ${practiceButtons}
            </div>
        `;

        list.appendChild(item);
    });
}

export async function toggleGroupPractices(index) {
    if (!isAdmin()) {
        return;
    }
    appState.expandedGroupIndex = appState.expandedGroupIndex === index ? null : index;
    renderGroupsList(await fetchGroups());
}

export function selectPractice(groupIndex, practiceType) {
    if (!isAdmin()) {
        return;
    }
    appState.selectedGroupIndex = groupIndex;
    appState.selectedPracticeType = practiceType;
    appState.expandedGroupIndex = groupIndex;
    showSection("adminPanel");
    loadGroups();
}

export function renderAdminTable(groups) {
    if (!isAdmin()) {
        return;
    }

    const tbody = document.getElementById("groupTableBody");
    const info = document.getElementById("selectedPracticeInfo");
    tbody.innerHTML = "";

    if (appState.selectedGroupIndex === null || !groups[appState.selectedGroupIndex] || !appState.selectedPracticeType) {
        info.textContent = tr("noPracticeSelected");
        return;
    }

    const group = groups[appState.selectedGroupIndex];
    const practice = group.practices[appState.selectedPracticeType] || createEmptyPractice(appState.selectedPracticeType);

    info.innerHTML = `<strong>${escapeHtml(group.name)}</strong> ${tr("practiceSelected")} <strong>${escapeHtml(localizedPracticeName(appState.selectedPracticeType))}</strong>.`;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" class="group-name-input" data-group-index="${appState.selectedGroupIndex}" value="${escapeHtml(group.name)}" placeholder="${tr("groupName")}"></td>
        <td>
            <select class="selected-practice-type-select">
                ${practiceTypeOptions.map((option) => `<option value="${escapeHtml(option)}" ${appState.selectedPracticeType === option ? "selected" : ""}>${escapeHtml(localizedPracticeName(option))}</option>`).join("")}
            </select>
        </td>
        <td><input type="date" class="practice-field-input" data-group-index="${appState.selectedGroupIndex}" data-practice-type="${escapeHtml(appState.selectedPracticeType)}" data-field="startDate" value="${practice.startDate}"></td>
        <td><input type="date" class="practice-field-input" data-group-index="${appState.selectedGroupIndex}" data-practice-type="${escapeHtml(appState.selectedPracticeType)}" data-field="endDate" value="${practice.endDate}"></td>
        <td><input type="number" min="0" class="practice-field-input" data-group-index="${appState.selectedGroupIndex}" data-practice-type="${escapeHtml(appState.selectedPracticeType)}" data-field="hours" value="${practice.hours}"></td>
        <td><button type="button" data-group-action="remove" data-group-index="${appState.selectedGroupIndex}">${tr("delete")}</button></td>
    `;

    tbody.appendChild(row);
}

export function bindGroupEvents() {
    if (groupEventsBound) {
        return;
    }
    groupEventsBound = true;

    document.addEventListener("click", function (event) {
        const actionButton = event.target.closest("[data-group-action]");
        if (!actionButton) {
            return;
        }

        const groupIndex = Number(actionButton.dataset.groupIndex);
        if (Number.isNaN(groupIndex)) {
            return;
        }

        if (actionButton.dataset.groupAction === "toggle") {
            toggleGroupPractices(groupIndex);
            return;
        }

        if (actionButton.dataset.groupAction === "select-practice") {
            selectPractice(groupIndex, actionButton.dataset.practiceType);
            return;
        }

        if (actionButton.dataset.groupAction === "remove") {
            removeGroup(groupIndex);
        }
    });

    document.addEventListener("change", function (event) {
        const groupNameInput = event.target.closest(".group-name-input");
        if (groupNameInput) {
            updateGroupName(Number(groupNameInput.dataset.groupIndex), groupNameInput.value);
            return;
        }

        const practiceSelect = event.target.closest(".selected-practice-type-select");
        if (practiceSelect) {
            changeSelectedPracticeType(practiceSelect.value);
            return;
        }

        const practiceInput = event.target.closest(".practice-field-input");
        if (practiceInput) {
            updatePracticeField(
                Number(practiceInput.dataset.groupIndex),
                practiceInput.dataset.practiceType,
                practiceInput.dataset.field,
                practiceInput.value
            );
        }
    });
}

export async function updateGroupName(index, value) {
    if (!isAdmin()) {
        return;
    }
    const groups = await fetchGroups();
    const group = groups[index];
    if (!group) {
        return;
    }
    await api.updateGroup(group.id, { name: value.trim() });
    loadGroups();
}

export function changeSelectedPracticeType(value) {
    if (!isAdmin()) {
        return;
    }
    appState.selectedPracticeType = value;
    loadGroups();
}

export async function updatePracticeField(groupIndex, practiceType, field, value) {
    if (!isAdmin()) {
        return;
    }

    const groups = await fetchGroups();
    const group = groups[groupIndex];
    if (!group) {
        return;
    }

    await api.updatePractice(group.id, {
        practiceType,
        [field]: field === "hours" ? Number(value) || 0 : value
    });
    loadGroups();
}

export async function addGroup() {
    if (!isAdmin()) {
        alert(tr("onlyAdminGroups"));
        return;
    }

    const nameInput = document.getElementById("newGroupName");
    const name = nameInput.value.trim();
    if (!name) {
        alert(tr("enterGroupName"));
        return;
    }

    const created = await api.createGroup(name);
    const groups = await fetchGroups();
    const createdIndex = groups.findIndex((group) => group.id === created.id);
    appState.expandedGroupIndex = createdIndex >= 0 ? createdIndex : groups.length - 1;
    appState.selectedGroupIndex = appState.expandedGroupIndex;
    appState.selectedPracticeType = practiceTypeOptions[0];
    nameInput.value = "";
    renderGroupsList(groups);
    renderAdminTable(groups);
}

export async function removeGroup(index) {
    if (!isAdmin()) {
        return;
    }

    const groups = await fetchGroups();
    const group = groups[index];
    if (!group) {
        return;
    }

    await api.deleteGroup(group.id);

    if (appState.selectedGroupIndex === index) {
        appState.selectedGroupIndex = null;
        appState.selectedPracticeType = null;
    } else if (appState.selectedGroupIndex !== null && appState.selectedGroupIndex > index) {
        appState.selectedGroupIndex -= 1;
    }

    if (appState.expandedGroupIndex === index) {
        appState.expandedGroupIndex = null;
    } else if (appState.expandedGroupIndex !== null && appState.expandedGroupIndex > index) {
        appState.expandedGroupIndex -= 1;
    }

    loadGroups();
}
