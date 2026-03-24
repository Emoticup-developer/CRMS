import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= GET LOGGED-IN USER ================= */
export const fetchUserByUsername = createAsyncThunk(
  "users/fetchUserByUsername",
  async (username, { rejectWithValue }) => {
    try {
      const res = await api.get(`/people/user/?username=${username}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching user profile",
      );
    }
  },
);

/* ================= SLICE ================= */
const userProfileSlice = createSlice({
  name: "userProfile",
  initialState: {
    selectedUser: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByUsername.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserByUsername.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload?.[0] || null; // 👈 API returns array
      })
      .addCase(fetchUserByUsername.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userProfileSlice.reducer;
