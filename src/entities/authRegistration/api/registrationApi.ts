import { createSlice } from "@reduxjs/toolkit";
import type { RegistrationFormFields } from "../model/types.ts";

const initialState: Omit<RegistrationFormFields, "confirmPassword"> = {
  username: "",
  password: "",
};

const registrationApi = createSlice({
  name: "registration",
  initialState,
    reducers:
});

export default registrationApi.reducer;
