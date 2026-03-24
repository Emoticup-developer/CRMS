import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchVenderDeclarations = createAsyncThunk(
  "vendorDeclarations/fetchVendorDeclarations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor_declaration/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching vendor declarations",
      );
    }
  },
);

export const createVenderDeclaration = createAsyncThunk(
  "vendorDeclarations/createVenderDeclaration",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/vendor/vendor_declaration/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchVenderDeclarations());
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

export const updateVenderDeclaration = createAsyncThunk(
  "vendorDeclarations/updateVenderDeclaration",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/vendor/vendor_declaration/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchVenderDeclarations());
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

export const deleteVenderDeclaration = createAsyncThunk(
  "vendorDeclarations/deleteVenderDeclaration",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/vendor/vendor_declaration/${id}`);
      dispatch(fetchVenderDeclarations());
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
  "vendorDeclarations/fetchVenders",
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
  "vendorDeclarations/fetchUsers",
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
  "vendorDeclarations/fetchCompanies",
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
const vendorDeclarationSlice = createSlice({
  name: "vendorDeclarations",
  initialState: {
    vendorDeclarations: [],
    vendors: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenderDeclarations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVenderDeclarations.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorDeclarations = action.payload;
      })
      .addCase(fetchVenderDeclarations.rejected, (state, action) => {
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

export default vendorDeclarationSlice.reducer;
