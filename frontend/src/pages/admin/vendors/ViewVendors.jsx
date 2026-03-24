import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./../../../components/AdminSidebar";
import mainConfig from "../../../config/mainConfig";
import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiPlus,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { fetchVenders } from "../../../store/slices/vendorSlice";
import { FaTimes } from "react-icons/fa";
import dayjs from "dayjs";

const ViewVendors = () => {
  const dispatch = useDispatch();
  const { vendors, loading } = useSelector((state) => state.vendors);

  // ---------------- FILTER / SORT / PAGINATION ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    dispatch(fetchVenders());
  }, [dispatch]);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const findPathInMenu = (menu, targetPath, parents = []) => {
    for (let item of menu) {
      const newParents = [...parents, item];
      if (item.path === targetPath) return newParents;
      if (item.subMenu) {
        const result = findPathInMenu(item.subMenu, targetPath, newParents);
        if (result) return result;
      }
    }
    return null;
  };

  const updateBreadcrumbs = (action = null, id = null) => {
    const menuPath = findPathInMenu(mainConfig, location.pathname) || [];

    const baseBreadcrumbs = menuPath.map((i) => ({
      label: i.label,
      path: i.path,
    }));

    if (action === "View" && id) {
      baseBreadcrumbs.push({ label: "View", path: null });
      baseBreadcrumbs.push({
        label: id.toString(),
        fullLabel: id.toString(),
        path: null,
      });
    }

    setBreadcrumbs(baseBreadcrumbs);
  };

  useEffect(() => {
    if (showConfirm && selectedVendor?.id) {
      updateBreadcrumbs("View", selectedVendor.id);
    } else {
      updateBreadcrumbs();
    }
  }, [location.pathname, showConfirm, selectedVendor]);

  const currentIndex = breadcrumbs.findIndex(
    (b) => b.path === location.pathname,
  );

  const goPrev = () => {
    if (currentIndex > 0) navigate(breadcrumbs[currentIndex - 1].path);
  };

  const goNext = () => {
    if (currentIndex < breadcrumbs.length - 1)
      navigate(breadcrumbs[currentIndex + 1].path);
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredVendors = vendors.filter((vendor) => {
    const search = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
    const normalize = (value) =>
      (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");
    let activeText = "";
    if (vendor?.is_active === true) activeText = "yes";
    else if (vendor?.is_active === false) activeText = "no";
    return (
      normalize(vendor?.vendor_name).includes(search) ||
      normalize(vendor?.short_name).includes(search) ||
      normalize(vendor?.creator?.username).includes(search) ||
      normalize(vendor?.company?.company_name).includes(search) ||
      normalize(activeText).includes(search)
    );
  });

  // ---------------- PAGINATION LOGIC ----------------
  const totalPages = Math.ceil(filteredVendors.length / rowsPerPage);

  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block fixed top-0 left-0 h-full w-[325px] z-40">
        <AdminSidebar />
      </div>

      <main className="flex-1 ml-0 lg:ml-[325px] mt-[148px] p-3 overflow-y-auto bg-white backdrop-blur-sm shadow-inner [&::-webkit-scrollbar]:hidden scrollbar-none">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400 flex items-center gap-2 overflow-hidden whitespace-nowrap max-w-[80%]">
            {breadcrumbs.map((b, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 truncate max-w-[200px]"
                title={b.fullLabel || b.label}
              >
                {b.path ? (
                  <span
                    onClick={() => navigate(b.path)}
                    className="cursor-pointer hover:text-gray-600 truncate"
                  >
                    {b.label}
                  </span>
                ) : (
                  <span className="truncate">{b.label}</span>
                )}

                {idx < breadcrumbs.length - 1 && (
                  <span className="text-gray-400 shrink-0"> &gt; </span>
                )}
              </span>
            ))}
          </div>

          <div className="flex items-center">
            <button
              onClick={goPrev}
              className={`text-gray-400 text-lg ${
                currentIndex <= 0
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
              disabled={currentIndex <= 0}
            >
              <MdKeyboardArrowLeft />
            </button>
            <button
              onClick={goNext}
              className={`text-gray-400 text-lg ${
                currentIndex >= breadcrumbs.length - 1
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
              disabled={currentIndex >= breadcrumbs.length - 1}
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
        </div>

        <div className="w-full mb-4">
          <div className="flex justify-between items-end border-b-2 border-gray-300 pb-1 mb-4">
            <div className="flex items-center gap-2">
              <FiUsers className="text-amber-500 text-lg" />
              <h2 className="text-lg font-semibold text-gray-700">
                Display Vendor
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />

                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 pl-7 py-1.5 rounded border h-8 border-gray-300 text-sm outline-none"
                />
              </div>

              <Link
                to="/admin/vendor/create"
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                <FiPlus /> Create Vendor
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-300 w-full">
          <div className="overflow-x-auto">
            <div className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
              <table className="min-w-full text-sm text-left divide-y divide-gray-200">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  <tr>
                    {[
                      "NAME",
                      "SHORT NAME",
                      "CREATOR",
                      "COMPANY",
                      "ACTIVE",
                      "ACTIONS",
                    ].map((label, idx) => (
                      <th
                        key={idx}
                        className="px-2 py-2 font-medium border border-gray-200 text-center sticky top-0 z-20 whitespace-nowrap"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-2 py-2 text-center border border-gray-200 whitespace-nowrap"
                      >
                        <div className="flex justify-center items-center">
                          <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVendors.length > 0 ? (
                    paginatedVendors.map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="hover:bg-gray-50 text-center transition-all duration-200"
                      >
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.vendor_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.short_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.creator?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.company?.company_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.is_active == null ? (
                            "--"
                          ) : (
                            <span
                              className={
                                vendor?.is_active
                                  ? "text-green-600"
                                  : "text-red-500"
                              }
                            >
                              {vendor?.is_active ? "Yes" : "No"}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <div className="flex justify-center items-center space-x-3 text-sm">
                            <button
                              onClick={() => {
                                setSelectedVendor(vendor);
                                updateBreadcrumbs("View", vendor.id);
                                setShowConfirm(true);
                              }}
                              className="text-gray-600 hover:scale-110 cursor-pointer transition"
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-2 py-2 text-center text-gray-400 border border-gray-200"
                      >
                        No vendors found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full px-6">
            <div className="flex justify-center items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center border rounded text-sm 
                   disabled:opacity-40 disabled:cursor-not-allowed 
                   hover:bg-gray-100 cursor-pointer transition"
              >
                <FiArrowLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-7 h-7 flex items-center justify-center border rounded text-sm 
            transition cursor-pointer ${
              currentPage === index + 1
                ? "bg-amber-400 text-black border-amber-400"
                : "hover:bg-gray-100"
            }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center border rounded text-sm 
                   disabled:opacity-40 disabled:cursor-not-allowed 
                   hover:bg-gray-100 cursor-pointer transition"
              >
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {showConfirm && selectedVendor && (
          <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
            <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
              <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-amber-500 text-lg" />
                  <h2 className="text-lg font-semibold text-gray-700">
                    View Vendor
                  </h2>
                </div>

                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-gray-500 cursor-pointer hover:text-gray-700 text-lg font-bold mb-0.5"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
                <table className="table-auto w-full text-sm text-gray-700">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Vendor Code:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.vendor_code || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Short Name:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.short_name || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Vendor Name:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.vendor_name || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Vendor Type:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.vendor_type?.name || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Contact Person:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.contact_person || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Email ID:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.email || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Phone:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.phone || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Mobile No:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.mobile || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Website:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.website ? (
                          <a
                            href={
                              selectedVendor.website.startsWith("http")
                                ? selectedVendor.website
                                : `https://${selectedVendor.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-500"
                          >
                            {selectedVendor.website}
                          </a>
                        ) : (
                          "--"
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Active:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.is_active == null ? (
                          "--"
                        ) : (
                          <span
                            className={
                              selectedVendor?.is_active
                                ? "text-green-600"
                                : "text-red-500"
                            }
                          >
                            {selectedVendor?.is_active ? "Yes" : "No"}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left align-top">
                        Billing Address:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4 align-top">
                        {selectedVendor?.billing_address || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left align-top">
                        Shipping Address:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4 align-top">
                        {selectedVendor?.shipping_address || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Currency:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.currency?.currency_code || "--"} -{" "}
                        {selectedVendor?.currency?.currency_name || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Country:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.country?.country_code || "--"} -{" "}
                        {selectedVendor?.country?.country_name || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        State:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.state?.state_name || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        City:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.city?.city_name || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Postal Code:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.postal_code || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Lead Time:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.default_lead_time_days == null ? (
                          "--"
                        ) : (
                          <>
                            {selectedVendor.default_lead_time_days}{" "}
                            {selectedVendor.default_lead_time_days > 1
                              ? "days"
                              : "day"}
                          </>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Minimum Order Value:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.minimum_order_value || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Blacklisted:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.is_blacklisted == null ? (
                          "--"
                        ) : (
                          <span
                            className={
                              selectedVendor?.is_blacklisted
                                ? "text-green-600"
                                : "text-red-500"
                            }
                          >
                            {selectedVendor?.is_blacklisted ? "Yes" : "No"}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Approved By CFO:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.is_approved_by_cfo == null ? (
                          "--"
                        ) : (
                          <span
                            className={
                              selectedVendor?.is_approved_by_cfo
                                ? "text-green-600"
                                : "text-red-500"
                            }
                          >
                            {selectedVendor?.is_approved_by_cfo ? "Yes" : "No"}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Validated:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.is_validated == null ? (
                          "--"
                        ) : (
                          <span
                            className={
                              selectedVendor?.is_validated
                                ? "text-green-600"
                                : "text-red-500"
                            }
                          >
                            {selectedVendor?.is_validated ? "Yes" : "No"}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Creator:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.creator?.username || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Company:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.company?.company_name || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left align-top">
                        Remarks:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4 align-top">
                        {selectedVendor?.remarks || "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Created At:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.created_at
                          ? dayjs(selectedVendor?.created_at).format(
                              "DD-MM-YYYY hh:mm A",
                            )
                          : "--"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="font-semibold w-2/5 py-1 text-left">
                        Updated At:
                      </td>
                      <td className="w-3/5 py-1 text-left pl-4">
                        {selectedVendor?.updated_at
                          ? dayjs(selectedVendor?.updated_at).format(
                              "DD-MM-YYYY hh:mm A",
                            )
                          : "--"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewVendors;
