import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import Spinner from "../components/Spinner/Spinner";

const Login = () => {
  const { login, userType } = useAuth(); // Get userType from AuthContext

  const [loading, setLoading] = useState(false); // State to manage loading

  const navigate = useNavigate();

  const getPrefix = (userType) => {
    return userType === "jobSeeker" ? "jobSeeker" : "employer";
  };

  // Form validation schema
  const validationSchema = Yup.object({
    [`${getPrefix(userType)}Email`]: Yup.string()
      .trim()
      .email("Invalid email address")
      .required("Email is required"),
    [`${getPrefix(userType)}Password`]: Yup.string()
      .trim()
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      [`${getPrefix(userType)}Email`]: "",
      [`${getPrefix(userType)}Password`]: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const credentials = {
        [`${getPrefix(userType)}Email`]: values[`${getPrefix(userType)}Email`],
        [`${getPrefix(userType)}Password`]:
          values[`${getPrefix(userType)}Password`],
      };

      try {
        await login(userType, credentials);
        toast.success("Signed in successfully");
        navigate(`/${userType}/home`);
      } catch (err) {
        toast.error(
          "Login failed. Please check your credentials and try again."
        );
        setLoading(false);
      }
    },
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-auto transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          {userType === "employer" ? "Employer" : "Job Seeker"} Login
        </h1>
        <form onSubmit={formik.handleSubmit}>
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
          <div className="mb-6">
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
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
