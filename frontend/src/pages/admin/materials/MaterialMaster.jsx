import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./../../../components/AdminSidebar";
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
  FiSave,
  FiSearch,
  FiTool,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMaterials,
  updateMaterial,
  deleteMaterial,
  fetchBaseUnitOfMeasures,
  fetchPurchaseUnitOfMeasures,
  fetchIssueUnitOfMeasures,
  fetchMaterialTypes,
  fetchVendors,
  createMaterial,
} from "../../../store/slices/materialSlice";
import { FaTimes, FaTrashAlt } from "react-icons/fa";
import dayjs from "dayjs";
import api from "../../../utils/api";

const MaterialMaster = () => {
  const dispatch = useDispatch();
  const {
    baseuoms,
    purchaseuoms,
    issueuoms,
    materialTypes,
    vendors,
    materials,
    loading,
  } = useSelector((state) => state.materials);

  // ---------------- FILTER / SORT / PAGINATION ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  const imageRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMaterials());
    dispatch(fetchBaseUnitOfMeasures());
    dispatch(fetchPurchaseUnitOfMeasures());
    dispatch(fetchIssueUnitOfMeasures());
    dispatch(fetchMaterialTypes());
    dispatch(fetchVendors());
  }, [dispatch]);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
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
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    image: null,
    material_name: "",
    code: "",
    is_active: "",
    base_uom: "",
    purchase_uom: "",
    issue_uom: "",
    weight: "",
    volume: "",
    short_name: "",
    material_type: "",
    description: "",
    re_order_level: "",
    re_order_quantity: "",
    has_expiry: "",
    shelf_life: "",
    qr_code: "",
    vendor: "",
  });

  const [existingFiles, setExistingFiles] = useState({
    image: "",
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

      if (isBulkDelete && selectedMaterials.length > 0) {
        baseBreadcrumbs.push({
          label: formatIdsWithEllipsis(selectedMaterials),
          fullLabel: selectedMaterials.join(", "),
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
    } else if (showConfirm && selectedMaterial?.id) {
      updateBreadcrumbs("View", selectedMaterial.id);
    } else {
      updateBreadcrumbs();
    }
  }, [
    location.pathname,
    showDeleteModal,
    showEditModal,
    showConfirm,
    selectedMaterials,
    editId,
    selectedMaterial,
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

  const handleImageChange = () => {
    const file = imageRef.current?.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showTemporaryMessage("Only PNG and JPG images are allowed!", "error");
      imageRef.current.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleOpenEdit = (mtrl) => {
    setEditId(mtrl.id);
    setFormData({
      image: null,
      material_name: mtrl.material_name || "",
      code: mtrl.code || "",
      is_active:
        mtrl.is_active === null ? "" : mtrl.is_active ? "true" : "false",
      base_uom: mtrl.base_uom?.id || "",
      purchase_uom: mtrl.purchase_uom?.id || "",
      issue_uom: mtrl.issue_uom?.id || "",
      weight: mtrl.weight || "",
      volume: mtrl.volume || "",
      short_name: mtrl.short_name || "",
      material_type: mtrl.material_type?.id || "",
      description: mtrl.description || "",
      re_order_level: mtrl.re_order_level || "",
      re_order_quantity: mtrl.re_order_quantity || "",
      has_expiry:
        mtrl.has_expiry === null ? "" : mtrl.has_expiry ? "true" : "false",
      shelf_life: mtrl.shelf_life || "",
      qr_code: mtrl.qr_code || "",
      vendor: mtrl.vendor?.id || "",
    });
    setExistingFiles({
      image: mtrl.image || "",
    });

    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "description") {
        data.append("description", formData.description ?? null);
      } else if (key === "image") {
        if (formData.image instanceof File) {
          data.append("image", formData.image);
        }
      } else {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    });

    if (
      !formData.material_name ||
      !formData.code ||
      !formData.base_uom ||
      !formData.purchase_uom ||
      !formData.issue_uom ||
      !formData.weight ||
      !formData.volume ||
      !formData.short_name ||
      !formData.material_type ||
      !formData.description ||
      !formData.re_order_level ||
      !formData.re_order_quantity ||
      !formData.shelf_life ||
      !formData.qr_code ||
      !formData.vendor
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      if (editId) {
        const res = await dispatch(
          updateMaterial({ id: editId, formData: data }),
        ).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("Material updated successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("Material update accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
      } else {
        const res = await dispatch(createMaterial(data)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("Material created successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("Material create accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setFormData({
          image: null,
          material_name: "",
          code: "",
          is_active: "",
          base_uom: "",
          purchase_uom: "",
          issue_uom: "",
          weight: "",
          volume: "",
          short_name: "",
          material_type: "",
          description: "",
          re_order_level: "",
          re_order_quantity: "",
          has_expiry: "",
          shelf_life: "",
          qr_code: "",
          vendor: "",
        });
        if (imageRef.current) {
          imageRef.current.value = "";
        }
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
        showTemporaryMessage("Failed to update or create material!", "error");
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);

    setFormData({
      image: null,
      material_name: "",
      code: "",
      is_active: "",
      base_uom: "",
      purchase_uom: "",
      issue_uom: "",
      weight: "",
      volume: "",
      short_name: "",
      material_type: "",
      description: "",
      re_order_level: "",
      re_order_quantity: "",
      has_expiry: "",
      shelf_life: "",
      qr_code: "",
      vendor: "",
    });

    setExistingFiles({ image: "" });
  };

  // ----------------- Delete handlers -----------------
  const handleDelete = (id) => {
    setDeleteId(id);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedMaterials.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDelete && selectedMaterials.length > 0) {
        const res = await Promise.all(
          selectedMaterials.map((id) => dispatch(deleteMaterial(id)).unwrap()),
        );
        if (res.every((r) => r.status === 200 || r.status === 201)) {
          showTemporaryMessage("Material deleted successfully!", "success");
        } else if (res.every((r) => r.status === 202)) {
          showTemporaryMessage("Material delete accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setSelectedMaterials([]);
      } else if (deleteId) {
        const res = await dispatch(deleteMaterial(deleteId)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("Material deleted successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("Material delete accepted!", "success");
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
        showTemporaryMessage("Failed to delete material!", "error");
      }
    }
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredMaterials = materials.filter((mtrl) => {
    const search = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
    const normalize = (value) =>
      (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");

    return (
      normalize(mtrl?.code).includes(search) ||
      normalize(mtrl?.material_name).includes(search) ||
      normalize(mtrl?.material_type?.name).includes(search) ||
      normalize(mtrl?.creator?.username).includes(search) ||
      normalize(mtrl?.company?.company_name).includes(search)
    );
  });

  // ---------------- PAGINATION LOGIC ----------------
  const totalPages = Math.ceil(filteredMaterials.length / rowsPerPage);

  const paginatedMaterials = filteredMaterials.slice(
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
              <FiTool className="text-amber-500 text-lg" />
              <h2 className="text-lg font-semibold text-gray-700">
                Material Master
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

              <button
                onClick={() => {
                  setEditId(null);
                  setExistingFiles({ image: "" });
                  setFormData({
                    image: null,
                    material_name: "",
                    code: "",
                    is_active: "",
                    base_uom: "",
                    purchase_uom: "",
                    issue_uom: "",
                    weight: "",
                    volume: "",
                    short_name: "",
                    material_type: "",
                    description: "",
                    re_order_level: "",
                    re_order_quantity: "",
                    has_expiry: "",
                    shelf_life: "",
                    qr_code: "",
                    vendor: "",
                  });
                  setShowEditModal(true);
                }}
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                <FiPlus /> Create Material
              </button>

              {selectedMaterials.length > 1 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="relative inline-flex items-center justify-center gap-2 text-red-500 text-sm font-medium px-3 h-9 transition cursor-pointer"
                >
                  <FaTrashAlt size={16} />
                  <span className="absolute -top-1 -right-1 text-red-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full border border-red-500 bg-white">
                    {selectedMaterials.length}
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
                      {filteredMaterials.length <= 1 ? (
                        "-"
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            filteredMaterials.length > 1 &&
                            selectedMaterials.length ===
                              filteredMaterials.length
                          }
                          onChange={(e) =>
                            setSelectedMaterials(
                              e.target.checked
                                ? filteredMaterials.map((mtrl) => mtrl.id)
                                : [],
                            )
                          }
                          className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                        />
                      )}
                    </th>
                    {[
                      "MATERIAL CODE",
                      "MATERIAL NAME",
                      "MATERIAL TYPE",
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
                  ) : filteredMaterials.length > 0 ? (
                    paginatedMaterials.map((mtrl) => (
                      <tr
                        key={mtrl.id}
                        className="hover:bg-gray-50 text-center transition-all duration-200"
                      >
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(mtrl.id)}
                            onChange={() =>
                              setSelectedMaterials((prev) =>
                                prev.includes(mtrl.id)
                                  ? prev.filter((x) => x !== mtrl.id)
                                  : [...prev, mtrl.id],
                              )
                            }
                            className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                          />
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {mtrl?.code || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {mtrl?.material_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {mtrl?.material_type?.name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {mtrl?.creator?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {mtrl?.company?.company_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <div className="flex justify-center items-center space-x-3 text-sm">
                            <button
                              onClick={() => handleOpenEdit(mtrl)}
                              className="text-amber-500 hover:scale-110 cursor-pointer transition"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMaterial(mtrl);
                                updateBreadcrumbs("View", mtrl.id);
                                setShowConfirm(true);
                              }}
                              className="text-gray-600 hover:scale-110 cursor-pointer transition"
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(mtrl.id)}
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
                        No materials found!
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

      {showConfirm && selectedMaterial && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FiTool className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  View Material
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
                      Material Code:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Material Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.material_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Short Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.short_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Material Type:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.material_type?.name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Image:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.image ? (
                        <img
                          src={
                            selectedMaterial.image.startsWith("http")
                              ? selectedMaterial.image
                              : `${api.defaults.baseURL.replace(/\/$/, "")}${selectedMaterial.image}`
                          }
                          alt="Material"
                          className="h-24 w-24 object-cover"
                        />
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
                      {selectedMaterial?.description || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Movement:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {Array.isArray(selectedMaterial?.movement) &&
                      selectedMaterial.movement.length > 0
                        ? selectedMaterial.movement.map((move, index) => (
                            <span
                              key={move.id || index}
                              className="inline-block mb-1"
                            >
                              {move.name}
                            </span>
                          ))
                        : "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Vendor:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.vendor?.vendor_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Base UOM:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.base_uom?.name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Purchase UOM:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.purchase_uom?.name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Issue UOM:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.issue_uom?.name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Weight:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.weight || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Volume:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.volume || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Reorder Level:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.re_order_level || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Reorder Quantity:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.re_order_quantity || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Shelf Life:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.shelf_life || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      QR Code:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedMaterial?.qr_code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Active:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.is_active == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            selectedMaterial?.is_active
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {selectedMaterial?.is_active ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Expiry:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.has_expiry == null ? (
                        "--"
                      ) : (
                        <span
                          className={
                            selectedMaterial?.has_expiry
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {selectedMaterial?.has_expiry ? "Yes" : "No"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Creator:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.creator?.username || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.company?.company_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Created At:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedMaterial?.created_at
                        ? dayjs(selectedMaterial?.created_at).format(
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
                      {selectedMaterial?.updated_at
                        ? dayjs(selectedMaterial?.updated_at).format(
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
                <FiTool className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  {editId ? "Change" : "Create"} Material
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
                  Material Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="Enter Material Code"
                  value={formData.code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="material_name"
                  placeholder="Enter Material Name"
                  value={formData.material_name}
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
                  Material Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="material_type"
                  value={formData.material_type}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {materialTypes.map((mttys) => (
                    <option key={mttys.id} value={mttys.id}>
                      {mttys.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/png, image/jpeg"
                  ref={imageRef}
                  onChange={handleImageChange}
                  className="form-input"
                />
                {existingFiles.image && (
                  <a
                    href={
                      existingFiles.image.startsWith("http")
                        ? existingFiles.image
                        : `${api.defaults.baseURL.replace(/\/$/, "")}${existingFiles.image}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500"
                  >
                    {existingFiles.image.split("/").pop()}
                  </a>
                )}
              </div>
              <div className="flex flex-col col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="textarea-input"
                  placeholder="Enter description..."
                ></textarea>
              </div>
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
                  {vendors.map((vdrs) => (
                    <option key={vdrs.id} value={vdrs.id}>
                      {vdrs.vendor_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Base UOM <span className="text-red-500">*</span>
                </label>
                <select
                  name="base_uom"
                  value={formData.base_uom}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {baseuoms.map((bsus) => (
                    <option key={bsus.id} value={bsus.id}>
                      {bsus.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Purchase UOM <span className="text-red-500">*</span>
                </label>
                <select
                  name="purchase_uom"
                  value={formData.purchase_uom}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {purchaseuoms.map((prus) => (
                    <option key={prus.id} value={prus.id}>
                      {prus.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Issue UOM <span className="text-red-500">*</span>
                </label>
                <select
                  name="issue_uom"
                  value={formData.issue_uom}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {issueuoms.map((isus) => (
                    <option key={isus.id} value={isus.id}>
                      {isus.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Weight</label>
                <input
                  type="number"
                  name="weight"
                  placeholder="Enter Weight"
                  value={formData.weight}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^\d*(\.\d{0,2})?$/;
                    if (value === "" || regex.test(value)) {
                      handleChange(e);
                    }
                  }}
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Volume</label>
                <input
                  type="number"
                  name="volume"
                  placeholder="Enter Volume"
                  value={formData.volume}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^\d*(\.\d{0,2})?$/;
                    if (value === "" || regex.test(value)) {
                      handleChange(e);
                    }
                  }}
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Reorder Level</label>
                <input
                  type="number"
                  name="re_order_level"
                  placeholder="Enter Reorder Level"
                  value={formData.re_order_level}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^\d*(\.\d{0,2})?$/;
                    if (value === "" || regex.test(value)) {
                      handleChange(e);
                    }
                  }}
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Reorder Quantity</label>
                <input
                  type="number"
                  name="re_order_quantity"
                  placeholder="Enter Reorder Quantity"
                  value={formData.re_order_quantity}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^\d*(\.\d{0,2})?$/;
                    if (value === "" || regex.test(value)) {
                      handleChange(e);
                    }
                  }}
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Shelf Life</label>
                <input
                  type="number"
                  name="shelf_life"
                  placeholder="Enter Shelf Life"
                  value={formData.shelf_life}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^\d*(\.\d{0,2})?$/;
                    if (value === "" || regex.test(value)) {
                      handleChange(e);
                    }
                  }}
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  QR Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="qr_code"
                  placeholder="Enter QR Code"
                  value={formData.qr_code}
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
              <div className="flex flex-col">
                <label className="form-label">Expiry</label>
                <select
                  name="has_expiry"
                  value={formData.has_expiry}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
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
                {editId ? <FiEdit /> : <FiSave />} {editId ? "Change" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white px-6 py-4 rounded-md w-11/12 max-w-sm shadow-md border border-gray-300">
            <div className="flex justify-center mb-1">
              <FiAlertTriangle className="text-amber-500 text-4xl" />
            </div>
            <h2 className="text-lg font-semibold text-center mb-2 whitespace-nowrap">
              Are you sure you want to delete?
            </h2>
            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={confirmDelete}
                className="bg-amber-400 text-black font-medium px-3 py-1.5 rounded-md cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  if (isBulkDelete) setSelectedMaterials([]);
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

export default MaterialMaster;
