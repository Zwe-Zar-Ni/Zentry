import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import my from "./locales/my.json";
import zh from "./locales/zh.json";

const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  },
  fr: {
    translation: fr
  },
  hi: {
    translation: hi
  },
  ja: {
    translation: ja
  },
  ko: {
    translation: ko
  },
  my: {
    translation: my
  },
  zh: {
    translation: zh
  }
};

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
