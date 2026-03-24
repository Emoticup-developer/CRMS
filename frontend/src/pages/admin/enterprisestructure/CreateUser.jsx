import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";
import mainConfig from "../../../config/mainConfig";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { FiInfo, FiSave, FiUsers } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  fetchCompanies,
  fetchUserTypes,
  fetchPositions,
  fetchUserStatus,
  fetchUsers,
} from "../../../store/slices/userSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const CreateUser = () => {
  const dispatch = useDispatch();
  const { companies, userTypes, positions, statuses, users } = useSelector(
    (state) => state.users,
  );

  const photoRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchUserTypes());
    dispatch(fetchPositions());
    dispatch(fetchUserStatus());
    dispatch(fetchUsers());
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
      !formData.username ||
      !formData.password ||
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

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    const file = photoRef.current?.files?.[0];
    if (file) {
      submitData.append("user_photo", file);
    }

    try {
      const res = await dispatch(createUser(submitData)).unwrap();
      if (res.status === 200 || res.status === 201) {
        showTemporaryMessage("User created successfully!", "success");
      } else if (res.status === 202) {
        showTemporaryMessage("User create accepted!", "success");
      } else {
        showTemporaryMessage("Unexpected response from server.", "error");
        return;
      }
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
        showTemporaryMessage("Failed to create user!", "error");
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
                          Create User
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
                            Username <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="username"
                            placeholder="Enter Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Password <span className="text-red-500">*</span>
                          </label>

                          <div className="relative flex-1 w-full">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              placeholder="Enter Password"
                              value={formData.password}
                              onChange={handleChange}
                              className="flex-1 w-full form-input pr-10"
                            />

                            <span
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                            >
                              {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Email ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            placeholder="Enter Email ID"
                            className="flex-1 w-full form-input"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            placeholder="Enter First Name"
                            className="flex-1 w-full form-input"
                            value={formData.first_name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            placeholder="Enter Last Name"
                            className="flex-1 w-full form-input"
                            value={formData.last_name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Photo
                          </label>
                          <input
                            type="file"
                            name="user_photo"
                            accept="image/png, image/jpeg"
                            ref={photoRef}
                            onChange={handlePhotoChange}
                            className="flex-1 w-full form-input"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="user_code"
                            placeholder="Enter User Code"
                            className="flex-1 w-full form-input"
                            value={formData.user_code}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Company <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="user_company"
                            value={formData.user_company}
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
                            Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="user_type"
                            value={formData.user_type}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {userTypes.map((ut) => (
                              <option key={ut.id} value={ut.id}>
                                {ut.type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Position <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            {positions.map((ps) => (
                              <option key={ps.id} value={ps.id}>
                                {ps.position}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Manager
                          </label>
                          <select
                            name="manager"
                            value={formData.manager}
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
                            Mobile No <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="phone_number"
                            placeholder="Enter Mobile No"
                            className="flex-1 w-full form-input"
                            maxLength={10}
                            value={formData.phone_number}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Emergency Mobile No{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="emergency_contact"
                            placeholder="Enter Emergency Mobile No"
                            className="flex-1 w-full form-input"
                            maxLength={10}
                            value={formData.emergency_contact}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Relation Mobile No{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="relationship_emergency_contact"
                            placeholder="Enter Relation Mobile No"
                            className="flex-1 w-full form-input"
                            maxLength={10}
                            value={formData.relationship_emergency_contact}
                            onChange={handleChange}
                          />
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
                        <div className="flex items-center">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Active <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="is_active"
                            value={formData.is_active}
                            onChange={handleChange}
                            className="flex-1 w-full form-input"
                          >
                            <option value="">Select</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                        <div className="flex items-start col-span-2">
                          <label className="w-[200px] text-sm font-medium text-gray-700">
                            Remarks
                          </label>
                          <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows={2}
                            className="flex-1 w-full textarea-input"
                            placeholder="Enter remarks..."
                          ></textarea>
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

export default CreateUser;
