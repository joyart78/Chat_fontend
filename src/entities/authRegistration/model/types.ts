export interface RegistrationData {
  login: string;
  password: string;
  confirmPassword?: string;
}

export interface RegistrationFormFields {
  login: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationErrors {
  login?: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegistrationResponse {
  login: string;
  password: string;
}
