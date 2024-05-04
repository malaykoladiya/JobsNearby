import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../context/AuthContext";
import { FaUniversity } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";

const ProfileEduCard = ({ education = [] }) => {
  const { profile, updateProfile, userType } = useAuth();
  const [isModalOpen, setModalIsOpen] = useState(false);

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

  const currentYear = new Date().getFullYear();

  function validateEndDates(values, context, monthNames, getPrefix, userType) {
    const startMonthIndex = monthNames.indexOf(
      values[`${getPrefix(userType)}EduStartMonth`]
    );
    const endMonthIndex = monthNames.indexOf(
      values[`${getPrefix(userType)}EduEndMonth`]
    );
    const startYear = parseInt(
      values[`${getPrefix(userType)}EduStartYear`],
      10
    );
    const endYear = parseInt(values[`${getPrefix(userType)}EduEndYear`], 10);

    // If the end date fields are not filled out, assume ongoing and return true
    if (
      !values[`${getPrefix(userType)}EduEndMonth`] ||
      !values[`${getPrefix(userType)}EduEndYear`]
    ) {
      return true;
    }

    // If the end date is provided and it's not valid, return an error
    if (
      endYear < startYear ||
      (endYear === startYear && endMonthIndex < startMonthIndex)
    ) {
      return context.createError({
        path: `${getPrefix(userType)}EduEndMonth`,
        message: "End Date must be later than Start Date",
      });
    }

    // If the end date is valid, pass validation
    return true;
  }

  const validationSchema = Yup.object()
    .shape({
      [`${getPrefix(userType)}EduSchoolName`]: Yup.string()
        .trim()
        .required("School Name is required"),
      [`${getPrefix(userType)}EduDegreeType`]: Yup.string()
        .trim()
        .required("Degree Type is required"),
      [`${getPrefix(userType)}EduMajor`]: Yup.string()
        .trim()
        .required("Major is required"),
      [`${getPrefix(userType)}EduStartMonth`]: Yup.string()
        .oneOf(monthNames, "Invalid Month")
        .required("Start Month is required"),
      [`${getPrefix(userType)}EduStartYear`]: Yup.number()
        .min(1985, "Start year must be 1985 or later")
        .max(currentYear, `Start Year cannot be in the future`)
        .required("Start Year is required"),
      [`${getPrefix(userType)}EduEndMonth`]: Yup.string().oneOf(
        monthNames.concat(""),
        "Invalid Month"
      ),
      // Not marked as required to allow currently enrolled students to leave this blank.

      [`${getPrefix(userType)}EduEndYear`]: Yup.number()
        .max(
          currentYear + 6,
          `End Year cannot be more than 6 years in the future`
        )
        .when(`${getPrefix(userType)}EduEndMonth`, (endMonth, schema) => {
          return endMonth
            ? schema.required("End Year is required")
            : schema.notRequired();
        }),
      // Not marked as required to allow currently enrolled students to leave this blank.

      [`${getPrefix(userType)}EduGPA`]: Yup.number()
        .min(0.0, "GPA must be between 0.0 and 4.0")
        .max(4.0, "GPA must be between 0.0 and 4.0")
        .nullable(),
      // Marked as nullable to allow for educational systems without GPA
    })
    .test(
      "dates-test",
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
    [`${getPrefix(userType)}EducationId`]: "",
    [`${getPrefix(userType)}EduSchoolName`]: "",
    [`${getPrefix(userType)}EduDegreeType`]: "",
    [`${getPrefix(userType)}EduMajor`]: "",
    [`${getPrefix(userType)}EduGPA`]: "",
    [`${getPrefix(userType)}EduStartMonth`]: "",
    [`${getPrefix(userType)}EduStartYear`]: "",
    [`${getPrefix(userType)}EduEndMonth`]: "",
    [`${getPrefix(userType)}EduEndYear`]: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const educationIdKey = `${getPrefix(userType)}EducationId`;
        const existingIndex = education.findIndex(
          (edu) => edu[educationIdKey] === values[educationIdKey]
        );
        let updatedEducation;

        if (existingIndex >= 0) {
          updatedEducation = education.map((edu, index) =>
            index === existingIndex ? values : edu
          );
        } else {
          updatedEducation = [...education, values];
        }

        const updatedProfile = {
          ...profile,
          [`${getPrefix(userType)}Education`]: updatedEducation,
        };
        await updateProfile(userType, updatedProfile);
        toast.success("Education updated successfully!");
        setModalIsOpen(false);
      } catch (error) {
        console.error("Error updating education:", error);
        toast.error(
          "An error occurred while updating education: ",
          error.message
        );
      }
      resetForm({});
    },
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState(null);

  const handleAddEducationClick = () => {
    formik.resetForm();
    formik.values[`${getPrefix(userType)}EducationId`] = uuidv4();
    setModalMode("add");
    setModalIsOpen(true);
  };

  const handleEditEducationClick = (edu) => {
    formik.setValues({ ...edu });
    setModalMode("edit");
    setModalIsOpen(true);
  };

  const handleDeleteClick = (eduId) => {
    setShowConfirmDialog(true);
    setEducationToDelete(eduId);
  };

  const handleConfirmDelete = async () => {
    if (educationToDelete) {
      await handleDeleteEducationClick(educationToDelete);
      setShowConfirmDialog(false);
      setEducationToDelete(null);
    }
  };

  const handleDeleteEducationClick = async (educationId) => {
    const updatedEducation = profile[`${getPrefix(userType)}Education`].filter(
      (ed) => ed[`${getPrefix(userType)}EducationId`] !== educationId
    );
    const updatedProfile = {
      ...profile,
      [`${getPrefix(userType)}Education`]: updatedEducation,
    };

    try {
      const response = await updateProfile(userType, updatedProfile);
      if (response.data && response.success) {
        console.log("Education deleted successfully");
        toast.success("Education deleted successfully!");
      } else {
        console.error("Failed to delete education entry");
        toast.error("Failed to delete education entry.");
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("An error occurred while deleting education.");
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    formik.resetForm();
  };

  return (
    <div className="card bg-base-100 shadow-xl min-w-[300px]">
      <div className="card-body">
        <div className="card-actions flex justify-between items-center mb-4">
          <h2 className="card-title text-2xl mb-2">Education</h2>

          <button
            className="btn btn-primary btn-circle btn-sm"
            onClick={handleAddEducationClick}
          >
            <AiOutlinePlus />
          </button>
        </div>
        {(profile[`${getPrefix(userType)}Education`] || []).length === 0 ? (
          <div className="text-gray-500 text-center my-10">
            Add your Education here
          </div>
        ) : (
          (profile[`${getPrefix(userType)}Education`] || []).map(
            (edu, index) => (
              <div
                key={edu[`${getPrefix(userType)}EducationId`]}
                className="mb-4"
              >
                <div className="flex items-start">
                  <div className="mr-8 mt-3 md:mr-10 lg:mt-3">
                    <FaUniversity size={40} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        {edu[`${getPrefix(userType)}EduSchoolName`]}
                      </h3>

                      <div className="flex space-x-2">
                        <button
                          className="btn btn-circle btn-outline btn-sm"
                          onClick={() => handleEditEducationClick(edu)}
                        >
                          <AiOutlineEdit />
                        </button>
                        <button
                          className="btn btn-circle btn-outline btn-error btn-sm"
                          onClick={() =>
                            handleDeleteClick(
                              edu[`${getPrefix(userType)}EducationId`]
                            )
                          }
                        >
                          <AiOutlineDelete />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      {edu[`${getPrefix(userType)}EduDegreeType`]} in{" "}
                      {edu[`${getPrefix(userType)}EduMajor`]}, GPA:{" "}
                      {edu[`${getPrefix(userType)}EduGPA`]}
                    </p>
                    <p className="text-sm text-gray-600">
                      {edu[`${getPrefix(userType)}EduStartYear`]} -{" "}
                      {edu[`${getPrefix(userType)}EduEndYear`] || "Present"}
                    </p>
                  </div>
                </div>
              </div>
            )
          )
        )}

        {/* Modal for adding/editing education, adjusted for Formik */}
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg text-center mb-4">
              {modalMode === "add" ? "Add Education" : "Edit Education"}
            </h3>
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col space-y-4"
            >
              {/* School Name input */}
              <div className="form-control">
                <label
                  className="label"
                  htmlFor={`${getPrefix(userType)}EduSchoolName`}
                >
                  School Name
                </label>
                <input
                  type="text"
                  id={`${getPrefix(userType)}EduSchoolName`}
                  name={`${getPrefix(userType)}EduSchoolName`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values[`${getPrefix(userType)}EduSchoolName`]}
                  className="input input-bordered w-full"
                />
                {formik.touched[`${getPrefix(userType)}EduSchoolName`] &&
                formik.errors[`${getPrefix(userType)}EduSchoolName`] ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors[`${getPrefix(userType)}EduSchoolName`]}
                  </div>
                ) : null}
              </div>
              <div className="form-control">
                <label
                  className="label"
                  htmlFor={`${getPrefix(userType)}EduMajor`}
                >
                  Major
                </label>
                <input
                  type="text"
                  id={`${getPrefix(userType)}EduMajor`}
                  name={`${getPrefix(userType)}EduMajor`}
                  value={formik.values[`${getPrefix(userType)}EduMajor`]}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Major"
                  className="input input-bordered w-full"
                />
                {formik.touched[`${getPrefix(userType)}EduMajor`] &&
                formik.errors[`${getPrefix(userType)}EduMajor`] ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors[`${getPrefix(userType)}EduMajor`]}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="label"
                    htmlFor={`${getPrefix(userType)}EduDegreeType`}
                  >
                    Degree Type
                  </label>
                  <select
                    id={`${getPrefix(userType)}EduDegreeType`}
                    name={`${getPrefix(userType)}EduDegreeType`}
                    onBlur={formik.handleBlur}
                    value={formik.values[`${getPrefix(userType)}EduDegreeType`]}
                    onChange={formik.handleChange}
                    className="select select-bordered w-full"
                  >
                    {/* Populate options based on your requirements */}
                    <option value="">Degree Type</option>
                    <option value="Bachelors">Bachelor's</option>
                    <option value="Masters">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="MBA">MBA</option>
                    <option value="HighSchool">High School</option>
                    <option value="Associate">Associate's</option>
                    <option value="Bootcamp">BootCamp</option>
                    <option value="Certification">Certification</option>
                  </select>
                  {formik.touched[`${getPrefix(userType)}EduDegreeType`] &&
                    formik.errors[`${getPrefix(userType)}EduDegreeType`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors[`${getPrefix(userType)}EduDegreeType`]}
                      </div>
                    )}
                </div>
                <div>
                  <label
                    className="label"
                    htmlFor={`${getPrefix(userType)}EduGPA`}
                  >
                    GPA
                  </label>
                  <input
                    type="text"
                    id={`${getPrefix(userType)}EduGPA`}
                    name={`${getPrefix(userType)}EduGPA`}
                    value={formik.values[`${getPrefix(userType)}EduGPA`]}
                    onChange={formik.handleChange}
                    placeholder="GPA on a scale of 4.0"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="label"
                    htmlFor={`${getPrefix(userType)}EduStartMonth`}
                  >
                    Start Month
                  </label>
                  <select
                    type="text"
                    id={`${getPrefix(userType)}EduStartMonth`}
                    name={`${getPrefix(userType)}EduStartMonth`}
                    onBlur={formik.handleBlur}
                    value={formik.values[`${getPrefix(userType)}EduStartMonth`]}
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
                  {formik.touched[`${getPrefix(userType)}EduStartMonth`] &&
                    formik.errors[`${getPrefix(userType)}EduStartMonth`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors[`${getPrefix(userType)}EduStartMonth`]}
                      </div>
                    )}
                </div>
                <div>
                  <label
                    className="label"
                    htmlFor={`${getPrefix(userType)}EduStartYear`}
                  >
                    Start Year
                  </label>
                  <select
                    type="number"
                    id={`${getPrefix(userType)}EduStartYear`}
                    name={`${getPrefix(userType)}EduStartYear`}
                    onBlur={formik.handleBlur}
                    value={formik.values[`${getPrefix(userType)}EduStartYear`]}
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
                  {formik.touched[`${getPrefix(userType)}EduStartYear`] &&
                    formik.errors[`${getPrefix(userType)}EduStartYear`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors[`${getPrefix(userType)}EduStartYear`]}
                      </div>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="label"
                    htmlFor={`${getPrefix(userType)}EduEndMonth`}
                  >
                    End Month
                  </label>
                  <select
                    id={`${getPrefix(userType)}EduEndMonth`}
                    name={`${getPrefix(userType)}EduEndMonth`}
                    value={formik.values[`${getPrefix(userType)}EduEndMonth`]}
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
                <div className="mb-4">
                  <label
                    className="label"
                    htmlFor={`${getPrefix(userType)}EduEndYear`}
                  >
                    End Year
                  </label>
                  <select
                    type="number"
                    id={`${getPrefix(userType)}EduEndYear`}
                    name={`${getPrefix(userType)}EduEndYear`}
                    value={formik.values[`${getPrefix(userType)}EduEndYear`]}
                    onChange={formik.handleChange}
                    placeholder="Year"
                    className="input input-bordered w-full"
                  >
                    <option value="">Select a year</option>
                    {[...Array(46)].map((_, i) => {
                      const year = new Date().getFullYear() + 6 - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  {formik.values[`${getPrefix(userType)}EduEndMonth`] &&
                    formik.errors[`${getPrefix(userType)}EduEndYear`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors[`${getPrefix(userType)}EduEndYear`]}
                      </div>
                    )}
                  {formik.errors[`${getPrefix(userType)}EduEndMonth`] && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors[`${getPrefix(userType)}EduEndMonth`]}
                    </div>
                  )}
                </div>
              </div>
              {/* Add other fields (Major, Degree Type, etc.) similar to the School Name field, adapting them for Formik */}
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
              <h3 className="font-bold text-lg">Confirm Deletion</h3>
              <p className="py-4">
                Are you sure you want to delete this education entry? This
                action cannot be undone.
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

export default ProfileEduCard;
