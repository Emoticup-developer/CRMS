import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchUsertypes = createAsyncThunk(
  "usertypes/fetchUsertypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/user_type/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching user types");
    }
  },
);

export const createUsertype = createAsyncThunk(
  "usertypes/createUsertype",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/user_type/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchUsertypes());
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

export const updateUsertype = createAsyncThunk(
  "usertypes/updateUsertype",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/user_type/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchUsertypes());
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

export const deleteUsertype = createAsyncThunk(
  "usertypes/deleteUsertype",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/user_type/${id}`);
      dispatch(fetchUsertypes());
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
const usertypeSlice = createSlice({
  name: "usertypes",
  initialState: {
    usertypes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsertypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsertypes.fulfilled, (state, action) => {
        state.loading = false;
        state.usertypes = action.payload;
      })
      .addCase(fetchUsertypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default usertypeSlice.reducer;
