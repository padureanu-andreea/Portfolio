const isValidName = (value) => {
  return /^[\p{L}\s'-]{2,80}$/u.test(String(value || "").trim());
};

const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.com$/i.test(String(value || "").trim());
};

const isValidPhone = (value) => {
  return /^\d{10}$/.test(String(value || "").trim());
};

const isValidPassword = (value) => {
  const password = String(value || "");

  return password.length >= 4 && password.length <= 100;
};

const isValidShortText = (value, maxLength = 100) => {
  const trimmedValue = String(value || "").trim();

  return trimmedValue.length >= 2 && trimmedValue.length <= maxLength;
};

const isValidLongText = (value, maxLength = 12000) => {
  const trimmedValue = String(value || "").trim();

  return trimmedValue.length >= 10 && trimmedValue.length <= maxLength;
};

const isValidLocationName = (value, maxLength = 100) => {
  const trimmedValue = String(value || "").trim();

  return (
    trimmedValue.length >= 2 &&
    trimmedValue.length <= maxLength &&
    /^[\p{L}\s'-]+$/u.test(trimmedValue)
  );
};

const isValidPositiveInteger = (value, { required = false } = {}) => {
  const text = String(value ?? "").trim();

  if (!text) {
    return !required;
  }

  return /^\d+$/.test(text) && Number(text) >= 0;
};

const isValidSalaryRange = (minSalary, maxSalary) => {
  if (
    !isValidPositiveInteger(minSalary) ||
    !isValidPositiveInteger(maxSalary)
  ) {
    return false;
  }

  const min = minSalary ? Number(minSalary) : null;
  const max = maxSalary ? Number(maxSalary) : null;

  return !(min !== null && max !== null && max < min);
};

module.exports = {
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidShortText,
  isValidLongText,
  isValidLocationName,
  isValidSalaryRange
};
