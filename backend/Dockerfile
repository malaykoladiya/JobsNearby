FROM public.ecr.aws/lambda/python:3.11

# Set the working directory in the container to ${LAMBDA_TASK_ROOT}
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy the requirements file into the container
COPY requirements.txt .

# Install the required Python packages
RUN pip install --no-cache-dir -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Copy the entire application code into the container
COPY . .

# Set the entry point to your Lambda handler
CMD ["app.lambda_handler"]
