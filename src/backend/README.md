
# FastAPI Backend for Image Cluster

This backend provides the image processing capabilities for the Image Cluster application.

## Features

- **Remove Blur Images:** Detects and filters out blurry images using advanced detection algorithms
- More features will be added in future updates

## Setup Instructions

1. Make sure you have Python 3.8+ installed
2. Install the required dependencies:
   ```
   pip install fastapi uvicorn python-multipart opencv-python numpy
   ```
3. Create the required directories:
   ```
   mkdir -p temp/sharp
   mkdir -p templates/static
   ```
4. Create a simple index.html in the templates directory:
   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <title>Image Processing API</title>
     </head>
     <body>
       <h1>Image Processing API</h1>
       <p>Upload images using the API endpoints.</p>
     </body>
   </html>
   ```
5. Save the Python script to `main.py` in the backend directory

## Running the Backend

1. Navigate to the backend directory
2. Run the server:
   ```
   python main.py
   ```
   or
   ```
   uvicorn main:app --reload
   ```
3. The API will be available at http://localhost:8000

## API Endpoints

- **POST /api/process-images**: Upload images for processing
- **GET /api/download**: Download processed (sharp) images as a ZIP file
- **GET /temp/{filename}**: Retrieve a specific processed image

## Integration with Frontend

The frontend connects to this API to:
1. Upload images for processing
2. Download the filtered sharp images
