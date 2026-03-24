import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const createInitiateVOB = createAsyncThunk(
  "initiateVOB/createInitiateVOB",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/vendor/send_link_to_vendor/", formData);

      return {
        data: res.data,
        status: res.status,
      };
    } catch (err) {
      return rejectWithValue({
        data: err.response?.data,
        status: err.response?.status,
      });
    }
  },
);

const initiateVOBSlice = createSlice({
  name: "initiateVOB",
  initialState: {
    initiateVOB: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createInitiateVOB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInitiateVOB.fulfilled, (state, action) => {
        state.loading = false;
        state.initiateVOB = action.payload;
      })
      .addCase(createInitiateVOB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default initiateVOBSlice.reducer;
