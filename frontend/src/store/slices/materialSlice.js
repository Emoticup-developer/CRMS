import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchMaterials = createAsyncThunk(
  "materials/fetchMaterials",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/material/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching materials");
    }
  },
);

export const createMaterial = createAsyncThunk(
  "materials/createMaterial",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/material/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchMaterials());
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

export const updateMaterial = createAsyncThunk(
  "materials/updateMaterial",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/material/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchMaterials());
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

export const deleteMaterial = createAsyncThunk(
  "materials/deleteMaterial",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/material/${id}`);
      dispatch(fetchMaterials());
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
export const fetchBaseUnitOfMeasures = createAsyncThunk(
  "materials/fetchBaseUnitOfMeasures",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/unit_of_measure/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchPurchaseUnitOfMeasures = createAsyncThunk(
  "materials/fetchPurchaseUnitOfMeasures",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/unit_of_measure/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchIssueUnitOfMeasures = createAsyncThunk(
  "materials/fetchIssueUnitOfMeasures",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/unit_of_measure/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchMaterialTypes = createAsyncThunk(
  "materials/fetchMaterialTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/material_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchVendors = createAsyncThunk(
  "materials/fetchVendors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const materialSlice = createSlice({
  name: "materials",
  initialState: {
    materials: [],
    baseuoms: [],
    purchaseuoms: [],
    issueuoms: [],
    materialTypes: [],
    vendors: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBaseUnitOfMeasures.fulfilled, (state, action) => {
        state.baseuoms = action.payload;
      })
      .addCase(fetchPurchaseUnitOfMeasures.fulfilled, (state, action) => {
        state.purchaseuoms = action.payload;
      })
      .addCase(fetchIssueUnitOfMeasures.fulfilled, (state, action) => {
        state.issueuoms = action.payload;
      })
      .addCase(fetchMaterialTypes.fulfilled, (state, action) => {
        state.materialTypes = action.payload;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.vendors = action.payload;
      });
  },
});

export default materialSlice.reducer;
