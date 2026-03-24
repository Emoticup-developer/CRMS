import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchPlants = createAsyncThunk(
  "plants/fetchPlants",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/plant/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching plants");
    }
  },
);

export const createPlant = createAsyncThunk(
  "plants/createPlant",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/plant/", formData);
      dispatch(fetchPlants());
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

export const updatePlant = createAsyncThunk(
  "plants/updatePlant",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/plant/${id}`, formData);
      dispatch(fetchPlants());
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

export const deletePlant = createAsyncThunk(
  "plants/deletePlant",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/plant/${id}`);
      dispatch(fetchPlants());
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
export const fetchPlantTypes = createAsyncThunk(
  "plants/fetchPlantTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/plant_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCurrencies = createAsyncThunk(
  "plants/fetchCurrencies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/currency/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCountries = createAsyncThunk(
  "plants/fetchCountries",
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
  "plants/fetchStates",
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
  "plants/fetchCities",
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
const plantSlice = createSlice({
  name: "plants",
  initialState: {
    plants: [],
    plantTypes: [],
    currencies: [],
    countries: [],
    states: [],
    cities: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlants.fulfilled, (state, action) => {
        state.loading = false;
        state.plants = action.payload;
      })
      .addCase(fetchPlants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlantTypes.fulfilled, (state, action) => {
        state.plantTypes = action.payload;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.currencies = action.payload;
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

export default plantSlice.reducer;
