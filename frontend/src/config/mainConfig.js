const mainConfig = [
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
  {
    id: "reportsMenu",
    label: "Reports",
    iconName: "AiOutlineLineChart",
    subMenu: [
      {
        id: "consumptionDataMenu",
        label: "Consumption Data",
        path: "/admin/consumption-data",
        iconName: "AiOutlineLineChart",
      },
      {
        id: "alertsMenu",
        label: "Alerts",
        path: "/admin/alerts",
        iconName: "FiBell",
      },
    ],
  },
];

export default mainConfig;