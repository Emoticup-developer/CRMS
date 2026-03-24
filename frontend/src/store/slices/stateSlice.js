import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchStates = createAsyncThunk(
  "states/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/state/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching states");
    }
  },
);

export const createState = createAsyncThunk(
  "states/createState",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/state/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchStates());
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

export const updateState = createAsyncThunk(
  "states/updateState",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/state/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchStates());
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

export const deleteState = createAsyncThunk(
  "states/deleteState",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/state/${id}`);
      dispatch(fetchStates());
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
export const fetchCountries = createAsyncThunk(
  "states/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/country/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const stateSlice = createSlice({
  name: "states",
  initialState: {
    states: [],
    countries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
      });
  },
});

export default stateSlice.reducer;
