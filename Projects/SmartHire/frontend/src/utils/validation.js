export const sanitizeDigits = (value, maxLength) => {
  const digits = String(value || "").replace(/\D/g, "");

  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
};

export const sanitizeIntegerInput = (value) => {
  return sanitizeDigits(value);
};

export const isValidName = (value) => {
  return /^[\p{L}\s'-]{2,80}$/u.test(String(value || "").trim());
};

export const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.com$/i.test(String(value || "").trim());
};

export const isValidPhone = (value) => {
  return /^\d{10}$/.test(String(value || "").trim());
};

export const isValidPassword = (value) => {
  const password = String(value || "");

  return password.length >= 4 && password.length <= 100;
};

export const isValidShortText = (value, maxLength = 100) => {
  const trimmedValue = String(value || "").trim();

  return trimmedValue.length >= 2 && trimmedValue.length <= maxLength;
};

export const isValidLongText = (value, maxLength = 12000) => {
  const trimmedValue = String(value || "").trim();

  return trimmedValue.length >= 10 && trimmedValue.length <= maxLength;
};

export const isValidLocationName = (value, maxLength = 100) => {
  const trimmedValue = String(value || "").trim();

  return (
    trimmedValue.length >= 2 &&
    trimmedValue.length <= maxLength &&
    /^[\p{L}\s'-]+$/u.test(trimmedValue)
  );
};

export const isValidFiscalCode = (value) => {
  return !value || /^[A-Za-z0-9-]{2,30}$/.test(String(value).trim());
};

export const isValidPositiveInteger = (value, { required = false } = {}) => {
  const text = String(value || "").trim();

  if (!text) {
    return !required;
  }

  return /^\d+$/.test(text) && Number(text) >= 0;
};

export const isValidSalaryRange = (minSalary, maxSalary) => {
  if (
    !isValidPositiveInteger(minSalary) ||
    !isValidPositiveInteger(maxSalary)
  ) {
    return false;
  }

  const min = minSalary ? Number(minSalary) : null;
  const max = maxSalary ? Number(maxSalary) : null;

  if (min !== null && max !== null && max < min) {
    return false;
  }

  return true;
};
