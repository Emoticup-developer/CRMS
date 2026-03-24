import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";

export const fetchVenderQuotations = createAsyncThunk(
  "vendorsQuotations/fetchVenderQuotations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor_quotation/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching vendor quotations",
      );
    }
  },
);

export const createVenderQuotation = createAsyncThunk(
  "vendorsQuotations/createVenderQuotation",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/vendor/vendor_quotation/", formData, {
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
  "vendorsQuotations/updateVenderQuotation",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/vendor/vendor_quotation/${id}`, formData, {
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
  "vendorsQuotations/deleteVenderQuotation",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/vendor/vendor_quotation/${id}`);
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
  "vendorsQuotations/fetchVenders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchQuotationTypes = createAsyncThunk(
  "vendorsQuotations/fetchQuotationTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/quotation_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchUsers = createAsyncThunk(
  "vendorsQuotations/fetchUsers",
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
  "vendorsQuotations/fetchCompanies",
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
const vendorsQuotationsSlice = createSlice({
  name: "vendorsQuotations",
  initialState: {
    vendorsQuotations: [],
    vendors: [],
    quotationTypes: [],
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
        state.vendorsQuotations = action.payload;
      })
      .addCase(fetchVenderQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVenders.fulfilled, (state, action) => {
        state.vendors = action.payload;
      })
      .addCase(fetchQuotationTypes.fulfilled, (state, action) => {
        state.quotationTypes = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
      });
  },
});

export default vendorsQuotationsSlice.reducer;
