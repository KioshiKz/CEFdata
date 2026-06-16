export const pageSections = ["home", "groups", "search", "binRecords", "documents", "adminPanel", "partners"];
export const adminSections = new Set(["groups", "adminPanel", "search", "binRecords"]);

export const practiceTypeOptions = [
    "Өндірістік оқыту",
    "Өндірістік тәжірибе",
    "Диплом алды тәжірибе",
    "Дипломдық жоба",
    "Оқу тәжірибесі"
];

export const documentDefinitions = [
    { key: "diary", name: "Күнделік" },
    { key: "characteristic", name: "Мінездеме" },
    { key: "practice_review", name: "Тәжірибе туралы шолу" },
    { key: "feedback", name: "Өндірістің студентке кері байланысы" },
    { key: "final_review", name: "Қорытынды шолу" },
    { key: "agreement", name: "Келісімшарт" },
    { key: "direction_paper", name: "Бағыт-бағдар қағазы" },
    { key: "report", name: "Отчет" }
];

export const fileMapping = {
    "Күнделік": "diary",
    "Мінездеме": "characteristic",
    "Тәжірибе туралы шолу": "practice_review",
    "Өндірістің студентке кері байланысы": "feedback",
    "Қорытынды шолу": "final_review",
    "Келісімшарт": "agreement",
    "Бағыт-бағдар қағазы": "direction_paper"
};

export const downloadFileByKey = {
    diary: "diary",
    characteristic: "characteristic",
    practice_review: "practice_review",
    feedback: "feedback",
    final_review: "final_review",
    agreement: "agreement",
    direction_paper: "direction_paper"
};

export const templateBasePath = "./assets/templates";

export const storageKeys = {
    language: "officialWebsiteLanguage"
};

export const legacyStatusKeys = {
    "Жаңа": "new",
    "Новый": "new",
    "Р–Р°ТЈР°": "new",
    "Р вЂ“Р В°РўР€Р В°": "new",
    "Тексерілді": "checked",
    "Проверено": "checked",
    "РўРµРєСЃРµСЂС–Р»РґС–": "checked",
    "Р СћР ВµР С”РЎРѓР ВµРЎР‚РЎвЂ“Р В»Р Т‘РЎвЂ“": "checked",
    "Түзету керек": "needsRevision",
    "Нужно исправить": "needsRevision",
    "РўТЇР·РµС‚Сѓ РєРµСЂРµРє": "needsRevision",
    "Р СћРўР‡Р В·Р ВµРЎвЂљРЎС“ Р С”Р ВµРЎР‚Р ВµР С”": "needsRevision",
    "Қабылданды": "accepted",
    "Принято": "accepted",
    "ТљР°Р±С‹Р»РґР°РЅРґС‹": "accepted",
    "РўС™Р В°Р В±РЎвЂ№Р В»Р Т‘Р В°Р Р…Р Т‘РЎвЂ№": "accepted"
};
