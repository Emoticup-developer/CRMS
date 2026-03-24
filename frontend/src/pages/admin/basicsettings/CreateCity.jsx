import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./../../../components/AdminSidebar";
import { createCity, fetchStates } from "../../../store/slices/citySlice";
import { useDispatch, useSelector } from "react-redux";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import mainConfig from "../../../config/mainConfig";
import { FiInfo, FiSave } from "react-icons/fi";
import { FaCity } from "react-icons/fa6";

const CreateCity = () => {
  const dispatch = useDispatch();
  const { states } = useSelector((state) => state.cities);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [actionType, setActionType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const citylogoRef = useRef(null);

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const [formData, setFormData] = useState({
    city_name: "",
    city_code: "",
    pin_code: "",
    city_logo: null,
    city_state: "",
  });

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

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

  const handleCityLogoChange = () => {
    const file = citylogoRef.current?.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      showTemporaryMessage("Only PNG and JPG images are allowed!", "error");
      citylogoRef.current.value = "";
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionType("Save");

    if (
      !formData.city_name ||
      !formData.city_code ||
      !formData.pin_code ||
      !formData.city_state
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    const file = citylogoRef.current?.files?.[0];
    if (file) {
      submitData.append("city_logo", file);
    }

    try {
      const res = await dispatch(createCity(submitData)).unwrap();
      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("City created successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("City create accepted!", "success");
      } else {
        showTemporaryMessage("Unexpected response from server.", "error");
        return;
      }
      setFormData({
        city_name: "",
        city_code: "",
        pin_code: "",
        city_logo: null,
        city_state: "",
      });
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
        showTemporaryMessage("Failed to create City!", "error");
      }
    }

    setTimeout(() => setActionType(""), 3000);
  };
  return (
    <div className="flex h-screen">
      <div className="hidden lg:block fixed top-0 left-0 h-full w-[325px] z-40">
        <AdminSidebar />
      </div>

      <main className="flex-1 ml-0 lg:ml-[325px] mt-[148px] p-3 overflow-y-auto bg-white backdrop-blur-sm shadow-inner [&::-webkit-scrollbar]:hidden scrollbar-none">
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

          {/* Arrows */}
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

        <div className="flex-1 w-full rounded-md">
          <div className="flex justify-between gap-4">
            <div className="w-full">
              <div className="bg-white rounded">
                <form>
                  <div className="animate-fadeIn rounded border border-gray-200">
                    <div className="px-6 flex justify-between items-center border-b-2 border-gray-200">
                      <div className="flex items-center gap-2 mt-4 pb-1">
                        <FaCity className="text-amber-500 text-lg" />
                        <h2 className="text-lg font-semibold text-gray-700">
                          Create City
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
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            City Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="city_code"
                            placeholder="Enter Country Code"
                            value={formData.city_code}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            City Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="city_name"
                            placeholder="Enter City name"
                            value={formData.city_name}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Pin Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="pin_code"
                            placeholder="Enter Pin Code"
                            value={formData.pin_code}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            City Logo <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            ref={citylogoRef}
                            name="city_logo"
                            accept="image/png, image/jpeg"
                            onChange={handleCityLogoChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            State <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="city_state"
                            value={formData.city_state}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {states.map((state) => (
                              <option key={state.id} value={state.id}>
                                {state.state_code} - {state.state_name}
                              </option>
                            ))}
                          </select>
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

export default CreateCity;
