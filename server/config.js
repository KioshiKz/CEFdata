const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const seedDataDir = path.join(rootDir, "data");
const seedStorageDir = path.join(rootDir, "storage");
const dataDir = process.env.APP_DATA_DIR || process.env.DATA_DIR || seedDataDir;
const storageDir = process.env.APP_STORAGE_DIR || process.env.STORAGE_DIR || seedStorageDir;
const uploadDir = path.join(storageDir, "uploads");

const credentials = {
    student: { username: "college", password: "1234", role: "student" },
    admin: { username: "admin", password: "admin123", role: "admin" }
};

const practiceTypeOptions = [
    "Өндірістік оқыту",
    "Өндірістік тәжірибе",
    "Диплом алды тәжірибе",
    "Дипломдық жоба",
    "Оқу тәжірибесі"
];

const documentKeys = new Set([
    "diary",
    "characteristic",
    "practice_review",
    "feedback",
    "final_review",
    "agreement",
    "direction_paper",
    "report"
]);

const statusKeys = new Set(["new", "checked", "needsRevision", "accepted"]);

module.exports = {
    appDataPath: process.env.APP_DATA_PATH || path.join(dataDir, "app-data.json"),
    binDatabasePath: process.env.BIN_DATABASE_PATH || path.join(seedDataDir, "bin-database.json"),
    credentials,
    dataDir,
    documentKeys,
    maxUploadBytes: 25 * 1024 * 1024,
    mimeTypes: {
        ".css": "text/css; charset=utf-8",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".txt": "text/plain; charset=utf-8"
    },
    port: Number(process.env.PORT) || 3000,
    practiceTypeOptions,
    rootDir,
    seedAppDataPath: path.join(seedDataDir, "app-data.json"),
    seedStorageDir,
    statusKeys,
    storageDir,
    uploadDir
};
