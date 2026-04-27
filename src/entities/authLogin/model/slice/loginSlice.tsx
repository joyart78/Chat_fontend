import { createSlice } from "@reduxjs/toolkit";

interface LoginState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuth: boolean;
}

const initialState: LoginState = {
  accessToken: null,
  refreshToken: null,
  isAuth: false,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    setRefreshToken(state, action) {
      state.refreshToken = action.payload;
    },
    setTokens(state, action) {
      state.accessToken = action.payload;
      state.refreshToken = action.payload;
    },
    setIsAuth(state, action) {
      state.isAuth = action.payload;
    },
  },
});

export const { setAccessToken, setRefreshToken, setTokens, setIsAuth } =
  loginSlice.actions;

export default loginSlice.reducer;
