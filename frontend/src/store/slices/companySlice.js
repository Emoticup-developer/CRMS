import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ================= COMPANIES CRUD ================= */
export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/company/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching companies");
    }
  },
);

export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/people/company/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchCompanies());
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

export const updateCompany = createAsyncThunk(
  "companies/updateCompany",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/people/company/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchCompanies());
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

export const deleteCompany = createAsyncThunk(
  "companies/deleteCompany",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/people/company/${id}`);
      dispatch(fetchCompanies());
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
  "companies/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/user/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCurrencies = createAsyncThunk(
  "companies/fetchCurrencies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/currency/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCountries = createAsyncThunk(
  "companies/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/country/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchStates = createAsyncThunk(
  "companies/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/state/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCities = createAsyncThunk(
  "companies/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/city/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchLanguages = createAsyncThunk(
  "companies/fetchLanguages",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/language/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchBusinessAreas = createAsyncThunk(
  "companies/fetchBusinessAreas",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/business_area/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchBusinessSectors = createAsyncThunk(
  "companies/fetchBusinessSectors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/business_sector/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchCompanyStatus = createAsyncThunk(
  "users/fetchCompanyStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/company_status/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const companySlice = createSlice({
  name: "companies",
  initialState: {
    companies: [],
    users: [],
    currencies: [],
    countries: [],
    states: [],
    cities: [],
    languages: [],
    businessareas: [],
    businesssectors: [],
    statuses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.currencies = action.payload;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.states = action.payload;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.languages = action.payload;
      })
      .addCase(fetchBusinessAreas.fulfilled, (state, action) => {
        state.businessareas = action.payload;
      })
      .addCase(fetchBusinessSectors.fulfilled, (state, action) => {
        state.businesssectors = action.payload;
      })
      .addCase(fetchCompanyStatus.fulfilled, (state, action) => {
        state.statuses = action.payload;
      });
  },
});

export default companySlice.reducer;
