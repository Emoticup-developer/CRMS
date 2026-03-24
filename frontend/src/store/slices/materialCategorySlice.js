import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchMaterialCategories = createAsyncThunk(
  "materialCategories/fetchMaterialCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/material_category/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching material categories",
      );
    }
  },
);

export const createMaterialCategory = createAsyncThunk(
  "materialCategories/createMaterialCategory",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/material_category/", formData);
      dispatch(fetchMaterialCategories());
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

export const updateMaterialCategory = createAsyncThunk(
  "materialCategories/updateMaterialCategory",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/material_category/${id}`, formData);
      dispatch(fetchMaterialCategories());
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

export const deleteMaterialCategory = createAsyncThunk(
  "materialCategories/deleteMaterialCategory",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/material_category/${id}`);
      dispatch(fetchMaterialCategories());
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

/* ================= FK DROPDOWNS ================= */
export const fetchMaterialGroups = createAsyncThunk(
  "materialCategories/fetchMaterialGroups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/material_group/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const materialCategorySlice = createSlice({
  name: "materialCategories",
  initialState: {
    materialCategories: [],
    materialGroups: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterialCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaterialCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.materialCategories = action.payload;
      })
      .addCase(fetchMaterialCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMaterialGroups.fulfilled, (state, action) => {
        state.materialGroups = action.payload;
      });
  },
});

export default materialCategorySlice.reducer;
