import { format, formatRelative } from "date-fns";
import { es } from "date-fns/locale";

/**
 * @param date Fecha a formatear
 * @param defaultMessage Mensaje por defecto a retornar si la fecha es nula
 * @returns Fecha formateada a string en el formato "dd/MM/yyyy"
 * @example "01/01/2022"
 */
export function formatDateToString(
  date?: Date | string,
  defaultMessage?: string
): string {
  if (!date) return defaultMessage || "Sin fecha";
  const dateToFormat = new Date(date);
  if (typeof date === "string") {
    dateToFormat.setDate(dateToFormat.getDate() + 1);
  }
  return format(dateToFormat, "dd/MM/yyyy", { locale: es });
}

/**
 * @param date Fecha a formatear
 * @param defaultMessage Mensaje por defecto a retornar si la fecha es nula
 * @returns Fecha formateada a string en el formato "dia" de "mes" de "año" en español
 * @example "1 de enero de 2022"
 */
export function getStringFromDate(
  date?: Date | string,
  defaultMessage?: string
): string {
  if (!date) return defaultMessage || "Sin fecha";
  const dateToFormat = new Date(date);
  return dateToFormat.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * @param date Fecha a formatear
 * @param defaultMessage Mensaje por defecto a retornar si la fecha es nula
 * @returns Fecha formateada a string en el formato "dia" de "mes" de "año" en español
 * @example "1 de enero de 2022"
 */
export function getRelativeTime(date: Date, defaultMessage?: string): string {
  if (!date) return defaultMessage || "Sin fecha";
  const dateFormat = new Date(date);
  return formatRelative(dateFormat, new Date(), { locale: es });
}
