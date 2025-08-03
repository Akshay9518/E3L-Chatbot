import React from "react";
import { IoMail, IoLockClosed, IoEye, IoEyeOff, IoWarning } from "react-icons/io5";

const LoginForm = ({
  data,
  setData,
  fieldErrors,
  setFieldErrors,
  passwordError,
  setPasswordError,
  showPassword,
  togglePasswordVisibility,
  loading,
  handleLogin,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
    if (name === "password") setPasswordError("");
  };

  return (
    <div>
      <div className="mb-3">
        <div className="relative flex items-center h-12">
          <IoMail className="absolute left-3 text-gray-400 w-5 h-5" aria-label="Email icon" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={data.email}
            onChange={handleChange}
            className={`w-full h-12 bg-gray-800 text-white pl-10 pr-3 rounded-lg focus:outline-none ${
              fieldErrors.email ? "border-red-500 border" : ""
            }`}
            required
            aria-label="Email"
          />
        </div>
        {fieldErrors.email && (
          <div className="flex items-center text-red-500 text-xs mt-2">
            <IoWarning className="w-4 h-4 mr-1 flex-shrink-0" aria-label="Error" />
            <p>{fieldErrors.email}</p>
          </div>
        )}
      </div>
      <div className="mb-3">
        <div className="relative flex items-center h-12">
          <IoLockClosed className="absolute left-3 text-gray-400 w-5 h-5" aria-label="Password icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            className={`w-full h-12 bg-gray-800 text-white pl-10 pr-10 rounded-lg focus:outline-none ${
              fieldErrors.password || passwordError ? "border-red-500 border" : ""
            }`}
            required
            aria-label="Password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 text-gray-400 hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
          </button>
        </div>
        {fieldErrors.password && (
          <div className="flex items-center text-red-500 text-xs mt-2">
            <IoWarning className="w-4 h-4 mr-1 flex-shrink-0" aria-label="Error" />
            <p>{fieldErrors.password}</p>
          </div>
        )}
      </div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full py-2 rounded-lg text-white font-bold transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
        }`}
        aria-label="Login"
      >
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  );
};

export default LoginForm;