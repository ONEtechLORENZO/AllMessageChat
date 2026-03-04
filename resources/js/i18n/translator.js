import itTranslations from "./it";
import enTranslations from "./en";

const dictionaries = {
    en: enTranslations,
    it: itTranslations,
};

export const getLocale = () => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("locale") || "it";
};

export const setLocale = (locale) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("locale", locale);
};

export const translate = (value, locale = getLocale(), base = {}) => {
    if (typeof value !== "string") return value;
    const dictionary = { ...base, ...(dictionaries[locale] || {}) };
    return dictionary[value] ?? value;
};

export const createTranslator = (base = {}, locale = getLocale()) => {
    const dictionary = { ...base, ...(dictionaries[locale] || {}) };
    return new Proxy(dictionary, {
        get: (target, prop) =>
            typeof prop === "string" ? target[prop] ?? prop : "",
    });
};

export const availableLocales = [
    { value: "en", label: "EN" },
    { value: "it", label: "IT" },
];
