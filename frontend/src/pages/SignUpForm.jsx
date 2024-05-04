import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";

const SignUpForm = () => {
  const { register, login, userType } = useAuth();
  const navigate = useNavigate();

  const getPrefix = (userType) => {
    return userType === "jobSeeker" ? "jobSeeker" : "employer";
  };

  const validationSchema = Yup.object({
    [`${getPrefix(userType)}FirstName`]: Yup.string()
      .trim()
      .required("First name is required"),
    [`${getPrefix(userType)}LastName`]: Yup.string()
      .trim()
      .required("Last name is required"),
    [`${getPrefix(userType)}Email`]: Yup.string()
      .trim()
      .email("Invalid email address")
      .required("Email is required"),
    [`${getPrefix(userType)}Password`]: Yup.string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    [`${getPrefix(userType)}ConfirmPassword`]: Yup.string()
      .trim()
      .oneOf(
        [Yup.ref(`${getPrefix(userType)}Password`), null],
        "Passwords must match"
      )
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      [`${getPrefix(userType)}FirstName`]: "",
      [`${getPrefix(userType)}LastName`]: "",
      [`${getPrefix(userType)}Email`]: "",
      [`${getPrefix(userType)}Password`]: "",
      [`${getPrefix(userType)}ConfirmPassword`]: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const signUpData = {
        [`${getPrefix(userType)}FirstName`]:
          values[`${getPrefix(userType)}FirstName`],
        [`${getPrefix(userType)}LastName`]:
          values[`${getPrefix(userType)}LastName`],
        [`${getPrefix(userType)}Email`]: values[`${getPrefix(userType)}Email`],
        [`${getPrefix(userType)}Password`]:
          values[`${getPrefix(userType)}Password`],
      };
      const loginData = {
        [`${getPrefix(userType)}Email`]: values[`${getPrefix(userType)}Email`],
        [`${getPrefix(userType)}Password`]:
          values[`${getPrefix(userType)}Password`],
      };
      try {
        await register(userType, signUpData);
        toast.success("Registration successful");

        await login(userType, loginData);
        toast.success("Signed in successfully");

        navigate(`/${userType}/home`, { state: { isNewUser: true } });
      } catch (err) {
        toast.error("Registration failed. Please try again.");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-auto transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          {userType === "employer" ? "Employer" : "Job Seeker"} Sign Up
        </h1>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor={`${getPrefix(userType)}FirstName`}
              className="block text-gray-700 font-semibold mb-2"
            >
              First Name:
            </label>
            <input
              type="text"
              id={`${getPrefix(userType)}FirstName`}
              name={`${getPrefix(userType)}FirstName`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values[`${getPrefix(userType)}FirstName`]}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
            {formik.touched[`${getPrefix(userType)}FirstName`] &&
              formik.errors[`${getPrefix(userType)}FirstName`] && (
                <div className="text-red-500 mt-2">
                  {formik.errors[`${getPrefix(userType)}FirstName`]}
                </div>
              )}
          </div>
          <div className="mb-4">
            <label
              htmlFor={`${getPrefix(userType)}LastName`}
              className="block text-gray-700 font-semibold mb-2"
            >
              Last Name:
            </label>
            <input
              type="text"
              id={`${getPrefix(userType)}LastName`}
              name={`${getPrefix(userType)}LastName`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values[`${getPrefix(userType)}LastName`]}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
            {formik.touched[`${getPrefix(userType)}LastName`] &&
              formik.errors[`${getPrefix(userType)}LastName`] && (
                <div className="text-red-500 mt-2">
                  {formik.errors[`${getPrefix(userType)}LastName`]}
                </div>
              )}
          </div>
          <div className="mb-4">
            <label
              htmlFor={`${getPrefix(userType)}Email`}
              className="block text-gray-700 font-semibold mb-2"
            >
              Email:
            </label>
            <input
              type="email"
              id={`${getPrefix(userType)}Email`}
              name={`${getPrefix(userType)}Email`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values[`${getPrefix(userType)}Email`]}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
            {formik.touched[`${getPrefix(userType)}Email`] &&
              formik.errors[`${getPrefix(userType)}Email`] && (
                <div className="text-red-500 mt-2">
                  {formik.errors[`${getPrefix(userType)}Email`]}
                </div>
              )}
          </div>
          <div className="mb-4">
            <label
              htmlFor={`${getPrefix(userType)}Password`}
              className="block text-gray-700 font-semibold mb-2"
            >
              Password:
            </label>
            <input
              type="password"
              id={`${getPrefix(userType)}Password`}
              name={`${getPrefix(userType)}Password`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values[`${getPrefix(userType)}Password`]}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
            {formik.touched[`${getPrefix(userType)}Password`] &&
              formik.errors[`${getPrefix(userType)}Password`] && (
                <div className="text-red-500 mt-2">
                  {formik.errors[`${getPrefix(userType)}Password`]}
                </div>
              )}
          </div>
          <div className="mb-6">
            <label
              htmlFor={`${getPrefix(userType)}ConfirmPassword`}
              className="block text-gray-700 font-semibold mb-2"
            >
              Confirm Password:
            </label>
            <input
              type="password"
              id={`${getPrefix(userType)}ConfirmPassword`}
              name={`${getPrefix(userType)}ConfirmPassword`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values[`${getPrefix(userType)}ConfirmPassword`]}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
            {formik.touched[`${getPrefix(userType)}ConfirmPassword`] &&
              formik.errors[`${getPrefix(userType)}ConfirmPassword`] && (
                <div className="text-red-500 mt-2">
                  {formik.errors[`${getPrefix(userType)}ConfirmPassword`]}
                </div>
              )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
