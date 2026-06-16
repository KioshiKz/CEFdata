import { tr } from "./i18n.js";
import { isAdmin } from "./state.js";
import { escapeHtml } from "./utils.js";

let localBinDatabasePromise = null;

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

async function getBinFromApi(bin) {
    const payload = await fetchJson(`/api/bin/${encodeURIComponent(bin)}`);
    return payload.record || payload;
}

async function getLocalBinDatabase() {
    if (!localBinDatabasePromise) {
        localBinDatabasePromise = fetchJson("./data/bin-database.json");
    }
    return localBinDatabasePromise;
}

async function findBinRecord(bin) {
    try {
        return await getBinFromApi(bin);
    } catch (error) {
        if (error.status === 404) {
            return null;
        }
    }

    const database = await getLocalBinDatabase();
    return database[bin] || null;
}

export async function searchBIN() {
    if (!isAdmin()) {
        return;
    }

    const bin = document.getElementById("binInput").value.trim();
    const resultDiv = document.getElementById("result");

    if (!bin) {
        resultDiv.innerHTML = `<p style="color: red;">${tr("emptyBin")}</p>`;
        return;
    }

    let record = null;
    try {
        record = await findBinRecord(bin);
    } catch {
        record = null;
    }
    if (!record) {
        resultDiv.innerHTML = `
            <p style="color: red;">${tr("binNotFound")}</p>
            <p>${tr("officialSources")}</p>
            <p><a href="https://portal.kgd.gov.kz/kk/pages/info-services/find-taxpayer" target="_blank" rel="noopener noreferrer">Мемлекеттік кірістер комитеті / Комитет государственных доходов</a></p>
            <p><a href="https://www.goszakup.gov.kz/kz/registry/supplierreg" target="_blank" rel="noopener noreferrer">Мемлекеттік сатып алу порталы / Портал государственных закупок</a></p>
        `;
        return;
    }

    resultDiv.innerHTML = `
        <h3>${tr("companyInfo")}</h3>
        <p><strong>${tr("name")}</strong> ${escapeHtml(record.name)}</p>
        <p><strong>${tr("address")}</strong> ${escapeHtml(record.address)}</p>
        <p><strong>${tr("director")}</strong> ${escapeHtml(record.director)}</p>
        <p><strong>${tr("region")}</strong> ${escapeHtml(record.region)}</p>
        <p><strong>${tr("source")}</strong> ${escapeHtml(record.sourceLabel)}</p>
    `;
}
