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
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanies,
  updateCompany,
  deleteCompany,
  fetchCompanyStatus,
  fetchUsers,
  fetchCurrencies,
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchLanguages,
  fetchBusinessAreas,
  fetchBusinessSectors,
} from "../../../store/slices/companySlice";
import { FaBuilding, FaTimes, FaTrashAlt } from "react-icons/fa";
import api from "../../../utils/api";
import dayjs from "dayjs";

const ViewCompany = () => {
  const dispatch = useDispatch();
  const {
    companies,
    users,
    statuses,
    currencies,
    countries,
    states,
    cities,
    languages,
    businessareas,
    businesssectors,
    loading,
  } = useSelector((state) => state.companies);

  // ---------------- FILTER / SORT / PAGINATION ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchCompanyStatus());
    dispatch(fetchUsers());
    dispatch(fetchCurrencies());
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
    dispatch(fetchLanguages());
    dispatch(fetchBusinessAreas());
    dispatch(fetchBusinessSectors());
  }, [dispatch]);

  const photoRef = useRef(null);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
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
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    organization_id: "",
    company_name: "",
    company_code: "",
    company_description: "",
    parent_company: "",
    company_logo: null,
    company_admin: "",
    currency: "",
    status: "",
    country: "",
    state: "",
    city: "",
    language: "",
    business_area: "",
    business_sector: "",
  });

  const [existingFiles, setExistingFiles] = useState({
    company_logo: "",
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

      if (isBulkDelete && selectedCompanies.length > 0) {
        baseBreadcrumbs.push({
          label: formatIdsWithEllipsis(selectedCompanies),
          fullLabel: selectedCompanies.join(", "),
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
    } else if (showConfirm && selectedCompany?.id) {
      updateBreadcrumbs("View", selectedCompany.id);
    } else {
      updateBreadcrumbs();
    }
  }, [
    location.pathname,
    showDeleteModal,
    showEditModal,
    showConfirm,
    selectedCompanies,
    editId,
    selectedCompany,
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

  const handlePhotoChange = () => {
    const file = photoRef.current?.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showTemporaryMessage("Only PNG and JPG images are allowed!", "error");
      photoRef.current.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      company_logo: file,
    }));
  };

  const handleOpenEdit = (company) => {
    setEditId(company.id);
    setFormData({
      organization_id: company.organization_id || "",
      company_name: company.company_name || "",
      company_code: company.company_code || "",
      company_description: company.company_description || "",
      parent_company: company.parent_company?.id || "",
      company_logo: null,
      company_admin: company.company_admin?.id || "",
      currency: company.currency?.id || "",
      status: company.status?.id || "",
      country: company.country?.id || "",
      state: company.state?.id || "",
      city: company.city?.id || "",
      language: company.language?.id || "",
      business_area: company.business_area?.id || "",
      business_sector: company.business_sector?.id || "",
    });
    setExistingFiles({
      company_logo: company.company_logo || "",
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "company_logo") {
        if (formData.company_logo instanceof File) {
          data.append("company_logo", formData.company_logo);
        }
      } else if (key === "company_description") {
        data.append(
          "company_description",
          formData.company_description ?? null,
        );
      } else {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    });

    if (
      !formData.organization_id ||
      !formData.company_code ||
      !formData.company_name ||
      !formData.parent_company ||
      !formData.company_admin ||
      !formData.country ||
      !formData.currency ||
      !formData.state ||
      !formData.city ||
      !formData.language ||
      !formData.business_area ||
      !formData.business_sector
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      const res = await dispatch(
        updateCompany({ id: editId, formData: data }),
      ).unwrap();

      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("Company updated successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("Company update accepted!", "success");
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
        showTemporaryMessage("Failed to update user!", "error");
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);

    setFormData({
      organization_id: "",
      company_name: "",
      company_code: "",
      company_description: "",
      parent_company: "",
      company_logo: null,
      company_admin: "",
      currency: "",
      status: "",
      country: "",
      state: "",
      city: "",
      language: "",
      business_area: "",
      business_sector: "",
    });

    setExistingFiles({ company_logo: "" });
  };

  // ----------------- Delete handlers -----------------
  const handleDelete = (id) => {
    setDeleteId(id);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedCompanies.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDelete && selectedCompanies.length > 0) {
        const res = await Promise.all(
          selectedCompanies.map((id) => dispatch(deleteCompany(id)).unwrap()),
        );
        if (res.every((r) => r.status === 200 || r.status === 201)) {
          showTemporaryMessage("Company deleted successfully!", "success");
        } else if (res.every((r) => r.status === 202)) {
          showTemporaryMessage("Company delete accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setSelectedCompanies([]);
      } else if (deleteId) {
        const res = await dispatch(deleteCompany(deleteId)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("Company deleted successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("Company delete accepted!", "success");
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
        showTemporaryMessage("Failed to delete Company!", "error");
      }
    }
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredCompanies = companies.filter((company) => {
    const search = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
    const normalize = (value) =>
      (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");

    return (
      normalize(company?.company_name).includes(search) ||
      normalize(company?.parent_company?.company_name).includes(search) ||
      normalize(company?.company_admin?.username).includes(search) ||
      normalize(company?.business_area?.business_area).includes(search) ||
      normalize(company?.status?.status).includes(search)
    );
  });

  // ---------------- PAGINATION LOGIC ----------------
  const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);

  const paginatedCompanies = filteredCompanies.slice(
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
              <FaBuilding className="text-amber-500 text-lg" />
              <h2 className="text-lg font-semibold text-gray-700">
                View Companies
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
                to="/admin/company/create"
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                <FiPlus /> Create Company
              </Link>

              {selectedCompanies.length > 1 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="relative inline-flex items-center justify-center gap-2 text-red-500 text-sm font-medium px-3 h-9 transition cursor-pointer"
                >
                  <FaTrashAlt size={16} />
                  <span className="absolute -top-1 -right-1 text-red-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full border border-red-500 bg-white">
                    {selectedCompanies.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-300 w-full">
          <div className="overflow-x-auto">
            <div className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
              <table className="min-w-full text-sm text-left divide-y divide-gray-200">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2 border border-gray-200 text-center sticky top-0 z-20">
                      {filteredCompanies.length <= 1 ? (
                        "-"
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            filteredCompanies.length > 1 &&
                            selectedCompanies.length ===
                              filteredCompanies.length
                          }
                          onChange={(e) =>
                            setSelectedCompanies(
                              e.target.checked
                                ? filteredCompanies.map((company) => company.id)
                                : [],
                            )
                          }
                          className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                        />
                      )}
                    </th>
                    {[
                      "COMPANY NAME",
                      "PARENT COMPANY",
                      "COMPANY ADMIN",
                      "BUSINESS AREA",
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
                  ) : filteredCompanies.length > 0 ? (
                    paginatedCompanies.map((company) => (
                      <tr
                        key={company.id}
                        className="hover:bg-gray-50 text-center transition-all duration-200"
                      >
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCompanies.includes(company.id)}
                            onChange={() =>
                              setSelectedCompanies((prev) =>
                                prev.includes(company.id)
                                  ? prev.filter((x) => x !== company.id)
                                  : [...prev, company.id],
                              )
                            }
                            className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                          />
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {company?.company_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {company?.parent_company?.company_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {company?.company_admin?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {company?.business_area?.business_area || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {company?.status?.status || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <div className="flex justify-center items-center space-x-3 text-sm">
                            <button
                              onClick={() => handleOpenEdit(company)}
                              className="text-amber-500 hover:scale-110 cursor-pointer transition"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                updateBreadcrumbs("View", company.id);
                                setShowConfirm(true);
                              }}
                              className="text-gray-600 hover:scale-110 cursor-pointer transition"
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(company.id)}
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
                        No companies found!
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

      {showConfirm && selectedCompany && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FaBuilding className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  View Company
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
                      Organization ID:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.organization_id || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company Code:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.company_code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.company_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Logo:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.company_logo ? (
                        <a
                          href={
                            selectedCompany.company_logo.startsWith("http")
                              ? selectedCompany.company_logo
                              : `${api.defaults.baseURL.replace(/\/$/, "")}${selectedCompany.company_logo}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500"
                        >
                          {selectedCompany.company_logo.split("/").pop()}
                        </a>
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Description:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedCompany?.company_description || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Parent Company:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.parent_company?.company_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company Admin:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.company_admin?.username || "--"} -{" "}
                      {selectedCompany?.company_admin?.email || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Currency:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.currency?.currency_code || "--"} -{" "}
                      {selectedCompany?.currency?.currency_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Country:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.country?.country_code || "--"} -{" "}
                      {selectedCompany?.country?.country_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      State:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.state?.state_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      City:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.city?.city_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Language:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.language?.language_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Business Area:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.business_area?.business_area || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Business Sector:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.business_sector?.business_sector ||
                        "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Status:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.status?.status || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Created At:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompany?.created_at
                        ? dayjs(selectedCompany?.created_at).format(
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
                      {selectedCompany?.updated_at
                        ? dayjs(selectedCompany?.updated_at).format(
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

      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-md border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FaBuilding className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Change Company
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
                  Organization ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organization_id"
                  placeholder="Enter Organization ID"
                  value={formData.organization_id}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Company Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_code"
                  placeholder="Enter Company Code"
                  value={formData.company_code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  placeholder="Enter Company Name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Logo</label>
                <input
                  type="file"
                  name="company_logo"
                  accept="image/png, image/jpeg"
                  ref={photoRef}
                  onChange={handlePhotoChange}
                  className="form-input"
                />
                {existingFiles.company_logo && (
                  <a
                    href={
                      existingFiles.company_logo.startsWith("http")
                        ? existingFiles.company_logo
                        : `${api.defaults.baseURL.replace(/\/$/, "")}${existingFiles.company_logo}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500"
                  >
                    {existingFiles.company_logo.split("/").pop()}
                  </a>
                )}
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleChange}
                  rows={2}
                  className="textarea-input"
                  placeholder="Enter company description..."
                ></textarea>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Parent Company <span className="text-red-500">*</span>
                </label>
                <select
                  name="parent_company"
                  value={formData.parent_company}
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
              <div className="flex flex-col">
                <label className="form-label">
                  Company Admin <span className="text-red-500">*</span>
                </label>
                <select
                  name="company_admin"
                  value={formData.company_admin}
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
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {languages.map((lg) => (
                    <option key={lg.id} value={lg.id}>
                      {lg.language_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Business Area <span className="text-red-500">*</span>
                </label>
                <select
                  name="business_area"
                  value={formData.business_area}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {businessareas.map((ba) => (
                    <option key={ba.id} value={ba.id}>
                      {ba.business_area}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Business Sector <span className="text-red-500">*</span>
                </label>
                <select
                  name="business_sector"
                  value={formData.business_sector}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {businesssectors.map((bs) => (
                    <option key={bs.id} value={bs.id}>
                      {bs.business_sector}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {statuses.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.status}
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
                  if (isBulkDelete) setSelectedCompanies([]);
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

export default ViewCompany;
