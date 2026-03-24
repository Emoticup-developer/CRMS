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
    id: "ticketManagementMenu",
    label: "Ticket Management",
    iconName: "LuTickets",
    subMenu: [
      {
        id: "ticketsMenu",
        label: "Tickets",
        iconName: "LuTickets",
        subMenu: [
          {
            id: "createTicketMenu",
            label: "Create Ticket",
            path: "/admin/ticket/create",
            iconName: "LuTickets",
          },
          {
            id: "viewTicketsMenu",
            label: "View Tickets",
            path: "/admin/tickets/view",
            iconName: "LuTickets",
          },
        ],
      },
    ],
  },
  {
    id: "orderManagementMenu",
    label: "Order Management",
    iconName: "FaClipboardList",
    subMenu: [
      {
        id: "ordersMenu",
        label: "Orders",
        iconName: "FaClipboardList",
        subMenu: [
          {
            id: "createOrderMenu",
            label: "Create Order",
            path: "/admin/order/create",
            iconName: "FaClipboardList",
          },
          {
            id: "viewOrdersMenu",
            label: "View Orders",
            path: "/admin/orders/view",
            iconName: "FaClipboardList",
          },
        ],
      },
    ],
  },
];

export default mainConfig;
