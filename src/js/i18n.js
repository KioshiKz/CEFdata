import { documentDefinitions, legacyStatusKeys, statusLabels } from "./labels.js";
import { appState, setCurrentLanguage } from "./state.js";
import { setPlaceholder, setText } from "./utils.js";

export const i18n = {
    kk: {
        title: "Қазақстан Республикасы - BIN іздеу жүйесі",
        headerTitle: "ӨСКЕМЕН ЭКОНОМИКА ЖӘНЕ ТЕХНИКА КОЛЛЕДЖІ",
        subtitle: "Өндірістік тәжірибеден өтуге арналған веб-сайт",
        navLogin: "Кіру",
        logoutButton: "Шығу",
        navSearch: "Іздеу",
        navGroups: "Топтар тізімі",
        navBinRecords: "BIN базасы",
        navDocuments: "Құжаттар қалтасы",
        navAdmin: "Әкім панелі",
        navPartners: "Әлеуметтік серіктестер",
        loginTitle: "Сайтқа кіру",
        loginText: "Сайтқа кіру үшін төмендегі өрістерге пайдаланушы аты мен құпия сөзді енгізіңіз.",
        username: "Пайдаланушы аты",
        password: "Құпия сөз",
        loginButton: "Кіру",
        homeTitle: "Қош келдіңіз!",
        homeText: "Бұл сайтқа рұқсат алған қолданушылар кіре алады. Студенттер мұнда құжаттарды PDF форматында жүктей алады, ал әкім жүктелген құжаттарды тексеріп, есеп файлын тіркей алады.",
        groupsTitle: "Топтар тізімі",
        groupsText: "Алдымен топтарды осы жерде қосыңыз. Әр топ жеке тізім болып шығады, ал ішіне кіргенде 5 практика түрі көрінеді.",
        noGroups: "Әзірге топтар жоқ. Жаңа топ қосыңыз.",
        groupName: "Топ атауы",
        addGroup: "Топ қосу",
        searchTitle: "BIN арқылы ұйымды табу",
        searchText: "Ұйымның БИН кодын енгізіңіз:",
        binPlaceholder: "BIN коды",
        searchButton: "Іздеу",
        binRecordsTitle: "BIN базасы",
        binRecordsText: "Осы жерден ұйымдардың BIN кодтары мен сілтемелерін қосып, өңдей аласыз. Іздеу кезінде осы жазбалар бірінші тексеріледі.",
        binFormTitleCreate: "Жаңа BIN жазбасын қосу",
        addBin: "Қосу",
        editBin: "Өзгерту",
        saveBin: "Сақтау",
        cancelEdit: "Бас тарту",
        binPlaceholder: "BIN (мысалы: 123456789012)",
        binUrlPlaceholder: "Сілтеме (https://...)",
        binNamePlaceholder: "Ұйым атауы",
        binAddressPlaceholder: "Мекенжайы",
        binDirectorPlaceholder: "Басшысы",
        binRegionPlaceholder: "Өңірі",
        noBinRecords: "Әзірге BIN жазбалары жоқ. Жаңа жазба қосыңыз.",
        binRequired: "BIN кодын енгізіңіз.",
        binDigitsOnly: "BIN тек цифрлардан тұруы тиіс.",
        urlRequired: "Сілтемені міндетті түрде енгізіңіз.",
        urlInvalid: "Сілтеме http:// немесе https:// арқылы басталуы тиіс.",
        confirmDeleteBin: "Бұл BIN жазбасын жоюға сенімдісіз бе?",
        loadFailed: "Жазбаларды жүктеу сәтсіз аяқталды.",
        saveFailed: "Жазбаны сақтау сәтсіз аяқталды.",
        deleteFailed: "Жазбаны жою сәтсіз аяқталды.",
        documentsTitle: "Құжаттар қалтасы",
        documentsText: "Төмендегі шаблондарды жүктеп алып, толтырылған нұсқасын PDF форматында қайта жүктей аласыз.",
        templates: "Шаблондар",
        templateNote: "Алдымен DOCX шаблонын жүктеп алыңыз, содан кейін толтырылған құжатты PDF ретінде қайта жүктеңіз.",
        uploadTitle: "Документтерді жүктеу",
        uploadText: "Қажетті құжат түрін басыңыз, сонда өз компьютеріңіздегі файлдар ашылады. Сол жерден керек PDF документті таңдап жүктейсіз.",
        uploadedFiles: "Жүктелген файлдар",
        adminTitle: "Әкім панелі",
        adminText: "Тізімнен топ пен практика түрін таңдаңыз. Таңдалған практика осында өңделеді.",
        tableGroup: "Топ атауы",
        tablePractice: "Практика түрі",
        tableStart: "Басталуы",
        tableEnd: "Аяқталуы",
        tableHours: "Сағат саны",
        tableAction: "Іс-әрекет",
        adminNote: "Жаңартылған мәндер серверге сақталады.",
        adminDocumentsTitle: "Жүктелген PDF құжаттар",
        adminDocumentsText: "Әкім осы жерден студент жүктеген PDF құжаттарды қарап, статус қойып және тексеру есебін PDF түрінде тіркей алады.",
        partnersTitle: "Әлеуметтік серіктестер",
        partnersText: "Өндірістік тәжірибе мен оқу үдерісіне қатысты қысқаша мәлімет:",
        partnerName: "Өскемен экономика және техника колледжі",
        partnerDirector: "Директоры:",
        partnerDirectorValue: "Нәбиев Ерсайын Ахметуәліұлы",
        partnerAddress: "Мекенжайы:",
        partnerAddressValue: "Өскемен қаласы, Бажова көшесі, 68",
        partnerBrief: "Қысқаша:",
        partnerBriefValue: "1943 жылы құрылған оқу орны. 2010 жылдан бастап Қазақстан-Американдық еркін университеті құрамында жұмыс істейді және экономикалық, техникалық бағыттар бойынша маман даярлайды.",
        partnerSite: "Сайт:",
        footer: "© 2026 Қазақстан Республикасы. Барлық құқықтар қорғалған.",
        loginFailed: "Қате пайдаланушы аты немесе құпия сөз. Қайта енгізіңіз.",
        loginRequired: "Сайтқа кіру үшін алдымен логин жасаңыз.",
        noAccess: "Сізде бұл бөлімге рұқсат жоқ.",
        emptyBin: "БИН кодын енгізіңіз.",
        binNotFound: "Бұл БИН жергілікті тексерілген тізімнен табылмады.",
        officialSources: "Шынайы дерек алу үшін ресми көзден тексеріңіз:",
        companyInfo: "Ұйым туралы ақпарат:",
        name: "Атауы:",
        address: "Адрес:",
        director: "Басшысы:",
        region: "Өңір:",
        source: "Дереккөз:",
        unnamedGroup: "Аты жоқ топ",
        noPracticeSelected: "Әзірге ешқандай практика таңдалмаған.",
        practiceSelected: "тобы, бағыты таңдалды.",
        delete: "Жою",
        onlyAdminGroups: "Топтарды тек админ қоса алады.",
        enterGroupName: "Топ атауын енгізіңіз.",
        uploadHint: "Толтырылған файлды өз құжаттарыңыздың ішінен таңдап жүктеңіз.",
        chooseDocument: "Құжат таңдау",
        chooseReport: "Отчет таңдау",
        noFileSelected: "Файл таңдалмаған",
        noStudentFiles: "Әзірге жүктелген PDF файлдар жоқ.",
        file: "Файл:",
        uploadedAt: "Жүктелген уақыты:",
        status: "Статус:",
        openFile: "Файлды ашу",
        openReport: "Отчетты ашу",
        choosePdf: "PDF файлын таңдаңыз.",
        onlyPdf: "Тек PDF форматындағы файл қабылданады.",
        uploadSuccess: "файлы сәтті жүктелді.",
        fileMissing: "Файл табылмады.",
        chooseReportPdf: "Отчет PDF файлын таңдаңыз.",
        reportMustBePdf: "Отчет тек PDF форматында болуы керек.",
        noAdminDocuments: "Әзірге студенттер жүктеген PDF құжаттар жоқ.",
        originalName: "Бастапқы атауы:",
        openPdf: "PDF ашу",
        adminComment: "Әкімнің ескертпесі",
        attachReport: "Тексеру есебін PDF форматында тіркеу:",
        uploadReport: "Отчет PDF жүктеу",
        uploadedReport: "Жүктелген отчет:",
        fileNotFoundAdmin: "Файл табылмады. Әкімшіге хабарласыңыз.",
        downloadError: "Файлды жүктеу кезінде қате пайда болды."
    },
    ru: {
        title: "Республика Казахстан - система поиска BIN",
        headerTitle: "УСТЬ-КАМЕНОГОРСКИЙ КОЛЛЕДЖ ЭКОНОМИКИ И ТЕХНИКИ",
        subtitle: "Веб-сайт для прохождения производственной практики",
        navLogin: "Вход",
        logoutButton: "Выход",
        navSearch: "Поиск",
        navGroups: "Список групп",
        navBinRecords: "База BIN",
        navDocuments: "Папка документов",
        navAdmin: "Панель администратора",
        navPartners: "Социальные партнеры",
        loginTitle: "Вход на сайт",
        loginText: "Введите имя пользователя и пароль в поля ниже.",
        username: "Имя пользователя",
        password: "Пароль",
        loginButton: "Войти",
        homeTitle: "Добро пожаловать!",
        homeText: "На сайт могут входить пользователи с доступом. Студенты загружают документы в формате PDF, а администратор проверяет их и прикрепляет файл отчета.",
        groupsTitle: "Список групп",
        groupsText: "Сначала добавьте группы здесь. Каждая группа отображается отдельным списком, внутри доступны 5 видов практики.",
        noGroups: "Пока групп нет. Добавьте новую группу.",
        groupName: "Название группы",
        addGroup: "Добавить группу",
        searchTitle: "Найти организацию по BIN",
        searchText: "Введите BIN организации:",
        binPlaceholder: "Код BIN",
        searchButton: "Поиск",
        binRecordsTitle: "База BIN",
        binRecordsText: "Здесь можно добавлять и редактировать BIN-коды организаций и ссылки на них. При поиске эти записи проверяются первыми.",
        binFormTitleCreate: "Добавить новую запись BIN",
        addBin: "Добавить",
        editBin: "Изменить",
        saveBin: "Сохранить",
        cancelEdit: "Отмена",
        binPlaceholder: "BIN (например: 123456789012)",
        binUrlPlaceholder: "Ссылка (https://...)",
        binNamePlaceholder: "Название организации",
        binAddressPlaceholder: "Адрес",
        binDirectorPlaceholder: "Руководитель",
        binRegionPlaceholder: "Регион",
        noBinRecords: "Пока записей BIN нет. Добавьте новую запись.",
        binRequired: "Введите код BIN.",
        binDigitsOnly: "BIN должен состоять только из цифр.",
        urlRequired: "Ссылка обязательна для заполнения.",
        urlInvalid: "Ссылка должна начинаться с http:// или https://.",
        confirmDeleteBin: "Вы уверены, что хотите удалить эту запись BIN?",
        loadFailed: "Не удалось загрузить записи.",
        saveFailed: "Не удалось сохранить запись.",
        deleteFailed: "Не удалось удалить запись.",
        documentsTitle: "Папка документов",
        documentsText: "Скачайте шаблоны ниже, заполните их и загрузите готовую версию в формате PDF.",
        templates: "Шаблоны",
        templateNote: "Сначала скачайте шаблон DOCX, затем загрузите заполненный документ в формате PDF.",
        uploadTitle: "Загрузка документов",
        uploadText: "Нажмите на нужный тип документа, выберите PDF-файл на компьютере и загрузите его.",
        uploadedFiles: "Загруженные файлы",
        adminTitle: "Панель администратора",
        adminText: "Выберите группу и вид практики из списка. Выбранная практика редактируется здесь.",
        tableGroup: "Название группы",
        tablePractice: "Вид практики",
        tableStart: "Начало",
        tableEnd: "Окончание",
        tableHours: "Количество часов",
        tableAction: "Действие",
        adminNote: "Обновленные значения сохраняются на сервере.",
        adminDocumentsTitle: "Загруженные PDF-документы",
        adminDocumentsText: "Администратор может просматривать PDF-документы студентов, менять статус и прикреплять отчет проверки в PDF.",
        partnersTitle: "Социальные партнеры",
        partnersText: "Краткая информация о производственной практике и учебном процессе:",
        partnerName: "Усть-Каменогорский колледж экономики и техники",
        partnerDirector: "Директор:",
        partnerDirectorValue: "Набиев Ерсайын Ахметуалиевич",
        partnerAddress: "Адрес:",
        partnerAddressValue: "город Усть-Каменогорск, улица Бажова, 68",
        partnerBrief: "Кратко:",
        partnerBriefValue: "Учебное заведение основано в 1943 году. С 2010 года работает в составе Казахстанско-Американского свободного университета и готовит специалистов экономического и технического направлений.",
        partnerSite: "Сайт:",
        footer: "© 2026 Республика Казахстан. Все права защищены.",
        loginFailed: "Неверное имя пользователя или пароль. Попробуйте еще раз.",
        loginRequired: "Чтобы перейти в раздел, сначала войдите на сайт.",
        noAccess: "У вас нет доступа к этому разделу.",
        emptyBin: "Введите код БИН.",
        binNotFound: "Этот БИН не найден в локальном проверенном списке.",
        officialSources: "Для актуальных данных проверьте официальные источники:",
        companyInfo: "Информация об организации:",
        name: "Название:",
        address: "Адрес:",
        director: "Руководитель:",
        region: "Регион:",
        source: "Источник:",
        unnamedGroup: "Группа без названия",
        noPracticeSelected: "Пока не выбрана ни одна практика.",
        practiceSelected: "группа, направление выбрано.",
        delete: "Удалить",
        onlyAdminGroups: "Группы может добавлять только администратор.",
        enterGroupName: "Введите название группы.",
        uploadHint: "Выберите заполненный файл из своих документов и загрузите его.",
        chooseDocument: "Выбрать документ",
        chooseReport: "Выбрать отчет",
        noFileSelected: "Файл не выбран",
        noStudentFiles: "Пока загруженных PDF-файлов нет.",
        file: "Файл:",
        uploadedAt: "Время загрузки:",
        status: "Статус:",
        openFile: "Открыть файл",
        openReport: "Открыть отчет",
        choosePdf: "Выберите PDF-файл.",
        onlyPdf: "Принимаются только файлы в формате PDF.",
        uploadSuccess: "файл успешно загружен.",
        fileMissing: "Файл не найден.",
        chooseReportPdf: "Выберите PDF-файл отчета.",
        reportMustBePdf: "Отчет должен быть в формате PDF.",
        noAdminDocuments: "Пока студенты не загрузили PDF-документы.",
        originalName: "Исходное имя:",
        openPdf: "Открыть PDF",
        adminComment: "Комментарий администратора",
        attachReport: "Прикрепить отчет проверки в формате PDF:",
        uploadReport: "Загрузить PDF-отчет",
        uploadedReport: "Загруженный отчет:",
        fileNotFoundAdmin: "Файл не найден. Сообщите администратору.",
        downloadError: "При загрузке файла произошла ошибка."
    }
};

