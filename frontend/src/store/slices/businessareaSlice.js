import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchBusinessareas = createAsyncThunk(
  "businessareas/fetchBusinessareas",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/business_area/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching  Business Area",
      );
    }
  },
);

export const createBusinessareas = createAsyncThunk(
  "businessareas/createBusinessareas",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/business_area/", formData);
      dispatch(fetchBusinessareas());
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

export const updateBusinessareas = createAsyncThunk(
  "businessareas/updateBusinessareas",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/business_area/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchBusinessareas());
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

export const deleteBusinessarea = createAsyncThunk(
  "businessareas/deleteBusinessarea",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/business_area/${id}`);
      dispatch(fetchBusinessareas());
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
const businessareaSlice = createSlice({
  name: "businessareas",
  initialState: {
    businessareas: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessareas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBusinessareas.fulfilled, (state, action) => {
        state.loading = false;
        state.businessareas = action.payload;
      })
      .addCase(fetchBusinessareas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessareaSlice.reducer;
