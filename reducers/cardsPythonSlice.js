import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
};

const cardsPythonSlice = createSlice({
  name: "cardsPython",
  initialState,
  reducers: {
    setCardsPython: (state, action) => {
      state.data = action.payload || null;
    },

  },
});

export const { setCardsPython } = cardsPythonSlice.actions;
export default cardsPythonSlice.reducer;
