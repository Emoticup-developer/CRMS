import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchCities = createAsyncThunk(
  "cities/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/city/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching Cities");
    }
  },
);

export const createCity = createAsyncThunk(
  "cities/createCity",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/city/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchCities());
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

export const updateCity = createAsyncThunk(
  "cities/updateCity",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/city/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchCities());
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

export const deleteCity = createAsyncThunk(
  "cities/deleteCity",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/city/${id}`);
      dispatch(fetchCities());
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
export const fetchStates = createAsyncThunk(
  "cities/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/state/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const citySlice = createSlice({
  name: "cities",
  initialState: {
    cities: [],
    states: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.states = action.payload;
      });
  },
});

export default citySlice.reducer;
