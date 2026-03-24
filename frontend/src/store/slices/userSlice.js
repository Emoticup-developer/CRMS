import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= USERS CRUD ================= */
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (limit = 50, { rejectWithValue }) => {
    try {
      const res = await api.get(`/people/user/?limit=${limit}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching users");
    }
  },
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/user/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchUsers());
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

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/user/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchUsers());
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

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/user/${id}`);
      dispatch(fetchUsers());
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
export const fetchCompanies = createAsyncThunk(
  "users/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/company/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchUserTypes = createAsyncThunk(
  "users/fetchUserTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/user_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchPositions = createAsyncThunk(
  "users/fetchPositions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/position/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchUserStatus = createAsyncThunk(
  "users/fetchUserStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/user_status/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    companies: [],
    userTypes: [],
    positions: [],
    statuses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.results || action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
      })
      .addCase(fetchUserTypes.fulfilled, (state, action) => {
        state.userTypes = action.payload;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.positions = action.payload;
      })
      .addCase(fetchUserStatus.fulfilled, (state, action) => {
        state.statuses = action.payload;
      });
  },
});

export default userSlice.reducer;
