import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

import httpClient from "../utils/httpClient";

const SettingsPage = () => {
  const { userType, profile, updateProfile } = useAuth(); // Using profile object which contains email
  const [changePassword, setChangePassword] = useState(false);

  // Updated custom classes for styling
  const buttonClass =
    "py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 text-lg w-full cursor-pointer"; // Added cursor-pointer here
  const inputClass =
    "mt-4 block w-full border rounded-lg py-3 px-4 border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg mb-6";

  const UPDATE_PASSWORD_URL =
    userType === "jobSeeker"
      ? "/user/updatepassword"
      : "/employer/updatepassword";

  // Function to prefix the form fields based on the userType
  const prefix = (fieldName) =>
    `${userType}${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;

  const validationSchema = Yup.object({
    [prefix("newEmail")]: Yup.string()
      .email("Invalid email address")
      .notOneOf([profile[prefix("email")]], "New email must be different"),
    [prefix("oldPassword")]: Yup.string(),
    [prefix("newPassword")]: Yup.string().min(
      8,
      "New password must be at least 8 characters"
    ),
  });

  const formik = useFormik({
    initialValues: {
      [prefix("newEmail")]: "",
      [prefix("oldPassword")]: "",
      [prefix("newPassword")]: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);

      const emailField = prefix("email");
      const newEmailField = prefix("newEmail");
      const oldPasswordField = prefix("oldPassword");
      const newPasswordField = prefix("newPassword");

      if (
        values[newEmailField] &&
        values[newEmailField] !== profile[emailField]
      ) {
        // If the new email is different, update it through the updateProfile context method
        try {
          const updatedProfile = {
            ...profile,
            [emailField]: values[newEmailField],
          };
          await updateProfile(userType, updatedProfile);
          toast.success("Email updated successfully.");
        } catch (error) {
          console.error("Failed to update email:", error);
          toast.error("Failed to update email, please try again.");
        }
      }

      if (changePassword && values[newPasswordField]) {
        // Validate oldPassword here
        if (!values[oldPasswordField]) {
          // Handle the error
          console.error("Current password is required to set a new password");
          return;
        }
        const body = {
          [emailField]: profile[emailField], // Current email
          [oldPasswordField]: values[oldPasswordField],
          [newPasswordField]: values[newPasswordField],
        };

        try {
          const response = await httpClient.put(UPDATE_PASSWORD_URL, body);
          if (response.status === 200) {
            toast.success("Password updated successfully.");
          } else {
            // This will log the actual error message from the backend, if any
            console.error("Failed to update password:", response.data.error);
            toast.error(
              response.data.error ||
                "Failed to update password: An unknown error occurred."
            );
          }
        } catch (error) {
          console.error("Failed to update password:", error);
          toast.error(
            error.response.data.error ||
              "Failed to update password, please try again."
          );
        }
      }

      resetForm();
      setSubmitting(false);
    },
  });

  // Dynamic field names
  const currentEmailField = prefix("email");
  const newEmailField = prefix("newEmail");
  const oldPasswordField = prefix("oldPassword");
  const newPasswordField = prefix("newPassword");

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
        Account Settings
      </h2>
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-xl shadow-lg">
        <form onSubmit={formik.handleSubmit}>
          {/* Email update section */}
          <fieldset className="space-y-6 mb-10">
            {" "}
            {/* Adjust spacing for the entire section */}
            <div className="text-2xl font-semibold text-gray-900 mb-6">
              Change Email
            </div>
            <div className="space-y-4">
              <div className="mb-8">
                <label
                  htmlFor={currentEmailField}
                  className="text-lg font-medium text-gray-700"
                >
                  Current Email
                </label>
                <input
                  id={currentEmailField}
                  type="email"
                  disabled
                  value={profile[currentEmailField]}
                  className={`${inputClass} cursor-not-allowed bg-gray-100`}
                />
              </div>
              <div className="mb-8">
                <label
                  htmlFor={newEmailField}
                  className="text-lg font-medium text-gray-700"
                >
                  New Email
                </label>
                <input
                  id={newEmailField}
                  type="email"
                  {...formik.getFieldProps(newEmailField)}
                  className={inputClass}
                  placeholder="Enter new email"
                />
                {formik.touched[newEmailField] &&
                  formik.errors[newEmailField] && (
                    <p className="text-red-500 text-xs italic">
                      {formik.errors[newEmailField]}
                    </p>
                  )}
              </div>
            </div>
            <button
              type="submit"
              className={buttonClass}
              disabled={
                formik.isSubmitting || formik.values[newEmailField] === ""
              }
            >
              Change Email
            </button>
          </fieldset>

          {/* Password update section */}
          <fieldset className="space-y-6">
            <div className="flex items-center mb-6">
              {" "}
              {/* Add space above the checkbox */}
              <input
                id="changePassword"
                type="checkbox"
                checked={changePassword}
                onChange={() => setChangePassword(!changePassword)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="changePassword"
                className="ml-2 text-md font-medium text-gray-700"
              >
                I want to change my password
              </label>
            </div>
            {changePassword && (
              <div className="space-y-4">
                <div className="text-2xl font-semibold text-gray-900 mb-6">
                  Change Password
                </div>

                <div className="mb-8">
                  <label
                    htmlFor={oldPasswordField}
                    className="text-lg font-medium text-gray-700"
                  >
                    Current Password
                  </label>
                  <input
                    id={oldPasswordField}
                    type="password"
                    {...formik.getFieldProps(oldPasswordField)}
                    className={inputClass}
                    placeholder="Enter current password"
                  />
                  {formik.touched[oldPasswordField] &&
                    formik.errors[oldPasswordField] && (
                      <p className="text-red-500 text-xs italic">
                        {formik.errors[oldPasswordField]}
                      </p>
                    )}
                </div>

                <div className="mb-8">
                  <label
                    htmlFor={newPasswordField}
                    className="text-lg font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    id={newPasswordField}
                    type="password"
                    {...formik.getFieldProps(newPasswordField)}
                    className={inputClass}
                    placeholder="Enter new password"
                  />
                  {formik.touched[newPasswordField] &&
                    formik.errors[newPasswordField] && (
                      <p className="text-red-500 text-xs italic">
                        {formik.errors[newPasswordField]}
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  className={buttonClass}
                  disabled={formik.isSubmitting}
                >
                  Change Password
                </button>
              </div>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
