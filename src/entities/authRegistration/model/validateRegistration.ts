import type { RegistrationData, RegistrationErrors } from "./types";

export const validateRegistration = (
  data: RegistrationData,
): RegistrationErrors => {
  const errors: RegistrationErrors = {};

  if (!data.username.trim()) {
    errors.username = "Username is required";
  } else if (data.username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const isValidRegistration = (errors: RegistrationErrors): boolean => {
  return Object.keys(errors).length === 0;
};
