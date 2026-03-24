import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= CRUD ================= */

export const fetchWarehousetypes = createAsyncThunk(
  "warehousetypes/fetchWarehousetypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/warehouse_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching warehousetypes",
      );
    }
  },
);

export const createWarehousetype = createAsyncThunk(
  "warehousetypes/createWarehousetype",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/warehouse_type/", formData);
      dispatch(fetchWarehousetypes());
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

export const updateWarehousetype = createAsyncThunk(
  "warehousetypes/updateWarehousetype",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/inventory/warehouse_type/${id}`, formData);
      dispatch(fetchWarehousetypes());
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

export const deleteWarehousetype = createAsyncThunk(
  "warehousetypes/deleteWarehousetype",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/warehouse_type/${id}`);
      dispatch(fetchWarehousetypes());
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
  "warehousetypes/fetchUsers",
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
  "warehousetypes/fetchCompanies",
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

const warehousetypeSlice = createSlice({
  name: "warehousetypes",
  initialState: {
    warehousetypes: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehousetypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehousetypes.fulfilled, (state, action) => {
        state.loading = false;
        state.warehousetypes = action.payload;
      })
      .addCase(fetchWarehousetypes.rejected, (state, action) => {
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

export default warehousetypeSlice.reducer;
