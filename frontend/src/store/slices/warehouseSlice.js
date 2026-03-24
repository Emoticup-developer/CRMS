import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchWarehouses = createAsyncThunk(
  "warehouses/fetchWarehouses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/warehouse/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching warehouses");
    }
  },
);

export const createWarehouse = createAsyncThunk(
  "warehouses/createWarehouse",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/warehouse/", formData);
      dispatch(fetchWarehouses());
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

export const updateWarehouse = createAsyncThunk(
  "warehouses/updateWarehouse",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/warehouse/${id}`, formData);
      dispatch(fetchWarehouses());
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

export const deleteWarehouse = createAsyncThunk(
  "warehouses/deleteWarehouse",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/warehouse/${id}`);
      dispatch(fetchWarehouses());
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
export const fetchPlants = createAsyncThunk(
  "warehouses/fetchPlants",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/plant/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchWarehousetypes = createAsyncThunk(
  "warehouses/fetchWarehousetypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/warehouse_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCountries = createAsyncThunk(
  "warehouses/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/country/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchStates = createAsyncThunk(
  "warehouses/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/state/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCities = createAsyncThunk(
  "warehouses/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/city/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const warehouseSlice = createSlice({
  name: "warehouses",
  initialState: {
    warehouses: [],
    warehousetypes: [],
    plants: [],
    countries: [],
    states: [],
    cities: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlants.fulfilled, (state, action) => {
        state.plants = action.payload;
      })
      .addCase(fetchWarehousetypes.fulfilled, (state, action) => {
        state.warehousetypes = action.payload;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.states = action.payload;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload;
      });
  },
});

export default warehouseSlice.reducer;
