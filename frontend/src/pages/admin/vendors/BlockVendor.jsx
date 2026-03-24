import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./../../../components/AdminSidebar";
import mainConfig from "../../../config/mainConfig";
import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
  FiArrowLeft,
  FiArrowRight,
  FiInfo,
  FiPlus,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVenders,
  updateVender,
  fetchVenderTypes,
  fetchCurrencies,
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchUsers,
  fetchCompanies,
} from "../../../store/slices/vendorSlice";
import { FaTimes } from "react-icons/fa";

const BlockVendor = () => {
  const dispatch = useDispatch();
  const {
    vendortypes,
    currencies,
    countries,
    states,
    cities,
    users,
    companies,
    vendors,
    loading,
  } = useSelector((state) => state.vendors);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    dispatch(fetchVenders());
    dispatch(fetchVenderTypes());
    dispatch(fetchCurrencies());
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
    dispatch(fetchUsers());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState({ text: "", type: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [submitAction, setSubmitAction] = useState("");

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const initialFormData = {
    vendor_name: "",
    vendor_code: "",
    short_name: "",
    vendor_type: "",
    contact_person: "",
    email: "",
    phone: "",
    mobile: "",
    website: "",
    billing_address: "",
    shipping_address: "",
    country: "",
    state: "",
    city: "",
    postal_code: "",
    currency: "",
    default_lead_time_days: "",
    minimum_order_value: "",
    is_active: "",
    is_blacklisted: "",
    is_approved_by_cfo: "",
    is_validated: "",
    remarks: "",
    creator: "",
    company: "",
  };

  const [formData, setFormData] = useState(initialFormData);

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

    if (action === "Block" && id) {
      baseBreadcrumbs.push({ label: "Block", path: null });
      baseBreadcrumbs.push({
        label: id.toString(),
        fullLabel: id.toString(),
        path: null,
      });
    }

    setBreadcrumbs(baseBreadcrumbs);
  };

  useEffect(() => {
    if (showEditModal && editId) {
      updateBreadcrumbs("Block", editId);
    } else {
      updateBreadcrumbs();
    }
  }, [location.pathname, showEditModal, editId]);

  const currentIndex = breadcrumbs.findIndex(
    (b) => b.path === location.pathname,
  );

  const goPrev = () => {
    if (currentIndex > 0) navigate(breadcrumbs[currentIndex - 1].path);
  };

  const goNext = () => {
    if (currentIndex < breadcrumbs.length - 1) {
      navigate(breadcrumbs[currentIndex + 1].path);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOpenEdit = (vendor) => {
    setEditId(vendor.id);
    setFormData({
      vendor_name: vendor.vendor_name || "",
      vendor_code: vendor.vendor_code || "",
      short_name: vendor.short_name || "",
      vendor_type: vendor.vendor_type?.id || "",
      contact_person: vendor.contact_person || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      mobile: vendor.mobile || "",
      website: vendor.website || "",
      billing_address: vendor.billing_address || "",
      shipping_address: vendor.shipping_address || "",
      country: vendor.country?.id || "",
      state: vendor.state?.id || "",
      city: vendor.city?.id || "",
      postal_code: vendor.postal_code || "",
      currency: vendor.currency?.id || "",
      default_lead_time_days: vendor.default_lead_time_days || "",
      minimum_order_value: vendor.minimum_order_value || "",
      is_active:
        vendor.is_active === null ? "" : vendor.is_active ? "true" : "false",
      is_blacklisted:
        vendor.is_blacklisted === null
          ? ""
          : vendor.is_blacklisted
            ? "true"
            : "false",
      is_approved_by_cfo:
        vendor.is_approved_by_cfo === null
          ? ""
          : vendor.is_approved_by_cfo
            ? "true"
            : "false",
      is_validated:
        vendor.is_validated === null
          ? ""
          : vendor.is_validated
            ? "true"
            : "false",
      remarks: vendor.remarks || "",
      creator: vendor.creator?.id || "",
      company: vendor.company?.id || "",
    });

    setShowEditModal(true);
  };

  const handleToggleClick = (vendor) => {
    handleOpenEdit(vendor);
  };

  const handleSubmitEdit = async (statusValue) => {
    const updatedFormData = {
      ...formData,
      is_active: statusValue,
    };

    const data = new FormData();

    Object.keys(updatedFormData).forEach((key) => {
      if (key === "billing_address") {
        data.append("billing_address", updatedFormData.billing_address ?? "");
      } else if (key === "shipping_address") {
        data.append("shipping_address", updatedFormData.shipping_address ?? "");
      } else if (key === "remarks") {
        data.append("remarks", updatedFormData.remarks ?? "");
      } else {
        if (
          updatedFormData[key] !== undefined &&
          updatedFormData[key] !== null &&
          updatedFormData[key] !== ""
        ) {
          data.append(key, updatedFormData[key]);
        }
      }
    });

    if (
      !updatedFormData.vendor_name ||
      !updatedFormData.vendor_code ||
      !updatedFormData.short_name ||
      !updatedFormData.vendor_type ||
      !updatedFormData.currency ||
      !updatedFormData.country ||
      !updatedFormData.state ||
      !updatedFormData.city ||
      !updatedFormData.postal_code ||
      !updatedFormData.creator ||
      !updatedFormData.company
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      return;
    }

    try {
      setSubmittingStatus(true);
      setSubmitAction(statusValue);

      const res = await dispatch(
        updateVender({ id: editId, formData: data }),
      ).unwrap();

      if (res.status === 200 || res.status === 201) {
        setFormData((prev) => ({
          ...prev,
          is_active: statusValue,
        }));

        showTemporaryMessage(
          statusValue === "true"
            ? "Vendor activated successfully!"
            : "Vendor deactivated successfully!",
          "success",
        );
        setShowEditModal(false);
        setEditId(null);
      } else if (res.status === 202) {
        setFormData((prev) => ({
          ...prev,
          is_active: statusValue,
        }));

        showTemporaryMessage(
          statusValue === "true"
            ? "Vendor activate accepted!"
            : "Vendor deactivate accepted!",
          "success",
        );
        setShowEditModal(false);
        setEditId(null);
      } else {
        showTemporaryMessage("Unexpected response from server.", "error");
      }
    } catch (error) {
      console.log("Update Error:", error);

      let errorMessages = [];

      if (error?.data) {
        const data = error.data;

        Object.keys(data).forEach((key) => {
          const value = data[key];

          if (Array.isArray(value)) {
            value.forEach((msg) => errorMessages.push(msg));
          } else if (typeof value === "string") {
            errorMessages.push(value);
          }
        });
      }

      if (errorMessages.length > 0) {
        errorMessages.forEach((msg, i) => {
          setTimeout(() => {
            showTemporaryMessage(msg, "error");
          }, i * 600);
        });
      } else {
        showTemporaryMessage(
          "Failed to activate or deactivate vendor!",
          "error",
        );
      }
    } finally {
      setSubmittingStatus(false);
      setSubmitAction("");
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);
    setSubmittingStatus(false);
    setSubmitAction("");
    setFormData(initialFormData);
  };

  const getDisplayValue = (value, fallback = "--") => {
    return value !== null && value !== undefined && value !== ""
      ? value
      : fallback;
  };

  const getBooleanText = (value) => {
    if (value === "true") return "Yes";
    if (value === "false") return "No";
    return "--";
  };

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
                Block Vendor
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
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }
                            >
                              {vendor?.is_active ? "Yes" : "No"}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <div className="flex justify-center items-center">
                            <button
                              onClick={() => handleToggleClick(vendor)}
                              className="cursor-pointer transition"
                              title={
                                vendor?.is_active ? "Deactivate" : "Activate"
                              }
                            >
                              <div
                                className={`w-12 h-5 rounded-full flex items-center px-1 transition-all duration-300 ${
                                  vendor?.is_active
                                    ? "bg-amber-400"
                                    : "bg-gray-300"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                                    vendor?.is_active
                                      ? "translate-x-6"
                                      : "translate-x-0"
                                  }`}
                                />
                              </div>
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

        {message.text && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full px-6">
            <div
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded border shadow-lg ${
                message.type === "success"
                  ? "text-green-700 border-green-200 bg-green-50"
                  : "text-red-700 border-red-200 bg-red-50"
              }`}
            >
              <FiInfo
                className={`${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              />
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
            <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-md border border-gray-300">
              <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-amber-500 text-lg" />
                  <h2 className="text-lg font-semibold text-gray-700">
                    Block Vendor
                  </h2>
                </div>
                <button
                  onClick={handleCloseEditModal}
                  disabled={submittingStatus}
                  className="text-gray-500 cursor-pointer hover:text-gray-700 text-lg font-bold mb-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
                <div className="flex flex-col">
                  <label className="form-label">Vendor Code</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.vendor_code, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Short Name</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.short_name, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Vendor Name</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.vendor_name, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Vendor Type</label>
                  <input
                    type="text"
                    value={
                      vendortypes.find(
                        (vt) => String(vt.id) === String(formData.vendor_type),
                      )?.name || "--"
                    }
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.contact_person, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Email ID</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.email, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.phone, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Mobile No</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.mobile, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Website</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.website, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Active</label>
                  <select
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleChange}
                    className="form-input"
                    disabled={submittingStatus}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="form-label">Billing Address</label>
                  <textarea
                    value={getDisplayValue(formData.billing_address, "")}
                    readOnly
                    rows={2}
                    className="textarea-input bg-gray-100 cursor-not-allowed"
                  ></textarea>
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="form-label">Shipping Address</label>
                  <textarea
                    value={getDisplayValue(formData.shipping_address, "")}
                    readOnly
                    rows={2}
                    className="textarea-input bg-gray-100 cursor-not-allowed"
                  ></textarea>
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Currency</label>
                  <input
                    type="text"
                    value={
                      currencies.find(
                        (cr) => String(cr.id) === String(formData.currency),
                      )
                        ? `${currencies.find((cr) => String(cr.id) === String(formData.currency)).currency_code} - ${currencies.find((cr) => String(cr.id) === String(formData.currency)).currency_name}`
                        : "--"
                    }
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    value={
                      countries.find(
                        (ct) => String(ct.id) === String(formData.country),
                      )
                        ? `${countries.find((ct) => String(ct.id) === String(formData.country)).country_code} - ${countries.find((ct) => String(ct.id) === String(formData.country)).country_name}`
                        : "--"
                    }
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    value={
                      states.find(
                        (st) => String(st.id) === String(formData.state),
                      )?.state_name || "--"
                    }
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={
                      cities.find(
                        (cs) => String(cs.id) === String(formData.city),
                      )?.city_name || "--"
                    }
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.postal_code, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Lead Time</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.default_lead_time_days, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Minimum Order Value</label>
                  <input
                    type="text"
                    value={getDisplayValue(formData.minimum_order_value, "")}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Blacklisted</label>
                  <input
                    type="text"
                    value={getBooleanText(formData.is_blacklisted)}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Approved By CFO</label>
                  <input
                    type="text"
                    value={getBooleanText(formData.is_approved_by_cfo)}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Validated</label>
                  <input
                    type="text"
                    value={getBooleanText(formData.is_validated)}
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Creator</label>
                  <input
                    type="text"
                    value={
                      users.find(
                        (user) => String(user.id) === String(formData.creator),
                      )
                        ? `${users.find((user) => String(user.id) === String(formData.creator)).username} - ${users.find((user) => String(user.id) === String(formData.creator)).email}`
                        : "--"
                    }
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    value={
                      companies.find(
                        (cp) => String(cp.id) === String(formData.company),
                      )
                        ? `${companies.find((cp) => String(cp.id) === String(formData.company)).company_code} - ${companies.find((cp) => String(cp.id) === String(formData.company)).company_name}`
                        : "--"
                    }
                    readOnly
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="form-label">Remarks</label>
                  <textarea
                    value={getDisplayValue(formData.remarks, "")}
                    readOnly
                    rows={2}
                    className="textarea-input bg-gray-100 cursor-not-allowed"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => handleSubmitEdit("true")}
                  disabled={submittingStatus || formData.is_active === "false"}
                  className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm cursor-pointer rounded bg-amber-400 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingStatus && submitAction === "true"
                    ? "Activating..."
                    : "Activate"}
                </button>

                <button
                  onClick={() => handleSubmitEdit("false")}
                  disabled={submittingStatus || formData.is_active === "true"}
                  className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm cursor-pointer rounded bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingStatus && submitAction === "false"
                    ? "Deactivating..."
                    : "Deactivate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlockVendor;
