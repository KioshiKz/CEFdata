const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const {
    appDataPath,
    dataDir,
    practiceTypeOptions,
    seedAppDataPath,
    seedStorageDir,
    storageDir,
    uploadDir
} = require("./config");

const defaultData = {
    groups: [],
    submissions: [],
    binRecords: []
};

let dataPromise = null;
let writeQueue = Promise.resolve();

function createId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function createEmptyPractice(practiceType) {
    return { practiceType, startDate: "", endDate: "", hours: 0 };
}

function normalizePractice(practice, practiceType) {
    return {
        practiceType,
        startDate: practice?.startDate || "",
        endDate: practice?.endDate || "",
        hours: Number(practice?.hours) || 0
    };
}

function createGroup(name, practices = {}) {
    const normalizedPractices = {};
    practiceTypeOptions.forEach((practiceType) => {
        normalizedPractices[practiceType] = normalizePractice(practices[practiceType], practiceType);
    });

    return {
        id: createId("grp"),
        name,
        practices: normalizedPractices
    };
}

function normalizeGroup(group) {
    const normalized = createGroup(group.name || "", group.practices || {});
    normalized.id = group.id || createId("grp");
    return normalized;
}

function normalizeSubmission(submission) {
    return {
        id: submission.id || createId("sub"),
        documentKey: submission.documentKey || submission.documentName || "",
        documentName: submission.documentName || submission.documentKey || "",
        originalFileName: submission.originalFileName || submission.fileName || "",
        fileName: submission.fileName || "",
        mimeType: submission.mimeType || "application/pdf",
        uploadedAt: submission.uploadedAt || new Date().toISOString(),
        status: submission.status || "new",
        adminComment: submission.adminComment || "",
        reviewReportFileName: submission.reviewReportFileName || "",
        submissionPath: submission.submissionPath || "",
        reportPath: submission.reportPath || ""
    };
}

function normalizeBinRecord(record) {
    const bin = String(record?.bin || "").replace(/\D/g, "");
    return {
        id: record?.id || createId("bin"),
        bin,
        url: String(record?.url || "").trim(),
        name: String(record?.name || "").trim(),
        address: String(record?.address || "").trim(),
        director: String(record?.director || "").trim(),
        region: String(record?.region || "").trim(),
        createdAt: record?.createdAt || new Date().toISOString(),
        updatedAt: record?.updatedAt || new Date().toISOString()
    };
}

async function exists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

async function copyDirectoryContents(sourceDir, targetDir) {
    if (!await exists(sourceDir)) {
        return;
    }

    await fs.mkdir(targetDir, { recursive: true });
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetPath = path.join(targetDir, entry.name);

        if (entry.isDirectory()) {
            await copyDirectoryContents(sourcePath, targetPath);
            return;
        }

        if (!await exists(targetPath)) {
            await fs.copyFile(sourcePath, targetPath);
        }
    }));
}

async function seedRuntimeFiles() {
    if (!await exists(appDataPath) && await exists(seedAppDataPath)) {
        await fs.copyFile(seedAppDataPath, appDataPath);
    }

    if (path.resolve(storageDir) !== path.resolve(seedStorageDir)) {
        await copyDirectoryContents(seedStorageDir, storageDir);
    }
}

async function ensureStorage() {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(path.join(uploadDir, "submissions"), { recursive: true });
    await fs.mkdir(path.join(uploadDir, "reports"), { recursive: true });
    await seedRuntimeFiles();
}

async function loadData() {
    await ensureStorage();

    try {
        const raw = await fs.readFile(appDataPath, "utf8");
        const parsed = JSON.parse(raw);
        return {
            groups: Array.isArray(parsed.groups) ? parsed.groups.map(normalizeGroup) : [],
            submissions: Array.isArray(parsed.submissions) ? parsed.submissions.map(normalizeSubmission) : [],
            binRecords: Array.isArray(parsed.binRecords) ? parsed.binRecords.map(normalizeBinRecord) : []
        };
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
        await saveData(defaultData);
        return JSON.parse(JSON.stringify(defaultData));
    }
}