export const documentLabels = Object.fromEntries(
    documentDefinitions.map((item) => [
        item.key,
        {
            kk: item.name,
            ru: {
                diary: "Дневник",
                characteristic: "Характеристика",
                practice_review: "Отзыв о практике",
                feedback: "Обратная связь от производства",
                final_review: "Итоговый отзыв",
                agreement: "Договор",
                direction_paper: "Направление",
                report: "Отчет"
            }[item.key] || item.name
        }
    ])
);

export const practiceLabels = {
    "Өндірістік оқыту": { kk: "Өндірістік оқыту", ru: "Производственное обучение" },
    "Өндірістік тәжірибе": { kk: "Өндірістік тәжірибе", ru: "Производственная практика" },
    "Диплом алды тәжірибе": { kk: "Диплом алды тәжірибе", ru: "Преддипломная практика" },
    "Дипломдық жоба": { kk: "Дипломдық жоба", ru: "Дипломный проект" },
    "Оқу тәжірибесі": { kk: "Оқу тәжірибесі", ru: "Учебная практика" }
};

export function tr(key) {
    return i18n[appState.currentLanguage]?.[key] || i18n.kk[key] || key;
}

export function localizedDocumentName(key) {
    return documentLabels[key]?.[appState.currentLanguage] || key;
}

