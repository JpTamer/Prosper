#!/usr/bin/env python3
"""
Script to download placeholder images for tree diseases.
This script uses placeholder image services to generate images.
"""

import os
import requests
from pathlib import Path

# Base directory for assets
ASSETS_DIR = Path(__file__).parent.parent / "assets" / "images"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# Tree disease images to create
TREE_IMAGES = [
    "olive_leaf_spot.jpg",
    "olive_verticillium_wilt.jpg",
    "apple_mildew.jpg",
    "apple_fire_blight.jpg",
    "lemon_aphids.jpg",
    "lemon_citrus_greening.jpg",
    "orange_canker.jpg",
    "mango_anthracnose.jpg",
    "mango_powdery_mildew.jpg",
    "banana_panama.jpg",
    "banana_black_sogatoka.jpg",
    "grape_downy_mildew.jpg",
    "peach_leaf_curl.jpg",
    "pine_needle_blight.jpg",
    "avocado_root_rot.jpg",
    "fig_rust.jpg",
    "cherry_brown_rot.jpg",
    "pear_fire_blight.jpg",
    "papaya_mildew.jpg",
    "coconut_bud_rot.jpg",
    "walnut_thousand_cankers.jpg",
    "maple_verticillium_wilt.jpg",
    "cedar_apple_rust.jpg",
    "chestnut_blight.jpg",
    "eucalyptus_leaf_blight.jpg",
]

def download_placeholder_image(filename, width=400, height=300):
    """Download a placeholder image from placeholder.com"""
    url = f"https://via.placeholder.com/{width}x{height}/4CAF50/FFFFFF?text={filename.replace('.jpg', '').replace('_', '+')}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            filepath = ASSETS_DIR / filename
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print(f"✓ Downloaded: {filename}")
            return True
        else:
            print(f"✗ Failed to download {filename}: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error downloading {filename}: {e}")
        return False

def create_solid_color_image(filename, color_hex="4CAF50"):
    """Create a simple colored placeholder using PIL or just download from placeholder service"""
    # For simplicity, we'll use a placeholder service
    # In a real scenario, you might want to use PIL to create actual images
    return download_placeholder_image(filename)

def main():
    print("Starting image download...")
    print(f"Target directory: {ASSETS_DIR}")
    print("-" * 50)
    
    downloaded = 0
    failed = 0
    
    for image_name in TREE_IMAGES:
        if (ASSETS_DIR / image_name).exists():
            print(f"⊘ Already exists: {image_name}")
            continue
            
        if download_placeholder_image(image_name):
            downloaded += 1
        else:
            failed += 1
    
    print("-" * 50)
    print(f"Download complete!")
    print(f"Downloaded: {downloaded}")
    print(f"Failed: {failed}")
    print(f"Total: {len(TREE_IMAGES)}")

if __name__ == "__main__":
    try:
        import requests
        main()
    except ImportError:
        print("Error: requests library not found.")
        print("Install it with: pip install requests")
        print("\nAlternatively, manually download images and place them in assets/images/")

