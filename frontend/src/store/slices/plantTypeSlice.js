import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchPlantTypes = createAsyncThunk(
  "plantTypes/fetchPlantTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/plant_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching plant types",
      );
    }
  },
);

export const createPlantType = createAsyncThunk(
  "plantTypes/createPlantType",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/plant_type/", formData);
      dispatch(fetchPlantTypes());
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

export const updatePlantType = createAsyncThunk(
  "plantTypes/updatePlantType",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/plant_type/${id}`, formData);
      dispatch(fetchPlantTypes());
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

export const deletePlantType = createAsyncThunk(
  "plantTypes/deletePlantType",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/plant_type/${id}`);
      dispatch(fetchPlantTypes());
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
export const fetchUsers = createAsyncThunk(
  "plantTypes/fetchUsers",
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
  "plantTypes/fetchCompanies",
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
const plantTypeSlice = createSlice({
  name: "plantTypes",
  initialState: {
    plantTypes: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlantTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlantTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.plantTypes = action.payload;
      })
      .addCase(fetchPlantTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
      });
  },
});

export default plantTypeSlice.reducer;
