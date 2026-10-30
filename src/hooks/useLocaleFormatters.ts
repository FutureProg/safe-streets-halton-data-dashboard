import { useTranslation } from "react-i18next";

/**
 * Formatters bound to the active language: `date` and `time` follow the
 * locale, `description` translates a static incident code, and `translate` is
 * the default-namespace `t`.
 */
export const useLocaleFormatters = () => {
  const { t: translate, i18n } = useTranslation();
  const { t: tStaticValues } = useTranslation("staticValues");
  return {
    date: (date: Date, style: "medium" | "full" = "medium") =>
      date.toLocaleDateString(i18n.language, { dateStyle: style }),
    time: (date: Date) =>
      date.toLocaleTimeString(i18n.language, { timeStyle: "short" }),
    description: (code: string) => tStaticValues(code),
    translate,
  };
};
