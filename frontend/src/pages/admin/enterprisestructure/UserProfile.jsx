import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import AdminSidebar from "../../../components/AdminSidebar";
import { updateUser } from "../../../store/slices/userSlice";
import { fetchUserByUsername } from "../../../store/slices/userProfileSlice";
import api from "../../../utils/api";
import { FiEdit, FiUser } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";

const UserProfile = () => {
  const dispatch = useDispatch();
  const [actionType, setActionType] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const { selectedUser, loading, error } = useSelector(
    (state) => state.selectedUser,
  );

  const [existingFiles, setExistingFiles] = useState({
    user_photo: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const photoRef = useRef(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // ✅ Get username from cookies
  const username = Cookies.get("username");

  useEffect(() => {
    if (username) {
      dispatch(fetchUserByUsername(username));
    }
  }, [dispatch, username]);

  // ✅ OPEN EDIT + PREFILL
  const handleOpenEdit = (user) => {
    setEditId(user.id);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      emergency_contact: user.emergency_contact || "",
      relationship_emergency_contact: user.relationship_emergency_contact || "",
      remarks: user.remarks || "",
      user_photo: null,
    });
    setExistingFiles({
      user_photo: user.user_photo || "",
    });
    setIsEditOpen(true);
  };

  // const handleOpenEdit = (selectedUser) => {
  //   setEditId(selectedUser.id);
  //   setFormData({
  //     username: selectedUser.username || "",
  //     email: selectedUser.email || "",
  //     first_name: selectedUser.first_name || "",
  //     last_name: selectedUser.last_name || "",
  //     password: "",
  //     is_active:
  //       selectedUser.is_active === null
  //         ? ""
  //         : selectedUser.is_active
  //           ? "true"
  //           : "false",
  //     user_code: selectedUser.user_code || "",
  //     user_photo: null,
  //     user_company: selectedUser.user_company?.id || "",
  //     user_type: selectedUser.user_type?.id || "",
  //     position: selectedUser.position?.id || "",
  //     status: selectedUser.status?.id || "",
  //     manager: selectedUser.manager?.id || "",
  //     phone_number: selectedUser.phone_number || "",
  //     emergency_contact: selectedUser.emergency_contact || "",
  //     relationship_emergency_contact:
  //       selectedUser.relationship_emergency_contact || "",
  //     remarks: selectedUser.remarks || "",
  //   });
  //   setExistingFiles({
  //     user_photo: selectedUser.user_photo || "",
  //   });
  //   setShowEditModal(true);
  // };

  // useEffect(() => {
  //   if (selectedUser) {
  //     setFormData({
  //       first_name: selectedUser.first_name || "",
  //       last_name: selectedUser.last_name || "",
  //       email: selectedUser.email || "",
  //       phone_number: selectedUser.phone_number || "",
  //       emergency_contact: selectedUser.emergency_contact || "",
  //       relationship_emergency_contact:
  //         selectedUser.relationship_emergency_contact || "",
  //       remarks: selectedUser.remarks || "",
  //     });
  //   }
  // }, [selectedUser]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    console.log("Submitting Edit with data:", formData);

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "user_photo") {
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
      !formData.first_name ||
      !formData.email ||
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

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block fixed top-0 left-0 h-full w-[325px] z-40">
        <AdminSidebar />
      </div>

      <main className="flex-1 ml-0 lg:ml-[325px] mt-[148px] p-3 overflow-y-auto bg-white backdrop-blur-sm shadow-inner [&::-webkit-scrollbar]:hidden scrollbar-none">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* ✅ EDIT MODAL */}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
              <div className="flex justify-between px-4 py-2">
                <h2>Edit Profile</h2>
                <button onClick={handleCloseEditModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="p-4 grid grid-cols-2 gap-2">
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  label="First Name"
                />
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  label="Last Name"
                />
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  label="Email"
                />
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  label="Phone"
                />
                <Input
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  label="Emergency"
                />
                <Input
                  name="relationship_emergency_contact"
                  value={formData.relationship_emergency_contact}
                  onChange={handleChange}
                  label="Relation"
                />

                <div className="col-span-2">
                  <Input
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    label="Remarks"
                  />

                  {/* IMAGE */}
                  <input
                    type="file"
                    ref={photoRef}
                    onChange={handlePhotoChange}
                    className="mt-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 p-3">
                <button onClick={() => setIsEditOpen(false)}>Cancel</button>
                <button
                  onClick={handleSubmitEdit}
                  className="bg-amber-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 🔶 LEFT PROFILE CARD */}
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
              {/* Profile */}
              <div className="flex flex-col items-center text-center">
                {/* ✅ FIXED IMAGE ERROR */}
                {selectedUser?.user_photo ? (
                  <img
                    src={
                      selectedUser.user_photo.startsWith("http")
                        ? selectedUser.user_photo
                        : `${api.defaults.baseURL}${selectedUser.user_photo}`
                    }
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <FiUser />
                  </div>
                )}

                <h2 className="mt-3 text-lg font-semibold text-gray-800">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedUser.position?.position}
                </p>
              </div>
              <button
                onClick={() => handleOpenEdit(selectedUser)}
                className="absolute bottom-3 right-3"
              >
                <FiEdit />
              </button>

              {/* Basic Info */}
              <div className="space-y-3">
                <InfoRow label="Email" value={selectedUser.email} />
                <InfoRow label="Phone" value={selectedUser.phone_number} />
                <InfoRow label="Username" value={selectedUser.username} />
              </div>
            </div>

            {/* 🔶 RIGHT SIDE */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm px-4">
                <div className="flex gap-6  overflow-x-auto">
                  {[
                    { key: "basic", label: "Personal Info" },
                    { key: "work", label: "Job Info" },
                    { key: "company", label: "Company" },
                    { key: "security", label: "Security" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative py-3 text-sm font-medium ${
                        activeTab === tab.key
                          ? "text-amber-600"
                          : "text-gray-500"
                      }`}
                    >
                      {tab.label}

                      {activeTab === tab.key && (
                        <span className="absolute left-0 bottom-0 w-full h-[2px] bg-amber-500"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-xl shadow-sm p-5 mt-4">
                {/* PERSONAL */}
                {activeTab === "basic" && (
                  <Section title="Personal Information">
                    <InfoRow
                      label="First Name"
                      value={selectedUser.first_name}
                    />
                    <InfoRow label="Last Name" value={selectedUser.last_name} />
                    <InfoRow label="Email" value={selectedUser.email} />
                    <InfoRow label="Phone" value={selectedUser.phone_number} />
                    <InfoRow
                      label="Date Joined"
                      value={selectedUser.date_joined}
                    />
                    <InfoRow
                      label="Last Login"
                      value={selectedUser.last_login}
                    />
                  </Section>
                )}

                {/* WORK */}
                {activeTab === "work" && (
                  <Section title="Job Information">
                    <InfoRow
                      label="Employee Code"
                      value={selectedUser.user_code}
                    />
                    <InfoRow
                      label="Position"
                      value={selectedUser.position?.position}
                    />
                    <InfoRow
                      label="User Type"
                      value={selectedUser.user_type?.type}
                    />
                    <InfoRow
                      label="Manager"
                      value={selectedUser.manager?.username}
                    />
                    <InfoRow
                      label="Is Staff"
                      value={selectedUser.is_staff ? "Yes" : "No"}
                    />
                    <InfoRow
                      label="Superuser"
                      value={selectedUser.is_superuser ? "Yes" : "No"}
                    />
                  </Section>
                )}

                {/* COMPANY */}
                {activeTab === "company" && (
                  <Section title="Company Information">
                    <InfoRow
                      label="Company Name"
                      value={selectedUser.user_company?.company_name}
                    />
                    <InfoRow
                      label="Company Code"
                      value={selectedUser.user_company?.company_code}
                    />
                    <InfoRow
                      label="Organization ID"
                      value={selectedUser.user_company?.organization_id}
                    />
                  </Section>
                )}

                {/* SECURITY */}
                {activeTab === "security" && (
                  <Section title="Security & Emergency">
                    <InfoRow
                      label="Emergency Contact"
                      value={selectedUser.emergency_contact}
                    />
                    <InfoRow
                      label="Relationship"
                      value={selectedUser.relationship_emergency_contact}
                    />
                    <InfoRow label="Remarks" value={selectedUser.remarks} />
                    <InfoRow
                      label="Last Login IP"
                      value={selectedUser.last_login_ip}
                    />
                  </Section>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
const Section = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>

    <div className="space-y-2">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b last:border-none border-gray-300">
    <span className="text-sm text-gray-500 w-1/2">{label}</span>
    <span className="text-sm font-medium text-gray-800 w-1/2 text-left">
      {value || "—"}
    </span>
  </div>
);
const Input = ({ label, name, value, onChange }) => (
  <div>
    <label className="text-[10px] text-gray-500">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full mt-0.5 px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-400"
    />
  </div>
);
export default UserProfile;
