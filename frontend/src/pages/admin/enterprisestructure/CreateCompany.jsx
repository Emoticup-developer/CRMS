import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";
import mainConfig from "../../../config/mainConfig";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { FiInfo, FiSave } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  createCompany,
  fetchCompanies,
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
import { FaBuilding } from "react-icons/fa";

const CreateCompany = () => {
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
  } = useSelector((state) => state.companies);

  const photoRef = useRef(null);

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [actionType, setActionType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

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

  const handlePhotoChange = () => {
    const file = photoRef.current?.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      showTemporaryMessage("Only PNG and JPG images are allowed!", "error");
      photoRef.current.value = "";
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionType("Save");

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

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    const file = photoRef.current?.files?.[0];
    if (file) {
      submitData.append("company_logo", file);
    }

    try {
      const res = await dispatch(createCompany(submitData)).unwrap();
      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("Company created successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("Company create accepted!", "success");
      } else {
        showTemporaryMessage("Unexpected response from server.", "error");
        return;
      }
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

      if (photoRef.current) {
        photoRef.current.value = "";
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
        showTemporaryMessage("Failed to create Company!", "error");
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
                        <FaBuilding className="text-amber-500 text-lg" />
                        <h2 className="text-lg font-semibold text-gray-700">
                          Create Company
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
                            Organization ID{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="organization_id"
                            placeholder="Enter Organization ID"
                            value={formData.organization_id}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Company Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="company_code"
                            placeholder="Enter Company Code"
                            value={formData.company_code}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="company_name"
                            placeholder="Enter Company Name"
                            value={formData.company_name}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Logo
                          </label>
                          <input
                            type="file"
                            name="company_logo"
                            accept="image/png, image/jpeg"
                            ref={photoRef}
                            onChange={handlePhotoChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-start col-span-2">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="company_description"
                            value={formData.company_description}
                            onChange={handleChange}
                            rows={2}
                            className="flex-1 w-full textarea-input"
                            placeholder="Enter company description..."
                          ></textarea>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Parent Company{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="parent_company"
                            value={formData.parent_company}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {companies.map((cp) => (
                              <option key={cp.id} value={cp.id}>
                                {cp.company_code} - {cp.company_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Company Admin{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="company_admin"
                            value={formData.company_admin}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.username} - {user.email}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Currency <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {currencies.map((cr) => (
                              <option key={cr.id} value={cr.id}>
                                {cr.currency_code} - {cr.currency_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {countries.map((ct) => (
                              <option key={ct.id} value={ct.id}>
                                {ct.country_code} - {ct.country_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            State <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {states.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.state_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            City <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {cities.map((cs) => (
                              <option key={cs.id} value={cs.id}>
                                {cs.city_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Language <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {languages.map((lg) => (
                              <option key={lg.id} value={lg.id}>
                                {lg.language_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Business Area{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="business_area"
                            value={formData.business_area}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {businessareas.map((ba) => (
                              <option key={ba.id} value={ba.id}>
                                {ba.business_area}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Business Sector{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="business_sector"
                            value={formData.business_sector}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {businesssectors.map((bs) => (
                              <option key={bs.id} value={bs.id}>
                                {bs.business_sector}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
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

export default CreateCompany;
