import React from "react";
import { IoMail, IoLockClosed, IoEye, IoEyeOff, IoWarning, IoCheckmarkCircle } from "react-icons/io5";

const SignUpForm = ({
  data,
  setData,
  fieldErrors,
  setFieldErrors,
  passwordError,
  setPasswordError,
  showPassword,
  showConfirmPassword,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  loading,
  handleSignUp,
  showOtpInput,
  handleOtpSubmit,
  handleOtpChange,
  response,
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
    if (name === "password" || name === "confirmPassword") setPasswordError("");
  };

  return (
    <div>
      {!showOtpInput ? (
        <>
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
          <div className="mb-3">
            <div className="relative flex items-center h-12">
              <IoLockClosed className="absolute left-3 text-gray-400 w-5 h-5" aria-label="Confirm Password icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={data.confirmPassword}
                onChange={handleChange}
                className={`w-full h-12 bg-gray-800 text-white pl-10 pr-10 rounded-lg focus:outline-none ${
                  passwordError ? "border-red-500 border" : ""
                }`}
                required
                aria-label="Confirm Password"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 text-gray-400 hover:text-white"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
              </button>
            </div>
            {passwordError && (
              <div className="flex items-center text-red-500 text-xs mt-2">
                <IoWarning className="w-4 h-4 mr-1 flex-shrink-0" aria-label="Error" />
                <p>{passwordError}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-bold transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
            aria-label="Sign Up"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-2 text-center">OTP valid for 5 minutes only</p>
          <div className="flex justify-between mb-4">
            {data.otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                className={`w-10 h-10 bg-gray-800 text-white text-center rounded-lg focus:outline-none border ${
                  fieldErrors.otp ? "border-red-500" : "border-gray-700"
                } focus:border-blue-500`}
                required
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
          {fieldErrors.otp && (
            <div className="flex items-center text-red-500 text-xs mb-2">
              <IoWarning className="w-4 h-4 mr-1 flex-shrink-0" aria-label="Error" />
              <p>{fieldErrors.otp}</p>
            </div>
          )}
          <div className="flex items-center text-green-500 text-sm mb-4">
            <IoCheckmarkCircle className="w-5 h-5 mr-2 flex-shrink-0" aria-label="Success" />
            <p>{response?.data?.message || "Signup successful. Please check your email for OTP."}</p>
          </div>
          <button
            onClick={handleOtpSubmit}
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-bold transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
            aria-label="Verify OTP"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
    </div>
  );
};

export default SignUpForm;