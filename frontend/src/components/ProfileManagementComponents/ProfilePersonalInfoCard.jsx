import React, { useState } from "react";
import {
  AiOutlineEdit,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineHome,
} from "react-icons/ai";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const ProfilePersonalInfoCard = () => {
  const { profile, updateProfile, userType } = useAuth();
  const [isModalOpen, setModalIsOpen] = useState(false);

  const getPrefix = (userType) => {
    return userType === "jobSeeker" ? "jobSeeker" : "employer";
  };

  const initialValues = {
    [`${getPrefix(userType)}FirstName`]:
      profile[`${getPrefix(userType)}FirstName`],
    [`${getPrefix(userType)}LastName`]:
      profile[`${getPrefix(userType)}LastName`],
    [`${getPrefix(userType)}Role`]: profile[`${getPrefix(userType)}Role`],
    [`${getPrefix(userType)}Email`]: profile[`${getPrefix(userType)}Email`],
    [`${getPrefix(userType)}PhoneNumber`]:
      profile[`${getPrefix(userType)}PhoneNumber`],
    [`${getPrefix(userType)}Location`]:
      profile[`${getPrefix(userType)}Location`],
  };

  const validationSchema = Yup.object().shape({
    [`${getPrefix(userType)}FirstName`]: Yup.string().required(
      "First Name is required"
    ),
    [`${getPrefix(userType)}LastName`]: Yup.string().required(
      "Last Name is required"
    ),
    [`${getPrefix(userType)}Role`]: Yup.string().required("Role is required"),
    [`${getPrefix(userType)}Email`]: Yup.string().email(
      "Invalid email address"
    ),
    [`${getPrefix(userType)}PhoneNumber`]: Yup.string().required(
      "Phone Number is required"
    ),
    [`${getPrefix(userType)}Location`]: Yup.string().required(
      "Location is required"
    ),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const updatedProfile = { ...profile, ...values };
        const response = await updateProfile(userType, updatedProfile);
        if (response.success) {
          toast.success("Profile updated successfully!");
          setModalIsOpen(false);
        } else {
          throw new Error("Backend update failed");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      }
      resetForm();
    },
    enableReinitialize: true, // Add this line
  });

  const openEditModal = () => {
    setModalIsOpen(true);
  };

  const closeEditModal = () => {
    formik.resetForm();
    setModalIsOpen(false);
  };

  const renderProfileImageOrInitials = () => {
    if (profile.imageUrl) {
      return (
        <img
          className="rounded-full w-24 h-24 object-cover"
          src={profile.imageUrl}
          alt="Profile"
        />
      );
    } else {
      // Check for the presence of first name and last name
      const firstNameInitial = profile[`${getPrefix(userType)}FirstName`]
        ? profile[`${getPrefix(userType)}FirstName`][0]
        : "";
      const lastNameInitial = profile[`${getPrefix(userType)}LastName`]
        ? profile[`${getPrefix(userType)}LastName`][0]
        : "";

      // Decide the initials based on the presence of first and/or last name
      const initials =
        firstNameInitial || lastNameInitial
          ? `${firstNameInitial}${lastNameInitial}`
          : "??";

      return (
        <div className="avatar-placeholder">
          <div className="rounded-full w-24 h-24 bg-blue-500 text-white flex items-center justify-center text-3xl font-semibold">
            {initials.toUpperCase()}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl p-4 min-w-[300px]">
      <div className="card-body items-center text-center">
        {renderProfileImageOrInitials()}
        <h2 className="card-title">
          {profile[`${getPrefix(userType)}FirstName`]}{" "}
          {profile[`${getPrefix(userType)}LastName`]}
        </h2>
        <p>{profile[`${getPrefix(userType)}Role`]}</p>
        <div>
          <p className="flex items-center justify-left">
            <AiOutlineMail size={20} className="inline mr-2" />{" "}
            {profile[`${getPrefix(userType)}Email`]}
          </p>
          <p className="flex items-center justify-left">
            <AiOutlinePhone size={20} className="inline mr-2" />{" "}
            {profile[`${getPrefix(userType)}PhoneNumber`]}
          </p>
          <p className="flex items-center justify-left">
            <AiOutlineHome size={20} className="inline mr-2" />{" "}
            {profile[`${getPrefix(userType)}Location`]}
          </p>
        </div>
        <div className="card-actions justify-end">
          <button
            onClick={openEditModal}
            className="btn btn-circle btn-outline btn-primary btn-sm absolute top-0 right-0 mt-4 mr-4"
          >
            <AiOutlineEdit />
          </button>
        </div>
      </div>

      {/* Edit Modal */}

      <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit Personal Information</h3>
          <form onSubmit={formik.handleSubmit} className="form-control">
            <label
              className="label"
              htmlFor={`${getPrefix(userType)}FirsttName`}
            >
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              id={`${getPrefix(userType)}FirsttName`}
              name={`${getPrefix(userType)}FirstName`}
              value={formik.values[`${getPrefix(userType)}FirstName`]}
              onChange={formik.handleChange}
              className="input input-bordered"
            />

            <label className="label" htmlFor={`${getPrefix(userType)}LastName`}>
              <span className="label-text">Last Name</span>
            </label>
            <input
              type="text"
              id={`${getPrefix(userType)}LastName`}
              name={`${getPrefix(userType)}LastName`}
              value={formik.values[`${getPrefix(userType)}LastName`]}
              onChange={formik.handleChange}
              className="input input-bordered"
            />

            <label className="label" htmlFor={`${getPrefix(userType)}Role`}>
              <span className="label-text">Role</span>
            </label>
            <input
              type="text"
              id={`${getPrefix(userType)}Role`}
              name={`${getPrefix(userType)}Role`}
              value={formik.values[`${getPrefix(userType)}Role`]}
              onChange={formik.handleChange}
              className="input input-bordered"
            />

            <label className="label" htmlFor={`${getPrefix(userType)}Email`}>
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              id={`${getPrefix(userType)}Email`}
              name={`${getPrefix(userType)}Email`}
              value={formik.values[`${getPrefix(userType)}Email`]}
              onChange={formik.handleChange}
              className="input input-bordered"
              disabled={true}
            />

            <label
              className="label"
              htmlFor={`${getPrefix(userType)}PhoneNumber`}
            >
              <span className="label-text">Phone</span>
            </label>
            <input
              type="tel"
              id={`${getPrefix(userType)}PhoneNumber`}
              name={`${getPrefix(userType)}PhoneNumber`}
              value={formik.values[`${getPrefix(userType)}PhoneNumber`]}
              onChange={formik.handleChange}
              className="input input-bordered"
            />

            <label className="label" htmlFor={`${getPrefix(userType)}Location`}>
              <span className="label-text">Location</span>
            </label>
            <input
              type="text"
              id={`${getPrefix(userType)}Location`}
              name={`${getPrefix(userType)}Location`}
              value={formik.values[`${getPrefix(userType)}Location`]}
              onChange={formik.handleChange}
              className="input input-bordered"
            />

            <div className="modal-action">
              <button
                type="button"
                onClick={closeEditModal}
                className="btn btn-ghost"
              >
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
    </div>
  );
};

export default ProfilePersonalInfoCard;
