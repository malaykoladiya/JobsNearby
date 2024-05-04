import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../context/AuthContext";
import { FaBuilding } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";

const ProfileWorkExCard = ({ workExperience = [] }) => {
  const { profile, updateProfile, userType } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPrefix = (userType) => {
    return userType === "jobSeeker" ? "jobSeeker" : "employer";
  };

  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const experienceTypes = ["Full Time", "Part Time", "Internship"];

  const currentYear = new Date().getFullYear();

  function validateEndDates(values, context, monthNames, getPrefix, userType) {
    const startMonthIndex = monthNames.indexOf(
      values[`${getPrefix(userType)}WorkExStartMonth`]
    );
    const endMonthIndex = monthNames.indexOf(
      values[`${getPrefix(userType)}WorkExEndMonth`]
    );
    const startYear = parseInt(
      values[`${getPrefix(userType)}WorkExStartYear`],
      10
    );
    const endYear = parseInt(values[`${getPrefix(userType)}WorkExEndYear`], 10);

    // If the end date fields are not filled out, assume ongoing and return true
    if (
      !values[`${getPrefix(userType)}WorkExEndMonth`] ||
      !values[`${getPrefix(userType)}WorkExEndYear`]
    ) {
      return true;
    }

    // If the end date is provided and it's not valid, return an error
    if (
      endYear < startYear ||
      (endYear === startYear && endMonthIndex < startMonthIndex)
    ) {
      return context.createError({
        path: `${getPrefix(userType)}WorkExEndMonth`,
        message: "End Date must be later than Start Date",
      });
    }

    // If the end date is valid, pass validation
    return true;
  }

  const validationSchema = Yup.object()
    .shape({
      [`${getPrefix(userType)}WorkExPosition`]: Yup.string()
        .trim()
        .required("Position Title is required"),
      [`${getPrefix(userType)}WorkExCompany`]: Yup.string()
        .trim()
        .required("Company is required"),
      [`${getPrefix(userType)}WorkExLocation`]: Yup.string()
        .trim()
        .required("Location is required"),
      [`${getPrefix(userType)}WorkExType`]: Yup.string()
        .required("Experience Type is required")
        .oneOf(experienceTypes.concat(""), "Invalid Experience Type"),
      [`${getPrefix(userType)}WorkExStartMonth`]: Yup.string()
        .oneOf(monthNames, "Invalid Start Month")
        .required("Start Month is required"),
      [`${getPrefix(userType)}WorkExStartYear`]: Yup.number()
        .min(1985, "Start year must be 1985 or later")
        .max(currentYear, `Start Year cannot be in the future`)
        .required("Start Year is required"),
      [`${getPrefix(userType)}WorkExEndMonth`]: Yup.string().oneOf(
        monthNames.concat(""),
        "Invalid End Month"
      ),
      [`${getPrefix(userType)}WorkExEndYear`]: Yup.number().when(
        `${getPrefix(userType)}WorkExEndMonth`,
        (endMonth, schema) => {
          return endMonth
            ? schema.required("End Year is required")
            : schema.notRequired();
        }
      ),
      [`${getPrefix(userType)}WorkExDescription`]: Yup.string(),
    })
    .test(
      "end-date",
      "End Date must be later than Start Date",
      function (values, context) {
        return validateEndDates(
          values,
          context,
          monthNames,
          getPrefix,
          userType
        );
      }
    );

  const initialValues = {
    [`${getPrefix(userType)}WorkExId`]: "",
    [`${getPrefix(userType)}WorkExPosition`]: "",
    [`${getPrefix(userType)}WorkExCompany`]: "",
    [`${getPrefix(userType)}WorkExLocation`]: "",
    [`${getPrefix(userType)}WorkExType`]: "",
    [`${getPrefix(userType)}WorkExStartMonth`]: "",
    [`${getPrefix(userType)}WorkExStartYear`]: "",
    [`${getPrefix(userType)}WorkExEndMonth`]: "",
    [`${getPrefix(userType)}WorkExEndYear`]: "",
    [`${getPrefix(userType)}WorkExDescription`]: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const workExperienceIdKey = `${getPrefix(userType)}WorkExId`;
        const existingIndex = workExperience.findIndex(
          (ex) => ex[workExperienceIdKey] === values[workExperienceIdKey]
        );
        let updatedWorkExperience;

        if (existingIndex >= 0) {
          updatedWorkExperience = workExperience.map((ex, index) =>
            index === existingIndex ? values : ex
          );
        } else {
          updatedWorkExperience = [...workExperience, values];
        }

        const updatedProfile = {
          ...profile,
          [`${getPrefix(userType)}WorkExperience`]: updatedWorkExperience,
        };
        await updateProfile(userType, updatedProfile);
        toast.success("Work experience updated successfully!");
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error updating work experience:", error);
        toast.error("An error occurred while updating work experience.");
      }
      resetForm({});
    },
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState(null);

  const handleAddWorkExClick = () => {
    formik.resetForm();
    setModalMode("add");
    formik.values[`${getPrefix(userType)}WorkExId`] = uuidv4();
    setIsModalOpen(true);
  };

  const handleEditWorkExClick = (experience) => {
    formik.setValues({ ...experience });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (experienceId) => {
    setShowConfirmDialog(true);
    setExperienceToDelete(experienceId);
  };

  const handleConfirmDelete = async () => {
    if (experienceToDelete) {
      await handleDeleteWorkExClick(experienceToDelete);
      setShowConfirmDialog(false);
      setExperienceToDelete(null);
    }
  };

  const handleDeleteWorkExClick = async (seekerWorkExId) => {
    const updatedWorkExperience = profile[
      `${getPrefix(userType)}WorkExperience`
    ].filter((ex) => ex[`${getPrefix(userType)}WorkExId`] !== seekerWorkExId);
    const updatedProfile = {
      ...profile,
      [`${getPrefix(userType)}WorkExperience`]: updatedWorkExperience,
    };

    try {
      const response = await updateProfile(userType, updatedProfile);

      if (response.data && response.success) {
        console.log("Profile updated successfully after deletion");
        toast.success("Work experience deleted successfully!");
      } else {
        console.error("Deletion was unsuccessful, reverting to previous state");
        toast.error("An error occurred while deleting work experience.");
      }
    } catch (error) {
      console.error("Error deleting work experience:", error);
      toast.error("An error occurred while deleting work experience.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    formik.resetForm();
  };

  return (
    <div className="card bg-base-100 shadow-xl min-w-[300px]">
      <div className="card-body">
        <div className="card-actions flex justify-between items-center mb-4">
          <h2 className="card-title text-2xl mb-2">Work Experience</h2>
          <button
            className="btn btn-primary btn-circle btn-sm"
            onClick={handleAddWorkExClick}
          >
            <AiOutlinePlus />
          </button>
        </div>
        {(profile[`${getPrefix(userType)}WorkExperience`] || []).length ===
        0 ? (
          <div className="text-gray-500 text-center my-20">
            Add your WorkExperience here
          </div>
        ) : (
          (profile[`${getPrefix(userType)}WorkExperience`] || []).map(
            (experience, index) => (
              <div
                key={experience[`${getPrefix(userType)}WorkExId`]}
                className={`mb-4 ${
                  index === workExperience.length - 1
                    ? ""
                    : "border-b border-gray-300 pb-4"
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-8 mt-3 md:mr-10 lg:mt-3">
                    <FaBuilding size={40} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        {experience[`${getPrefix(userType)}WorkExPosition`]}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          className="btn btn-circle btn-outline btn-sm"
                          onClick={() => handleEditWorkExClick(experience)}
                        >
                          <AiOutlineEdit />
                        </button>
                        <button
                          className="btn btn-circle btn-outline btn-error btn-sm"
                          onClick={() =>
                            handleDeleteClick(
                              experience[`${getPrefix(userType)}WorkExId`]
                            )
                          }
                        >
                          <AiOutlineDelete />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      {experience[`${getPrefix(userType)}WorkExCompany`]} •{" "}
                      {experience[`${getPrefix(userType)}WorkExLocation`]}
                    </p>
                    <p className="text-gray-600">
                      {experience[`${getPrefix(userType)}WorkExStartMonth`]}{" "}
                      {experience[`${getPrefix(userType)}WorkExStartYear`]} -{" "}
                      {experience[`${getPrefix(userType)}WorkExEndYear`]
                        ? `${
                            experience[`${getPrefix(userType)}WorkExEndMonth`]
                          } ${
                            experience[`${getPrefix(userType)}WorkExEndYear`]
                          }`
                        : "Present"}
                    </p>
                    <ul className="mt-2 list-disc list-inside">
                      {experience[`${getPrefix(userType)}WorkExDescription`]
                        .split("\n")
                        .map((line, index) => (
                          <li
                            key={`${
                              experience[`${getPrefix(userType)}WorkExId`]
                            }-desc-${index}`}
                            className="text-gray-600"
                          >
                            {line}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          )
        )}

        {/* Modal for adding new experience */}
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-xl text-center mb-4">
              {modalMode === "add"
                ? "Add Work Experience"
                : "Edit Work Experience"}
            </h3>

            <form onSubmit={formik.handleSubmit} className="flex flex-col">
              <div className="mb-4">
                <label
                  className="block mb-2 font-bold text-gray-800"
                  htmlFor={`${getPrefix(userType)}WorkExCompany`}
                >
                  Company
                </label>
                <input
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-200 focus:outline-none"
                  type="text"
                  id={`${getPrefix(userType)}WorkExCompany`}
                  name={`${getPrefix(userType)}WorkExCompany`}
                  onBlur={formik.handleBlur}
                  value={formik.values[`${getPrefix(userType)}WorkExCompany`]}
                  onChange={formik.handleChange}
                />
                {formik.touched[`${getPrefix(userType)}WorkExCompany`] &&
                  formik.errors[`${getPrefix(userType)}WorkExCompany`] && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors[`${getPrefix(userType)}WorkExCompany`]}
                    </div>
                  )}
              </div>

              <div className="mb-4">
                <label
                  className="block mb-2 font-bold text-gray-800"
                  htmlFor={`${getPrefix(userType)}WorkExPosition`}
                >
                  Position Title
                </label>
                <input
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-200 focus:outline-none"
                  type="text"
                  id={`${getPrefix(userType)}WorkExPosition`}
                  name={`${getPrefix(userType)}WorkExPosition`}
                  onBlur={formik.handleBlur}
                  value={formik.values[`${getPrefix(userType)}WorkExPosition`]}
                  onChange={formik.handleChange}
                />
                {formik.touched[`${getPrefix(userType)}WorkExPosition`] &&
                  formik.errors[`${getPrefix(userType)}WorkExPosition`] && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors[`${getPrefix(userType)}WorkExPosition`]}
                    </div>
                  )}
              </div>

              <div className="mb-4">
                <label
                  className="block mb-2 font-bold text-gray-800"
                  htmlFor={`${getPrefix(userType)}WorkExLocation`}
                >
                  Location
                </label>
                <input
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-200 focus:outline-none"
                  type="text"
                  id={`${getPrefix(userType)}WorkExLocation`}
                  name={`${getPrefix(userType)}WorkExLocation`}
                  onBlur={formik.handleBlur}
                  value={formik.values[`${getPrefix(userType)}WorkExLocation`]}
                  onChange={formik.handleChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block mb-2 font-bold text-gray-800"
                  htmlFor={`${getPrefix(userType)}WorkExType`}
                >
                  Experience Type
                </label>
                <select
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-200 focus:outline-none"
                  type="text"
                  id={`${getPrefix(userType)}WorkExType`}
                  name={`${getPrefix(userType)}WorkExType`}
                  onBlur={formik.handleBlur}
                  value={formik.values[`${getPrefix(userType)}WorkExType`]}
                  onChange={formik.handleChange}
                >
                  <option value="">Select Type</option>
                  {experienceTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="label font-bold"
                    htmlFor={`${getPrefix(userType)}WorkExStartMonth`}
                  >
                    Start Month
                  </label>
                  <select
                    type="text"
                    id={`${getPrefix(userType)}WorkExStartMonth`}
                    name={`${getPrefix(userType)}WorkExStartMonth`}
                    value={
                      formik.values[`${getPrefix(userType)}WorkExStartMonth`]
                    }
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Month</option>
                    {monthNames.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  {formik.touched[`${getPrefix(userType)}WorkExStartMonth`] &&
                    formik.errors[`${getPrefix(userType)}WorkExStartMonth`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {
                          formik.errors[
                            `${getPrefix(userType)}WorkExStartMonth`
                          ]
                        }
                      </div>
                    )}
                </div>
                <div>
                  <label
                    className="label font-bold"
                    htmlFor={`${getPrefix(userType)}WorkExStartYear`}
                  >
                    Start Year
                  </label>
                  <select
                    type="number"
                    id={`${getPrefix(userType)}WorkExStartYear`}
                    name={`${getPrefix(userType)}WorkExStartYear`}
                    onBlur={formik.handleBlur}
                    value={
                      formik.values[`${getPrefix(userType)}WorkExStartYear`]
                    }
                    onChange={formik.handleChange}
                    placeholder="Year"
                    className="input input-bordered w-full"
                    required
                  >
                    <option value="">Select a year</option>
                    {[...Array(40)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  {formik.touched[`${getPrefix(userType)}WorkExStartYear`] &&
                    formik.errors[`${getPrefix(userType)}WorkExStartYear`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors[`${getPrefix(userType)}WorkExStartYear`]}
                      </div>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="label font-bold"
                    htmlFor={`${getPrefix(userType)}WorkExEndMonth`}
                  >
                    End Month
                  </label>
                  <select
                    id={`${getPrefix(userType)}WorkExEndMonth`}
                    name={`${getPrefix(userType)}WorkExEndMonth`}
                    onBlur={formik.handleBlur}
                    value={
                      formik.values[`${getPrefix(userType)}WorkExEndMonth`]
                    }
                    onChange={formik.handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Month</option>
                    {monthNames.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="label font-bold"
                    htmlFor={`${getPrefix(userType)}WorkExEndYear`}
                  >
                    End Year
                  </label>
                  <select
                    type="number"
                    id={`${getPrefix(userType)}WorkExEndYear`}
                    name={`${getPrefix(userType)}WorkExEndYear`}
                    onBlur={formik.handleBlur}
                    value={formik.values[`${getPrefix(userType)}WorkExEndYear`]}
                    onChange={formik.handleChange}
                    placeholder="Year"
                    className="input input-bordered w-full"
                  >
                    <option value="">Select a year</option>
                    {[...Array(40)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  {formik.values[`${getPrefix(userType)}WorkExEndMonth`] &&
                    formik.errors[`${getPrefix(userType)}WorkExEndYear`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors[`${getPrefix(userType)}WorkExEndYear`]}
                      </div>
                    )}
                  {formik.errors[`${getPrefix(userType)}WorkExEndMonth`] && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors[`${getPrefix(userType)}WorkExEndMonth`]}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-control mt-4 mb-4">
                <label
                  className="block mb-2 font-bold text-gray-800"
                  htmlFor={`${getPrefix(userType)}WorkExDescription`}
                >
                  Description
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-200 focus:outline-none"
                  name={`${getPrefix(userType)}WorkExDescription`}
                  id={`${getPrefix(userType)}WorkExDescription`}
                  value={
                    formik.values[`${getPrefix(userType)}WorkExDescription`]
                  }
                  onChange={formik.handleChange}
                />
              </div>

              <div className="modal-action">
                <button type="button" onClick={closeModal} className="btn">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!formik.isValid || !formik.dirty}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>

        {showConfirmDialog && (
          <div className={`modal modal-open`}>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Delete Experience</h3>
              <p className="py-4">
                Are you sure you want to delete this experience? You won't be
                able to undo this action.
              </p>
              <div className="modal-action">
                <button onClick={handleConfirmDelete} className="btn btn-error">
                  Delete
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfileWorkExCard;
