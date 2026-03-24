import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";
import mainConfig from "../../../config/mainConfig";
import { useEffect, useState } from "react";
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
  fetchCompanystatuses,
  deleteCompanystatus,
  updateCompanystatus,
} from "../../../store/slices/companystatusSlice";
import { FaTimes, FaTrashAlt } from "react-icons/fa";
import dayjs from "dayjs";
import { BsBuildingFillCheck } from "react-icons/bs";

const ViewCompanyStatus = () => {
  const dispatch = useDispatch();
  const { companystatuses, loading } = useSelector(
    (state) => state.companystatuses,
  );

  // ---------------- FILTER / SORT / PAGINATION ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    dispatch(fetchCompanystatuses());
  }, [dispatch]);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedCompanystatuses, setSelectedCompanystatuses] = useState([]);
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
  const [selectedCompanystatus, setSelectedCompanystatus] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    status: "",
    status_code: "",
    status_description: "",
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

      if (isBulkDelete && selectedCompanystatuses.length > 0) {
        baseBreadcrumbs.push({
          label: formatIdsWithEllipsis(selectedCompanystatuses),
          fullLabel: selectedCompanystatuses.join(", "),
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
    } else if (showConfirm && selectedCompanystatus?.id) {
      updateBreadcrumbs("View", selectedCompanystatus.id);
    } else {
      updateBreadcrumbs();
    }
  }, [
    location.pathname,
    showDeleteModal,
    showEditModal,
    showConfirm,
    selectedCompanystatuses,
    editId,
    selectedCompanystatus,
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

  const handleOpenEdit = (companystatus) => {
    setEditId(companystatus.id);
    setFormData({
      status: companystatus.status || "",
      status_code: companystatus.status_code || "",
      status_description: companystatus.status_description || "",
    });

    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    if (
      !formData.status ||
      !formData.status_code ||
      !formData.status_description
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      const res = await dispatch(
        updateCompanystatus({ id: editId, formData: data }),
      ).unwrap();

      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("Company Status updated successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("Company Status update accepted!", "success");
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
        showTemporaryMessage("Failed to update Company Status!", "error");
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);

    setFormData({
      status: "",
      status_code: "",
      status_description: "",
    });
  };

  // ----------------- Delete handlers -----------------
  const handleDelete = (id) => {
    setDeleteId(id);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedCompanystatuses.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDelete && selectedCompanystatuses.length > 0) {
        const res = await Promise.all(
          selectedCompanystatuses.map((id) =>
            dispatch(deleteCompanystatus(id)).unwrap(),
          ),
        );
        if (res.every((r) => r.status === 200 || r.status === 201)) {
          showTemporaryMessage(
            "Company Status deleted successfully!",
            "success",
          );
        } else if (res.every((r) => r.status === 202)) {
          showTemporaryMessage("Company Status delete accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setSelectedCompanystatuses([]);
      } else if (deleteId) {
        const res = await dispatch(deleteCompanystatus(deleteId)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage(
            "Company Status deleted successfully!",
            "success",
          );
        } else if (res.status === 202) {
          showTemporaryMessage("Company Status delete accepted!", "success");
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
        showTemporaryMessage("Failed to delete Company Status!", "error");
      }
    }
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredCompanystatuses = companystatuses.filter((companystatus) => {
    const search = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
    const normalize = (value) =>
      (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");

    return (
      normalize(companystatus?.status).includes(search) ||
      normalize(companystatus?.status_code).includes(search) ||
      normalize(companystatus?.status_description).includes(search) ||
      normalize(companystatus?.creator?.username).includes(search) ||
      normalize(companystatus?.company?.company_name).includes(search)
    );
  });

  // ---------------- PAGINATION LOGIC ----------------
  const totalPages = Math.ceil(filteredCompanystatuses.length / rowsPerPage);

  const paginatedCompanystatuses = filteredCompanystatuses.slice(
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
              <BsBuildingFillCheck className="text-amber-500 text-lg" />
              <h2 className="text-lg font-semibold text-gray-700">
                View Company Status
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
                to="/admin/company_status/create"
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                <FiPlus /> Create Company Status
              </Link>

              {selectedCompanystatuses.length > 1 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="relative inline-flex items-center justify-center gap-2 text-red-500 text-sm font-medium px-3 h-9 transition cursor-pointer"
                >
                  <FaTrashAlt size={16} />
                  <span className="absolute -top-1 -right-1 text-red-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full border border-red-500 bg-white">
                    {selectedCompanystatuses.length}
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
                      {filteredCompanystatuses.length <= 1 ? (
                        "-"
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            filteredCompanystatuses.length > 1 &&
                            selectedCompanystatuses.length ===
                              filteredCompanystatuses.length
                          }
                          onChange={(e) =>
                            setSelectedCompanystatuses(
                              e.target.checked
                                ? filteredCompanystatuses.map(
                                    (companystatus) => companystatus.id,
                                  )
                                : [],
                            )
                          }
                          className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                        />
                      )}
                    </th>
                    {[
                      "STATUS",
                      "STATUS CODE ",
                      "STATUS DISCRIBTION",
                      "CREATOR",
                      "COMPANY",
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
                  ) : filteredCompanystatuses.length > 0 ? (
                    paginatedCompanystatuses.map((companystatus) => (
                      <tr
                        key={companystatus.id}
                        className="hover:bg-gray-50 text-center transition-all duration-200"
                      >
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCompanystatuses.includes(
                              companystatus.id,
                            )}
                            onChange={() =>
                              setSelectedCompanystatuses((prev) =>
                                prev.includes(companystatus.id)
                                  ? prev.filter((x) => x !== companystatus.id)
                                  : [...prev, companystatus.id],
                              )
                            }
                            className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                          />
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {companystatus?.status || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {companystatus?.status_code || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {companystatus?.status_description || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {companystatus?.creator?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {companystatus?.company?.company_name || "--"}
                        </td>

                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <div className="flex justify-center items-center space-x-3 text-sm">
                            <button
                              onClick={() => handleOpenEdit(companystatus)}
                              className="text-amber-500 hover:scale-110 cursor-pointer transition"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCompanystatus(companystatus);
                                updateBreadcrumbs("View", companystatus.id);
                                setShowConfirm(true);
                              }}
                              className="text-gray-600 hover:scale-110 cursor-pointer transition"
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(companystatus.id)}
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
                        className="px-2 py-2 text-center text-gray-400 border border-gray-200"
                      >
                        No Company Status found!
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

      {showConfirm && selectedCurrency && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <BsBuildingFillCheck className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  View Company Status
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
                      status:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompanystatus?.status || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Status Code:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompanystatus?.status_code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Description:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedCompanystatus?.status_description || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Creator:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompanystatus?.creator?.username || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompanystatus?.company?.company_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Created At:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedCompanystatus?.created_at
                        ? dayjs(selectedCompanystatus?.created_at).format(
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
                      {selectedCompanystatus?.updated_at
                        ? dayjs(selectedCompanystatus?.updated_at).format(
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
                <BsBuildingFillCheck className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Change Company Status
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
                  Status <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="status"
                  placeholder="Enter Status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Status Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="status_code"
                  placeholder="Enter Status Code"
                  value={formData.status_code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="status_description"
                  value={formData.status_description}
                  onChange={handleChange}
                  rows={2}
                  className="textarea-input"
                  placeholder="Enter company status description..."
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
                  if (isBulkDelete) setSelectedCompanystatuses([]);
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

export default ViewCompanyStatus;
