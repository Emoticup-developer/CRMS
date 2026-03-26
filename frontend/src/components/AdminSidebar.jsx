import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import logo from "../assets/logo.png";
import * as FiIcons from "react-icons/fi";
import api from "../utils/api";
import {
  FaMoneyBill, FaBriefcase, FaClipboardList, FaFileSignature,
  FaBuilding, FaCog, FaLanguage, FaUserTie, FaHome, FaExchangeAlt,
} from "react-icons/fa";
import mainConfig from "../config/mainConfig";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleMenu, setCodeMap, setOpenMenus, closeAllModals,
} from "../store/slices/sidebarSlice";
import { PiCubeThin, } from "react-icons/pi";
import { MdFormatListNumbered } from "react-icons/md";
import { TbDatabaseEdit } from "react-icons/tb";
import { FiRefreshCw } from "react-icons/fi";
import {LuTickets} from "react-icons/lu";
import { AiOutlineLineChart } from "react-icons/ai";

const HEADER_HEIGHT = 62;

/* ── icon resolver ── */
const getIcon = (iconName) => {
  if (!iconName) return null;
  if (FiIcons[iconName]) return React.createElement(FiIcons[iconName], { size: 17 });
  const map = {
    
    FaHome: <FaHome size={17}/>,
    LuTickets: <LuTickets size={17}/>, AiOutlineLineChart: <AiOutlineLineChart size={17}/>,
     FaClipboardList: <FaClipboardList size={17}/>
  };
  return map[iconName] ?? null;
};

/* ── flat searchable list ── */
const buildMenuList = (menus, codeMap, parent = "") => {
  let list = [];
  menus.forEach((menu) => {
    const folder = parent ? `${parent} > ${menu.label}` : menu.label;
    if (menu.path) list.push({ label: menu.label, path: menu.path, iconName: menu.iconName, code: codeMap?.[menu.path] || "", folder: parent });
    if (menu.subMenu) list = list.concat(buildMenuList(menu.subMenu, codeMap, folder));
  });
  return list;
};

