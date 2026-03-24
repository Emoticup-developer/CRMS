import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchLanguages = createAsyncThunk(
  "languages/fetchlLanguages",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/language/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching languages");
    }
  },
);

export const createLanguage = createAsyncThunk(
  "languages/createLanguage",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/language/", formData);
      dispatch(fetchLanguages());
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

export const updateLanguage = createAsyncThunk(
  "languages/updateLanguage",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/language/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchLanguages());
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

export const deleteLanguage = createAsyncThunk(
  "languages/deleteLanguage",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/language/${id}`);
      dispatch(fetchLanguages());
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
const languageSlice = createSlice({
  name: "languages",
  initialState: {
    languages: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.languages = action.payload;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default languageSlice.reducer;
