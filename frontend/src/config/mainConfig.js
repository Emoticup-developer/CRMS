const FAVORITES_KEY = "aerp_favorites";

/* ===============================
   FAVORITES STORAGE FUNCTIONSd dd
================================ */

export const getFavorites = () => {
  const fav = localStorage.getItem(FAVORITES_KEY);
  return fav ? JSON.parse(fav) : [];
};

export const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const addToFavorites = (item) => {
  const favorites = getFavorites();
  const exists = favorites.find((f) => f.id === item.id);

  if (!exists) {
    favorites.push({ ...item, isFavorite: true });
    saveFavorites(favorites);
  }
};

export const removeFromFavorites = (id) => {
  const favorites = getFavorites().filter((f) => f.id !== id);
  saveFavorites(favorites);
};

/* ===============================
   FAVORITES MENU
================================ */

export const getFavoritesMenu = () => ({
  id: "favoritesMenu",
  label: "Favorites",
  iconName: "FiStar",
  subMenu: getFavorites(),
});

/* ===============================
   MAIN MENU CONFIG
================================ */
import Cookies from "js-cookie";
const username = Cookies.get("username");
const mainConfig = [
  getFavoritesMenu(),

  {
    id: "basicSettingsMenu",
    label: "Basic Settings",
    iconName: "FaCog",
    subMenu: [
      {
        id: "regionalSettingsMenu",
        label: "General Settings",
        iconName: "FaCog",
        subMenu: [
          {
            id: "currencyMenu",
            label: "Currency",
            iconName: "MdCurrencyExchange",
            subMenu: [
              {
                id: "createcurrencyMenu",
                label: "Create currency",
                path: "/admin/currency/create",
                iconName: "MdCurrencyExchange",
              },
              {
                id: "viewCurrencyMenu",
                label: "View Currency",
                path: "/admin/currency/view",
                iconName: "MdCurrencyExchange",
              },
            ],
          },
          {
            id: "countryMenu",
            label: "Country",
            iconName: "FiGlobe",
            subMenu: [
              {
                id: "createCountryMenu",
                label: "Create Country",
                path: "/admin/country/create",
                iconName: "FiGlobe",
              },
              {
                id: "viewCountryMenu",
                label: "View Country",
                path: "/admin/country/view",
                iconName: "FiGlobe",
              },
            ],
          },
          {
            id: "stateMenu",
            label: "State",
            iconName: "FiFlag",
            subMenu: [
              {
                id: "createstateMenu",
                label: "Create State",
                path: "/admin/state/create",
                iconName: "FiFlag",
              },
              {
                id: "viewstateMenu",
                label: "View State",
                path: "/admin/state/view",
                iconName: "FiFlag",
              },
            ],
          },
          {
            id: "cityMenu",
            label: "City",
            iconName: "FaCity",
            subMenu: [
              {
                id: "createcityMenu",
                label: "Create City",
                path: "/admin/city/create",
                iconName: "FaCity",
              },
              {
                id: "viewcityMenu",
                label: "View City",
                path: "/admin/city/view",
                iconName: "FaCity",
              },
            ],
          },
          {
            id: "languageMenu",
            label: "Language",
            iconName: "FaLanguage",
            subMenu: [
              {
                id: "createlanguageMenu",
                label: "Create Language",
                path: "/admin/language/create",
                iconName: "FaLanguage",
              },
              {
                id: "viewlanguageMenu",
                label: "View Language",
                path: "/admin/language/view",
                iconName: "FaLanguage",
              },
            ],
          },
          {
            id: "numberRangesMenu",
            label: "Number Ranges",
            path: "/admin/number-ranges",
            iconName: "MdFormatListNumbered",
          },
        ],
      },
      {
        id: "businessSettingsMenu",
        label: "Business",
        iconName: "PiMapPinAreaFill",
        subMenu: [
          {
            id: "businessareaMenu",
            label: "Business Area",
            iconName: "PiMapPinAreaFill",
            subMenu: [
              {
                id: "createbusinessareaMenu",
                label: "Create Business Area",
                path: "/admin/business_area/create",
                iconName: "PiMapPinAreaFill",
              },
              {
                id: "viewbusinessareaMenu",
                label: "View Business Area",
                path: "/admin/business_area/view",
                iconName: "PiMapPinAreaFill",
              },
            ],
          },
          {
            id: "businesssectorMenu",
            label: "Business Sectors",
            iconName: "GiFactory",
            subMenu: [
              {
                id: "createbusinesssectorMenu",
                label: "Create Business Sectors",
                path: "/admin/business_sector/create",
                iconName: "GiFactory",
              },
              {
                id: "viewbusinesssectorMenu",
                label: "View Business Sectors",
                path: "/admin/business_sector/view",
                iconName: "GiFactory",
              },
            ],
          },
          {
            id: "companystatusMenu",
            label: "Company Status",
            iconName: "BsBuildingFillCheck",
            subMenu: [
              {
                id: "createcompanystatusMenu",
                label: "Create Company Status",
                path: "/admin/company_status/create",
                iconName: "BsBuildingFillCheck",
              },
              {
                id: "viewcompanystatusMenu",
                label: "View Company Status",
                path: "/admin/company_status/view",
                iconName: "BsBuildingFillCheck",
              },
            ],
          },
        ],
      },
      {
        id: "userSettingsMenu",
        label: "User",
        iconName: "FiUsers",
        subMenu: [
          {
            id: "userstatusMenu",
            label: "User Status",
            iconName: "FiUsers",
            subMenu: [
              {
                id: "createuserstatusMenu",
                label: "Create User Status",
                path: "/admin/user_status/create",
                iconName: "FiUsers",
              },
              {
                id: "viewuserstatusMenu",
                label: "View User Status",
                path: "/admin/user_status/view",
                iconName: "FiUsers",
              },
            ],
          },
          {
            id: "usertypeMenu",
            label: "User Type",
            iconName: "FiUsers",
            subMenu: [
              {
                id: "createusertypeMenu",
                label: "Create User Type",
                path: "/admin/user_type/create",
                iconName: "FiUsers",
              },
              {
                id: "viewusertypeMenu",
                label: "View User Type",
                path: "/admin/user_type/view",
                iconName: "FiUsers",
              },
            ],
          },
          {
            id: "positionMenu",
            label: "Position",
            iconName: "FaUserTie",
            subMenu: [
              {
                id: "createpositionMenu",
                label: "Create Position",
                path: "/admin/position/create",
                iconName: "FaUserTie",
              },
              {
                id: "viewpositionMenu",
                label: "View Position",
                path: "/admin/position/view",
                iconName: "FaUserTie",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "enterpriseStructureMenu",
    label: "Enterprise Structure",
    iconName: "FaBuilding",
    subMenu: [
      {
        id: "usersMenu",
        label: "Users",
        iconName: "FiUsers",
        subMenu: [
          {
            id: "createUserMenu",
            label: "Create User",
            path: "/admin/users/create",
            iconName: "FiUsers",
          },
          {
            id: "viewUsersMenu",
            label: "View Users",
            path: "/admin/users/view",
            iconName: "FiUsers",
          },
          {
            id: "userProfileMenu",
            label: "Profile",
            path: `/admin/user/${username}`,
            iconName: "FiUsers",
          },
        ],
      },
      {
        id: "companyMenu",
        label: "Company",
        iconName: "FaBuilding",
        subMenu: [
          {
            id: "createCompanyMenu",
            label: "Create Company",
            path: "/admin/company/create",
            iconName: "FaBuilding",
          },
          {
            id: "viewCompaniesMenu",
            label: "View Companies",
            path: "/admin/company/view",
            iconName: "FaBuilding",
          },
        ],
      },
    ],
  },
  {
    id: "procureToPayMenu",
    label: "Procure To Pay (PTP)",
    iconName: "FaMoneyBill",
    subMenu: [
      {
        id: "vendorManagementMenu",
        label: "Vendor Management",
        iconName: "FiUsers",
        subMenu: [
          // {
          //   id: "vendorTypesMenu",
          //   label: "Vendor Types",
          //   iconName: "FiUsers",
          //   subMenu: [
          //     {
          //       id: "createVendorTypeMenu",
          //       label: "Create Vendor Type",
          //       path: "/admin/vendor-types/create",
          //       iconName: "FiUsers",
          //     },
          //     {
          //       id: "viewVendorTypesMenu",
          //       label: "View Vendor Types",
          //       path: "/admin/vendor-types/view",
          //       iconName: "FiUsers",
          //     },
          //   ],
          // },
          // {
          //   id: "vendorKYCStatusMenu",
          //   label: "Vendor KYC Status",
          //   iconName: "FiUsers",
          //   subMenu: [
          //     {
          //       id: "createVendorKYCStatusMenu",
          //       label: "Create Vendor KYC Status",
          //       path: "/admin/vendor-kyc-status/create",
          //       iconName: "FiUsers",
          //     },
          //     {
          //       id: "viewVendorKYCStatusMenu",
          //       label: "View Vendor KYC Status",
          //       path: "/admin/vendor-kyc-status/view",
          //       iconName: "FiUsers",
          //     },
          //   ],
          // },
          // {
          //   id: "vendorMenu",
          //   label: "Vendors",
          //   iconName: "FiUsers",
          //   subMenu: [
          //     {
          //       id: "createVendorMenu",
          //       label: "Create Vendor",
          //       path: "/admin/vendor/create",
          //       iconName: "FiUsers",
          //     },
          //     {
          //       id: "viewVendorsMenu",
          //       label: "View Vendors",
          //       path: "/admin/vendors/view",
          //       iconName: "FiUsers",
          //     },
          //   ],
          // },
          // {
          //   id: "vendorMaterialsMenu",
          //   label: "Vendor Materials",
          //   iconName: "FiUsers",
          //   subMenu: [
          //     {
          //       id: "createVendorMaterialMenu",
          //       label: "Create Vendor Material",
          //       path: "/admin/vendor-material/create",
          //       iconName: "FiUsers",
          //     },
          //     {
          //       id: "viewVendorMaterialsMenu",
          //       label: "View Vendor Materials",
          //       path: "/admin/vendor-materials/view",
          //       iconName: "FiUsers",
          //     },
          //   ],
          // },
          // {
          //   id: "vendorDeclarationsMenu",
          //   label: "Vendor Declarations",
          //   iconName: "FiUsers",
          //   subMenu: [
          //     {
          //       id: "createVendorDeclarationMenu",
          //       label: "Create Vendor Declaration",
          //       path: "/admin/vendor-declaration/create",
          //       iconName: "FiUsers",
          //     },
          //     {
          //       id: "viewVendorDeclarationsMenu",
          //       label: "View Vendor Declarations",
          //       path: "/admin/vendor-declarations/view",
          //       iconName: "FiUsers",
          //     },
          //   ],
          // },
          // {
          //   id: "vendorQuotationsMenu",
          //   label: "Vendor Quotations",
          //   iconName: "FiUsers",
          //   subMenu: [
          //     {
          //       id: "createVendorQuotationMenu",
          //       label: "Create Vendor Quotation",
          //       path: "/admin/vendor-quotation/create",
          //       iconName: "FiUsers",
          //     },
          //     {
          //       id: "viewVendorQuotationsMenu",
          //       label: "View Vendor Quotations",
          //       path: "/admin/vendor-quotations/view",
          //       iconName: "FiUsers",
          //     },
          //   ],
          // },
          // {
          //   id: "vendorKYCMenu",
          //   label: "Vendor KYC",
          //   iconName: "FiUsers",
          //   subMenu: [
          //     {
          //       id: "createVendorKYCMenu",
          //       label: "Create Vendor KYC",
          //       path: "/admin/vendor-kyc/create",
          //       iconName: "FiUsers",
          //     },
          //     {
          //       id: "viewVendorKYCsMenu",
          //       label: "View Vendor KYC",
          //       path: "/admin/vendor-kyc/view",
          //       iconName: "FiUsers",
          //     },
          //   ],
          // },
          // {
          //   id: "vendorOnboardingMenu",
          //   label: "Vendor Onboarding",
          //   path: "/admin/vendor-onboarding",
          //   iconName: "FiUsers",
          // },
          {
            id: "initiateVOBMenu",
            label: "Initiate New VOB",
            path: "/admin/vendor/initiate",
            iconName: "FiUsers",
          },
          {
            id: "vendorMenu",
            label: "Vendors",
            iconName: "FiUsers",
            subMenu: [
              {
                id: "createVendorMenu",
                label: "Create Vendor",
                path: "/admin/vendor/create",
                iconName: "PiCubeThin",
              },
              {
                id: "changeVendorMenu",
                label: "Change Vendor",
                path: "/admin/vendor/change",
                iconName: "PiCubeThin",
              },
              {
                id: "displayVendorMenu",
                label: "Display Vendor",
                path: "/admin/vendors/view",
                iconName: "PiCubeThin",
              },
              {
                id: "deleteVendorMenu",
                label: "Delete Vendor",
                path: "/admin/vendor/delete",
                iconName: "PiCubeThin",
              },
              {
                id: "blockVendorsMenu",
                label: "Block Vendor",
                path: "/admin/vendor/block",
                iconName: "PiCubeThin",
              },
            ],
          },
          {
            id: "vendorMasterMenu",
            label: "Vendor Master",
            path: "/admin/vendor-master",
            iconName: "FiUsers",
          },
        ],
      },
      {
        id: "purchaseOrderGoodsReceiptMenu",
        label: "PO Goods Receipt",
        path: "/admin/purchase-order-goods-receipt",
        iconName: "FaFileSignature",
      },
      {
        id: "invoiceVerificationMenu",
        label: "Invoice Verification",
        path: "/admin/invoice-verification",
        iconName: "FaFileSignature",
      },
      {
        id: "paymentsMenu",
        label: "Payments",
        path: "/admin/payments",
        iconName: "FaMoneyBill",
      },
    ],
  },
  {
    id: "materialManagementMenu",
    label: "Material Management",
    iconName: "FiTool",
    subMenu: [
      {
        id: "materialGroupsMenu",
        label: "Material Groups",
        iconName: "FiTool",
        subMenu: [
          {
            id: "createMaterialGroupMenu",
            label: "Create Material Group",
            path: "/admin/material-group/create",
            iconName: "FiTool",
          },
          {
            id: "viewMaterialGroupsMenu",
            label: "View Material Groups",
            path: "/admin/material-groups/view",
            iconName: "FiTool",
          },
        ],
      },
      {
        id: "materialCategoriesMenu",
        label: "Material Categories",
        iconName: "FiTool",
        subMenu: [
          {
            id: "createMaterialCategoryMenu",
            label: "Create Material Category",
            path: "/admin/material-category/create",
            iconName: "FiTool",
          },
          {
            id: "viewMaterialCategoriesMenu",
            label: "View Material Categories",
            path: "/admin/material-categories/view",
            iconName: "FiTool",
          },
        ],
      },
      {
        id: "materialTypesMenu",
        label: "Material Types",
        iconName: "FiTool",
        subMenu: [
          {
            id: "createMaterialTypeMenu",
            label: "Create Material Type",
            path: "/admin/material-type/create",
            iconName: "FiTool",
          },
          {
            id: "viewMaterialTypesMenu",
            label: "View Material Types",
            path: "/admin/material-types/view",
            iconName: "FiTool",
          },
        ],
      },
      {
        id: "materialMasterMenu",
        label: "Material Master",
        path: "/admin/materials",
        iconName: "FiTool",
      },
    ],
  },
  {
    id: "plantManagementMenu",
    label: "Plant Management",
    iconName: "PiPlantLight",
    subMenu: [
      {
        id: "materialGroupsMenu",
        label: "Plant Types",
        iconName: "PiPlantLight",
        subMenu: [
          {
            id: "createPlantTypeMenu",
            label: "Create Plant Type",
            path: "/admin/plant-type/create",
            iconName: "PiPlantLight",
          },
          {
            id: "viewPlantTypesMenu",
            label: "View Plant Types",
            path: "/admin/plant-types/view",
            iconName: "PiPlantLight",
          },
        ],
      },
      {
        id: "plantMasterMenu",
        label: "Plant Master",
        path: "/admin/plant-master",
        iconName: "PiPlantLight",
      },
    ],
  },
  {
    id: "warehousemangementMenu",
    label: "Warehouse Mangement",
    iconName: "FaHome",
    subMenu: [
      {
        id: "warehousetypesMenu",
        label: "Warehouse Types",
        iconName: "FaHome",
        subMenu: [
          {
            id: "createwarehousetypesMenu",
            label: "Create Warehouse Type",
            path: "/admin/warehouse_type/create",
            iconName: "FaHome",
          },
          {
            id: "viewwarehousetypesMenu",
            label: "View Warehouse Types",
            path: "/admin/warehouse_type/view",
            iconName: "FaHome",
          },
        ],
      },
      {
        id: "warehouseMasterMenu",
        label: "Warehouse Master",
        path: "/admin/warehouse-master",
        iconName: "FaHome",
      },
      {
        id: "storagelocationtypesMenu",
        label: "Storage Location Types",
        iconName: "TbDatabaseEdit",
        subMenu: [
          {
            id: "storagelocationtypesMenu",
            label: "Create Storage Location Type",
            path: "/admin/storage_location_type/create",
            iconName: "TbDatabaseEdit",
          },
          {
            id: "storagelocationtypesMenu",
            label: "View Storage Location Types",
            path: "/admin/storage_location_type/view",
            iconName: "TbDatabaseEdit",
          },
        ],
      },
      {
        id: "materialmovementsMenu",
        label: "Material Movement",
        iconName: "FaExchangeAlt",
        subMenu: [
          {
            id: "materialmovementsMenu",
            label: "Create Material Movement",
            path: "/admin/material_movement/create",
            iconName: "FaExchangeAlt",
          },
          {
            id: "materialmovementsMenu",
            label: "View Material Movement",
            path: "/admin/material_movement/view",
            iconName: "FaExchangeAlt",
          },
        ],
      },
      {
        id: "transactionstatusMenu",
        label: "Transaction Status",
        iconName: "FiRefreshCw",
        subMenu: [
          {
            id: "createtransactionstatusMenu",
            label: "Create Transaction Status",
            path: "/admin/transaction_status/create",
            iconName: "FiRefreshCw",
          },
          {
            id: "viewtransactionstatusMenu",
            label: "View Transaction Status",
            path: "/admin/transaction_status/view",
            iconName: "FiRefreshCw",
          },
        ],
      },
    ],
  },
];

export default mainConfig;
