import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { loginUser, clearError } from "../store/slices/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const isProduction = import.meta.env.MODE === "production";

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isHoveringLogin, setIsHoveringLogin] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    language: "",
    server: isProduction ? "prod" : "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
      dispatch(clearError());
    }, 3000);
  };

  useEffect(() => {
    if (user?.access && user?.position) {
      showTemporaryMessage("Login successfully!", "success");

      setTimeout(() => {
        switch (user.position) {
          case "ADMIN":
            navigate("/admin/home");
            break;
          case "MANAGER":
            navigate("/manager/home");
            break;
          case "GENERALMANAGER":
            navigate("/general-manager/home");
            break;
          case "VENDOR":
            navigate("/partner/partner-onboarding");
            break;
          case "ASSOCIATE":
            navigate("/associate/home");
            break;
          case "EXECUTIVES":
            navigate("/executives/home");
            break;
          default:
            navigate("/");
        }
      }, 1000);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      showTemporaryMessage(error, "error");
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showTemporaryMessage("Please enter username and password", "error");
      return;
    }

    if (!formData.language) {
      showTemporaryMessage("Please select language", "error");
      return;
    }

    if (!isProduction && !formData.server) {
      showTemporaryMessage("Please select server", "error");
      return;
    }

    await dispatch(
      loginUser({
        username: formData.username,
        password: formData.password,
        server: isProduction ? "prod" : formData.server,
      }),
    );
  };

  return (
    <div
      className={`flex items-center justify-center h-screen transition-colors duration-300 ${
        isHoveringLogin ? "bg-gray-200" : "bg-gray-400"
      }`}
    >
      {message.text && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
          <div
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded border shadow-lg ${
              message.type === "success"
                ? "text-green-700 border-green-200 bg-green-50"
                : "text-red-700 border-red-200 bg-red-50"
            }`}
          >
            <FiInfo />
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-4xl shadow-lg px-8 py-8 w-full max-w-[320px] h-[370px] space-y-3"
      >
        <div className="flex justify-center">
          <img src={logo} alt="Logo" className="h-20 object-contain mb-2" />
        </div>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="form-input w-full"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="form-input w-full"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-2 text-gray-500 cursor-pointer"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        <div className="flex justify-between gap-2">
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="form-input w-full"
          >
            <option value="">Language</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="kn">Kannada</option>
            <option value="ta">Tamil</option>
          </select>
          {!isProduction && (
            <select
              name="server"
              value={formData.server}
              onChange={handleChange}
              className="form-input w-full"
            >
              <option value="">Server</option>
              <option value="dev">Development</option>
              <option value="test">Test</option>
              <option value="prod">Production</option>
            </select>
          )}
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 w-3 h-3 accent-amber-500 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm">
              Remember me
            </label>
          </div>

          <div>
            <a href="/forgot-password" className="text-blue-500 text-sm">
              forgot password?
            </a>
          </div>
        </div>

        <div className="flex justify-center mt-5">
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setIsHoveringLogin(true)}
            onMouseLeave={() => setIsHoveringLogin(false)}
            className="px-3 py-1.5 bg-amber-400 rounded-full text-sm font-medium h-8 cursor-pointer text-black transition hover:scale-110"
          >
            {loading ? "Login" : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
