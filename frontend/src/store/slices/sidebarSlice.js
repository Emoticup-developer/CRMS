import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openMenus: {},
  searchCode: "",
  codeMap: {},
  showConfirm: false,
  showEditModal: false,
  showDeleteModal: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleMenu: (state, action) => {
      const id = action.payload;
      state.openMenus[id] = !state.openMenus[id];
    },

    setSearchCode: (state, action) => {
      state.searchCode = action.payload;
    },

    clearSearchCode: (state) => {
      state.searchCode = "";
    },

    setOpenMenus: (state, action) => {
      state.openMenus = action.payload;
    },

    setCodeMap: (state, action) => {
      state.codeMap = action.payload;
    },

    openConfirm: (state) => {
      state.showConfirm = true;
    },
    openEditModal: (state) => {
      state.showEditModal = true;
    },

    closeConfirm: (state) => {
      state.showConfirm = false;
    },

    closeEditModal: (state) => {
      state.showEditModal = false;
    },

    openDeleteModal: (state) => {
      state.showDeleteModal = true;
    },
    closeDeleteModal: (state) => {
      state.showDeleteModal = false;
    },

    closeAllModals: (state) => {
      state.showConfirm = false;
      state.showEditModal = false;
      state.showDeleteModal = false;
    },
  },
});

export const {
  toggleMenu,
  setSearchCode,
  clearSearchCode,
  setOpenMenus,
  setCodeMap,
  openConfirm,
  openEditModal,
  closeConfirm,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  closeAllModals,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