export function localizedPracticeName(value) {
    return practiceLabels[value]?.[appState.currentLanguage] || value;
}

export function normalizeStatus(status) {
    if (statusLabels[status]) {
        return status;
    }

    return legacyStatusKeys[status] || "new";
}

export function localizedStatus(value) {
    const normalized = normalizeStatus(value);
    return statusLabels[normalized]?.[appState.currentLanguage] || value;
}

export function pdfDropText(key) {
    const dictionary = {
        title: {
            kk: "PDF құжатты осы жерге салыңыз",
            ru: "Перетащите PDF-документ сюда"
        },
        hint: {
            kk: "немесе басып, компьютерден таңдаңыз",
            ru: "или нажмите, чтобы выбрать с компьютера"
        },
        choose: {
            kk: "PDF таңдау",
            ru: "Выбрать PDF"
        }
    };

    return dictionary[key]?.[appState.currentLanguage] || dictionary[key]?.kk || key;
}

export function setLanguageValue(language) {
    setCurrentLanguage(language);
}

export function formatDateTime(value) {
    return new Date(value).toLocaleString(appState.currentLanguage === "ru" ? "ru-RU" : "kk-KZ");
}

export function applyStaticTranslations() {
    document.documentElement.lang = appState.currentLanguage;
    document.title = tr("title");
    setText("header h1", tr("headerTitle"));
    setText(".subtitle", tr("subtitle"));

    const navItems = ["navLogin", "navSearch", "navGroups", "navBinRecords", "navDocuments", "navAdmin", "navPartners"];
    document.querySelectorAll("nav a").forEach((link, index) => {
        link.textContent = tr(navItems[index]);
    });

    setText("#login h2", tr("loginTitle"));
    setText("#login > p", tr("loginText"));
    setPlaceholder("#usernameInput", tr("username"));
    setPlaceholder("#passwordInput", tr("password"));
    setText("#login button", tr("loginButton"));

    setText("#home h2", tr("homeTitle"));
    setText("#home p", tr("homeText"));
    setText("#groups h2", tr("groupsTitle"));
    setText("#groups > p", tr("groupsText"));
    setText("#noGroupsMessage", tr("noGroups"));
    setPlaceholder("#newGroupName", tr("groupName"));
    setText(".group-form button", tr("addGroup"));

    setText("#search h2", tr("searchTitle"));
    setText("#search .search-box > p", tr("searchText"));
    setPlaceholder("#binInput", tr("binPlaceholder"));
    setText("#search button", tr("searchButton"));

    setText("#binRecords h2", tr("binRecordsTitle"));
    setText("#binRecords .bin-records-box > p", tr("binRecordsText"));
    setText("#binFormTitle", tr("binFormTitleCreate"));
    setPlaceholder("#binRecordBin", tr("binPlaceholder"));
    setPlaceholder("#binRecordUrl", tr("binUrlPlaceholder"));
    setPlaceholder("#binRecordName", tr("binNamePlaceholder"));
    setPlaceholder("#binRecordAddress", tr("binAddressPlaceholder"));
    setPlaceholder("#binRecordDirector", tr("binDirectorPlaceholder"));
    setPlaceholder("#binRecordRegion", tr("binRegionPlaceholder"));
    setText(".bin-save-button", tr("addBin"));
    setText(".bin-cancel-button", tr("cancelEdit"));
    setText("#noBinRecordsMessage", tr("noBinRecords"));

    setText("#documents h2", tr("documentsTitle"));
    setText("#documents .documents-box > p", tr("documentsText"));
    setText("#documents h3", tr("templates"));
    setText("#documents .documents-box .note", tr("templateNote"));
    setText(".upload-panel-title", tr("uploadTitle"));
    setText(".upload-panel-content > p", tr("uploadText"));
    setText(".uploaded-files-box h4", tr("uploadedFiles"));

    setText("#adminPanel h2", tr("adminTitle"));
    setText("#adminPanel > p", tr("adminText"));
    const headers = ["tableGroup", "tablePractice", "tableStart", "tableEnd", "tableHours", "tableAction"];
    document.querySelectorAll(".group-table th").forEach((cell, index) => {
        cell.textContent = tr(headers[index]);
    });
    setText("#adminPanel > .note", tr("adminNote"));
    setText(".admin-documents-section h3", tr("adminDocumentsTitle"));
    setText(".admin-documents-section > p", tr("adminDocumentsText"));

    setText("#partners h2", tr("partnersTitle"));
    setText("#partners > p", tr("partnersText"));
    setText(".partner-card h3", tr("partnerName"));
    const partnerParagraphs = document.querySelectorAll(".partner-card p");
    if (partnerParagraphs[0]) partnerParagraphs[0].innerHTML = `<strong>${tr("partnerDirector")}</strong> ${tr("partnerDirectorValue")}`;
    if (partnerParagraphs[1]) partnerParagraphs[1].innerHTML = `<strong>${tr("partnerAddress")}</strong> ${tr("partnerAddressValue")}`;
    if (partnerParagraphs[2]) partnerParagraphs[2].innerHTML = `<strong>${tr("partnerBrief")}</strong> ${tr("partnerBriefValue")}`;
    if (partnerParagraphs[3]) partnerParagraphs[3].innerHTML = `<strong>${tr("partnerSite")}</strong> cef.kafu.kz`;

    setText("footer p", tr("footer"));
    document.querySelectorAll(".language-button").forEach((button) => {
        button.classList.toggle("active", button.dataset.lang === appState.currentLanguage);
        button.setAttribute("aria-pressed", String(button.dataset.lang === appState.currentLanguage));
    });
}
