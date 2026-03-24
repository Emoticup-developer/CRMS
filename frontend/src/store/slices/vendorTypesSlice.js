import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchVenderTypes = createAsyncThunk(
  "vendortypes/fetchVenderTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vendor/vendor_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching vendor types",
      );
    }
  },
);

export const createVenderType = createAsyncThunk(
  "vendortypes/createVenderType",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/vendor/vendor_type/", formData);
      dispatch(fetchVenderTypes());
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

export const updateVenderType = createAsyncThunk(
  "vendortypes/updateVenderType",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/vendor/vendor_type/${id}`, formData);
      dispatch(fetchVenderTypes());
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

export const deleteVenderType = createAsyncThunk(
  "vendortypes/deleteVenderType",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/vendor/vendor_type/${id}`);
      dispatch(fetchVenderTypes());
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
  "vendortypes/fetchUsers",
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
  "vendortypes/fetchCompanies",
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
const vendorTypesSlice = createSlice({
  name: "vendortypes",
  initialState: {
    vendortypes: [],
    companies: [],
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenderTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVenderTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.vendortypes = action.payload;
      })
      .addCase(fetchVenderTypes.rejected, (state, action) => {
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

export default vendorTypesSlice.reducer;
