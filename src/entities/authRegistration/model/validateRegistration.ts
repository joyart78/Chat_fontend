import type { RegistrationData, RegistrationErrors } from "./types";

export const validateRegistration = (
  data: RegistrationData,
  confirm: string,
): RegistrationErrors => {
  const errors: RegistrationErrors = {};

  if (!data.login.trim()) {
    errors.login = "Username is required";
  } else if (data.login.length < 3) {
    errors.login = "Username must be at least 3 characters";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!confirm) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== confirm) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const isValidRegistration = (errors: RegistrationErrors): boolean => {
  return Object.keys(errors).length === 0;
};
