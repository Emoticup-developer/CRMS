import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchVenderQuotations = createAsyncThunk(
  "vendorQuotations/fetchVenderQuotations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/quotation/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching vendor quotations",
      );
    }
  },
);

export const createVenderQuotation = createAsyncThunk(
  "vendorQuotations/createVenderQuotation",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/vendor/quotation/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchVenderQuotations());
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

export const updateVenderQuotation = createAsyncThunk(
  "vendorQuotations/updateVenderQuotation",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/vendor/quotation/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchVenderQuotations());
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

export const deleteVenderQuotation = createAsyncThunk(
  "vendorQuotations/deleteVenderQuotation",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/vendor/quotation/${id}`);
      dispatch(fetchVenderQuotations());
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
  "vendorQuotations/fetchVenders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchUsers = createAsyncThunk(
  "vendorQuotations/fetchUsers",
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
  "vendorQuotations/fetchCompanies",
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
const vendorQuotationSlice = createSlice({
  name: "vendorQuotations",
  initialState: {
    vendorQuotations: [],
    vendors: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenderQuotations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVenderQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorQuotations = action.payload;
      })
      .addCase(fetchVenderQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVenders.fulfilled, (state, action) => {
        state.vendors = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
      });
  },
});

export default vendorQuotationSlice.reducer;
