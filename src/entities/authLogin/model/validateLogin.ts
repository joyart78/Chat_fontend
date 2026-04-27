import type { LoginData, LoginErrors } from "./types/types.ts";

export const validateLogin = (data: LoginData): LoginErrors => {
  const errors: LoginErrors = {};

  if (!data.login.trim()) {
    errors.login = "Username is required";
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const isValidLogin = (errors: LoginErrors): boolean => {
  return Object.keys(errors).length === 0;
};

export {
  type LoginData,
  type LoginErrors,
  type LoginResponse,
} from "./types/types.ts";
