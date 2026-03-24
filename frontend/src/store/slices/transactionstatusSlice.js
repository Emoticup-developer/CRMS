import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= CRUD ================= */

export const fetchTransactionstatuses = createAsyncThunk(
  "transactionstatuses/fetchTransactionstatuses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/transaction_status/");
      return res.data;
    } catch (err) {
      print(e);
      return rejectWithValue(
        err.response?.data || "Error fetching Transaction Status",
      );
    }
  },
);

export const createTransactionstatus = createAsyncThunk(
  "transactionstatuses/createTransactionstatus",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/inventory/transaction_status/", formData);
      dispatch(fetchTransactionstatuses());
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

export const updateTransactionstatus = createAsyncThunk(
  "transactionstatuses/updateTransactionstatus",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(
        `/inventory/transaction_status/${id}`,
        formData,
      );
      dispatch(fetchTransactionstatuses());
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

export const deleteTransactionstatus = createAsyncThunk(
  "transactionstatuses/deleteTransactionstatus",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/inventory/transaction_status/${id}`);
      dispatch(fetchTransactionstatuses());
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
const transactionstatusSlice = createSlice({
  name: "transactionstatuses",
  initialState: {
    transactionstatuses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionstatuses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactionstatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionstatuses = action.payload;
      })
      .addCase(fetchTransactionstatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transactionstatusSlice.reducer;
