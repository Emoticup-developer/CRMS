import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchVenderKYC = createAsyncThunk(
  "vendorKYC/fetchVenderKYC",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor_kyc/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching vendor KYC");
    }
  },
);

export const createVenderKYC = createAsyncThunk(
  "vendorKYC/createVenderKYC",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/vendor/vendor_kyc/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchVenderKYC());
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

export const updateVenderKYC = createAsyncThunk(
  "vendorKYC/updateVenderKYC",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/vendor/vendor_kyc/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchVenderKYC());
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

export const deleteVenderKYC = createAsyncThunk(
  "vendorKYC/deleteVenderKYC",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/vendor/vendor_kyc/${id}`);
      dispatch(fetchVenderKYC());
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
export const fetchVenders = createAsyncThunk(
  "vendorKYC/fetchVenders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchVenderTypes = createAsyncThunk(
  "vendorKYC/fetchVenderTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCountries = createAsyncThunk(
  "vendorKYC/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/country/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchKYCStatus = createAsyncThunk(
  "vendorKYC/fetchKYCStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/kyc_status/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchApprovedBy = createAsyncThunk(
  "vendorKYC/fetchApprovedBy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/user/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchUsers = createAsyncThunk(
  "vendorKYC/fetchUsers",
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
  "vendorKYC/fetchCompanies",
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
const vendorKYCSlice = createSlice({
  name: "vendorKYC",
  initialState: {
    vendorKYC: [],
    vendors: [],
    vendortypes: [],
    countries: [],
    kycstatus: [],
    approvedby: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenderKYC.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVenderKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorKYC = action.payload;
      })
      .addCase(fetchVenderKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVenders.fulfilled, (state, action) => {
        state.vendors = action.payload;
      })
      .addCase(fetchVenderTypes.fulfilled, (state, action) => {
        state.vendortypes = action.payload;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
      })
      .addCase(fetchKYCStatus.fulfilled, (state, action) => {
        state.kycstatus = action.payload;
      })
      .addCase(fetchApprovedBy.fulfilled, (state, action) => {
        state.approvedby = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
      });
  },
});

export default vendorKYCSlice.reducer;
