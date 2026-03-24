import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchCountries = createAsyncThunk(
  "countries/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/country/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching Countries");
    }
  },
);

export const createCountry = createAsyncThunk(
  "countries/createCountry",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/country/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchCountries());
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

export const updateCountry = createAsyncThunk(
  "countries/updateCountry",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/country/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchCountries());
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

export const deleteCountry = createAsyncThunk(
  "countries/deleteCountry",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/country/${id}`);
      dispatch(fetchCountries());
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
const countrySlice = createSlice({
  name: "countries",
  initialState: {
    countries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default countrySlice.reducer;
