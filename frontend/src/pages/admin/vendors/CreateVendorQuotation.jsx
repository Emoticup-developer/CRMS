import { useEffect, useRef, useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import mainConfig from "../../../config/mainConfig";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { FiInfo, FiSave, FiUsers } from "react-icons/fi";
import {
  createVenderQuotation,
  fetchVenders,
  fetchUsers,
  fetchCompanies,
} from "../../../store/slices/vendorQuotationSlice";
import { useDispatch, useSelector } from "react-redux";

const CreateVendorQuotation = () => {
  const dispatch = useDispatch();
  const { vendors, users, companies } = useSelector(
    (state) => state.vendorQuotations,
  );

  const quotationRef = useRef(null);

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
    vendor: "",
    quotation_number: "",
    quotation: null,
    date_of_quotation: "",
    quantity: "",
    lead_time_days: "",
    creator: "",
    company: "",
  });

  useEffect(() => {
    dispatch(fetchVenders());
    dispatch(fetchUsers());
    dispatch(fetchCompanies());
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

  const handleQuotationChange = () => {
    const file = quotationRef.current?.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showTemporaryMessage("Only PDF files are allowed!", "error");
      quotationRef.current.value = "";
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionType("Save");

    if (
      !formData.vendor ||
      !formData.quotation_number ||
      !formData.date_of_quotation ||
      !formData.quantity ||
      !formData.lead_time_days ||
      !formData.creator ||
      !formData.company
    ) {
      showTemporaryMessage("Please fill in all required fields!", "error");
      setTimeout(() => setActionType(""), 3000);
      return;
    }

    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        submitData.append(key, value);
      }
    });

    const file = quotationRef.current?.files?.[0];
    if (file) {
      submitData.append("quotation", file);
    }

    try {
      const res = await dispatch(createVenderQuotation(submitData)).unwrap();
      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage(
          "Vendor Quotation created successfully!",
          "success",
        );
      } else if (res.status === 202) {
        showTemporaryMessage("Vendor Quotation create accepted!", "success");
      } else {
        showTemporaryMessage("Unexpected response from server.", "error");
        return;
      }
      setFormData({
        vendor: "",
        quotation_number: "",
        quotation: null,
        date_of_quotation: "",
        quantity: "",
        lead_time_days: "",
        creator: "",
        company: "",
      });
      if (quotationRef.current) {
        quotationRef.current.value = "";
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
        showTemporaryMessage("Failed to create vendor quotation!", "error");
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
                        <FiUsers className="text-amber-500 text-lg" />
                        <h2 className="text-lg font-semibold text-gray-700">
                          Create Vendor Quotation
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
                            Vendor <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="vendor"
                            value={formData.vendor}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {vendors.map((vs) => (
                              <option key={vs.id} value={vs.id}>
                                {vs.vendor_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Quotation Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="quotation_number"
                            placeholder="Enter Quotation Number"
                            value={formData.quotation_number}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Quotation <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            name="quotation"
                            accept="application/pdf"
                            ref={quotationRef}
                            onChange={handleQuotationChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="date_of_quotation"
                            value={formData.date_of_quotation}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            placeholder="Enter Quantity"
                            value={formData.quantity}
                            onKeyDown={(e) => {
                              if (["-", "+", "e", "E"].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^\d*(\.\d{0,3})?$/;
                              if (value === "" || regex.test(value)) {
                                handleChange(e);
                              }
                            }}
                            min="0"
                            step="0.001"
                            inputMode="decimal"
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Lead Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="lead_time_days"
                            placeholder="Enter Lead Time (Days)"
                            value={formData.lead_time_days}
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
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Creator <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="creator"
                            value={formData.creator}
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
                            Company <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="company"
                            value={formData.company}
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

export default CreateVendorQuotation;
