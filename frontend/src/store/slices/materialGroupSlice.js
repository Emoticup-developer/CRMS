import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchMaterialGroups = createAsyncThunk(
  "materialGroups/fetchMaterialGroups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/material_group/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching material groups",
      );
    }
  },
);

export const createMaterialGroup = createAsyncThunk(
  "materialGroups/createMaterialGroup",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/material_group/", formData);
      dispatch(fetchMaterialGroups());
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

export const updateMaterialGroup = createAsyncThunk(
  "materialGroups/updateMaterialGroup",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/material_group/${id}`, formData);
      dispatch(fetchMaterialGroups());
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

export const deleteMaterialGroup = createAsyncThunk(
  "materialGroups/deleteMaterialGroup",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/material_group/${id}`);
      dispatch(fetchMaterialGroups());
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
const materialGroupSlice = createSlice({
  name: "materialGroups",
  initialState: {
    materialGroups: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterialGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaterialGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.materialGroups = action.payload;
      })
      .addCase(fetchMaterialGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default materialGroupSlice.reducer;
