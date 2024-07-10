# Use the official Python image as the base image
FROM --platform=linux/amd64 python:3.9

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the Flask application
CMD ["flask", "run", "--host=0.0.0.0"]
