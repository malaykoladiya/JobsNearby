# JobsNearby: A Comprehensive Job Search Platform

## Live Link

Check out the live demo of the project: [JobsNearby](https://jobs-nearby.vercel.app/)

## Introduction

"JobsNearby" is a personalized online job portal designed to address the unique needs of job seekers in the support and service sectors. It aims to facilitate localized employment opportunities for various groups, including students seeking part-time work, stay-at-home parents needing flexible hours, and retirees looking for engaging yet less demanding roles.

## Motivation

The motivation for this project stems from the challenges faced by job seekers in the support and service sector. By providing a centralized platform tailored to their needs, "JobsNearby" enhances accessibility, promotes local hiring, and supports economic growth in the sector.

## Objectives

1. Develop a user-friendly web interface for job seekers.
2. Aggregate and categorize job listings within the service and support sector.
3. Enable employer accounts for job posting and management.
4. Personalize user experiences through individual accounts.

### Design

- **Technical Architecture Design**: Implemented a monolithic architecture using Flask for backend and React for frontend, deployed on AWS.

### Technical Architecture Development

![Technical Architecture](/githubimage/JobsNearby.png)

#### Front-end Development

Technologies used:

- HTML, CSS, JavaScript
- React
- DaisyUI and Tailwind CSS for UI components
- Vite for development tooling
- Vercel for deployment

#### Back-end Development

Technologies used:

- Flask within a Docker container
- MongoDB for data management
- Redis for caching and session management
- AWS Lambda and API Gateway for serverless execution

### Testing

Focused on manual API testing using Postman to ensure functionality, security, and performance.

## Future Work

1. Enhanced testing protocols.
2. Mobile platform development.
3. Integration of machine learning for job matching.
4. Development of analytics dashboards for employers.

## Limitations

1. Scope of testing was predominantly manual.
2. Heavy reliance on specific technologies and infrastructure.
3. User engagement strategies not extensively tested.
