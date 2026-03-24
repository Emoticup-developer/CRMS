import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchCompanystatuses = createAsyncThunk(
  "companystatuses/fetchCompanystatuses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/company_status/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching Country Status",
      );
    }
  },
);

export const createCompanystatus = createAsyncThunk(
  "companystatuses/createCompanystatus",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/company_status/", formData);
      dispatch(fetchCompanystatuses());
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

export const updateCompanystatus = createAsyncThunk(
  "companystatuses/updateCompanystatus",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/company_status/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchCompanystatuses());
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

export const deleteCompanystatus = createAsyncThunk(
  "companystatuses/deleteCompanystatus",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/company_status/${id}`);
      dispatch(fetchCompanystatuses());
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
const companystatusSlice = createSlice({
  name: "companystatuses",
  initialState: {
    companystatuses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanystatuses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanystatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.companystatuses = action.payload;
      })
      .addCase(fetchCompanystatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default companystatusSlice.reducer;
