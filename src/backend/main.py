import os
import cv2
import numpy as np
import uuid
import zipfile
import shutil
import time
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from starlette.requests import Request

###############################################################################
# FastAPI Setup
###############################################################################
app = FastAPI(title="Enhanced Blur Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup static files and templates
os.makedirs("static", exist_ok=True)
os.makedirs("templates", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

###############################################################################
# Directory Creation
###############################################################################
os.makedirs("temp", exist_ok=True)
os.makedirs("temp/sharp", exist_ok=True)

###############################################################################
# Configuration / Tunable Parameters
###############################################################################
# Global threshold for the combined focus measure (tuned based on validation data)
DEFAULT_BLUR_THRESHOLD = 120

# Local (patch-based) threshold: base value and required fraction of blurry patches
LOCAL_BLUR_THRESHOLD = 100  
FRACTION_BLURRY = 0.4  
PATCH_GRID = (5, 5)  # You might experiment with 4x4, 5x5, etc.

# Weights for the combined global focus measure (should be normalized to sum to 1)
LAPLACIAN_WEIGHT = 0.35
TENENGRAD_WEIGHT = 0.30
FFT_WEIGHT = 0.35

# Improved FFT: high-pass filter size (fraction of smaller dimension)
SIZE_PERCENT = 0.1

# Dictionary to track original filenames for ZIP creation.
# Key: unique (temp) filename, Value: original filename.
processed_files = {}

###############################################################################
# Routes
###############################################################################
@app.get("/")
async def read_index(request: Request):
    # Create a simple template if it doesn't exist
    index_path = os.path.join("templates", "index.html")
    if not os.path.exists(index_path):
        with open(index_path, "w") as f:
            f.write("""<!DOCTYPE html>
            <html>
              <head>
                <title>Image Processing API</title>
              </head>
              <body>
                <h1>Image Processing API</h1>
                <p>Upload images using the API endpoints.</p>
              </body>
            </html>""")
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/process-images")
async def process_images(files: List[UploadFile] = File(...)):
    """
    1) Clears temporary directories (skipping the ZIP file).
    2) Saves uploaded files with UUID-based names.
    3) Detects blur using a weighted combination of multi-scale Laplacian variance,
       Tenengrad gradient, and improved FFT high-frequency energy.
    4) Applies an adaptive patch-based measure with dynamic thresholds.
    5) Copies sharp images to 'temp/sharp' for later download.
    6) Records mapping of unique filename to original filename.
    7) Returns both original and unique filenames in the JSON response.
    """
    # Clean temp directories before processing (skip ZIP file)
    cleanup_temp_dirs()

    results = []
    sharp_count = 0
    blurry_count = 0

    processed_files.clear()  # Reset filename mapping

    for file in files:
        unique_name = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join("temp", unique_name)

        # Save the uploaded file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Record mapping for ZIP creation
        processed_files[unique_name] = file.filename

        # Run blur detection on the saved file
        blur_score, is_blurry = enhanced_blur_detection(file_path)

        # Copy sharp images to temp/sharp for ZIP download
        if not is_blurry:
            sharp_path = os.path.join("temp/sharp", unique_name)
            shutil.copy(file_path, sharp_path)
            sharp_count += 1
        else:
            blurry_count += 1

        results.append({
            "filename": unique_name,  # Unique temp filename to retrieve file later
            "original_filename": file.filename,
            "blur_score": blur_score,
            "is_blurry": is_blurry
        })

    response = {
        "total": len(files),
        "sharp": sharp_count,
        "blurry": blurry_count,
        "images": results
    }
    return JSONResponse(content=response)

@app.get("/api/download")
async def download_images(background_tasks: BackgroundTasks):
    """
    Creates a ZIP file of sharp images (preserving original filenames) and returns it.
    A background task then cleans up temporary files after a delay.
    """
    zip_path = create_zip_file()
    background_tasks.add_task(delayed_cleanup, delay=10)  # Delay cleanup to ensure ZIP is served
    return FileResponse(
        path=zip_path,
        filename="sharp_images.zip",
        media_type="application/zip"
    )

@app.get("/temp/{filename}")
async def get_temp_file(filename: str):
    """
    Retrieve a file from the 'temp' directory.
    The client should use the unique (temp) filename provided in the JSON response.
    """
    file_path = os.path.join("temp", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

###############################################################################
# Blur Detection Logic
###############################################################################
def enhanced_blur_detection(image_path, threshold=DEFAULT_BLUR_THRESHOLD):
    """
    Computes a combined focus score using:
      - Multi-scale Laplacian variance,
      - Tenengrad gradient magnitude, and
      - FFT-based high-frequency energy.
    The final score is compared against an adaptive threshold based on image brightness.
    Additionally, a patch-based method computes local blur scores with dynamic thresholds.
    The image is classified as blurry if either the global or the local measure indicates blur.
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            return 0, True

        # Resize image to a max width of 1024 (preserving aspect ratio)
        image = resize_image(image, width=1024)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Global focus measures:
        laplacian_var = multi_scale_laplacian_variance(gray, levels=3)
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        tenengrad = np.mean(sobel_x**2 + sobel_y**2)
        fft_score = improved_fft_blur_detection(gray, size_percent=SIZE_PERCENT)

        # Combine the global measures using the tuned weights.
        combined_score = (LAPLACIAN_WEIGHT * laplacian_var) + (TENENGRAD_WEIGHT * tenengrad) + (FFT_WEIGHT * fft_score)

        # Adaptive scaling based on overall brightness (mean intensity).
        mean_intensity = np.mean(gray)
        adaptive_factor = 1.0
        if mean_intensity < 50:
            adaptive_factor = 0.8
        elif mean_intensity > 200:
            adaptive_factor = 1.2
        final_threshold = threshold * adaptive_factor

        global_blurry = bool(combined_score < final_threshold)

        # Local (patch-based) focus measure.
        local_blurry = patch_based_blur_check(
            gray,
            patch_grid=PATCH_GRID,
            local_threshold=LOCAL_BLUR_THRESHOLD,
            fraction_blurry=FRACTION_BLURRY
        )

        # Classify image as blurry if either global or local measures indicate blur.
        is_blurry = (global_blurry or local_blurry)
        return float(combined_score), is_blurry

    except Exception as e:
        print(f"Error processing image {image_path}: {str(e)}")
        return 0, True

def multi_scale_laplacian_variance(gray, levels=3):
    """
    Computes Laplacian variance over multiple scales.
    This captures both fine and coarse blur details.
    """
    score = 0.0
    current = gray.copy()
    for _ in range(levels):
        lap = cv2.Laplacian(current, cv2.CV_64F)
        score += np.var(lap)
        if current.shape[0] > 1 and current.shape[1] > 1:
            current = cv2.pyrDown(current)
    return score / levels

def improved_fft_blur_detection(gray_image, size_percent=0.1):
    """
    Enhanced FFT-based focus measure:
      - Computes FFT and shifts it to center low frequencies.
      - Zeros out a central square (size determined by size_percent).
      - Returns the mean log-magnitude of the remaining high-frequency components.
    """
    dft = np.fft.fft2(gray_image)
    dft_shift = np.fft.fftshift(dft)
    h, w = gray_image.shape
    half_size = int(min(h, w) * size_percent // 2)
    cy, cx = h // 2, w // 2
    dft_shift[cy - half_size : cy + half_size, cx - half_size : cx + half_size] = 0
    f_ishift = np.fft.ifftshift(dft_shift)
    img_back = np.fft.ifft2(f_ishift)
    img_back = np.abs(img_back)
    eps = 1e-10
    magnitude = 20 * np.log10(img_back + eps)
    return np.mean(magnitude)

def patch_based_blur_check(gray, patch_grid=(4, 4), local_threshold=80, fraction_blurry=0.3):
    """
    Divides the image into patches and computes Laplacian variance for each.
    The threshold for each patch is dynamically adjusted based on its mean intensity.
    If the fraction of patches below the dynamic threshold exceeds fraction_blurry,
    the image is flagged as blurry locally.
    """
    rows, cols = patch_grid
    h, w = gray.shape
    patch_h = h // rows
    patch_w = w // cols

    blurry_patches = 0
    total_patches = rows * cols

    for r in range(rows):
        for c in range(cols):
            y1 = r * patch_h
            y2 = (r + 1) * patch_h if (r < rows - 1) else h
            x1 = c * patch_w
            x2 = (c + 1) * patch_w if (c < cols - 1) else w
            patch = gray[y1:y2, x1:x2]
            patch_mean = np.mean(patch)
            patch_factor = 1.0
            if patch_mean < 50:
                patch_factor = 0.8
            elif patch_mean > 200:
                patch_factor = 1.2
            dynamic_threshold = local_threshold * patch_factor

            lap = cv2.Laplacian(patch, cv2.CV_64F)
            lap_var = np.var(lap)
            if lap_var < dynamic_threshold:
                blurry_patches += 1

    return (blurry_patches / total_patches) > fraction_blurry

def resize_image(image, width=1024):
    """
    Resizes the image to the specified maximum width while preserving aspect ratio.
    """
    h, w = image.shape[:2]
    if w <= width:
        return image
    aspect_ratio = h / w
    new_height = int(width * aspect_ratio)
    return cv2.resize(image, (width, new_height), interpolation=cv2.INTER_AREA)

###############################################################################
# File and Temp Management
###############################################################################
def create_zip_file():
    """
    Creates a ZIP archive of the sharp images (from temp/sharp),
    preserving the original filenames.
    """
    zip_path = os.path.join("temp", "sharp_images.zip")
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for temp_name in os.listdir("temp/sharp"):
            file_path = os.path.join("temp/sharp", temp_name)
            if os.path.isfile(file_path):
                original_name = processed_files.get(temp_name, temp_name)
                zipf.write(file_path, original_name)
    return zip_path

def cleanup_temp_dirs():
    """
    Removes all files from 'temp' and 'temp/sharp', except for the ZIP file.
    """
    for folder in ["temp", "temp/sharp"]:
        if os.path.exists(folder):
            for f in os.listdir(folder):
                file_path = os.path.join(folder, f)
                if os.path.isfile(file_path) and not f.endswith('.zip'):
                    os.remove(file_path)

def delayed_cleanup(delay: int = 7):
    """Waits for a specified delay (in seconds) then cleans up temp directories."""
    time.sleep(delay)
    cleanup_temp_dirs()

###############################################################################
# Main Entry
###############################################################################
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
