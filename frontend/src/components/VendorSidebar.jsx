import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import * as FiIcons from "react-icons/fi";
import api from "../utils/api";
import {
  FaMoneyBill,
  FaBriefcase,
  FaClipboardList,
  FaFileSignature,
  FaBuilding,
} from "react-icons/fa";
import vendorConfig from "../config/vendorConfig";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleMenu,
  setSearchCode,
  clearSearchCode,
  setOpenMenus,
  setCodeMap,
} from "../store/slices/sidebarSlice";
import { PiPlantLight } from "react-icons/pi";

const HEADER_HEIGHT = 69.5;

const getIcon = (iconName) => {
  if (!iconName) return null;
  if (FiIcons[iconName])
    return React.createElement(FiIcons[iconName], { className: "w-5 h-5" });

  switch (iconName) {
    case "FaMoneyBill":
      return <FaMoneyBill className="w-5 h-5" />;
    case "FaBuilding":
      return <FaBuilding className="w-5 h-5" />;
    case "FaFileSignature":
      return <FaFileSignature className="w-5 h-5" />;
    case "FaBriefcase":
      return <FaBriefcase className="w-5 h-5" />;
    case "FaClipboardList":
      return <FaClipboardList className="w-5 h-5" />;
    case "PiPlantLight":
      return <PiPlantLight className="w-5 h-5" />;
    default:
      return null;
  }
};

const VendorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeMenuLabel, setActiveMenuLabel] = useState("Partner Onboarding");

  const [vendorExists, setVendorExists] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const { openMenus, searchCode, codeMap } = useSelector(
    (state) => state.sidebar,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchVendorStatus = async () => {
      try {
        const res = await api.get("/vendor/vendor/");
        const username = Cookies.get("username");

        if (!res.data || res.data.length === 0) {
          setVendorExists(false);
          setIsApproved(false);
          return;
        }

        const vendor = res.data.find((v) => v.creator?.username === username);

        if (!vendor) {
          setVendorExists(false);
          setIsApproved(false);
          return;
        }

        setVendorExists(true);
        setIsApproved(vendor.is_approved_by_cfo === true);
      } catch (error) {
        console.error("Vendor status API error:", error);
        setVendorExists(false);
        setIsApproved(false);
      }
    };

    fetchVendorStatus();
  }, []);

  const isOnboardingDisabled = vendorExists && isApproved;

  const getFilteredMenu = () => {
    if (!vendorExists || !isApproved) {
      return vendorConfig.filter((menu) => menu.id === "partnerOnboardingMenu");
    }
    return vendorConfig;
  };

  useEffect(() => {
    const activePath = location.pathname;
    let foundLabel = "Partner Onboarding";

    getFilteredMenu().forEach((menu) => {
      if (menu.path && activePath.startsWith(menu.path)) {
        foundLabel = menu.label;
      }
    });

    setActiveMenuLabel(foundLabel);
  }, [location.pathname, isApproved, vendorExists]);

  useEffect(() => {
    const activePath = location.pathname;
    const newOpenMenus = {};

    getFilteredMenu().forEach((menu) => {
      if (menu.path && activePath.startsWith(menu.path)) {
        newOpenMenus[menu.id] = true;
      }
    });

    dispatch(setOpenMenus(newOpenMenus));
  }, [location.pathname, isApproved, vendorExists, dispatch]);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const res = await api.get("/access/navigation_box/");
        const dynamicMap = {};
        res.data.forEach((item) => {
          if (item.path && item.code) {
            dynamicMap[item.path] = item.code;
          }
        });
        dispatch(setCodeMap(dynamicMap));
      } catch (error) {
        console.error("Navigation API error:", error);
      }
    };

    fetchNavigation();
  }, [dispatch]);

  const isPathActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClass = (path) => {
    return `flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer transition ${
      isPathActive(path) ? "bg-amber-100 text-gray-700" : "text-gray-700"
    }`;
  };

  const renderMenu = (menu) => {
    const isOpen = openMenus[menu.id];

    if (!menu.subMenu) {
      return (
        <div key={menu.id}>
          <Link to={menu.path} className={getLinkClass(menu.path)}>
            {getIcon(menu.iconName)}
            <span>
              {codeMap[menu.path] ? `${codeMap[menu.path]} - ` : ""}
              {menu.label}
            </span>
          </Link>
        </div>
      );
    }

    return (
      <div key={menu.id}>
        <button
          onClick={() => dispatch(toggleMenu(menu.id))}
          className="flex items-center justify-between w-full px-2 py-1 rounded-md text-gray-800"
        >
          <div className="flex items-center gap-3">
            {getIcon(menu.iconName)}
            <span>{menu.label}</span>
          </div>

          {isOpen && (
            <FiIcons.FiChevronRight className="rotate-90 text-gray-300 transition-transform duration-300" />
          )}
        </button>

        <ul
          className={`ml-8 text-sm space-y-[1px] transition-all duration-300 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          {menu.subMenu.map((sub) =>
            sub.subMenu ? (
              renderMenu(sub)
            ) : (
              <li key={sub.path}>
                <Link to={sub.path} className={getLinkClass(sub.path)}>
                  {getIcon(sub.iconName)}
                  <span>
                    {codeMap[sub.path] ? `${codeMap[sub.path]} - ` : ""}
                    {sub.label}
                  </span>
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
    );
  };

  const handleLogoClick = () => {
    const username = Cookies.get("username");
    const position = Cookies.get("position");

    let path = "/";

    if (position === "ADMIN") {
      path = "/admin/home";
    } else if (position === "VENDOR") {
      path = "/partner/partner-onboarding";
    } else if (position === "GM") {
      path = "/manager/home";
    } else if (position === "EXE") {
      path = "/home";
    }

    navigate(path, { state: { username: username } });
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("username");
    Cookies.remove("position");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-200">
        <h1 className="text-center font-bold text-lg py-1.5">
          Welcome to Partner Portal
        </h1>
        <div className="flex items-center justify-end px-3 py-1.5 bg-gray-100 border border-gray-300">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <FiIcons.FiWifi
                className="text-amber-500 cursor-pointer"
                size={16}
                title="Wifi off"
              />
            ) : (
              <FiIcons.FiWifiOff
                className="text-red-500 cursor-pointer"
                size={16}
                title="Wifi on"
              />
            )}

            <button
              onClick={() => setShowLogoutPopup(true)}
              className="flex items-center justify-center cursor-pointer"
            >
              <FiIcons.FiPower size={16} title="Logout" />
            </button>
          </div>
        </div>
      </header>

      <aside
        className="fixed left-0 w-[325px] transition-all duration-300 bg-gradient-to-t from-gray-100 via-gray-50 to-white border-r border-gray-300"
        style={{
          top: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <div className="flex items-center justify-between px-3 py-1 bg-gray-100 border-b border-gray-300">
          <div className="flex items-center">
            <span className="font-medium mr-3">{activeMenuLabel}</span>
          </div>
        </div>
        <nav className="h-full overflow-y-auto px-3 text-[15px] py-2 [&::-webkit-scrollbar]:hidden scrollbar-none">
          {getFilteredMenu().map(renderMenu)}
        </nav>
      </aside>

      {showLogoutPopup && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white px-6 py-4 rounded-md w-11/12 max-w-sm shadow-md border border-gray-300">
            <div className="flex justify-center mb-1">
              <FiIcons.FiAlertTriangle className="text-amber-500 text-4xl" />
            </div>
            <h2 className="text-lg font-semibold text-center mb-2 whitespace-nowrap">
              Are you sure you want to exit?
            </h2>
            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={handleLogout}
                className="bg-amber-400 text-black font-medium px-3 py-1.5 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="bg-gray-600 text-white font-medium px-3 py-1.5 rounded-md cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        className="ml-[325px] p-3 transition-all duration-300"
        style={{ marginTop: HEADER_HEIGHT }}
      ></main>
    </div>
  );
};

export default VendorSidebar;
