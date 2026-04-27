export interface LoginData {
  login: string;
  password: string;
}

export interface LoginErrors {
  login?: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    login: string;
    updated_at: string;
  };
}

export interface Token {
  sub: string;
  user: {
    id: number;
    login: string;
  };
  exp: number;
  iat: number;
  refresh_token: string;
}
