export interface RegistrationData {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationFormFields {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}
