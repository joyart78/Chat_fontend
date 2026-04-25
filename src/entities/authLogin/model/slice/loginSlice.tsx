import { createSlice } from "@reduxjs/toolkit";

interface LoginState {
  token: string | null;
}

const initialState: LoginState = {
  token: null,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
  },
});

export const { setToken } = loginSlice.actions;

export default loginSlice.reducer;
