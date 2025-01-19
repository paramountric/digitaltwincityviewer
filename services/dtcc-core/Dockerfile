# Use an official Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies including GDAL
RUN apt-get update && apt-get install -y \
    build-essential \
    gdal-bin \
    libgdal-dev \
    python3-gdal \
    libgl1-mesa-glx \
    libglu1-mesa \
    libxrender1 \
    libxcursor1 \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL environment variables
ENV GDAL_VERSION=3.6.2
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Explicitly set environment variable to disable GUI
ENV DTCC_NO_GUI=1

# Copy requirements first (for caching layer)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY app /app/app
COPY workflows /app/workflows
COPY app/setup.py .

# Expose the app port
EXPOSE 8000

# Run Uvicorn with reload for dev
CMD ["sh", "-c", "python setup.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
