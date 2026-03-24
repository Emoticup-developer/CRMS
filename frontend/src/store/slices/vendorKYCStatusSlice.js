import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchVenderKYCStatus = createAsyncThunk(
  "vendorKYCStatus/fetchVenderKYCStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/kyc_status/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching vendor kyc status",
      );
    }
  },
);

export const createVenderKYCStatus = createAsyncThunk(
  "vendorKYCStatus/createVenderKYCStatus",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/vendor/kyc_status/", formData);
      dispatch(fetchVenderKYCStatus());
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

export const updateVenderKYCStatus = createAsyncThunk(
  "vendorKYCStatus/updateVenderKYCStatus",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/vendor/kyc_status/${id}`, formData);
      dispatch(fetchVenderKYCStatus());
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

export const deleteVenderKYCStatus = createAsyncThunk(
  "vendorKYCStatus/deleteVenderKYCStatus",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/vendor/kyc_status/${id}`);
      dispatch(fetchVenderKYCStatus());
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
  "vendorKYCStatus/fetchUsers",
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
  "vendorKYCStatus/fetchCompanies",
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
const vendorKYCStatusSlice = createSlice({
  name: "vendorKYCStatus",
  initialState: {
    vendorKYCStatus: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenderKYCStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVenderKYCStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorKYCStatus = action.payload;
      })
      .addCase(fetchVenderKYCStatus.rejected, (state, action) => {
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

export default vendorKYCStatusSlice.reducer;
