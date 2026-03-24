import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchMaterialTypes = createAsyncThunk(
  "materialTypes/fetchMaterialTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/material_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching material types",
      );
    }
  },
);

export const createMaterialType = createAsyncThunk(
  "materialTypes/createMaterialType",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/material_type/", formData);
      dispatch(fetchMaterialTypes());
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

export const updateMaterialType = createAsyncThunk(
  "materialTypes/updateMaterialType",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/material_type/${id}`, formData);
      dispatch(fetchMaterialTypes());
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

export const deleteMaterialType = createAsyncThunk(
  "materialTypes/deleteMaterialType",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/material_type/${id}`);
      dispatch(fetchMaterialTypes());
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
export const fetchMaterialCategories = createAsyncThunk(
  "materialTypes/fetchMaterialCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/material_category/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchUsers = createAsyncThunk(
  "materialTypes/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/user/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCompanies = createAsyncThunk(
  "materialTypes/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/company/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const materialTypeSlice = createSlice({
  name: "materialTypes",
  initialState: {
    materialTypes: [],
    materialCategories: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterialTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaterialTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.materialTypes = action.payload;
      })
      .addCase(fetchMaterialTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMaterialCategories.fulfilled, (state, action) => {
        state.materialCategories = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
      });
  },
});

export default materialTypeSlice.reducer;
