import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchBusinesssectors = createAsyncThunk(
  "businesssectors/fetchBusinesssectors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/business_sector/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching Business Sectors ",
      );
    }
  },
);

export const createBusinesssector = createAsyncThunk(
  "businesssectors/createBusinesssector",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/business_sector/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchBusinesssectors());
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

export const updateBusinesssector = createAsyncThunk(
  "businesssectors/updateBusinesssector",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/business_sector/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchBusinesssectors());
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

export const deleteBusinesssector = createAsyncThunk(
  "businesssectors/deletebusinesssector",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/business_sector/${id}`);
      dispatch(fetchBusinesssectors());
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
const businesssectorSlice = createSlice({
  name: "businesssectors",
  initialState: {
    businesssectors: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinesssectors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBusinesssectors.fulfilled, (state, action) => {
        state.loading = false;
        state.businesssectors = action.payload;
      })
      .addCase(fetchBusinesssectors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businesssectorSlice.reducer;