function getData() {
    if (!dataPromise) {
        dataPromise = loadData();
    }
    return dataPromise;
}

async function saveData(data) {
    await ensureStorage();
    writeQueue = writeQueue.then(() => fs.writeFile(appDataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8"));
    await writeQueue;
}

function publicSubmission(submission) {
    return {
        id: submission.id,
        documentKey: submission.documentKey,
        documentName: submission.documentName,
        originalFileName: submission.originalFileName,
        fileName: submission.fileName,
        mimeType: submission.mimeType,
        uploadedAt: submission.uploadedAt,
        status: submission.status,
        adminComment: submission.adminComment,
        reviewReportFileName: submission.reviewReportFileName
    };
}

function safeFileName(fileName) {
    return path.basename(String(fileName || "document.pdf")).replace(/[^\w.\-а-яА-ЯёЁқҚңНғҒүҮұҰіІәӘөӨ ]/g, "_");
}

function standardSubmissionFileName(documentKey, date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}_${documentKey}.pdf`;
}

async function listGroups() {
    const data = await getData();
    return data.groups;
}

async function addGroup(name) {
    const data = await getData();
    const group = createGroup(name);
    data.groups.push(group);
    await saveData(data);
    return group;
}

async function updateGroup(id, patch) {
    const data = await getData();
    const group = data.groups.find((item) => item.id === id);
    if (!group) {
        return null;
    }

    if (typeof patch.name === "string") {
        group.name = patch.name.trim();
    }

    await saveData(data);
    return group;
}

async function updatePractice(groupId, practiceType, patch) {
    const data = await getData();
    const group = data.groups.find((item) => item.id === groupId);
    if (!group || !Object.prototype.hasOwnProperty.call(group.practices, practiceType)) {
        return null;
    }

    const practice = group.practices[practiceType] || createEmptyPractice(practiceType);
    if ("startDate" in patch) practice.startDate = String(patch.startDate || "");
    if ("endDate" in patch) practice.endDate = String(patch.endDate || "");
    if ("hours" in patch) practice.hours = Number(patch.hours) || 0;
    group.practices[practiceType] = practice;

    await saveData(data);
    return group;
}

async function deleteGroup(id) {
    const data = await getData();
    const initialLength = data.groups.length;
    data.groups = data.groups.filter((item) => item.id !== id);
    if (data.groups.length === initialLength) {
        return false;
    }
    await saveData(data);
    return true;
}

async function listSubmissions() {
    const data = await getData();
    return data.submissions.map(publicSubmission);
}

async function addSubmission({ documentKey, file }) {
    const data = await getData();
    const now = new Date();
    const id = createId("sub");
    const fileName = standardSubmissionFileName(documentKey, now);
    const storedName = `${id}_${fileName}`;
    const relativePath = ["uploads", "submissions", storedName].join("/");
    const absolutePath = path.join(storageDir, relativePath);

    await fs.writeFile(absolutePath, file.content);

    const submission = {
        id,
        documentKey,
        documentName: documentKey,
        originalFileName: safeFileName(file.filename),
        fileName,
        mimeType: "application/pdf",
        uploadedAt: now.toISOString(),
        status: "new",
        adminComment: "",
        reviewReportFileName: "",
        submissionPath: relativePath,
        reportPath: ""
    };

    data.submissions.push(submission);
    await saveData(data);
    return publicSubmission(submission);
}

async function updateSubmission(id, patch) {
    const data = await getData();
    const submission = data.submissions.find((item) => item.id === id);
    if (!submission) {
        return null;
    }

    if (typeof patch.status === "string") {
        submission.status = patch.status;
    }
    if (typeof patch.adminComment === "string") {
        submission.adminComment = patch.adminComment;
    }

    await saveData(data);
    return publicSubmission(submission);
}

async function attachReport(id, file) {
    const data = await getData();
    const submission = data.submissions.find((item) => item.id === id);
    if (!submission) {
        return null;
    }

    const reportFileName = safeFileName(file.filename || `${id}_report.pdf`);
    const storedName = `${id}_${Date.now()}_${reportFileName}`;
    const relativePath = ["uploads", "reports", storedName].join("/");
    const absolutePath = path.join(storageDir, relativePath);

    await fs.writeFile(absolutePath, file.content);
    submission.reviewReportFileName = reportFileName;
    submission.reportPath = relativePath;

    await saveData(data);
    return publicSubmission(submission);
}

async function deleteFileIfExists(filePath) {
    if (!filePath) {
        return;
    }

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
}

async function deleteSubmission(id) {
    const data = await getData();
    const index = data.submissions.findIndex((item) => item.id === id);
    if (index === -1) {
        return false;
    }

    const [submission] = data.submissions.splice(index, 1);
    await deleteFileIfExists(submission.submissionPath ? path.join(storageDir, submission.submissionPath) : "");
    await deleteFileIfExists(submission.reportPath ? path.join(storageDir, submission.reportPath) : "");
    await saveData(data);
    return true;
}

async function getSubmissionFile(id, type) {
    const data = await getData();
    const submission = data.submissions.find((item) => item.id === id);
    if (!submission) {
        return null;
    }

    const relativePath = type === "report" ? submission.reportPath : submission.submissionPath;
    if (!relativePath) {
        return null;
    }

    return {
        fileName: type === "report" ? submission.reviewReportFileName : submission.fileName,
        path: path.join(storageDir, relativePath)
    };
}

function publicBinRecord(record) {
    return {
        id: record.id,
        bin: record.bin,
        url: record.url,
        name: record.name,
        address: record.address,
        director: record.director,
        region: record.region,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
    };
}

async function listBinRecords() {
    const data = await getData();
    return data.binRecords.map(publicBinRecord);
}

async function addBinRecord(input) {
    const data = await getData();
    const record = normalizeBinRecord({
        bin: input.bin,
        url: input.url,
        name: input.name,
        address: input.address,
        director: input.director,
        region: input.region
    });
    record.createdAt = new Date().toISOString();
    record.updatedAt = record.createdAt;
    data.binRecords.push(record);
    await saveData(data);
    return publicBinRecord(record);
}

async function updateBinRecord(id, patch) {
    const data = await getData();
    const record = data.binRecords.find((item) => item.id === id);
    if (!record) {
        return null;
    }

    if (typeof patch.bin === "string") {
        record.bin = patch.bin.replace(/\D/g, "");
    }
    if (typeof patch.url === "string") {
        record.url = patch.url.trim();
    }
    if (typeof patch.name === "string") {
        record.name = patch.name.trim();
    }
    if (typeof patch.address === "string") {
        record.address = patch.address.trim();
    }
    if (typeof patch.director === "string") {
        record.director = patch.director.trim();
    }
    if (typeof patch.region === "string") {
        record.region = patch.region.trim();
    }
    record.updatedAt = new Date().toISOString();

    await saveData(data);
    return publicBinRecord(record);
}

async function deleteBinRecord(id) {
    const data = await getData();
    const initialLength = data.binRecords.length;
    data.binRecords = data.binRecords.filter((item) => item.id !== id);
    if (data.binRecords.length === initialLength) {
        return false;
    }
    await saveData(data);
    return true;
}

async function findBinRecord(bin) {
    const data = await getData();
    const record = data.binRecords.find((item) => item.bin === bin);
    return record ? publicBinRecord(record) : null;
}

async function binRecordExists(bin, excludeId = null) {
    const data = await getData();
    return data.binRecords.some((item) => item.bin === bin && item.id !== excludeId);
}

module.exports = {
    addGroup,
    addBinRecord,
    addSubmission,
    attachReport,
    binRecordExists,
    deleteBinRecord,
    deleteGroup,
    deleteSubmission,
    findBinRecord,
    getSubmissionFile,
    listBinRecords,
    listGroups,
    listSubmissions,
    updateBinRecord,
    updateGroup,
    updatePractice,
    updateSubmission
};
