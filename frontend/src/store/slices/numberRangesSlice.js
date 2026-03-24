import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchNumberRanges = createAsyncThunk(
  "numberRanges/fetchNumberRanges",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/access/code_settings/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching number ranges",
      );
    }
  },
);

export const createNumberRange = createAsyncThunk(
  "numberRanges/createNumberRange",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/access/code_settings/", formData);
      dispatch(fetchNumberRanges());
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

export const updateNumberRange = createAsyncThunk(
  "numberRanges/updateNumberRange",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/access/code_settings/${id}`, formData);
      dispatch(fetchNumberRanges());
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

export const deleteNumberRange = createAsyncThunk(
  "numberRanges/deleteNumberRange",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/access/code_settings/${id}`);
      dispatch(fetchNumberRanges());
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
export const fetchModels = createAsyncThunk(
  "numberRanges/fetchModels",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/access/model_name_database/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const numberRangesSlice = createSlice({
  name: "numberRanges",
  initialState: {
    numberRanges: [],
    models: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNumberRanges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNumberRanges.fulfilled, (state, action) => {
        state.loading = false;
        state.numberRanges = action.payload;
      })
      .addCase(fetchNumberRanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.models = action.payload;
      });
  },
});

export default numberRangesSlice.reducer;
