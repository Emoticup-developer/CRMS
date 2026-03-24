import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= CRUD ================= */

export const fetchStoragelocationtypes = createAsyncThunk(
  "storagelocationtypes/fetchStoragelocationtypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/storage_location_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching Storagelocationtypes",
      );
    }
  },
);

export const createStoragelocationtype = createAsyncThunk(
  "storagelocationtypes/createStoragelocationtype",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/storage_location_type/", formData);
      dispatch(fetchStoragelocationtypes());
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

export const updateStoragelocationtype = createAsyncThunk(
  "storagelocationtypes/updateStoragelocationtype",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(
        `/inventory/storage_location_type/${id}`,
        formData,
      );
      dispatch(fetchStoragelocationtypes());
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

export const deleteStoragelocationtype = createAsyncThunk(
  "storagelocationtypes/deleteStoragelocationtype",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/storage_location_type/${id}`);
      dispatch(fetchStoragelocationtypes());
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
  "storagelocationtypes/fetchUsers",
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
  "storagelocationtypes/fetchCompanies",
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

const storagelocationtypeSlice = createSlice({
  name: "storagelocationtypes",
  initialState: {
    storagelocationtypes: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoragelocationtypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStoragelocationtypes.fulfilled, (state, action) => {
        state.loading = false;
        state.storagelocationtypes = action.payload;
      })
      .addCase(fetchStoragelocationtypes.rejected, (state, action) => {
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

export default storagelocationtypeSlice.reducer;
