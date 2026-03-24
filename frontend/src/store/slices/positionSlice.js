import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchPositions = createAsyncThunk(
  "positions/fetchPositions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/position/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching Position ");
    }
  },
);

export const createPosition = createAsyncThunk(
  "positions/createPosition",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/position/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchPositions());
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

export const updatePosition = createAsyncThunk(
  "positions/updatePosition",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/position/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchPositions());
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

export const deletePosition = createAsyncThunk(
  "positions/deletePosition",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/position/${id}`);
      dispatch(fetchPositions());
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
const positionSlice = createSlice({
  name: "positions",
  initialState: {
    positions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default positionSlice.reducer;
