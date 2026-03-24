import AdminSidebar from "../../../components/AdminSidebar";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import mainConfig from "../../../config/mainConfig";
import { createInitiateVOB } from "../../../store/slices/initiateVOBSlice";
import { useDispatch } from "react-redux";

const InitiateVOB = () => {
  const dispatch = useDispatch();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedNumberRanges, setSelectedNumberRanges] = useState([]);
  const [actionType, setActionType] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [isAttachChecked, setIsAttachChecked] = useState(false);

  const fileRef = useRef(null);

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedNumberRange, setSelectedNumberRange] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    partner: "",
    representative: "",
    email: "",
    file: null,
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

      if (isBulkDelete && selectedNumberRanges.length > 0) {
        baseBreadcrumbs.push({
          label: formatIdsWithEllipsis(selectedNumberRanges),
          fullLabel: selectedNumberRanges.join(", "),
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
    } else if (showConfirm && selectedNumberRange?.id) {
      updateBreadcrumbs("View", selectedNumberRange.id);
    } else {
      updateBreadcrumbs();
    }
  }, [
    location.pathname,
    showDeleteModal,
    showEditModal,
    showConfirm,
    selectedNumberRanges,
    editId,
    selectedNumberRange,
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

  const handleAttachChange = (e) => {
    const checked = e.target.checked;
    setIsAttachChecked(checked);

    if (checked && fileRef.current) {
      fileRef.current.click();
    }

    if (!checked) {
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      setFormData((prev) => ({
        ...prev,
        file: null,
      }));
    }
  };

  const handleFileChange = () => {
    const selectedFile = fileRef.current?.files?.[0] || null;

    if (selectedFile) {
      setIsAttachChecked(true);
      setFormData((prev) => ({
        ...prev,
        file: selectedFile,
      }));
    } else {
      setIsAttachChecked(false);
      setFormData((prev) => ({
        ...prev,
        file: null,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.partner || !formData.representative || !formData.email) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    const payload = {
      partner: formData.partner,
      representative: formData.representative,
      email: formData.email,
    };

    try {
      const res = await dispatch(createInitiateVOB(payload)).unwrap();
      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("Initiate VOB created successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("Initiate VOB create accepted!", "success");
      } else {
        showTemporaryMessage("Unexpected response from server.", "error");
        return;
      }

      setFormData({
        partner: "",
        representative: "",
        email: "",
        file: null,
      });

      setIsAttachChecked(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (error) {
      console.log("Error:", error);

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
        showTemporaryMessage("Failed to initiate VOB!", "error");
      }
    }
  };

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
          <div className="flex justify-center items-center gap-2 bg-amber-200 border border-gray-300 rounded-tl rounded-tr">
            <h2 className="text-lg font-semibold text-gray-700 py-0.5">
              Initiate New VOB
            </h2>
          </div>
          <div className="bg-white w-full">
            <div className="overflow-x-auto">
              <div className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
                <table className="min-w-full text-sm text-left divide-y divide-gray-200">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                    <tr>
                      {[
                        "NAME OF THE VENDOR",
                        "REPRESENTATIVE",
                        "EMAIL ID",
                        "ATTACHMENT",
                      ].map((label, idx) => (
                        <th
                          key={idx}
                          className="px-2 py-2 font-medium border border-gray-300 text-center sticky top-0 z-20 whitespace-nowrap"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    <tr className="text-center transition-all duration-200">
                      <td className="px-1 py-0.5 border border-gray-300 whitespace-nowrap">
                        <input
                          type="text"
                          name="partner"
                          value={formData.partner}
                          onChange={handleChange}
                          className="w-full form-input border-none"
                        />
                      </td>
                      <td className="px-1 py-0.5 border border-gray-300 whitespace-nowrap">
                        <input
                          type="text"
                          name="representative"
                          value={formData.representative}
                          onChange={handleChange}
                          className="w-full form-input border-none"
                        />
                      </td>
                      <td className="px-1 py-0.5 border border-gray-300 whitespace-nowrap">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full form-input border-none"
                        />
                      </td>
                      <td className="px-1 py-0.5 border border-gray-300 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span>Attach</span>
                          <input
                            type="checkbox"
                            checked={isAttachChecked}
                            onChange={handleAttachChange}
                          />
                          <input
                            type="file"
                            ref={fileRef}
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSubmit}
                    className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InitiateVOB;
