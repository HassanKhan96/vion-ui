export const parseAppDate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (/^\d+$/.test(value)) {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) {
      const date = new Date(asNumber);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getAppTimestamp = (value: string | number | null | undefined) => {
  return parseAppDate(value)?.getTime() ?? 0;
};
