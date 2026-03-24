import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./../../../components/AdminSidebar";
import mainConfig from "../../../config/mainConfig";
import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { FiArrowLeft, FiInfo, FiSave, FiUsers } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVenderTypes,
  fetchCurrencies,
  fetchCountries,
  fetchStates,
  fetchCities,
  createVender,
} from "../../../store/slices/vendorSlice";
import {
  createVenderMaterial,
  fetchVenders,
  fetchMaterials,
  fetchUnitOfMeasurements,
} from "../../../store/slices/vendorMaterialSlice";
import { FaTimes } from "react-icons/fa";

const AdminVendorOnboarding = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { vendortypes, currencies, countries, states, cities } = useSelector(
    (state) => state.vendors,
  );

  const { vendors, materials, uoms } = useSelector(
    (state) => state.vendorMaterials,
  );

  const [savedSteps, setSavedSteps] = useState({
    general: false,
    material: false,
    control: false,
    bank: false,
  });

  const [reviewPopup, setReviewPopup] = useState(false);

  useEffect(() => {
    dispatch(fetchVenderTypes());
    dispatch(fetchCurrencies());
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
    dispatch(fetchVenders());
    dispatch(fetchMaterials());
    dispatch(fetchUnitOfMeasurements());
  }, [dispatch]);

  const tabs = ["general", "material", "control", "bank"];
  const [activeTab, setActiveTab] = useState("general");

  const goToNextTab = () => {
    const index = tabs.indexOf(activeTab);
    if (index < tabs.length - 1) setActiveTab(tabs[index + 1]);
  };

  const goToPrevTab = () => {
    const index = tabs.indexOf(activeTab);
    if (index > 0) setActiveTab(tabs[index - 1]);
  };

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [actionType, setActionType] = useState("");

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const [vendorFormData, setVendorFormData] = useState({
    vendor_name: "",
    vendor_code: "",
    short_name: "",
    vendor_type: "",
    contact_person: "",
    email: "",
    phone: "",
    mobile: "",
    website: "",
    billing_address: "",
    shipping_address: "",
    country: "",
    state: "",
    city: "",
    postal_code: "",
    currency: "",
    default_lead_time_days: "",
    minimum_order_value: "",
    remarks: "",
  });

  const [createdVendorId, setCreatedVendorId] = useState("");

  useEffect(() => {
    if (createdVendorId) {
      setVendorMaterialFormData((prev) => ({
        ...prev,
        vendor: createdVendorId,
      }));
    }
  }, [createdVendorId]);

  const [vendorMaterialFormData, setVendorMaterialFormData] = useState({
    vendor: "",
    material: "",
    purchase_uom: "",
    price: "",
    minimum_order_quantity: "",
    lead_time_days: "",
    tax_percentage: "",
    discount_percentage: "",
    valid_from: "",
    valid_to: "",
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

  // FK value resolvers
  const getVendorTypeName = (id) => {
    const data = vendortypes.find((v) => String(v.id) === String(id));
    return data ? data.name : "";
  };

  const getCurrencyName = (id) => {
    const data = currencies.find((c) => String(c.id) === String(id));
    return data ? `${data.currency_code} - ${data.currency_name}` : "";
  };

  const getCountryName = (id) => {
    const data = countries.find((c) => String(c.id) === String(id));
    return data ? `${data.country_code} - ${data.country_name}` : "";
  };

  const getStateName = (id) => {
    const data = states.find((s) => String(s.id) === String(id));
    return data ? data.state_name : "";
  };

  const getCityName = (id) => {
    const data = cities.find((c) => String(c.id) === String(id));
    return data ? c.city_name : "";
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendorFormData({ ...vendorFormData, [name]: value });
  };

  const handleVendorMaterialChange = (e) => {
    const { name, value } = e.target;
    setVendorMaterialFormData({ ...vendorMaterialFormData, [name]: value });
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setActionType("Save");
    if (
      !vendorFormData.vendor_name ||
      !vendorFormData.vendor_code ||
      !vendorFormData.short_name ||
      !vendorFormData.vendor_type ||
      !vendorFormData.currency ||
      !vendorFormData.country ||
      !vendorFormData.state ||
      !vendorFormData.city ||
      !vendorFormData.postal_code
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }
    setReviewPopup(true);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setActionType("Save");

    try {
      const payload = {
        ...vendorFormData,

        vendor_type: Number(vendorFormData.vendor_type),
        currency: Number(vendorFormData.currency),
        country: Number(vendorFormData.country),
        state: Number(vendorFormData.state),
        city: Number(vendorFormData.city),
      };
      const res = await dispatch(createVender(payload)).unwrap();
      const vendorId = res?.id || res?.data?.id;
      if (!vendorId) {
        showTemporaryMessage("Vendor ID not returned from API!", "error");
        return;
      }
      setCreatedVendorId(vendorId);
      setVendorMaterialFormData((prev) => ({
        ...prev,
        vendor: vendorId,
      }));
      setSavedSteps((prev) => ({
        ...prev,
        general: true,
      }));
      showTemporaryMessage("Vendor created successfully!");
      setReviewPopup(false);
      goToNextTab();
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
        showTemporaryMessage("Failed to create vendor!", "error");
      }
    }

    setTimeout(() => setActionType(""), 3000);
  };

  const handleVendorMaterialSubmit = async (e) => {
    e.preventDefault();
    setActionType("Save");

    // ✅ Correct validation (fix for filled values showing error)
    if (
      createdVendorId === "" ||
      vendorMaterialFormData.material === "" ||
      vendorMaterialFormData.purchase_uom === "" ||
      vendorMaterialFormData.price === ""
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    try {
      const payload = {
        ...vendorMaterialFormData,

        // ✅ Always use createdVendorId
        vendor: Number(createdVendorId),

        material: Number(vendorMaterialFormData.material),
        purchase_uom: Number(vendorMaterialFormData.purchase_uom),
        price: Number(vendorMaterialFormData.price),

        minimum_order_quantity: vendorMaterialFormData.minimum_order_quantity
          ? Number(vendorMaterialFormData.minimum_order_quantity)
          : null,

        lead_time_days: vendorMaterialFormData.lead_time_days
          ? Number(vendorMaterialFormData.lead_time_days)
          : null,

        tax_percentage: vendorMaterialFormData.tax_percentage
          ? Number(vendorMaterialFormData.tax_percentage)
          : null,

        discount_percentage: vendorMaterialFormData.discount_percentage
          ? Number(vendorMaterialFormData.discount_percentage)
          : null,
      };

      const res = await dispatch(createVenderMaterial(payload)).unwrap();

      if (res.status === 200 || res.status === 201) {
        setSavedSteps((prev) => ({ ...prev, material: true }));

        showTemporaryMessage("Vendor Material created successfully!");

        goToNextTab();
      } else if (res.status === 202) {
        setSavedSteps((prev) => ({ ...prev, material: true }));

        showTemporaryMessage("Vendor Material create accepted!", "success");

        goToNextTab();
      } else {
        showTemporaryMessage("Unexpected response from server.", "error");
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
        showTemporaryMessage("Failed to create vendor material!", "error");
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
        <div className="w-full h-[90%] border border-gray-300 rounded px-4 py-2">
          <div className="flex justify-between items-center border-b-2 border-gray-200 mb-2">
            <div className="flex items-center gap-2">
              <FiUsers className="text-amber-500 text-lg" />
              <h2 className="text-lg font-semibold text-gray-700">
                Vendor Onboarding
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
            <div className="flex flex-col">
              <label className="form-label">
                Vendor Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendor_code"
                value={vendorFormData.vendor_code}
                onChange={handleVendorChange}
                placeholder="Enter Vendor Code"
                className="flex-1 w-full form-input"
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendor_name"
                value={vendorFormData.vendor_name}
                onChange={handleVendorChange}
                placeholder="Enter Vendor Name"
                className="flex-1 w-full form-input"
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">
                Short Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="short_name"
                value={vendorFormData.short_name}
                onChange={handleVendorChange}
                placeholder="Enter Short Text"
                className="flex-1 w-full form-input"
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">
                Vendor Type <span className="text-red-500">*</span>
              </label>
              <select
                name="vendor_type"
                value={vendorFormData.vendor_type}
                onChange={handleVendorChange}
                className="flex-1 w-full form-input"
              >
                <option value="">Select</option>
                {vendortypes.map((vt) => (
                  <option key={vt.id} value={vt.id}>
                    {vt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2 border-b border-gray-300 flex gap-4 text-sm font-medium overflow-x-auto py-1 px-2 rounded">
            <button
              disabled={savedSteps.general}
              onClick={() => !savedSteps.general && setActiveTab("general")}
              className={`pb-1 ${
                activeTab === "general"
                  ? "border-b-2 border-amber-400 text-amber-500"
                  : savedSteps.general
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 cursor-pointer"
              }`}
            >
              General Data
            </button>

            <button
              disabled={!savedSteps.general}
              onClick={() => savedSteps.general && setActiveTab("material")}
              className={`pb-1 ${
                activeTab === "material"
                  ? "border-b-2 border-amber-400 text-amber-500"
                  : !savedSteps.general
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 cursor-pointer"
              }`}
            >
              Material Data
            </button>

            <button
              disabled={!savedSteps.material}
              onClick={() => savedSteps.material && setActiveTab("control")}
              className={`pb-1 ${
                activeTab === "control"
                  ? "border-b-2 border-amber-400 text-amber-500"
                  : !savedSteps.material
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 cursor-pointer"
              }`}
            >
              Control Data
            </button>

            <button
              disabled={!savedSteps.control}
              onClick={() => savedSteps.control && setActiveTab("bank")}
              className={`pb-1 ${
                activeTab === "bank"
                  ? "border-b-2 border-amber-400 text-amber-500"
                  : !savedSteps.control
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 cursor-pointer"
              }`}
            >
              Bank Details
            </button>
          </div>

          {/* General Tab */}
          {activeTab === "general" && (
            <>
              <div
                className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2
  max-h-[192px] overflow-y-auto
  [&::-webkit-scrollbar]:hidden scrollbar-none"
              >
                <div className="flex flex-col">
                  <label className="form-label">Long Text</label>
                  <input
                    type="text"
                    name="remarks"
                    value={vendorFormData.remarks}
                    onChange={handleVendorChange}
                    placeholder="Enter Long Text..."
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Email ID</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email ID"
                    value={vendorFormData.email}
                    onChange={handleVendorChange}
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    name="contact_person"
                    placeholder="Enter Contact Person"
                    value={vendorFormData.contact_person}
                    onChange={handleVendorChange}
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter Phone"
                    value={vendorFormData.phone}
                    onChange={handleVendorChange}
                    maxLength={10}
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Mobile No</label>
                  <input
                    type="text"
                    name="mobile"
                    placeholder="Enter Mobile No"
                    value={vendorFormData.mobile}
                    onChange={handleVendorChange}
                    maxLength={10}
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    placeholder="Enter Website URL"
                    value={vendorFormData.website}
                    onChange={handleVendorChange}
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Lead Time</label>
                  <input
                    type="number"
                    name="default_lead_time_days"
                    placeholder="eg. 1"
                    value={vendorFormData.default_lead_time_days}
                    min="0"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        handleVendorChange(e);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Minimum Order Value</label>
                  <input
                    type="number"
                    name="minimum_order_value"
                    placeholder="Enter Minimum Order Value"
                    value={vendorFormData.minimum_order_value}
                    min="0"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        handleVendorChange(e);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="form-label">Billing Address</label>
                  <textarea
                    name="billing_address"
                    value={vendorFormData.billing_address}
                    onChange={handleVendorChange}
                    rows={2}
                    className="flex-1 w-full textarea-input"
                    placeholder="Enter billing address..."
                  ></textarea>
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="form-label">Shipping Address</label>
                  <textarea
                    name="shipping_address"
                    value={vendorFormData.shipping_address}
                    onChange={handleVendorChange}
                    rows={2}
                    className="flex-1 w-full textarea-input"
                    placeholder="Enter shipping address..."
                  ></textarea>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currency"
                    value={vendorFormData.currency}
                    onChange={handleVendorChange}
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
                <div className="flex flex-col">
                  <label className="form-label">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={vendorFormData.country}
                    onChange={handleVendorChange}
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
                <div className="flex flex-col">
                  <label className="form-label">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={vendorFormData.state}
                    onChange={handleVendorChange}
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
                <div className="flex flex-col">
                  <label className="form-label">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={vendorFormData.city}
                    onChange={handleVendorChange}
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
                <div className="flex flex-col">
                  <label className="form-label">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    placeholder="Enter Postal Code"
                    value={vendorFormData.postal_code}
                    onChange={handleVendorChange}
                    className="flex-1 w-full form-input"
                  />
                </div>
              </div>
            </>
          )}
          {/* Material Tab */}
          {activeTab === "material" && (
            <>
              <div
                className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2
  max-h-[192px] overflow-y-auto
  [&::-webkit-scrollbar]:hidden scrollbar-none"
              >
                <div className="flex flex-col">
                  <label className="form-label">
                    Vendor <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={vendorFormData.vendor_name}
                    readOnly
                    className="flex-1 w-full form-input bg-gray-100 cursor-not-allowed"
                  />

                  <input type="hidden" name="vendor" value={createdVendorId} />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="material"
                    value={vendorMaterialFormData.material}
                    onChange={handleVendorMaterialChange}
                    className="flex-1 w-full form-input"
                  >
                    <option value="">Select</option>
                    {materials.map((mt) => (
                      <option key={mt.id} value={mt.id}>
                        {mt.material_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">
                    Unit of Measure <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="purchase_uom"
                    value={vendorMaterialFormData.purchase_uom}
                    onChange={handleVendorMaterialChange}
                    className="flex-1 w-full form-input"
                  >
                    <option value="">Select</option>
                    {uoms.map((uom) => (
                      <option key={uom.id} value={uom.id}>
                        {uom.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter Price"
                    value={vendorMaterialFormData.price}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      const regex = /^\d*(\.\d{0,4})?$/;
                      if (value === "" || regex.test(value)) {
                        handleVendorMaterialChange(e);
                      }
                    }}
                    min="0"
                    step="0.0001"
                    inputMode="decimal"
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Minimum Order Quantity</label>
                  <input
                    type="number"
                    name="minimum_order_quantity"
                    placeholder="Enter Minimum Order Qty"
                    value={vendorMaterialFormData.minimum_order_quantity}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      const regex = /^\d*(\.\d{0,3})?$/;
                      if (value === "" || regex.test(value)) {
                        handleVendorMaterialChange(e);
                      }
                    }}
                    min="0"
                    step="0.001"
                    inputMode="decimal"
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Lead Time</label>
                  <input
                    type="number"
                    name="lead_time_days"
                    placeholder="Enter Lead Time (Days)"
                    value={vendorMaterialFormData.lead_time_days}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      const regex = /^\d*$/;
                      if (value === "" || regex.test(value)) {
                        handleVendorMaterialChange(e);
                      }
                    }}
                    min="0"
                    inputMode="numeric"
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Tax (%)</label>
                  <input
                    type="number"
                    name="tax_percentage"
                    placeholder="Enter Tax (%)"
                    value={vendorMaterialFormData.tax_percentage}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      const regex = /^\d*(\.\d{0,2})?$/;
                      if (value === "" || regex.test(value)) {
                        handleVendorMaterialChange(e);
                      }
                    }}
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Discount (%)</label>
                  <input
                    type="number"
                    name="discount_percentage"
                    placeholder="Enter Discount (%)"
                    value={vendorMaterialFormData.discount_percentage}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      const regex = /^\d*(\.\d{0,2})?$/;
                      if (value === "" || regex.test(value)) {
                        handleVendorMaterialChange(e);
                      }
                    }}
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Valid From</label>
                  <input
                    type="date"
                    name="valid_from"
                    value={vendorMaterialFormData.valid_from}
                    onChange={handleVendorMaterialChange}
                    className="flex-1 w-full form-input"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Valid To</label>
                  <input
                    type="date"
                    name="valid_to"
                    value={vendorMaterialFormData.valid_to}
                    onChange={handleVendorMaterialChange}
                    className="flex-1 w-full form-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end mt-3 gap-2">
            {activeTab !== "general" && (
              <button
                type="button"
                onClick={goToPrevTab}
                className="px-3 py-1.5 cursor-pointer bg-gray-600 rounded h-8 text-white flex items-center gap-1 justify-center transition"
              >
                <FiArrowLeft /> Back
              </button>
            )}

            <button
              type="button"
              onClick={
                activeTab === "general"
                  ? handleVendorSubmit
                  : activeTab === "material"
                    ? handleVendorMaterialSubmit
                    : null
              }
              disabled={savedSteps[activeTab]}
              className={`px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition
      ${
        savedSteps[activeTab]
          ? "bg-amber-200 text-black cursor-not-allowed"
          : "bg-amber-400 text-black"
      }`}
            >
              <FiSave /> Save
            </button>
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
      {reviewPopup && (
        <div className="fixed inset-0 backdrop-blur-[1px] flex justify-center items-center z-50">
          <div className="bg-white pt-0 pb-6 pl-6 pr-6 rounded-md w-11/12 max-w-xl border border-gray-300">
            <div className="flex justify-between items-center border-b-2 pb-2 mt-4 mb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <FiUsers className="text-amber-500 text-lg" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Vendor Review
                </h2>
              </div>

              <button
                onClick={() => setReviewPopup(false)}
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
                      Vendor Code:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.vendor_code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Vendor Name:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.vendor_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Short Text:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.short_name || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Vendor Type:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {getVendorTypeName(vendorFormData?.vendor_type) || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Long Text:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.remarks || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Email ID:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.email || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Contact Person:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.contact_person || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Phone:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.phone || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Mobile No:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.mobile || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Website:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.website || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Lead Time:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.default_lead_time_days || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Minimum Order Value:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.minimum_order_value || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Billing Address:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {vendorFormData?.billing_address || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Shipping Address:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {vendorFormData?.shipping_address || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left">
                      Postal Code:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4">
                      {vendorFormData?.postal_code || "--"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-semibold w-2/5 py-1 text-left align-top">
                      Remarks:
                    </td>
                    <td className="w-3/5 py-1 text-left pl-4 align-top">
                      {vendorFormData?.remarks || "--"}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-center items-center gap-3 mt-4">
                <button
                  onClick={handleFinalSubmit}
                  className="px-3 py-1.5 cursor-pointer bg-amber-400 rounded h-8 text-black flex items-center gap-1 justify-center transition"
                >
                  <FiSave /> Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorOnboarding;
