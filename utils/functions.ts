export function getQueryParams(params: any): string {
  if (!params) return "";
  /* eliminar todos los undefined */
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined) {
      delete params[key];
    }
  });
  return Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

const DATE_UNITS: { [key: string]: number } = {
  year: 31536000,
  month: 2629800,
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
};

export const getRelativeTime = (date: Date): string => {
  if (!date) return "";
  const dateFormat = new Date(date);
  const timestamp = dateFormat.getTime();
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const from = new Date(timestamp).getTime();
  const now = new Date().getTime();

  const elapsed = (from - now) / 1000;

  for (const unit in DATE_UNITS) {
    if (Math.abs(elapsed) > DATE_UNITS[unit]) {
      return rtf.format(
        Math.floor(elapsed / DATE_UNITS[unit]),
        unit as Intl.RelativeTimeFormatUnit
      );
    }
  }
  return rtf.format(0, "second");
};

export function getFormatNumber(number: number): string {
  return new Intl.NumberFormat("es-PE").format(number);
}

export function convertStringToDate(obj: any): any {
  for (const key in obj) {
    if (obj[key] && obj[key].includes("date")) {
      obj[key] = new Date(obj[key]);
    }
  }
  return obj;
}

export function convertDatesInObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertDatesInObject);
  }

  if (typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = (obj as Record<string, unknown>)[key];
        if (key.toLowerCase().includes("date") && typeof value === "string") {
          newObj[key] = new Date(value);
        } else {
          newObj[key] = convertDatesInObject(value);
        }
      }
    }
    return newObj;
  }

  return obj;
}

export function getFormDataFromObject(object: any): FormData {
  const formData = new FormData();
  Object.entries(object).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, value as any);
    }
  });
  return formData;
}
