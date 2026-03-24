import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./../../../components/AdminSidebar";
import mainConfig from "../../../config/mainConfig";
import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEdit,
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

const ChangeVendor = () => {
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

  // ---------------- FILTER / SORT / PAGINATION ----------------
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

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
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
  });

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

    if (action === "Change" && id) {
      baseBreadcrumbs.push({ label: "Change", path: null });
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
      updateBreadcrumbs("Change", editId);
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
    if (currentIndex < breadcrumbs.length - 1)
      navigate(breadcrumbs[currentIndex + 1].path);
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

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "billing_address") {
        data.append("billing_address", formData.billing_address ?? null);
      } else if (key === "shipping_address") {
        data.append("shipping_address", formData.shipping_address ?? null);
      } else if (key === "remarks") {
        data.append("remarks", formData.remarks ?? null);
      } else {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    });

    if (
      !formData.vendor_name ||
      !formData.vendor_code ||
      !formData.short_name ||
      !formData.vendor_type ||
      !formData.currency ||
      !formData.country ||
      !formData.state ||
      !formData.city ||
      !formData.postal_code ||
      !formData.creator ||
      !formData.company
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      const res = await dispatch(
        updateVender({ id: editId, formData: data }),
      ).unwrap();

      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("Vendor updated successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("Vendor update accepted!", "success");
      } else {
        showTemporaryMessage("Unexpected response from server.", "error");
        return;
      }

      setShowEditModal(false);
      setEditId(null);
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
        showTemporaryMessage("Failed to update vendor!", "error");
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);

    setFormData({
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
    });
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
                Change Vendor
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
                              onClick={() => handleOpenEdit(vendor)}
                              className="text-amber-500 hover:scale-110 cursor-pointer transition"
                              title="Edit"
                            >
                              <FiEdit size={16} />
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
      </main>

      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-md border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FiUsers className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Change Vendor
                </h2>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-lg font-bold mb-0.5"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
              <div className="flex flex-col">
                <label className="form-label">
                  Vendor Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vendor_code"
                  placeholder="Enter Vendor Code"
                  value={formData.vendor_code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Short Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="short_name"
                  placeholder="Enter Short Name"
                  value={formData.short_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  placeholder="Enter Vendor Name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Vendor Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendor_type"
                  value={formData.vendor_type}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select Vendor Type</option>
                  {vendortypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>
                      {vt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  placeholder="Enter Contact Person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Email ID</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email ID"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Mobile No</label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter Mobile No"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  name="website"
                  placeholder="Enter Website URL"
                  value={formData.website}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Active</label>
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Billing Address</label>
                <textarea
                  name="billing_address"
                  value={formData.billing_address}
                  onChange={handleChange}
                  rows={2}
                  className="textarea-input"
                  placeholder="Enter billing address..."
                ></textarea>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Shipping Address</label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  rows={2}
                  className="textarea-input"
                  placeholder="Enter shipping address..."
                ></textarea>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {currencies.map((cr) => (
                    <option key={cr.id} value={cr.id}>
                      {cr.currency_code} - {cr.currency_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {countries.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.country_code} - {ct.country_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {states.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.state_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {cities.map((cs) => (
                    <option key={cs.id} value={cs.id}>
                      {cs.city_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postal_code"
                  placeholder="Enter Postal Code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Lead Time</label>
                <input
                  type="number"
                  name="default_lead_time_days"
                  placeholder="eg. 1"
                  value={formData.default_lead_time_days}
                  min="0"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Minimum Order Value</label>
                <input
                  type="number"
                  name="minimum_order_value"
                  placeholder="Enter Minimum Order Value"
                  value={formData.minimum_order_value}
                  min="0"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Blacklisted</label>
                <select
                  name="is_blacklisted"
                  value={formData.is_blacklisted}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Approved By CFO</label>
                <select
                  name="is_approved_by_cfo"
                  value={formData.is_approved_by_cfo}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Validated</label>
                <select
                  name="is_validated"
                  value={formData.is_validated}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Creator <span className="text-red-500">*</span>
                </label>
                <select
                  name="creator"
                  value={formData.creator}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {companies.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.company_code} - {cp.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={2}
                  className="textarea-input"
                  placeholder="Enter remarks..."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCloseEditModal}
                className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm cursor-pointer rounded bg-gray-600 text-white"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm cursor-pointer rounded bg-amber-400 text-black"
              >
                <FiEdit /> Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeVendor;
