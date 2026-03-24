import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";
import mainConfig from "../../../config/mainConfig";
import { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiEdit,
  FiEye,
  FiInfo,
  FiPlus,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVenderQuotations,
  updateVenderQuotation,
  deleteVenderQuotation,
  fetchVenders,
  fetchUsers,
  fetchCompanies,
} from "../../../store/slices/vendorQuotationSlice";
import { FaTimes, FaTrashAlt } from "react-icons/fa";
import api from "../../../utils/api";
import dayjs from "dayjs";

const ViewVendorQuotations = () => {
  const dispatch = useDispatch();
  const { vendors, users, companies, vendorQuotations, loading } = useSelector(
    (state) => state.vendorQuotations,
  );

  const quotationRef = useRef(null);

  // ---------------- FILTER / SORT / PAGINATION ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    dispatch(fetchVenderQuotations());
    dispatch(fetchVenders());
    dispatch(fetchUsers());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedVendorQuotations, setSelectedVendorQuotations] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVendorQuotation, setSelectedVendorQuotation] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    vendor: "",
    quotation_number: "",
    quotation: null,
    date_of_quotation: "",
    quantity: "",
    lead_time_days: "",
    is_validated: "",
    creator: "",
    company: "",
  });

  const [existingFiles, setExistingFiles] = useState({
    quotation: "",
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

  const formatIdsWithEllipsis = (ids, maxVisible = 3) => {
    if (!ids || ids.length === 0) return "";

    if (ids.length <= maxVisible) {
      return ids.join(", ");
    }

    const first = ids.slice(0, maxVisible).join(", ");
    const last = ids[ids.length - 1];
    return `${first} ... ${last}`;
  };

  const updateBreadcrumbs = (action = null, id = null) => {
    const menuPath = findPathInMenu(mainConfig, location.pathname) || [];

    const baseBreadcrumbs = menuPath.map((i) => ({
      label: i.label,
      path: i.path,
    }));

    if (action === "Delete") {
      baseBreadcrumbs.push({ label: "Delete", path: null });

      if (isBulkDelete && selectedVendorQuotations.length > 0) {
        baseBreadcrumbs.push({
          label: formatIdsWithEllipsis(selectedVendorQuotations),
          fullLabel: selectedVendorQuotations.join(", "),
          path: null,
        });
      } else if (deleteId) {
        baseBreadcrumbs.push({
          label: deleteId.toString(),
          fullLabel: deleteId.toString(),
          path: null,
        });
      }
    }

    if (action === "Change" && id) {
      baseBreadcrumbs.push({ label: "Change", path: null });
      baseBreadcrumbs.push({
        label: id.toString(),
        fullLabel: id.toString(),
        path: null,
      });
    }

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
    if (showDeleteModal) {
      updateBreadcrumbs("Delete");
    } else if (showEditModal && editId) {
      updateBreadcrumbs("Change", editId);
    } else if (showConfirm && selectedVendorQuotation?.id) {
      updateBreadcrumbs("View", selectedVendorQuotation.id);
    } else {
      updateBreadcrumbs();
    }
  }, [
    location.pathname,
    showDeleteModal,
    showEditModal,
    showConfirm,
    selectedVendorQuotations,
    editId,
    selectedVendorQuotation,
  ]);

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

  const handleQuotationChange = () => {
    const file = quotationRef.current?.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showTemporaryMessage("Only PDF files are allowed!", "error");
      quotationRef.current.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      quotation: file,
    }));
  };

  const handleOpenEdit = (vendor) => {
    setEditId(vendor.id);
    setFormData({
      vendor: vendor.vendor?.id || "",
      quotation_number: vendor.quotation_number || "",
      quotation: null,
      date_of_quotation: vendor.date_of_quotation || "",
      quantity: vendor.quantity || "",
      lead_time_days: vendor.lead_time_days || "",
      is_validated:
        vendor.is_validated === null
          ? ""
          : vendor.is_validated
            ? "true"
            : "false",
      creator: vendor.creator?.id || "",
      company: vendor.company?.id || "",
    });
    setExistingFiles({
      quotation: vendor.quotation || "",
    });

    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "quotation") {
        if (formData.quotation instanceof File) {
          data.append("quotation", formData.quotation);
        }
      } else {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    });

    if (
      !formData.vendor ||
      !formData.quotation_number ||
      !formData.date_of_quotation ||
      !formData.quantity ||
      !formData.lead_time_days ||
      !formData.creator ||
      !formData.company
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      const res = await dispatch(
        updateVenderQuotation({ id: editId, formData: data }),
      ).unwrap();

      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage(
          "Vendor Quotation updated successfully!",
          "success",
        );
      } else if (res.status === 202) {
        showTemporaryMessage("Vendor Quotation update accepted!", "success");
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
        showTemporaryMessage("Failed to update vendor quotation!", "error");
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);

    setFormData({
      vendor: "",
      quotation_number: "",
      quotation: null,
      date_of_quotation: "",
      quantity: "",
      lead_time_days: "",
      is_validated: "",
      creator: "",
      company: "",
    });
    setExistingFiles({ quotation: "" });
  };

  // ----------------- Delete handlers -----------------
  const handleDelete = (id) => {
    setDeleteId(id);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedVendorQuotations.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDelete && selectedVendorQuotations.length > 0) {
        const res = await Promise.all(
          selectedVendorQuotations.map((id) =>
            dispatch(deleteVenderQuotation(id)).unwrap(),
          ),
        );
        if (res.every((r) => r.status === 200 || r.status === 201)) {
          showTemporaryMessage(
            "Vendor Quotation deleted successfully!",
            "success",
          );
        } else if (res.every((r) => r.status === 202)) {
          showTemporaryMessage("Vendor Quotation delete accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setSelectedVendorQuotations([]);
      } else if (deleteId) {
        const res = await dispatch(deleteVenderQuotation(deleteId)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage(
            "Vendor Quotation deleted successfully!",
            "success",
          );
        } else if (res.status === 202) {
          showTemporaryMessage("Vendor Quotation delete accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
      }

      setDeleteId(null);
      setIsBulkDelete(false);
      setShowDeleteModal(false);
    } catch (error) {
      console.log("Delete Error:", error);

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
        showTemporaryMessage("Failed to delete vendor quotation!", "error");
      }
    }
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredVendorQuotations = vendorQuotations.filter((vendor) => {
    const search = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
    const normalize = (value) =>
      (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");
    let activeText = "";
    if (vendor?.is_validated === true) activeText = "yes";
    else if (vendor?.is_validated === false) activeText = "no";
    return (
      normalize(vendor?.vendor?.vendor_name).includes(search) ||
      normalize(
        vendor?.date_of_quotation
          ? dayjs(vendor.date_of_quotation).format("DD-MM-YYYY")
          : "--",
      ).includes(search) ||
      normalize(vendor?.creator?.username).includes(search) ||
      normalize(vendor?.company?.company_name).includes(search) ||
      normalize(activeText).includes(search)
    );
  });

  // ---------------- PAGINATION LOGIC ----------------
  const totalPages = Math.ceil(filteredVendorQuotations.length / rowsPerPage);

  const paginatedVendorQuotations = filteredVendorQuotations.slice(
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

        {/* Header */}
        <div className="w-full mb-4">
          <div className="flex justify-between items-end border-b-2 border-gray-300 pb-1 mb-4">
            {/* Left Section */}
            <div className="flex items-center gap-2">
              <FiUsers className="text-amber-500 text-lg" />
              <h2 className="text-lg font-semibold text-gray-700">
                View Vendor Quotations
              </h2>
            </div>
            {/* Right Section */}
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
                to="/admin/vendor-quotation/create"
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                <FiPlus /> Create Vendor Quotation
              </Link>

              {selectedVendorQuotations.length > 1 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="relative inline-flex items-center justify-center gap-2 text-red-500 text-sm font-medium px-3 h-9 transition cursor-pointer"
                >
                  <FaTrashAlt size={16} />
                  <span className="absolute -top-1 -right-1 text-red-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full border border-red-500 bg-white">
                    {selectedVendorQuotations.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-md shadow-sm border border-gray-300 w-full">
          <div className="overflow-x-auto">
            <div className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
              <table className="min-w-full text-sm text-left divide-y divide-gray-200">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2 border border-gray-200 text-center sticky top-0 z-20">
                      {filteredVendorQuotations.length <= 1 ? (
                        "-"
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            filteredVendorQuotations.length > 1 &&
                            selectedVendorQuotations.length ===
                              filteredVendorQuotations.length
                          }
                          onChange={(e) =>
                            setSelectedVendorQuotations(
                              e.target.checked
                                ? filteredVendorQuotations.map(
                                    (vendor) => vendor.id,
                                  )
                                : [],
                            )
                          }
                          className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                        />
                      )}
                    </th>
                    {[
                      "VENDOR NAME",
                      "DATE",
                      "CREATOR",
                      "COMPANY",
                      "VALIDATED",
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
                        colSpan={7}
                        className="px-2 py-2 text-center border border-gray-200 whitespace-nowrap"
                      >
                        <div className="flex justify-center items-center">
                          <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVendorQuotations.length > 0 ? (
                    paginatedVendorQuotations.map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="hover:bg-gray-50 text-center transition-all duration-200"
                      >
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedVendorQuotations.includes(
                              vendor.id,
                            )}
                            onChange={() =>
                              setSelectedVendorQuotations((prev) =>
                                prev.includes(vendor.id)
                                  ? prev.filter((x) => x !== vendor.id)
                                  : [...prev, vendor.id],
                              )
                            }
                            className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                          />
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.vendor?.vendor_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.date_of_quotation
                            ? dayjs(vendor.date_of_quotation).format(
                                "DD-MM-YYYY",
                              )
                            : "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.creator?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.company?.company_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.is_validated == null ? (
                            "--"
                          ) : (
                            <span
                              className={
                                vendor?.is_validated
                                  ? "text-green-600"
                                  : "text-red-500"
                              }
                            >
                              {vendor?.is_validated ? "Yes" : "No"}
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
                            <button
                              onClick={() => {
                                setSelectedVendorQuotation(vendor);
                                updateBreadcrumbs("View", vendor.id);
                                setShowConfirm(true);
                              }}
                              className="text-gray-600 hover:scale-110 cursor-pointer transition"
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(vendor.id)}
                              className="text-red-500 hover:scale-110 cursor-pointer transition"
                              title="Delete"
                            >
                              <FaTrashAlt size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-2 py-2 text-center text-gray-300 whitespace-nowrap"
                      >
                        No vendor quotations found!
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

      {/* Confirmation Modal */}
      {showConfirm && selectedVendorQuotation && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FiUsers className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  View Vendor Quotation
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
                      Vendor:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.vendor?.vendor_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Quotation Number:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.quotation_number || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Quotation:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation.quotation && (
                        <a
                          href={
                            selectedVendorQuotation.quotation.startsWith("http")
                              ? selectedVendorQuotation.quotation
                              : `${api.defaults.baseURL.replace(/\/$/, "")}${selectedVendorQuotation.quotation}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500"
                        >
                          {selectedVendorQuotation.quotation.split("/").pop()}
                        </a>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Date:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.date_of_quotation
                        ? dayjs(
                            selectedVendorQuotation.date_of_quotation,
                          ).format("DD-MM-YYYY")
                        : "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Quantity:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.quantity || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Lead Time:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.lead_time_days || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Validated:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.is_validated == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            selectedVendorQuotation?.is_validated
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {selectedVendorQuotation?.is_validated ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Creator:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.creator?.username || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.company?.company_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Created At:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorQuotation?.created_at
                        ? dayjs(selectedVendorQuotation?.created_at).format(
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
                      {selectedVendorQuotation?.updated_at
                        ? dayjs(selectedVendorQuotation?.updated_at).format(
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

      {/* EDIT Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-md border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FiUsers className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Change Vendor Quotation
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
                  Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {vendors.map((vs) => (
                    <option key={vs.id} value={vs.id}>
                      {vs.vendor_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Quotation Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="quotation_number"
                  placeholder="Enter Quotation Number"
                  value={formData.quotation_number}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">
                  Quotation <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="quotation"
                  accept="application/pdf"
                  ref={quotationRef}
                  onChange={handleQuotationChange}
                  className="form-input"
                />
                {existingFiles.quotation && (
                  <a
                    href={
                      existingFiles.quotation.startsWith("http")
                        ? existingFiles.quotation
                        : `${api.defaults.baseURL.replace(/\/$/, "")}${existingFiles.quotation}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500"
                  >
                    {existingFiles.quotation.split("/").pop()}
                  </a>
                )}
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_quotation"
                  value={formData.date_of_quotation}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Enter Quantity"
                  value={formData.quantity}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^\d*(\.\d{0,3})?$/;
                    if (value === "" || regex.test(value)) {
                      handleChange(e);
                    }
                  }}
                  min="0"
                  step="0.001"
                  inputMode="decimal"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Lead Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="lead_time_days"
                  placeholder="Enter Lead Time (Days)"
                  value={formData.lead_time_days}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    let value = e.target.value;
                    const regex = /^\d*$/;
                    if (value === "" || regex.test(value)) {
                      handleChange(e);
                    }
                  }}
                  min="0"
                  inputMode="numeric"
                  className="form-input"
                />
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

      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-md w-11/12 max-w-md shadow-xl">
            <div className="flex justify-center mb-3">
              <FiAlertTriangle className="text-amber-500 text-4xl" />
            </div>
            <h2 className="text-lg font-semibold text-center mb-4">
              Are you sure you want to delete?
            </h2>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={confirmDelete}
                className="bg-amber-400 text-black font-medium px-3 py-1.5 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  if (isBulkDelete) setSelectedVendorQuotations([]);
                  setIsBulkDelete(false);
                  setDeleteId(null);
                }}
                className="bg-gray-600 text-white font-medium px-3 py-1.5 rounded-md cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewVendorQuotations;
