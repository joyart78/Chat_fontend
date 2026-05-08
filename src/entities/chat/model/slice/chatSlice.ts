import { createSlice } from "@reduxjs/toolkit";
import type { ChatState, Message } from "../types/types.ts";

const initialState: ChatState = {
  messages: [],
  connectionStatus: "disconnected",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(state, action: { payload: Message }) {
      state.messages.push(action.payload);
    },
    clearMessages(state) {
      state.messages = [];
    },
    setConnectionStatus(
      state,
      action: { payload: ChatState["connectionStatus"] },
    ) {
      state.connectionStatus = action.payload;
    },
  },
});

export const { addMessage, clearMessages, setConnectionStatus } =
  chatSlice.actions;

export default chatSlice.reducer;
