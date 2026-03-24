import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import logo from "../assets/logo.png";
import * as FiIcons from "react-icons/fi";
import api from "../utils/api";
import Fuse from "fuse.js";
import {
  FaMoneyBill,
  FaBriefcase,
  FaClipboardList,
  FaFileSignature,
  FaBuilding,
  FaCog,
  FaLanguage,
  FaUserTie,
  FaHome,
  FaExchangeAlt,
  FaBinoculars,
  FaTimes,
  FaArrowsAlt,
} from "react-icons/fa";
import { RiArrowGoBackLine, RiArrowGoForwardFill } from "react-icons/ri";

import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from "../config/mainConfig";
import mainConfig from "../config/mainConfig";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleMenu,
  setSearchCode,
  clearSearchCode,
  setOpenMenus,
  setCodeMap,
  closeAllModals,
} from "../store/slices/sidebarSlice";
import { PiCubeThin, PiPlantLight } from "react-icons/pi";
import {
  MdCurrencyExchange,
  MdFormatListNumbered,
  MdOutlineCancel,
} from "react-icons/md";
import {
  BsBuildingFillCheck,
  BsWindowDash,
  BsWindowPlus,
} from "react-icons/bs";
import { FaCity } from "react-icons/fa6";
import { PiMapPinAreaFill } from "react-icons/pi";
import { GiFactory } from "react-icons/gi";
import { TbArrowBigLeft, TbDatabaseEdit } from "react-icons/tb";
import { FiRefreshCw } from "react-icons/fi";
import { LuTickets } from "react-icons/lu";

const HEADER_HEIGHT = 148;

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
    case "FaCog":
      return <FaCog className="w-5 h-5" />;
    case "MdCurrencyExchange":
      return <MdCurrencyExchange className="w-5 h-5" />;
    case "FaLanguage":
      return <FaLanguage className="w-5 h-5" />;
    case "BsBuildingFillCheck":
      return <BsBuildingFillCheck className="w-5 h-5" />;
    case "FaCity":
      return <FaCity className="w-5 h-5" />;
    case "FaUserTie":
      return <FaUserTie className="w-5 h-5" />;
    case "PiMapPinAreaFill":
      return <PiMapPinAreaFill className="w-5 h-5" />;
    case "GiFactory":
      return <GiFactory className="w-5 h-5" />;
    case "FaHome":
      return <FaHome className="w-5 h-5" />;
    case "TbDatabaseEdit":
      return <TbDatabaseEdit className="w-5 h-5" />;
    case "FaExchangeAlt":
      return <FaExchangeAlt className="w-5 h-5" />;
    case "FiRefreshCw":
      return <FiRefreshCw className="w-5 h-5" />;
    case "PiCubeThin":
      return <PiCubeThin className="w-5 h-5" />;
    case "MdFormatListNumbered":
      return <MdFormatListNumbered className="w-5 h-5" />;
    case "LuTickets":
      return <LuTickets className="w-5 h-5" />;
    default:
      return null;
  }
};

/* ===============================
   SAP STYLE SESSION MANAGEMENT
================================ */
const SESSION_KEY = "aerp_sessions";
const MAX_SESSIONS = 6;

const getSessions = () => {
  const sessions = localStorage.getItem(SESSION_KEY);
  return sessions ? JSON.parse(sessions) : [];
};

const saveSessions = (sessions) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
};

const addSession = () => {
  const sessions = getSessions();

  if (sessions.length >= MAX_SESSIONS) {
    alert("Maximum 6 sessions allowed");
    return false;
  }

  sessions.push({
    id: Date.now(),
    created: new Date().toISOString(),
  });

  saveSessions(sessions);
  return true;
};

const removeSession = () => {
  const sessions = getSessions();

  if (sessions.length > 0) {
    sessions.pop();
    saveSessions(sessions);
  }
};

