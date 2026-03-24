import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import mainConfig from "../../../config/mainConfig";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { FiInfo, FiSave, FiHome, FiRefreshCw } from "react-icons/fi";

import { createTransactionstatus } from "../../../store/slices/transactionstatusSlice";

import { useDispatch, useSelector } from "react-redux";

const CreateTransactionstatus = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [actionType, setActionType] = useState("");

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const [formData, setFormData] = useState({
    status_name: "",
    status_code: "",
    description: "",
    is_active: "",
    sort_order: "",
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

  useEffect(() => {
    const basePath = location.pathname;
    const menuPath = findPathInMenu(mainConfig, basePath) || [];

    const breadcrumbArray = menuPath.map((i) => ({
      label: i.label,
      path: i.path,
    }));

    if (actionType === "Save")
      breadcrumbArray.push({ label: "Save", path: null });

    setBreadcrumbs(breadcrumbArray);
  }, [location.pathname, actionType]);

  const currentIndex = breadcrumbs.findIndex(
    (b) => b.path === location.pathname,
  );

  const goPrev = () => {
    if (currentIndex > 0 && breadcrumbs[currentIndex - 1].path) {
      navigate(breadcrumbs[currentIndex - 1].path);
    }
  };

  const goNext = () => {
    if (
      currentIndex >= 0 &&
      currentIndex < breadcrumbs.length - 1 &&
      breadcrumbs[currentIndex + 1].path
    ) {
      navigate(breadcrumbs[currentIndex + 1].path);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionType("Save");

    if (!formData.status_name || !formData.status_code) {
      showTemporaryMessage("Please fill all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const res = await dispatch(createTransactionstatus(submitData)).unwrap();

      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage(
          "Transaction Status created successfully!",
          "success",
        );
      } else {
        showTemporaryMessage("Unexpected server response!", "error");
        return;
      }

      setFormData({
        status_name: "",
        status_code: "",
        description: "",
        is_active: "",
        sort_order: "",
      });
    } catch (error) {
      showTemporaryMessage("Failed to create Transaction Status!", "error");
    }

    setTimeout(() => setActionType(""), 3000);
  };

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block fixed top-0 left-0 h-full w-[325px] z-40">
        <AdminSidebar />
      </div>

      <main className="flex-1 ml-0 lg:ml-[325px] mt-[148px] p-3 overflow-y-auto bg-white backdrop-blur-sm shadow-inner [&::-webkit-scrollbar]:hidden scrollbar-none">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            {breadcrumbs.map((b, index) => (
              <span key={index} className="flex items-center gap-1">
                {b.path ? (
                  <span
                    onClick={() => navigate(b.path)}
                    className="cursor-pointer"
                  >
                    {b.label}
                  </span>
                ) : (
                  <span>{b.label}</span>
                )}

                {index < breadcrumbs.length - 1 && (
                  <span className="text-gray-400"> &gt; </span>
                )}
              </span>
            ))}
          </div>

          <div className="flex items-center">
            <button
              onClick={goPrev}
              className={`text-gray-400 text-lg ${
                currentIndex <= 0 ? "opacity-50" : "cursor-pointer"
              }`}
            >
              <MdKeyboardArrowLeft />
            </button>

            <button
              onClick={goNext}
              className={`text-gray-400 text-lg ${
                currentIndex >= breadcrumbs.length - 1
                  ? "opacity-50"
                  : "cursor-pointer"
              }`}
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full rounded-md">
          <div className="flex justify-between gap-4">
            <div className="w-full">
              <div className="bg-white rounded">
                <form>
                  <div className="animate-fadeIn rounded border border-gray-200">
                    <div className="px-6 flex justify-between items-center border-b-2 border-gray-200">
                      <div className="flex items-center gap-2 mt-4 pb-1">
                        <FiRefreshCw className="text-amber-500 text-lg" />
                        <h2 className="text-lg font-semibold text-gray-700">
                          Create Transaction Status
                        </h2>
                      </div>

                      <button
                        onClick={handleSubmit}
                        className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
                      >
                        <FiSave /> Save
                      </button>
                    </div>

                    <div className="max-h-[255px] rounded overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 px-6 my-4">
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium">
                            Transaction Status Name{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="status_name"
                            value={formData.status_name}
                            onChange={handleChange}
                            className="flex-1 form-input"
                          />
                        </div>

                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium">
                            Transaction Status Code{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="status_code"
                            value={formData.status_code}
                            onChange={handleChange}
                            className="flex-1 form-input"
                          />
                        </div>

                        <div className="flex items-start col-span-2">
                          <label className="w-[200px] text-sm font-medium">
                            Description
                          </label>
                          <textarea
                            name="description"
                            rows={2}
                            value={formData.description}
                            onChange={handleChange}
                            className="flex-1 textarea-input"
                          />
                        </div>

                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium">
                            Active
                          </label>
                          <select
                            name="is_active"
                            value={formData.is_active}
                            onChange={handleChange}
                            className="flex-1 form-input"
                          >
                            <option value="">Select</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>

                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium">
                            Sort Order
                          </label>
                          <input
                            type="number"
                            name="sort_order"
                            value={formData.sort_order}
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
                            className="flex-1 w-full form-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default CreateTransactionstatus;
