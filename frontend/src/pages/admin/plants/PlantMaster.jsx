import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./../../../components/AdminSidebar";
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
  FiSave,
  FiSearch,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPlants,
  updatePlant,
  deletePlant,
  fetchPlantTypes,
  fetchCurrencies,
  fetchCountries,
  fetchStates,
  fetchCities,
  createPlant,
} from "../../../store/slices/plantSlice";
import { FaHome, FaTimes, FaTrashAlt } from "react-icons/fa";
import dayjs from "dayjs";
import { PiPlantLight } from "react-icons/pi";

const PlantMaster = () => {
  const dispatch = useDispatch();
  const { plantTypes, currencies, countries, states, cities, plants, loading } =
    useSelector((state) => state.plants);

  // ---------------- FILTER / SORT / PAGINATION ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    dispatch(fetchPlants());
    dispatch(fetchPlantTypes());
    dispatch(fetchCurrencies());
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
  }, [dispatch]);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedPlants, setSelectedPlants] = useState([]);
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
  const [selectedPlant, setSelectedPlant] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    plant_name: "",
    code: "",
    plant_type: "",
    short_name: "",
    description: "",
    is_operational: "",
    currency: "",
    country: "",
    state: "",
    city: "",
    address_line1: "",
    address_line2: "",
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

      if (isBulkDelete && selectedPlants.length > 0) {
        baseBreadcrumbs.push({
          label: formatIdsWithEllipsis(selectedPlants),
          fullLabel: selectedPlants.join(", "),
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
    } else if (showConfirm && selectedPlant?.id) {
      updateBreadcrumbs("View", selectedPlant.id);
    } else {
      updateBreadcrumbs();
    }
  }, [
    location.pathname,
    showDeleteModal,
    showEditModal,
    showConfirm,
    selectedPlants,
    editId,
    selectedPlant,
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

  const handleOpenEdit = (plts) => {
    setEditId(plts.id);
    setFormData({
      plant_name: plts.plant_name || "",
      code: plts.code || "",
      plant_type: plts.plant_type?.id || "",
      short_name: plts.short_name || "",
      description: plts.description || "",
      is_operational:
        plts.is_operational === null
          ? ""
          : plts.is_operational
            ? "true"
            : "false",
      currency: plts.currency?.id || "",
      country: plts.country?.id || "",
      state: plts.state?.id || "",
      city: plts.city?.id || "",
      address_line1: plts.address_line1 || "",
      address_line2: plts.address_line2 || "",
    });

    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "address_line1") {
        data.append("address_line1", formData.address_line1 ?? null);
      } else if (key === "address_line2") {
        data.append("address_line2", formData.address_line2 ?? null);
      } else {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    });

    if (!formData.plant_name || !formData.code || !formData.short_name) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      if (editId) {
        const res = await dispatch(
          updatePlant({ id: editId, formData: data }),
        ).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("Plant updated successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("Plant update accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
      } else {
        const res = await dispatch(createPlant(data)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("Plant created successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("Plant create accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setFormData({
          plant_name: "",
          code: "",
          plant_type: "",
          short_name: "",
          description: "",
          is_operational: "",
          currency: "",
          country: "",
          state: "",
          city: "",
          address_line1: "",
          address_line2: "",
        });
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
        showTemporaryMessage("Failed to update or create plant!", "error");
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);

    setFormData({
      plant_name: "",
      code: "",
      plant_type: "",
      short_name: "",
      description: "",
      is_operational: "",
      currency: "",
      country: "",
      state: "",
      city: "",
      address_line1: "",
      address_line2: "",
    });
  };

  // ----------------- Delete handlers -----------------
  const handleDelete = (id) => {
    setDeleteId(id);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedPlants.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDelete && selectedPlants.length > 0) {
        const res = await Promise.all(
          selectedPlants.map((id) => dispatch(deletePlant(id)).unwrap()),
        );
        if (res.every((r) => r.status === 200 || r.status === 201)) {
          showTemporaryMessage("Plant deleted successfully!", "success");
        } else if (res.every((r) => r.status === 202)) {
          showTemporaryMessage("Plant delete accepted!", "success");
        } else {
          showTemporaryMessage("Unexpected response from server.", "error");
          return;
        }
        setSelectedPlants([]);
      } else if (deleteId) {
        const res = await dispatch(deletePlant(deleteId)).unwrap();
        if (res.status === 200 || res.status === 201) {
          showTemporaryMessage("Plant deleted successfully!", "success");
        } else if (res.status === 202) {
          showTemporaryMessage("Plant delete accepted!", "success");
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
        showTemporaryMessage("Failed to delete plant!", "error");
      }
    }
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredPlants = plants.filter((plts) => {
    const search = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
    const normalize = (value) =>
      (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");

    return (
      normalize(plts?.code).includes(search) ||
      normalize(plts?.plant_name).includes(search) ||
      normalize(plts?.plant_type?.name).includes(search) ||
      normalize(plts?.creator?.username).includes(search) ||
      normalize(plts?.company?.company_name).includes(search)
    );
  });

  // ---------------- PAGINATION LOGIC ----------------
  const totalPages = Math.ceil(filteredPlants.length / rowsPerPage);

  const paginatedPlants = filteredPlants.slice(
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
              <PiPlantLight className="text-amber-500 text-lg" />
              <h2 className="text-lg font-semibold text-gray-700">
                Plant Master
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
                  setFormData({
                    plant_name: "",
                    code: "",
                    plant_type: "",
                    short_name: "",
                    description: "",
                    is_operational: "",
                    currency: "",
                    country: "",
                    state: "",
                    city: "",
                    address_line1: "",
                    address_line2: "",
                  });
                  setShowEditModal(true);
                }}
                className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
              >
                <FiPlus /> Create Plant
              </button>

              {selectedPlants.length > 1 && (
                <button
                  onClick={handleBulkDeleteClick}
                  className="relative inline-flex items-center justify-center gap-2 text-red-500 text-sm font-medium px-3 h-9 transition cursor-pointer"
                >
                  <FaTrashAlt size={16} />
                  <span className="absolute -top-1 -right-1 text-red-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full border border-red-500 bg-white">
                    {selectedPlants.length}
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
                      {filteredPlants.length <= 1 ? (
                        "-"
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            filteredPlants.length > 1 &&
                            selectedPlants.length === filteredPlants.length
                          }
                          onChange={(e) =>
                            setSelectedPlants(
                              e.target.checked
                                ? filteredPlants.map((plts) => plts.id)
                                : [],
                            )
                          }
                          className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                        />
                      )}
                    </th>
                    {[
                      "PLANT CODE",
                      "PLANT NAME",
                      "PLANT TYPE",
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
                  ) : filteredPlants.length > 0 ? (
                    paginatedPlants.map((plts) => (
                      <tr
                        key={plts.id}
                        className="hover:bg-gray-50 text-center transition-all duration-200"
                      >
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedPlants.includes(plts.id)}
                            onChange={() =>
                              setSelectedPlants((prev) =>
                                prev.includes(plts.id)
                                  ? prev.filter((x) => x !== plts.id)
                                  : [...prev, plts.id],
                              )
                            }
                            className="w-4 h-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 accent-amber-400"
                          />
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {plts?.code || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {plts?.plant_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {plts?.plant_type?.name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {plts?.creator?.username || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          {plts?.company?.company_name || "--"}
                        </td>
                        <td className="px-2 py-2 border border-gray-200 whitespace-nowrap">
                          <div className="flex justify-center items-center space-x-3 text-sm">
                            <button
                              onClick={() => handleOpenEdit(plts)}
                              className="text-amber-500 hover:scale-110 cursor-pointer transition"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPlant(plts);
                                updateBreadcrumbs("View", plts.id);
                                setShowConfirm(true);
                              }}
                              className="text-gray-600 hover:scale-110 cursor-pointer transition"
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(plts.id)}
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
                        No plants found!
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

      {showConfirm && selectedPlant && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FaHome className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  View Plant
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
                      Plant Code:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedPlant?.code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Plant Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedPlant?.plant_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Short Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedPlant?.short_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Plant Type:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedPlant?.plant_type?.name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Description:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {selectedPlant?.description || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Creator:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedPlant?.creator?.username || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Company:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedPlant?.company?.company_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Created At:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {selectedPlant?.created_at
                        ? dayjs(selectedPlant?.created_at).format(
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
                      {selectedPlant?.updated_at
                        ? dayjs(selectedPlant?.updated_at).format(
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
                <FaHome className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  {editId ? "Change" : "Create"} Plant
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
                  Plant Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="Enter Plant Code"
                  value={formData.code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  Plant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="plant_name"
                  placeholder="Enter Plant Name"
                  value={formData.plant_name}
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
                  Plant Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="plant_type"
                  value={formData.plant_type}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {plantTypes.map((plty) => (
                    <option key={plty.id} value={plty.id}>
                      {plty.name}
                    </option>
                  ))}
                </select>
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
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select</option>
                  {currencies.map((crns) => (
                    <option key={crns.id} value={crns.id}>
                      {crns.currency_code} - {crns.currency_name}
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
                  {countries.map((ctry) => (
                    <option key={ctry.id} value={ctry.id}>
                      {ctry.country_code} - {ctry.country_name}
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
                  {states.map((sts) => (
                    <option key={sts.id} value={sts.id}>
                      {sts.state_code} - {sts.state_name}
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
                  {cities.map((cts) => (
                    <option key={cts.id} value={cts.id}>
                      {cts.city_code} - {cts.city_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Operational</label>
                <select
                  name="is_operational"
                  value={formData.is_operational}
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
                  if (isBulkDelete) setSelectedPlants([]);
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

export default PlantMaster;