/* ===============================
   BUILD SEARCHABLE MENU LIST
================================ */
const buildMenuList = (menus, codeMap, parent = "") => {
  let list = [];

  menus.forEach((menu) => {
    const folder = parent ? `${parent} > ${menu.label}` : menu.label;

    if (menu.path) {
      list.push({
        label: menu.label,
        path: menu.path,
        iconName: menu.iconName,
        code: codeMap?.[menu.path] || "",
        folder: parent,
        fullPath: folder,
      });
    }

    if (menu.subMenu) {
      list = list.concat(buildMenuList(menu.subMenu, codeMap, folder));
    }
  });

  return list;
};

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeMenuLabel, setActiveMenuLabel] = useState("Quick Access");
  const menuRef = useRef(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(null);

  const [showFindPopup, setShowFindPopup] = useState(false);
  const [findText, setFindText] = useState("");
  const [findResults, setFindResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const { openMenus, searchCode, codeMap } = useSelector(
    (state) => state.sidebar,
  );

  const menuList = React.useMemo(() => {
    return buildMenuList(mainConfig, codeMap);
  }, [codeMap]);

  const fuse = React.useMemo(() => {
    return new Fuse(menuList, {
      keys: ["label", "code", "path", "folder", "fullPath"],
      threshold: 0.3,
    });
  }, [menuList]);

  const [topMenu, setTopMenu] = useState(null);

  const toggleTopMenu = (menu) => {
    setTopMenu(topMenu === menu ? null : menu);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setShowFindPopup(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setPageHistory((prev) => {
      if (prev[historyIndex] === location.pathname) return prev;

      const updated = prev.slice(0, historyIndex + 1);
      updated.push(location.pathname);
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [location.pathname]);

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
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setTopMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ---------------- KEEP MENU OPEN FOR CHILD ROUTES ---------------- */
  useEffect(() => {
    const activePath = location.pathname;
    let foundLabel = "Quick Access";

    const findLabel = (menus) => {
      menus.forEach((menu) => {
        if (menu.path && activePath.startsWith(menu.path)) {
          foundLabel = menu.label;
        }

        if (menu.subMenu) {
          menu.subMenu.forEach((sub) => {
            if (sub.path && activePath.startsWith(sub.path)) {
              foundLabel = sub.label;
            }
          });

          findLabel(menu.subMenu);
        }
      });
    };

    findLabel(mainConfig);
    setActiveMenuLabel(foundLabel);
  }, [location.pathname]);

  /* AUTO OPEN ACTIVE MENU */
  useEffect(() => {
    const activePath = location.pathname;
    const favorites = getFavorites();
    const isFavoritePage = favorites.some((f) => f.path === activePath);

    if (isFavoritePage) return;

    const newOpenMenus = {};

    const findAndOpenParents = (menus, parents = []) => {
      menus.forEach((menu) => {
        const isVendorProfile = activePath.startsWith(
          "/admin/vendors/profile/",
        );

        const isMatch =
          menu.path === activePath ||
          activePath.startsWith(menu.path) ||
          (menu.path === "/admin/vendor-master" && isVendorProfile);

        if (isMatch) {
          parents.forEach((p) => (newOpenMenus[p] = true));
        }

        if (menu.subMenu) {
          findAndOpenParents(menu.subMenu, [...parents, menu.id]);
        }
      });
    };

    findAndOpenParents(mainConfig);
    dispatch(setOpenMenus(newOpenMenus));
  }, [location.pathname, dispatch]);

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

  useEffect(() => {
    const sessions = getSessions();

    if (sessions.length === 0) {
      addSession();
    }
  }, []);

  /* ===============================
   NEW SESSION (SAP STYLE)
================================ */

  const handleNewSession = () => {
    const allowed = addSession();

    if (allowed) {
      const currentPath = window.location.pathname;
      window.open(currentPath, "_blank");
    }
  };

  /* ===============================
   END SESSION (SAP STYLE)
================================ */

  const handleEndSession = () => {
    removeSession();

    try {
      window.close();
    } catch (e) {
      alert("Close this tab manually");
    }
  };

  const closeMenu = () => {
    setTopMenu(null);
  };

  const searchMenus = (text) => {
    if (!text || text.trim() === "") {
      setFindResults([]);
      return;
    }

    const words = text.toLowerCase().trim().split(/\s+/);

    const matches = menuList.filter((menu) => {
      const label = menu.label?.toLowerCase() || "";
      const code = menu.code?.toLowerCase() || "";

      return words.every((word) => label.includes(word) || code.includes(word));
    });

    setFindResults(matches);
    setCurrentResultIndex(0);
  };

  const jumpToResult = () => {
    if (findResults.length === 0) return;

    const menu = findResults[currentResultIndex];

    if (menu.path) {
      navigate(menu.path);
      setShowFindPopup(false);
      setFindText("");
    }
  };

  const nextResult = () => {
    if (findResults.length === 0) return;

    setCurrentResultIndex((prev) =>
      prev + 1 >= findResults.length ? 0 : prev + 1,
    );
  };

  const prevResult = () => {
    if (findResults.length === 0) return;

    setCurrentResultIndex((prev) =>
      prev - 1 < 0 ? findResults.length - 1 : prev - 1,
    );
  };

  const handleRightClick = (e, menu) => {
    if (!menu.path) return;

    e.preventDefault();

    const favorites = getFavorites();
    const exists = favorites.find((f) => f.id === menu.id);

    setSelectedMenu(menu);

    if (exists) setPopupType("remove");
    else setPopupType("add");

    setPopupOpen(true);
  };
  const handleConfirm = () => {
    if (popupType === "add") addToFavorites(selectedMenu);
    if (popupType === "remove") removeFromFavorites(selectedMenu.id);

    setPopupOpen(false);
    window.location.reload();
  };

  const handleCancel = () => setPopupOpen(false);

  const handleSearch = () => {
    if (!searchCode) return;

    let route = null;

    Object.entries(codeMap).forEach(([path, code]) => {
      if (code === searchCode) {
        route = path;
      }
    });

    if (route) {
      navigate(route);
    } else {
      console.warn("T-Code not found:", searchCode);
    }

    dispatch(clearSearchCode());
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleExit = () => {
    setShowLogoutPopup(true);
  };

  const handlePrevious = () => {
    if (historyIndex > 0) {
      const prevPath = pageHistory[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      navigate(prevPath);
    }
  };

  const handleNext = () => {
    if (historyIndex < pageHistory.length - 1) {
      const nextPath = pageHistory[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      navigate(nextPath);
    }
  };

  const isPathActive = (path) => {
    const activePath = location.pathname;

    if (path === "/admin/vendor-master") {
      return (
        activePath === "/admin/vendor-master" ||
        activePath.startsWith("/admin/vendor-master") ||
        activePath.startsWith("/admin/vendors/profile/")
      );
    }

    return activePath === path;
  };

  const getLinkClass = (path, label) => {
    const active = isPathActive(path);

    const match =
      findText && label && label.toLowerCase().includes(findText.toLowerCase());

    return `flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer transition ${
      active
        ? "bg-amber-100 text-gray-700"
        : match
          ? "bg-yellow-200 text-black"
          : "text-gray-700"
    }`;
  };

  // const getLinkClass = (path) => {
  //   return `flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer transition ${
  //     isPathActive(path) ? "bg-amber-100 text-gray-700" : "text-gray-700"
  //   }`;
  // };

  const renderMenu = (menu) => {
    const isOpen = openMenus[menu.id];

    if (!menu.subMenu) {
      return (
        <div key={menu.id}>
          <Link
            to={menu.path}
            onContextMenu={(e) => handleRightClick(e, menu)}
            className={getLinkClass(menu.path, menu.label)}
          >
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
                <Link
                  to={sub.path}
                  onContextMenu={(e) => handleRightClick(e, sub)}
                  className={getLinkClass(sub.path, sub.label)}
                >
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
        <div className="flex items-center justify-between px-3 py-1 bg-gray-100 border border-gray-300">
          <div ref={menuRef} className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                onClick={() => toggleTopMenu("menu")}
                className="font-medium text-sm cursor-pointer"
              >
                Menu
              </button>

              {topMenu === "menu" && (
                <div className="absolute top-7 left-0 bg-white border border-gray-300 w-30 z-50">
                  <ul className="text-sm">
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiSave /> Save
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiEdit /> Edit
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiDelete /> Delete
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiEdit /> Park
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiStopCircle /> Hold
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => toggleTopMenu("system")}
                className="font-medium text-sm cursor-pointer"
              >
                Systems
              </button>

              {topMenu === "system" && (
                <div className="absolute top-7 left-0 bg-white border border-gray-300 w-30 z-50">
                  <ul className="text-sm">
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiSearch /> Find T code
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiSearch /> Search
                    </li>
                    <li
                      onClick={() => {
                        handleBack();
                        closeMenu();
                      }}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <TbArrowBigLeft /> Back
                    </li>

                    <li
                      onClick={() => {
                        handleExit();
                        closeMenu();
                      }}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FaArrowsAlt /> Exit
                    </li>

                    <li
                      onClick={() => {
                        dispatch(closeAllModals());
                        closeMenu();
                      }}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <MdOutlineCancel /> Cancel
                    </li>
                    <li
                      onClick={() => {
                        handleNewSession();
                        closeMenu();
                      }}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <BsWindowPlus /> New Session
                    </li>
                    <li
                      onClick={() => {
                        handleEndSession();
                        closeMenu();
                      }}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <BsWindowDash /> End Session
                    </li>
                    <li
                      onClick={() => {
                        handlePrevious();
                        closeMenu();
                      }}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <RiArrowGoBackLine /> Previous
                    </li>

                    <li
                      onClick={() => {
                        handleNext();
                        closeMenu();
                      }}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <RiArrowGoForwardFill /> Next
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiPrinter /> Print
                    </li>
                    <li
                      onClick={() => {
                        setShowLogoutPopup(true);
                        closeMenu();
                      }}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiPower /> Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => toggleTopMenu("favorites")}
                className="font-medium text-sm cursor-pointer"
              >
                Favorites
              </button>

              {topMenu === "favorites" && (
                <div className="absolute top-7 left-0 bg-white border border-gray-300 w-30 z-50">
                  <ul className="text-sm">
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiUser /> User Profile
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiMoon /> Theme
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiType /> Font
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiSettings /> Settings
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => toggleTopMenu("help")}
                className="font-medium text-sm cursor-pointer"
              >
                Help
              </button>

              {topMenu === "help" && (
                <div className="absolute top-7 left-0 bg-white border border-gray-300 w-30 z-50">
                  <ul className="text-sm">
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiUser /> User Profile
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiFile /> SOP
                    </li>
                    <li
                      onClick={closeMenu}
                      className="px-2 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                    >
                      <FiIcons.FiHelpCircle /> Help Desk
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-3 py-1">
          <img
            onClick={handleLogoClick}
            src={logo}
            alt="Logo"
            className="h-16 object-contain cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between px-3 py-1 bg-gray-100 border border-gray-300">
          <div className="flex items-center gap-3">
            <div className="flex items-stretch bg-white rounded overflow-hidden border border-gray-400">
              <span className="px-2 flex items-center border-r border-gray-300">
                T Code:
              </span>

              <input
                type="text"
                value={searchCode}
                onChange={(e) =>
                  dispatch(setSearchCode(e.target.value.toUpperCase()))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="px-2 w-20 h-8 outline-none"
              />

              <button
                onClick={handleSearch}
                title="Search"
                className="px-2 bg-gray-100 flex items-center justify-center cursor-pointer border-l border-gray-300"
              >
                <FiIcons.FiSearch size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <FiIcons.FiSave
                size={16}
                title="Save"
                className="cursor-pointer"
              />
              <FiIcons.FiPrinter
                size={16}
                title="Print"
                className="cursor-pointer"
              />
              <FaBinoculars
                onClick={() => setShowFindPopup(true)}
                size={16}
                title="Find"
                className="cursor-pointer"
              />
              <TbArrowBigLeft
                onClick={() => {
                  handleBack();
                  closeMenu();
                }}
                size={16}
                title="Back"
                className="cursor-pointer"
              />
              <FaArrowsAlt
                onClick={() => {
                  handleExit();
                  closeMenu();
                }}
                size={16}
                title="Exit"
                className="cursor-pointer"
              />
              <MdOutlineCancel
                onClick={() => {
                  dispatch(closeAllModals());
                  closeMenu();
                }}
                size={16}
                title="Cancel"
                className="cursor-pointer"
              />

              <BsWindowPlus
                onClick={handleNewSession}
                size={16}
                title="New Session"
                className="cursor-pointer"
              />
              <BsWindowDash
                onClick={handleEndSession}
                size={16}
                title="End Session"
                className="cursor-pointer"
              />
              <FiIcons.FiHelpCircle
                size={16}
                title="Help"
                className="cursor-pointer"
              />
              <RiArrowGoBackLine
                onClick={() => {
                  handlePrevious();
                  closeMenu();
                }}
                size={16}
                title="Previous"
                className="cursor-pointer"
              />
              <RiArrowGoForwardFill
                onClick={() => {
                  handleNext();
                  closeMenu();
                }}
                size={16}
                title="Next"
                className="cursor-pointer"
              />
            </div>
          </div>

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
          {mainConfig.map(renderMenu)}
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

      {popupOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white px-6 py-4 rounded-md w-11/12 max-w-sm shadow-md border border-gray-300">
            <h2 className="text-lg font-semibold text-center mb-2 whitespace-nowrap">
              {popupType === "add"
                ? "Add this menu to Favorites?"
                : "Remove this menu from Favorites?"}
            </h2>
            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={handleConfirm}
                className="bg-amber-400 text-black font-medium px-3 py-1.5 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white font-medium px-3 py-1.5 rounded-md cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showFindPopup && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white px-6 py-4 rounded-md w-11/12 max-w-sm shadow-md border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-1 mb-2 border-gray-300">
              <div className="flex items-center gap-2">
                <FaBinoculars className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">Search</h2>
              </div>

              <button
                onClick={() => {
                  setShowFindPopup(false);
                  setFindText("");
                }}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-lg font-bold mb-0.5"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64 h-8 flex items-center">
                <FiIcons.FiSearch
                  className="absolute left-3 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  onFocus={(e) => e.target.select()}
                  autoFocus
                  value={findText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFindText(value);
                    searchMenus(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") jumpToResult();
                    if (e.key === "ArrowDown") nextResult();
                    if (e.key === "ArrowUp") prevResult();
                  }}
                  placeholder="Search T Code or menu..."
                  className="w-full h-8 border border-gray-300 rounded-sm text-sm text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300 text-left pl-8 pr-3 placeholder:text-gray-400 placeholder:text-sm"
                />
              </div>

              <button
                onClick={() => jumpToResult()}
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                Search <FaBinoculars size={16} />
              </button>
            </div>
            <div className="mt-2 max-h-52 overflow-y-auto rounded shadow-sm">
              {findResults.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setShowFindPopup(false);
                    setFindText("");
                  }}
                  className={`px-3 py-2 cursor-pointer flex items-center gap-3 text-sm ${
                    index === currentResultIndex
                      ? "bg-amber-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {item.code ? `${item.code} - ` : ""}
                        {item.label}
                      </span>

                      <span className="text-xs text-gray-500">
                        {item.folder}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
