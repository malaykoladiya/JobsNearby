import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  reqId: Yup.string().required("Requisition ID is required"),
  jobTitle: Yup.string().required("Job Title is required"),
  jobCategory: Yup.string().required("Job Category is required"),
  employmentType: Yup.string().required("Employment Type is required"),
  noOfopening: Yup.number().required("Number of Openings is required"),
  jobAdress: Yup.string().required("Job Address is required"),
  jobCity: Yup.string().required("Job City is required"),
  jobState: Yup.string().required("Job State is required"),
  jobZip: Yup.string().required("Job Zip is required"),
  jobDescription: Yup.string().required("Job Description is required"),
  jobQualifications: Yup.string().required("Job Qualifications are required"),
  jobSkills: Yup.string().required("Job Skills are required"),
  jobSalary: Yup.string().required("Job Salary is required"),
  companyName: Yup.string().required("Company Name is required"),
  companyDescription: Yup.string().required("Company Description is required"),
  companyIndustry: Yup.string().required("Industry is required"),
  startDate: Yup.date().required("Start Date is required"),
  appDeadline: Yup.date().required("Application Deadline is required"),
});

function EmployerJobForm({ job, onSubmit }) {
  const [initialValues, setInitialValues] = useState({
    reqId: "",
    jobTitle: "",
    jobCategory: "",
    employmentType: "",
    noOfopening: 1,
    jobAdress: "",
    jobCity: "",
    jobState: "",
    jobZip: "",
    jobDescription: "",
    jobQualifications: "",
    jobSkills: "",
    jobSalary: "",
    companyName: "",
    companyDescription: "",
    companyIndustry: "",
    startDate: "",
    appDeadline: "",
  });

  useEffect(() => {
    if (job) {
      const formattedStartDate = job.startDate
        ? new Date(job.startDate).toISOString().slice(0, 10)
        : "";
      const formattedAppDeadline = job.appDeadline
        ? new Date(job.appDeadline).toISOString().slice(0, 10)
        : "";
      setInitialValues({
        reqId: job.reqId || "",
        jobTitle: job.jobTitle || "",
        jobCategory: job.jobCategory || "",
        employmentType: job.employmentType || "",
        noOfopening: job.noOfopening || 1,
        jobAdress: job.jobAdress || "",
        jobCity: job.jobCity || "",
        jobState: job.jobState || "",
        jobZip: job.jobZip || "",
        jobDescription: job.jobDescription || "",
        jobQualifications: job.jobQualifications || "",
        jobSkills: job.jobSkills || "",
        jobSalary: job.jobSalary || "",
        companyName: job.companyName || "",
        companyDescription: job.companyDescription || "",
        companyIndustry: job.companyIndustry || "",
        startDate: formattedStartDate || "",
        appDeadline: formattedAppDeadline || "",
      });
    }
  }, [job]);

  const handleTextAreaChange = (event) => {
    const { name, value } = event.target;

    // Adjust the height to fit content
    event.target.style.height = "inherit";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  return (
    <div className="mx-auto my-8 bg-white p-4 sm:p-6 md:p-8 lg:p-12 w-3/4 sm:w-3/4 md:w-2/3 lg:w-2/3 xl:w-2/3 2xl:w-2/4">
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">
                  Job Details
                </h3>
                <div className="grid gap-4 mb-2">
                  <div>
                    <label
                      htmlFor="reqId"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Requisition ID
                    </label>
                    <Field
                      type="text"
                      id="reqId"
                      name="reqId"
                      placeholder="Requisition ID"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="reqId"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobTitle"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job Title
                    </label>
                    <Field
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      placeholder="Job Title. e.g. - Retail Associate"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobTitle"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobCategory"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job Category
                    </label>
                    <Field
                      type="text"
                      id="jobCategory"
                      name="jobCategory"
                      placeholder="Job Category. e.g. - Food Service, Retail"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobCategory"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="employmentType"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Employment Type
                    </label>
                    <Field
                      type="text"
                      id="employmentType"
                      name="employmentType"
                      placeholder="Employment Type. e.g. - Full-Time"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="employmentType"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="noOfopening"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Number of Opening
                    </label>
                    <Field
                      type="number"
                      id="noOfopening"
                      name="noOfopening"
                      placeholder="No. of Openings"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="noOfopening"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobAdress"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job Address
                    </label>
                    <Field
                      type="text"
                      id="jobAdress"
                      name="jobAdress"
                      placeholder="Enter Adresss. e.g. 1313 Luxury Ln"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobAdress"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobCity"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job City
                    </label>
                    <Field
                      type="text"
                      id="jobCity"
                      name="jobCity"
                      placeholder="Enter City. e.g. Touristville"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobCity"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobState"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job State
                    </label>
                    <Field
                      type="text"
                      id="jobState"
                      name="jobState"
                      placeholder="Enter State. e.g. California/CA"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobState"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobZip"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job Zip
                    </label>
                    <Field
                      type="text"
                      id="jobZip"
                      name="jobZip"
                      placeholder="Enter Zip. e.g. 12345"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobZip"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mt-20 mb-2">
                  Role Details
                </h3>
                <div className="grid gap-4 mb-2">
                  <div>
                    <label
                      htmlFor="jobDescription"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job Description
                    </label>
                    <Field
                      as="textarea"
                      id="jobDescription"
                      name="jobDescription"
                      placeholder="Job Description"
                      onInput={handleTextAreaChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobDescription"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobQualifications"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job Qualifications
                    </label>
                    <Field
                      as="textarea"
                      id="jobQualifications"
                      name="jobQualifications"
                      placeholder="Job Qualifications"
                      onInput={handleTextAreaChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobQualifications"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobSkills"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job Skills
                    </label>
                    <Field
                      as="textarea"
                      id="jobSkills"
                      name="jobSkills"
                      placeholder="Job Skills"
                      onInput={handleTextAreaChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobSkills"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jobSalary"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Job Salary
                    </label>
                    <Field
                      type="text"
                      id="jobSalary"
                      name="jobSalary"
                      placeholder="Job Salary"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="jobSalary"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mt-20 mb-2">
                  Company Details
                </h3>
                <div className="grid gap-4 mb-2">
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Company Name
                    </label>
                    <Field
                      type="text"
                      id="companyName"
                      name="companyName"
                      placeholder="Company Name"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="companyName"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="companyDescription"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Company Description
                    </label>
                    <Field
                      as="textarea"
                      id="companyDescription"
                      name="companyDescription"
                      placeholder="Company Description"
                      onInput={handleTextAreaChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="companyDescription"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="companyIndustry"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Industry
                    </label>
                    <Field
                      type="text"
                      id="companyIndustry"
                      name="companyIndustry"
                      placeholder="Industry"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="companyIndustry"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mt-20 mb-2">
                  Additional Information
                </h3>
                <div className="grid gap-4 mb-2">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Start Date
                    </label>
                    <Field
                      type="date"
                      id="startDate"
                      name="startDate"
                      placeholder="Start Date"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="startDate"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="appDeadline"
                      className="block text-gray-700 font-semibold mb-2"
                    >
                      Application Deadline
                    </label>
                    <Field
                      type="date"
                      id="appDeadline"
                      name="appDeadline"
                      placeholder="Application Deadline"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="appDeadline"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 mt-5 sm:py-3 lg:py-4 px-6 rounded-full font-semibold uppercase hover:bg-blue-700 transition-colors duration-300 shadow-md"
            >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default EmployerJobForm;
