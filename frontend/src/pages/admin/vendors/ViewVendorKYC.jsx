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
  fetchVenderKYC,
  updateVenderKYC,
  deleteVenderKYC,
  fetchVenders,
  fetchVenderTypes,
  fetchCountries,
  fetchKYCStatus,
  fetchApprovedBy,
  fetchUsers,
  fetchCompanies,
} from "../../../store/slices/vendorKYCSlice";
import { FaTimes, FaTrashAlt } from "react-icons/fa";
import dayjs from "dayjs";
import api from "../../../utils/api";

const ViewVendorKYC = () => {
  const dispatch = useDispatch();
  const {
    vendors,
    vendortypes,
    countries,
    kycstatus,
    approvedby,
    users,
    companies,
    vendorKYC,
    loading,
  } = useSelector((state) => state.vendorKYC);

  const taxcertificateRef = useRef(null);
  const msmecertificateRef = useRef(null);
  const bankproofRef = useRef(null);

  // ---------------- FILTER / SORT / PAGINATION ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    dispatch(fetchVenderKYC());
    dispatch(fetchVenders());
    dispatch(fetchVenderTypes());
    dispatch(fetchCountries());
    dispatch(fetchKYCStatus());
    dispatch(fetchApprovedBy());
    dispatch(fetchUsers());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedVendorKYCs, setSelectedVendorKYCs] = useState([]);
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
  const [selectedVendorKYC, setSelectedVendorKYC] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    vendor: "",
    payment_terms: "",
    credit_days: "",
    credit_limit: "",
    legal_name: "",
    trade_name: "",
    vendor_type: "",
    registration_number: "",
    incorporation_date: "",
    country_of_registration: "",
    tax_id: "",
    vat_number: "",
    tax_certificate: null,
    is_msme: "",
    msme_certificate: null,
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    ifsc_swift_code: "",
    bank_branch: "",
    bank_proof: null,
    registered_address: "",
    operational_address: "",
    official_email: "",
    phone_number: "",
    signatory_name: "",
    signatory_designation: "",
    signatory_email: "",
    signatory_phone: "",
    nda_signed: "",
    contract_signed: "",
    is_blacklisted: "",
    risk_rating: "",
    kyc_status: "",
    approved_at: "",
    approved_by: "",
    creator: "",
    company: "",
  });

  const [existingFiles, setExistingFiles] = useState({
    tax_certificate: "",
    msme_certificate: "",
    bank_proof: "",
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

      if (isBulkDelete && selectedVendorKYCs.length > 0) {
        baseBreadcrumbs.push({
          label: formatIdsWithEllipsis(selectedVendorKYCs),
          fullLabel: selectedVendorKYCs.join(", "),
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
    } else if (showConfirm && selectedVendorKYC?.id) {
      updateBreadcrumbs("View", selectedVendorKYC.id);
    } else {
      updateBreadcrumbs();
    }
  }, [
    location.pathname,
    showDeleteModal,
    showEditModal,
    showConfirm,
    selectedVendorKYCs,
    editId,
    selectedVendorKYC,
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

  const handleTaxCertificateChange = () => {
    const file = taxcertificateRef.current?.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showTemporaryMessage("Only PDF files are allowed!", "error");
      taxcertificateRef.current.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tax_certificate: file,
    }));
  };

  const handleMsmeCertificateChange = () => {
    const file = msmecertificateRef.current?.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showTemporaryMessage("Only PDF files are allowed!", "error");
      msmecertificateRef.current.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      msme_certificate: file,
    }));
  };

  const handleBankProofChange = () => {
    const file = bankproofRef.current?.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showTemporaryMessage("Only PDF files are allowed!", "error");
      bankproofRef.current.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      bank_proof: file,
    }));
  };

  const handleOpenEdit = (vendor) => {
    setEditId(vendor.id);
    setFormData({
      vendor: vendor.vendor?.id || "",
      payment_terms: vendor.payment_terms || "",
      credit_days: vendor.credit_days || "",
      credit_limit: vendor.credit_limit || "",
      legal_name: vendor.legal_name || "",
      trade_name: vendor.trade_name || "",
      vendor_type: vendor.vendor_type?.id || "",
      registration_number: vendor.registration_number || "",
      incorporation_date: vendor.incorporation_date || "",
      country_of_registration: vendor.country_of_registration?.id || "",
      tax_id: vendor.tax_id || "",
      vat_number: vendor.vat_number || "",
      tax_certificate: null,
      is_msme: vendor.is_msme === null ? "" : vendor.is_msme ? "true" : "false",
      msme_certificate: null,
      bank_name: vendor.bank_name || "",
      account_holder_name: vendor.account_holder_name || "",
      account_number: vendor.account_number || "",
      ifsc_swift_code: vendor.ifsc_swift_code || "",
      bank_branch: vendor.bank_branch || "",
      bank_proof: null,
      registered_address: vendor.registered_address || "",
      operational_address: vendor.operational_address || "",
      official_email: vendor.official_email || "",
      phone_number: vendor.phone_number || "",
      signatory_name: vendor.signatory_name || "",
      signatory_designation: vendor.signatory_designation || "",
      signatory_email: vendor.signatory_email || "",
      signatory_phone: vendor.signatory_phone || "",
      nda_signed:
        vendor.nda_signed === null ? "" : vendor.nda_signed ? "true" : "false",
      contract_signed:
        vendor.contract_signed === null
          ? ""
          : vendor.contract_signed
            ? "true"
            : "false",
      is_blacklisted:
        vendor.is_blacklisted === null
          ? ""
          : vendor.is_blacklisted
            ? "true"
            : "false",
      risk_rating: vendor.risk_rating || "",
      kyc_status: vendor.kyc_status?.id || "",
      approved_at: vendor.approved_at
        ? dayjs(vendor.approved_at).format("YYYY-MM-DDTHH:mm")
        : "",
      approved_by: vendor.approved_by?.id || "",
      creator: vendor.creator?.id || "",
      company: vendor.company?.id || "",
    });
    setExistingFiles({
      tax_certificate: vendor.tax_certificate || "",
      msme_certificate: vendor.msme_certificate || "",
      bank_proof: vendor.bank_proof || "",
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "registered_address") {
        data.append("registered_address", formData.registered_address ?? null);
      } else if (key === "operational_address") {
        data.append(
          "operational_address",
          formData.operational_address ?? null,
        );
      } else if (key === "tax_certificate") {
        if (formData.tax_certificate instanceof File) {
          data.append("tax_certificate", formData.tax_certificate);
        }
      } else if (key === "msme_certificate") {
        if (formData.msme_certificate instanceof File) {
          data.append("msme_certificate", formData.msme_certificate);
        }
      } else if (key === "bank_proof") {
        if (formData.bank_proof instanceof File) {
          data.append("bank_proof", formData.bank_proof);
        }
      } else {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    });

    if (
      !formData.vendor ||
      !formData.legal_name ||
      !formData.registration_number ||
      !formData.bank_name ||
      !formData.account_holder_name ||
      !formData.account_number ||
      !formData.ifsc_swift_code ||
      !formData.registered_address ||
      !formData.official_email ||
      !formData.phone_number ||
      !formData.signatory_name ||
      !formData.signatory_designation ||
      !formData.signatory_email ||
      !formData.signatory_phone ||
      !formData.creator ||
      !formData.company
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      const res = await dispatch(
        updateVenderKYC({ id: editId, formData: data }),
      ).unwrap();

      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("Vendor KYC updated successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("Vendor KYC update accepted!", "success");
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
        showTemporaryMessage("Failed to update vendor KYC!", "error");
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);

    setFormData({
      vendor: "",
      payment_terms: "",
      credit_days: "",
      credit_limit: "",
      legal_name: "",
      trade_name: "",
      vendor_type: "",
      registration_number: "",
      incorporation_date: "",
      country_of_registration: "",
      tax_id: "",
      vat_number: "",
      tax_certificate: null,
      is_msme: "",
      msme_certificate: null,
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      ifsc_swift_code: "",
      bank_branch: "",
      bank_proof: null,
      registered_address: "",
      operational_address: "",
      official_email: "",
      phone_number: "",
      signatory_name: "",
      signatory_designation: "",
      signatory_email: "",
      signatory_phone: "",
      nda_signed: "",
      contract_signed: "",
      is_blacklisted: "",
      risk_rating: "",
      kyc_status: "",
      approved_at: "",
      approved_by: "",
      creator: "",
      company: "",
    });

    setExistingFiles({
      tax_certificate: "",
      msme_certificate: "",
      bank_proof: "",
    });
  };

  // ----------------- Delete handlers -----------------
  const handleDelete = (id) => {
    setDeleteId(id);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedVendorKYCs.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDelete && selectedVendorKYCs.length > 0) {
        const res = await Promise.all(
          selectedVendorKYCs.map((id) =>
            dispatch(deleteVenderKYC(id)).unwrap(),
          ),
        );
        if (res.every((r) => r.status === 200 || r.status === 201)) {
          showTemporaryMessage("Vendor KYC deleted successfully!", "success");
        } else if (res.every((r) => r.status === 202)) {
          showTemporaryMessage("Vendor KYC delete accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setSelectedVendorKYCs([]);
      } else if (deleteId) {
        const res = await dispatch(deleteVenderKYC(deleteId)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("Vendor KYC deleted successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("Vendor KYC delete accepted!", "success");
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
        showTemporaryMessage("Failed to delete vendor KYC!", "error");
      }
    }
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredVendorKYCs = vendorKYC.filter((vendor) => {
    const search = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
    const normalize = (value) =>
      (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");

    return (
      normalize(vendor?.vendor?.vendor_name).includes(search) ||
      normalize(vendor?.vendor_type?.name).includes(search) ||
      normalize(vendor?.creator?.username).includes(search) ||
      normalize(vendor?.company?.company_name).includes(search) ||
      normalize(vendor?.kyc_status?.name).includes(search)
    );
  });

  // ---------------- PAGINATION LOGIC ----------------
  const totalPages = Math.ceil(filteredVendorKYCs.length / rowsPerPage);

  const paginatedVendorKYCs = filteredVendorKYCs.slice(
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
                View Vendor KYC
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
                to="/admin/vendor-kyc/create"
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                <FiPlus /> Create Vendor KYC
              </Link>

              {selectedVendorKYCs.length > 1 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="relative inline-flex items-center justify-center gap-2 text-red-500 text-sm font-medium px-3 h-9 transition cursor-pointer"
                >
                  <FaTrashAlt size={16} />
                  <span className="absolute -top-1 -right-1 text-red-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full border border-red-500 bg-white">
                    {selectedVendorKYCs.length}
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
                      {filteredVendorKYCs.length <= 1 ? (
                        "-"
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            filteredVendorKYCs.length > 1 &&
                            selectedVendorKYCs.length ===
                              filteredVendorKYCs.length
                          }
                          onChange={(e) =>
                            setSelectedVendorKYCs(
                              e.target.checked
                                ? filteredVendorKYCs.map((vendor) => vendor.id)
                                : [],
                            )
                          }
                          className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                        />
                      )}
                    </th>
                    {[
                      "VENDOR NAME",
                      "VENDOR TYPE",
                      "CREATOR",
                      "COMPANY",
                      "STATUS",
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
                  ) : filteredVendorKYCs.length > 0 ? (
                    paginatedVendorKYCs.map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="hover:bg-gray-50 text-center transition-all duration-200"
                      >
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedVendorKYCs.includes(vendor.id)}
                            onChange={() =>
                              setSelectedVendorKYCs((prev) =>
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
                          {vendor?.vendor_type?.name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.creator?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.company?.company_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {vendor?.kyc_status?.name || "--"}
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
                                setSelectedVendorKYC(vendor);
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
                        No vendor KYC found!
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
      {showConfirm && selectedVendorKYC && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FiUsers className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  View Vendor KYC
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
                      {selectedVendorKYC?.vendor?.vendor_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Payment Terms:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.payment_terms || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Credit Days:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.credit_days || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Credit Limit:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.credit_limit || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Legal Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.legal_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Trade Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.trade_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Vendor Type:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.vendor_type?.name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Registration Number:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.registration_number || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Incorporation Date:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.incorporation_date
                        ? dayjs(selectedVendorKYC?.incorporation_date).format(
                            "DD-MM-YYYY",
                          )
                        : "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Country of Registration:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.country_of_registration
                        ?.country_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Tax ID:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.tax_id || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      VAT Number:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.vat_number || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Tax Certificate:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.tax_certificate ? (
                        <a
                          href={
                            selectedVendorKYC.tax_certificate.startsWith("http")
                              ? selectedVendorKYC.tax_certificate
                              : `${api.defaults.baseURL.replace(/\/$/, "")}${selectedVendorKYC.tax_certificate}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500"
                        >
                          {selectedVendorKYC.tax_certificate.split("/").pop()}
                        </a>
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      MSME:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.is_msme == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            selectedVendorKYC?.is_msme
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {selectedVendorKYC?.is_msme ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      MSME Certificate:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.msme_certificate ? (
                        <a
                          href={
                            selectedVendorKYC.msme_certificate.startsWith(
                              "http",
                            )
                              ? selectedVendorKYC.msme_certificate
                              : `${api.defaults.baseURL.replace(/\/$/, "")}${selectedVendorKYC.msme_certificate}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500"
                        >
                          {selectedVendorKYC.msme_certificate.split("/").pop()}
                        </a>
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Bank Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.bank_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Account Holder Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.account_holder_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Account Number:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.account_number || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      IFSC:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.ifsc_swift_code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Branch:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.bank_branch || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Bank Proof:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.bank_proof ? (
                        <a
                          href={
                            selectedVendorKYC.bank_proof.startsWith("http")
                              ? selectedVendorKYC.bank_proof
                              : `${api.defaults.baseURL.replace(/\/$/, "")}${selectedVendorKYC.bank_proof}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500"
                        >
                          {selectedVendorKYC.bank_proof.split("/").pop()}
                        </a>
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      KYC Status:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.kyc_status?.name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Registered Address:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedVendorKYC?.registered_address || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Operational Address:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedVendorKYC?.operational_address || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Official Email ID:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.official_email || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Mobile No:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.phone_number || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Signatory Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.signatory_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Signatory Designation:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.signatory_designation || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Signatory Email ID:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.signatory_email || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Signatory Mobile No:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.signatory_phone || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      NDA Signed:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.nda_signed == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            selectedVendorKYC?.nda_signed
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {selectedVendorKYC?.nda_signed ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Contract Signed:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.contract_signed == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            selectedVendorKYC?.contract_signed
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {selectedVendorKYC?.contract_signed ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Blacklisted:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.is_blacklisted == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            selectedVendorKYC?.is_blacklisted
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {selectedVendorKYC?.is_blacklisted ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Risk Rating:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.risk_rating || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Approved At:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.approved_at
                        ? dayjs(selectedVendorKYC?.approved_at).format(
                            "DD-MM-YYYY hh:mm A",
                          )
                        : "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Approved By:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.approved_by?.username || "--"} -{" "}
                      {selectedVendorKYC?.approved_by?.email || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Creator:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.creator?.username || "--"} -{" "}
                      {selectedVendorKYC?.creator?.email || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.company?.company_code || "--"} -{" "}
                      {selectedVendorKYC?.company?.company_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Created At:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedVendorKYC?.created_at
                        ? dayjs(selectedVendorKYC?.created_at).format(
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
                      {selectedVendorKYC?.updated_at
                        ? dayjs(selectedVendorKYC?.updated_at).format(
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
                  Change Vendor KYC
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
                <label className="form-label">Payment Terms</label>
                <input
                  type="text"
                  name="payment_terms"
                  placeholder="Enter Payment Terms"
                  value={formData.payment_terms}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Credit Days</label>
                <input
                  type="number"
                  name="credit_days"
                  placeholder="Enter Credit Days"
                  value={formData.credit_days}
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
                <label className="form-label">Credit Limit</label>
                <input
                  type="number"
                  name="credit_limit"
                  placeholder="Enter Credit Limit"
                  value={formData.credit_limit}
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
                  Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="legal_name"
                  placeholder="Enter Legal Name"
                  value={formData.legal_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Trade Name</label>
                <input
                  type="text"
                  name="trade_name"
                  placeholder="Enter Trade Name"
                  value={formData.trade_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Vendor Type</label>
                <select
                  name="vendor_type"
                  value={formData.vendor_type}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {vendortypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>
                      {vt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registration_number"
                  placeholder="Enter Registration Number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Incorporation Date</label>
                <input
                  type="date"
                  name="incorporation_date"
                  value={formData.incorporation_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Country of Registration</label>
                <select
                  name="country_of_registration"
                  value={formData.country_of_registration}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {countries.map((cs) => (
                    <option key={cs.id} value={cs.id}>
                      {cs.country_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Tax ID</label>
                <input
                  type="text"
                  name="tax_id"
                  placeholder="Enter Tax ID"
                  value={formData.tax_id}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">VAT Number</label>
                <input
                  type="text"
                  name="vat_number"
                  placeholder="Enter VAT Number"
                  value={formData.vat_number}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Tax Certificate</label>
                <input
                  type="file"
                  name="tax_certificate"
                  accept="application/pdf"
                  ref={taxcertificateRef}
                  onChange={handleTaxCertificateChange}
                  className="form-input"
                />
                {existingFiles.tax_certificate && (
                  <a
                    href={
                      existingFiles.tax_certificate.startsWith("http")
                        ? existingFiles.tax_certificate
                        : `${api.defaults.baseURL.replace(/\/$/, "")}${existingFiles.tax_certificate}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500"
                  >
                    {existingFiles.tax_certificate.split("/").pop()}
                  </a>
                )}
              </div>
              <div className="flex flex-col">
                <label className="form-label">MSME</label>
                <select
                  name="is_msme"
                  value={formData.is_msme}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">MSME Certificate</label>
                <input
                  type="file"
                  name="msme_certificate"
                  accept="application/pdf"
                  ref={msmecertificateRef}
                  onChange={handleMsmeCertificateChange}
                  className="form-input"
                />
                {existingFiles.msme_certificate && (
                  <a
                    href={
                      existingFiles.msme_certificate.startsWith("http")
                        ? existingFiles.msme_certificate
                        : `${api.defaults.baseURL.replace(/\/$/, "")}${existingFiles.msme_certificate}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500"
                  >
                    {existingFiles.msme_certificate.split("/").pop()}
                  </a>
                )}
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bank_name"
                  placeholder="Enter Bank Name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="account_holder_name"
                  placeholder="Enter Account Holder Name"
                  value={formData.account_holder_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="account_number"
                  placeholder="Enter Account Number"
                  value={formData.account_number}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  IFSC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ifsc_swift_code"
                  placeholder="Enter IFSC"
                  value={formData.ifsc_swift_code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Branch</label>
                <input
                  type="text"
                  name="bank_branch"
                  placeholder="Enter Branch"
                  value={formData.bank_branch}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Bank Proof</label>
                <input
                  type="file"
                  name="bank_proof"
                  accept="application/pdf"
                  ref={bankproofRef}
                  onChange={handleBankProofChange}
                  className="form-input"
                />
                {existingFiles.bank_proof && (
                  <a
                    href={
                      existingFiles.bank_proof.startsWith("http")
                        ? existingFiles.bank_proof
                        : `${api.defaults.baseURL.replace(/\/$/, "")}${existingFiles.bank_proof}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500"
                  >
                    {existingFiles.bank_proof.split("/").pop()}
                  </a>
                )}
              </div>
              <div className="flex flex-col">
                <label className="form-label">KYC Status</label>
                <select
                  name="kyc_status"
                  value={formData.kyc_status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {kycstatus.map((kyc) => (
                    <option key={kyc.id} value={kyc.id}>
                      {kyc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">
                  Registered Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="registered_address"
                  value={formData.registered_address}
                  onChange={handleChange}
                  rows={2}
                  className="textarea-input"
                  placeholder="Enter registered address..."
                ></textarea>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Operational Address</label>
                <textarea
                  name="operational_address"
                  value={formData.operational_address}
                  onChange={handleChange}
                  rows={2}
                  className="textarea-input"
                  placeholder="Enter operational address..."
                ></textarea>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Official Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="official_email"
                  placeholder="Enter Official Email ID"
                  value={formData.official_email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Enter Mobile No"
                  value={formData.phone_number}
                  onChange={(e) => {
                    const regex = /^[0-9]*$/;
                    if (regex.test(e.target.value)) {
                      handleChange(e);
                    }
                  }}
                  maxLength={10}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Signatory Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="signatory_name"
                  placeholder="Enter Signatory Name"
                  value={formData.signatory_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Signatory Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="signatory_designation"
                  placeholder="Enter Signatory Designation"
                  value={formData.signatory_designation}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Signatory Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="signatory_email"
                  placeholder="Enter Signatory Email ID"
                  value={formData.signatory_email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Signatory Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="signatory_phone"
                  placeholder="Enter Signatory Mobile No"
                  value={formData.signatory_phone}
                  onChange={(e) => {
                    const regex = /^[0-9]*$/;
                    if (regex.test(e.target.value)) {
                      handleChange(e);
                    }
                  }}
                  maxLength={10}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">NDA Signed</label>
                <select
                  name="nda_signed"
                  value={formData.nda_signed}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Contract Signed</label>
                <select
                  name="contract_signed"
                  value={formData.contract_signed}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
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
                <label className="form-label">Risk Rating</label>
                <input
                  type="text"
                  name="risk_rating"
                  placeholder="Enter Risk Rating"
                  value={formData.risk_rating}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Approved At</label>
                <input
                  type="datetime-local"
                  name="approved_at"
                  value={formData.approved_at}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Approved By</label>
                <select
                  name="approved_by"
                  value={formData.approved_by}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {approvedby.map((apby) => (
                    <option key={apby.id} value={apby.id}>
                      {apby.username} - {apby.email}
                    </option>
                  ))}
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
                  if (isBulkDelete) setSelectedVendorKYCs([]);
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

export default ViewVendorKYC;
