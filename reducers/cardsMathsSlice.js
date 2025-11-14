import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
};

const cardsMathsSlice = createSlice({
  name: "cardsMaths",
  initialState,
  reducers: {
    setCardsMaths: (state, action) => {
      state.data = action.payload || null;
    },

  },
});

export const { setCardsMaths } = cardsMathsSlice.actions;
export default cardsMathsSlice.reducer;