/* ══════════════════════════════════════════ */
const AdminSidebar = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useDispatch();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showUserMenu,    setShowUserMenu]    = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [searchResults,   setSearchResults]   = useState([]);
  const [showResults,     setShowResults]     = useState(false);
  const [resultIndex,     setResultIndex]     = useState(0);

  const userMenuRef  = useRef(null);
  const searchRef    = useRef(null);

  const { openMenus, codeMap } = useSelector((s) => s.sidebar);
  const menuList = React.useMemo(() => buildMenuList(mainConfig, codeMap), [codeMap]);

  

  const username = Cookies.get("username") || "Admin";
  const position = Cookies.get("position") || "Admin";
  const initials  = username.slice(0, 2).toUpperCase();

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))   setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* auto-open parent menus */
  useEffect(() => {
    const activePath = location.pathname;
    const newOpen = {};
    const find = (menus, parents = []) => menus.forEach((m) => {
      const match = m.path === activePath || activePath.startsWith(m.path) ||
        (m.path === "/admin/vendor-master" && activePath.startsWith("/admin/vendors/profile/"));
      if (match) parents.forEach((p) => (newOpen[p] = true));
      if (m.subMenu) find(m.subMenu, [...parents, m.id]);
    });
    find(mainConfig);
    dispatch(setOpenMenus(newOpen));
  }, [location.pathname, dispatch]);

  /* fetch t-code map */
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await api.get("/access/navigation_box/");
        const map = {};
        res.data.forEach((i) => { if (i.path && i.code) map[i.path] = i.code; });
        dispatch(setCodeMap(map));
      } catch (e) { console.error(e); }
    };
    fetch_();
  }, [dispatch]);

  /* search */
  const doSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) { setSearchResults([]); setShowResults(false); return; }
    const words = text.toLowerCase().split(/\s+/);
    const hits = menuList.filter((m) => {
      const l = m.label.toLowerCase(), c = m.code.toLowerCase();
      return words.every((w) => l.includes(w) || c.includes(w));
    });
    setSearchResults(hits);
    setResultIndex(0);
    setShowResults(true);
  };

  const pickResult = (item) => {
    navigate(item.path);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleLogout = () => {
    ["access_token","refresh_token","username","position"].forEach((k) => Cookies.remove(k));
    window.location.href = "/";
  };

  const handleLogoClick = () => {
    const paths = { ADMIN: "/admin/home", VENDOR: "/partner/partner-onboarding", GM: "/manager/home", EXE: "/home" };
    navigate(paths[position] || "/");
  };

  const isActive = (path) => {
    const a = location.pathname;
    if (path === "/admin/vendor-master")
      return a === path || a.startsWith(path) || a.startsWith("/admin/vendors/profile/");
    return a === path;
  };

  const getLinkClass = (path) => {
    return `flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer transition ${
      isActive(path) ? "bg-amber-100 text-gray-700" : "text-gray-700"
    }`;
  };

  /* ── render one menu node ── */
  const renderMenu = (menu) => {
    const isOpen = openMenus[menu.id];

    if (!menu.subMenu) {
      return (
        <div key={menu.id}>
          <Link
            to={menu.path}
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

  /* ══════════════ JSX ══════════════ */
  return (
<div className="min-h-screen bg-[#f2f1ed] text-[#18181a] font-['DM_Sans',sans-serif]">

      {/* ════════════ NAVBAR ════════════ */}
<header className="fixed inset-x-0 top-0 h-[62px] bg-white border-b border-[#e8e7e2] flex items-center pr-6 z-50 shadow-sm">

        {/* Logo block — same width as sidebar */}
      <div
  onClick={handleLogoClick}
  className="px-3 py-1 min-w-[325px]"
>
  <img src={logo} alt="logo" className="h-10 object-contain cursor-pointer" />
</div>

        {/* Search */}
        <div className="flex-1 max-w-[500px] ml-7 relative" ref={searchRef}>
  <div className="flex items-center gap-2 bg-[#f8f8f5] border-[1.5px] border-[#e8e7e2] rounded-full px-4 h-[38px] focus-within:border-[#f0b429] focus-within:shadow-[0_0_0_3px_rgba(240,180,41,0.18)] focus-within:bg-white transition-all">
    <FiIcons.FiSearch size={14} className="text-[#a0a0a0] flex-shrink-0" />
    <input
      type="text"
      placeholder="Search menus, T-codes..."
      value={searchQuery}
      onChange={(e) => doSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && searchResults.length) pickResult(searchResults[resultIndex]);
        if (e.key === "ArrowDown") setResultIndex((p) => Math.min(p + 1, searchResults.length - 1));
        if (e.key === "ArrowUp")   setResultIndex((p) => Math.max(p - 1, 0));
        if (e.key === "Escape")    { setShowResults(false); setSearchQuery(""); }
      }}
      onFocus={() => searchResults.length && setShowResults(true)}
      className="flex-1 border-none bg-transparent text-[13.5px] text-[#18181a] outline-none placeholder:text-[#a0a0a0] font-['DM_Sans',sans-serif]"
    />
  </div>
  {showResults && searchResults.length > 0 && (
    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-[#e8e7e2] rounded-[10px] shadow-lg max-h-[300px] overflow-y-auto z-[999]">
      {searchResults.map((item, idx) => (
        <div
          key={idx}
          onClick={() => pickResult(item)}
          className={`flex flex-col gap-[2px] px-4 py-[10px] cursor-pointer border-b border-[#e8e7e2] last:border-b-0 transition-colors ${
            idx === resultIndex ? "bg-[#fef5e0]" : "hover:bg-[#fef5e0]"
          }`}
        >
          <span className="text-[13px] font-medium text-[#18181a]">
            {item.code ? <b>{item.code} · </b> : ""}{item.label}
          </span>
          <span className="text-[11px] text-[#a0a0a0]">{item.folder}</span>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Right side */}
<div className="ml-auto flex items-center gap-1">
          <button className="relative w-[38px] h-[38px] rounded-md bg-transparent border-none text-[#6b6b6b] flex items-center justify-center hover:bg-[#f4f3ef] hover:text-[#18181a] transition-colors" title="Notifications">
  <FiIcons.FiBell size={18} />
  <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white" />
</button>
<button className="w-[38px] h-[38px] rounded-md bg-transparent border-none text-[#6b6b6b] flex items-center justify-center hover:bg-[#f4f3ef] hover:text-[#18181a] transition-colors" title="Help">
  <FiIcons.FiHelpCircle size={18} />
</button>
<button className="w-[38px] h-[38px] rounded-md bg-transparent border-none text-[#6b6b6b] flex items-center justify-center hover:bg-[#f4f3ef] hover:text-[#18181a] transition-colors" title="Settings">
  <FiIcons.FiSettings size={18} />
</button>

          {/* User */}
          <div className="relative ml-3" ref={userMenuRef}>
  <div
    onClick={() => setShowUserMenu((v) => !v)}
    className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-[#f4f3ef] transition-colors"
  >
    <div className="flex flex-col items-end">
      <span className="text-[13px] font-semibold text-[#18181a] leading-tight">{username}</span>
      <span className="text-[10.5px] font-medium tracking-[0.04em] text-[#a0a0a0] uppercase">{position}</span>
    </div>
    <div className="w-9 h-9 rounded-md bg-[#f0b429] text-[#1a1000] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
      {initials}
    </div>
  </div>
  {showUserMenu && (
    <div className="absolute top-[calc(100%+10px)] right-0 w-[220px] bg-white border border-[#e8e7e2] rounded-[14px] shadow-lg overflow-hidden z-[999]">
      <div className="flex items-center gap-2 p-4">
        <div className="w-[38px] h-[38px] rounded-md bg-[#f0b429] text-[#1a1000] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[#18181a]">{username}</div>
          <div className="text-[11px] text-[#a0a0a0] uppercase tracking-[0.04em] mt-[1px]">{position}</div>
        </div>
      </div>
      <hr className="border-[#e8e7e2]" />
      <button onClick={() => navigate(`/admin/user/${username}`)} className="w-full flex items-center gap-2 px-4 py-[10px] text-[13px] font-medium text-[#18181a] bg-none border-none text-left hover:bg-[#f4f3ef] transition-colors">
        <FiIcons.FiUser size={14}/> Profile
      </button>
      <button onClick={() => navigate("/admin/settings")} className="w-full flex items-center gap-2 px-4 py-[10px] text-[13px] font-medium text-[#18181a] bg-none border-none text-left hover:bg-[#f4f3ef] transition-colors">
        <FiIcons.FiSettings size={14}/> Settings
      </button>
      <hr className="border-[#e8e7e2]" />
      <button onClick={() => setShowLogoutPopup(true)} className="w-full flex items-center gap-2 px-4 py-[10px] text-[13px] font-medium text-red-600 bg-none border-none text-left hover:bg-red-50 transition-colors">
        <FiIcons.FiLogOut size={14}/> Logout
      </button>
    </div>
  )}
</div>
        </div>
      </header>

      {/* ════════════ SIDEBAR ════════════ */}
         <aside
        className="fixed left-0 w-[325px] transition-all duration-300 bg-gradient-to-t from-gray-100 to-gray-50 border-r border-gray-300"
        style={{
          top: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
       
        <nav className="h-full overflow-y-auto px-3 text-[15px] py-2 [&::-webkit-scrollbar]:hidden scrollbar-none">
          {mainConfig.map(renderMenu)}
        </nav>
      </aside>
      {/* <aside className="w-[325px] bg-white border-r border-[#e8e7e2] fixed top-[62px] bottom-0 left-0 p-4 overflow-y-auto">
        {mainConfig.map(renderMenu)}
      </aside> */}

      {/* ════════════ MAIN SLOT ════════════ */}
      <main className="ml-[325px] p-3 transition-all duration-300" style={{ marginTop: HEADER_HEIGHT }}>
  <Outlet />
      </main>
      {/* ════════════ LOGOUT MODAL ════════════ */}
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
             <button onClick={handleLogout} className="text-[13px] font-semibold rounded-md px-6 py-2 bg-[#f0b429] text-[#1a1000] hover:opacity-85 transition-opacity">Yes, Logout</button>
      <button onClick={() => setShowLogoutPopup(false)} className="text-[13px] font-semibold rounded-md px-6 py-2 bg-[#f4f3ef] text-[#18181a] border border-[#e8e7e2] hover:opacity-85 transition-opacity">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* {showLogoutPopup && (
       <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center z-50">
  <div className="bg-white px-6 py-4 rounded-md w-11/12 max border border-[#e8e7e2] rounded-[14px] p-9 w-full max-w-[360px] text-center shadow-xl">
    <div className="text-[38px] text-[#f0b429] flex justify-center mb-3"><FiIcons.FiAlertTriangle /></div>
    <h3 className="text-[15px] font-semibold text-[#18181a] mb-6">Are you sure you want to logout?</h3>
    <div className="flex justify-center gap-3">
      <button onClick={handleLogout} className="text-[13px] font-semibold rounded-md px-6 py-2 bg-[#f0b429] text-[#1a1000] hover:opacity-85 transition-opacity">Yes, Logout</button>
      <button onClick={() => setShowLogoutPopup(false)} className="text-[13px] font-semibold rounded-md px-6 py-2 bg-[#f4f3ef] text-[#18181a] border border-[#e8e7e2] hover:opacity-85 transition-opacity">Cancel</button>
    </div>
  </div>
</div>
      )} */}

     
    </div>
  );
};

export default AdminSidebar;