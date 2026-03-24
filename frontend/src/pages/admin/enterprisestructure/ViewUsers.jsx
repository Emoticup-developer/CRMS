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
  fetchUsers,
  updateUser,
  deleteUser,
  fetchCompanies,
  fetchUserTypes,
  fetchPositions,
  fetchUserStatus,
} from "../../../store/slices/userSlice";
import { FaEye, FaEyeSlash, FaTimes, FaTrashAlt } from "react-icons/fa";
import api from "../../../utils/api";
import dayjs from "dayjs";

const ViewUsers = () => {
  const dispatch = useDispatch();
  const [actionType, setActionType] = useState("");
  const { users, companies, userTypes, positions, statuses, loading } =
    useSelector((state) => state.users);

  const [limit, setLimit] = useState(50);

  // ---------------- FILTER / SORT / PAGINATION ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    dispatch(fetchUsers(limit));
  }, [dispatch, limit]);

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchUserTypes());
    dispatch(fetchPositions());
    dispatch(fetchUserStatus());
  }, [dispatch]);

  const [showPassword, setShowPassword] = useState(false);
  const photoRef = useRef(null);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
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
  const [selectedUser, setSelectedUser] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    is_active: "",
    user_code: "",
    user_photo: null,
    user_company: "",
    user_type: "",
    position: "",
    status: "",
    manager: "",
    phone_number: "",
    emergency_contact: "",
    relationship_emergency_contact: "",
    remarks: "",
  });

  const [existingFiles, setExistingFiles] = useState({
    user_photo: "",
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

      if (isBulkDelete && selectedUsers.length > 0) {
        baseBreadcrumbs.push({
          label: formatIdsWithEllipsis(selectedUsers),
          fullLabel: selectedUsers.join(", "),
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
    } else if (showConfirm && selectedUser?.id) {
      updateBreadcrumbs("View", selectedUser.id);
    } else {
      updateBreadcrumbs();
    }
  }, [
    location.pathname,
    showDeleteModal,
    showEditModal,
    showConfirm,
    selectedUsers,
    editId,
    selectedUser,
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
      user_photo: file,
    }));
  };

  const handleOpenEdit = (user) => {
    setEditId(user.id);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      password: "",
      is_active:
        user.is_active === null ? "" : user.is_active ? "true" : "false",
      user_code: user.user_code || "",
      user_photo: null,
      user_company: user.user_company?.id || "",
      user_type: user.user_type?.id || "",
      position: user.position?.id || "",
      status: user.status?.id || "",
      manager: user.manager?.id || "",
      phone_number: user.phone_number || "",
      emergency_contact: user.emergency_contact || "",
      relationship_emergency_contact: user.relationship_emergency_contact || "",
      remarks: user.remarks || "",
    });
    setExistingFiles({
      user_photo: user.user_photo || "",
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "password") {
        if (formData.password) {
          data.append("password", formData.password);
        }
      } else if (key === "user_photo") {
        if (formData.user_photo instanceof File) {
          data.append("user_photo", formData.user_photo);
        }
      } else if (key === "remarks") {
        data.append("remarks", formData.remarks ?? null);
      } else {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    });

    if (
      !formData.username ||
      !formData.email ||
      !formData.first_name ||
      !formData.is_active ||
      !formData.user_code ||
      !formData.user_company ||
      !formData.user_type ||
      !formData.position ||
      !formData.phone_number ||
      !formData.emergency_contact ||
      !formData.relationship_emergency_contact
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      const res = await dispatch(
        updateUser({ id: editId, formData: data }),
      ).unwrap();

      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("User updated successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("User update accepted!", "success");
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
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      is_active: "",
      user_code: "",
      user_photo: null,
      user_company: "",
      user_type: "",
      position: "",
      status: "",
      manager: "",
      phone_number: "",
      emergency_contact: "",
      relationship_emergency_contact: "",
      remarks: "",
    });

    setExistingFiles({ user_photo: "" });
  };

  // ----------------- Delete handlers -----------------
  const handleDelete = (id) => {
    setDeleteId(id);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDelete && selectedUsers.length > 0) {
        const res = await Promise.all(
          selectedUsers.map((id) => dispatch(deleteUser(id)).unwrap()),
        );
        if (res.every((r) => r.status === 200 || r.status === 201)) {
          showTemporaryMessage("User deleted successfully!", "success");
        } else if (res.every((r) => r.status === 202)) {
          showTemporaryMessage("User delete accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setSelectedUsers([]);
      } else if (deleteId) {
        const res = await dispatch(deleteUser(deleteId)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("User deleted successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("User delete accepted!", "success");
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
        showTemporaryMessage("Failed to delete user!", "error");
      }
    }
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredUsers = (users || []).filter((user) => {
    const search = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
    const normalize = (value) =>
      (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");
    let activeText = "";
    if (user?.is_active === true) activeText = "yes";
    else if (user?.is_active === false) activeText = "no";
    return (
      normalize(user?.username).includes(search) ||
      normalize(user?.email).includes(search) ||
      normalize(user?.phone_number).includes(search) ||
      normalize(user?.manager?.username).includes(search) ||
      normalize(activeText).includes(search)
    );
  });

  // ---------------- PAGINATION LOGIC ----------------
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const paginatedUsers = filteredUsers.slice(
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
                View Users
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-2 py-1.5 rounded border h-8 border-gray-300 text-sm outline-none cursor-pointer"
              >
                <option value={50}>0 - 50</option>
                <option value={100}>0 - 100</option>
                <option value={200}>0 - 200</option>
                <option value={500}>0 - 500</option>
                <option value={1000}>0 - 1000</option>
              </select>

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
                to="/admin/users/create"
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                <FiPlus /> Create User
              </Link>

              {selectedUsers.length > 1 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="relative inline-flex items-center justify-center gap-2 text-red-500 text-sm font-medium px-3 h-9 transition cursor-pointer"
                >
                  <FaTrashAlt size={16} />
                  <span className="absolute -top-1 -right-1 text-red-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full border border-red-500 bg-white">
                    {selectedUsers.length}
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
                      {filteredUsers.length <= 1 ? (
                        "-"
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            filteredUsers.length > 1 &&
                            selectedUsers.length === filteredUsers.length
                          }
                          onChange={(e) =>
                            setSelectedUsers(
                              e.target.checked
                                ? filteredUsers.map((user) => user.id)
                                : [],
                            )
                          }
                          className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                        />
                      )}
                    </th>
                    {[
                      "USERNAME",
                      "EMAIL ID",
                      "MOBILE NO",
                      "MANAGER",
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
                        colSpan={7}
                        className="px-2 py-2 text-center border border-gray-200 whitespace-nowrap"
                      >
                        <div className="flex justify-center items-center">
                          <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 text-center transition-all duration-200"
                      >
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() =>
                              setSelectedUsers((prev) =>
                                prev.includes(user.id)
                                  ? prev.filter((x) => x !== user.id)
                                  : [...prev, user.id],
                              )
                            }
                            className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                          />
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {user?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {user?.email || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {user?.phone_number || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {user?.manager?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {user?.is_active == null ? (
                            "--"
                          ) : (
                            <span
                              className={
                                user?.is_active
                                  ? "text-green-600"
                                  : "text-red-500"
                              }
                            >
                              {user?.is_active ? "Yes" : "No"}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <div className="flex justify-center items-center space-x-3 text-sm">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="text-amber-500 hover:scale-110 cursor-pointer transition"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                updateBreadcrumbs("View", user.id);
                                setShowConfirm(true);
                              }}
                              className="text-gray-600 hover:scale-110 cursor-pointer transition"
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
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
                        No users found!
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

      {showConfirm && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FiUsers className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  View User
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
                      Username:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.username || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Email ID:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.email || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      First Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.first_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Last Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.last_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Active:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.is_active == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            selectedUser?.is_active
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {selectedUser?.is_active ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Code:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.user_code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Photo:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.user_photo ? (
                        <a
                          href={
                            selectedUser.user_photo.startsWith("http")
                              ? selectedUser.user_photo
                              : `${api.defaults.baseURL.replace(/\/$/, "")}${selectedUser.user_photo}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500"
                        >
                          {selectedUser.user_photo.split("/").pop()}
                        </a>
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.user_company?.company_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Type:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.user_type?.type || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Position:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.position?.position || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Status:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.status?.status || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Manager:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.manager?.username || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Mobile No:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.phone_number || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Emergency Mobile No:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.emergency_contact || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Relation Mobile No:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.relationship_emergency_contact || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Remarks:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedUser?.remarks || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Created At:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedUser?.created_at
                        ? dayjs(selectedUser?.created_at).format(
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
                      {selectedUser?.updated_at
                        ? dayjs(selectedUser?.updated_at).format(
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
                <FiUsers className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Change User
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
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full form-input pr-10"
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Enter Last Name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Photo</label>
                <input
                  type="file"
                  name="user_photo"
                  accept="image/png, image/jpeg"
                  ref={photoRef}
                  onChange={handlePhotoChange}
                  className="form-input"
                />
                {existingFiles.user_photo && (
                  <a
                    href={
                      existingFiles.user_photo.startsWith("http")
                        ? existingFiles.user_photo
                        : `${api.defaults.baseURL.replace(/\/$/, "")}${existingFiles.user_photo}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500"
                  >
                    {existingFiles.user_photo.split("/").pop()}
                  </a>
                )}
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="user_code"
                  placeholder="Enter User Code"
                  className="form-input"
                  value={formData.user_code}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  name="user_company"
                  value={formData.user_company}
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
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {userTypes.map((ut) => (
                    <option key={ut.id} value={ut.id}>
                      {ut.type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Position <span className="text-red-500">*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {positions.map((ps) => (
                    <option key={ps.id} value={ps.id}>
                      {ps.position}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Manager</label>
                <select
                  name="manager"
                  value={formData.manager}
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
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Enter Mobile No"
                  className="form-input"
                  maxLength={10}
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Emergency Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  placeholder="Enter Emergency Contact"
                  className="form-input"
                  maxLength={10}
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Relation Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="relationship_emergency_contact"
                  placeholder="Enter Relation Mobile No"
                  className="form-input"
                  maxLength={10}
                  value={formData.relationship_emergency_contact}
                  onChange={handleChange}
                />
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
              <div className="flex flex-col">
                <label className="form-label">
                  Active <span className="text-red-500">*</span>
                </label>
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
                  if (isBulkDelete) setSelectedUsers([]);
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

export default ViewUsers;
