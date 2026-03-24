import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchUserstatuses = createAsyncThunk(
  "userstatuses/fetchUserstatuses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/user_status/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching User Status",
      );
    }
  },
);

export const createUserstatus = createAsyncThunk(
  "Userstatuses/createUserstatus",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/user_status/", formData);
      dispatch(fetchUserstatuses());
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

export const updateUserstatus = createAsyncThunk(
  "userstatuses/updateUserstatus",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/user_status/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchUserstatuses());
      return {
        id,
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

export const deleteUserstatus = createAsyncThunk(
  "userstatuses/deleteUserstatus",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/user_status/${id}`);
      dispatch(fetchUserstatuses());
      return {
        id,
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

/* ================= SLICE ================= */
const userstatusSlice = createSlice({
  name: "userstatuses",
  initialState: {
    userstatuses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserstatuses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserstatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.userstatuses = action.payload;
      })
      .addCase(fetchUserstatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userstatusSlice.reducer;
