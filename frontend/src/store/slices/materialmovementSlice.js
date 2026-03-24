import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= CRUD ================= */

export const fetchMaterialmovements = createAsyncThunk(
  "materialmovements/fetchMaterialmovements",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/material_movement/");
      return res.data;
    } catch (err) {
      print(e);
      return rejectWithValue(
        err.response?.data || "Error fetching Material Movements",
      );
    }
  },
);

export const createMaterialmovement = createAsyncThunk(
  "materialmovements/createMaterialmovement",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/material_movement/", formData);
      dispatch(fetchMaterialmovements());
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

export const updateMaterialmovement = createAsyncThunk(
  "materialmovements/updateMaterialmovement",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/material_movement/${id}`, formData);
      dispatch(fetchMaterialmovements());
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

export const deleteMaterialmovement = createAsyncThunk(
  "materialmovements/deleteMaterialmovement",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/material_movement/${id}`);
      dispatch(fetchMaterialmovements());
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
const materialmovementSlice = createSlice({
  name: "materialmovements",
  initialState: {
    materialmovements: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterialmovements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaterialmovements.fulfilled, (state, action) => {
        state.loading = false;
        state.materialmovements = action.payload;
      })
      .addCase(fetchMaterialmovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default materialmovementSlice.reducer;
