export function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

export function setPlaceholder(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.placeholder = value;
    }
}

export function setInlineMessage(element, text, isError) {
    if (!element) {
        return;
    }

    element.textContent = text;
    element.className = `inline-message ${isError ? "error" : "success"}`;
}

export function formatDateForFileName(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
