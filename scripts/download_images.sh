#!/bin/bash

# Script to download placeholder images for tree diseases
# Uses placeholder.com service to generate images

ASSETS_DIR="assets/images"
mkdir -p "$ASSETS_DIR"

# Array of image names
images=(
    "olive_leaf_spot.jpg"
    "olive_verticillium_wilt.jpg"
    "apple_mildew.jpg"
    "apple_fire_blight.jpg"
    "lemon_aphids.jpg"
    "lemon_citrus_greening.jpg"
    "orange_canker.jpg"
    "mango_anthracnose.jpg"
    "mango_powdery_mildew.jpg"
    "banana_panama.jpg"
    "banana_black_sogatoka.jpg"
    "grape_downy_mildew.jpg"
    "peach_leaf_curl.jpg"
    "pine_needle_blight.jpg"
    "avocado_root_rot.jpg"
    "fig_rust.jpg"
    "cherry_brown_rot.jpg"
    "pear_fire_blight.jpg"
    "papaya_mildew.jpg"
    "coconut_bud_rot.jpg"
    "walnut_thousand_cankers.jpg"
    "maple_verticillium_wilt.jpg"
    "cedar_apple_rust.jpg"
    "chestnut_blight.jpg"
    "eucalyptus_leaf_blight.jpg"
)

echo "Starting image download..."
echo "Target directory: $ASSETS_DIR"
echo "----------------------------------------"

downloaded=0
skipped=0

for image in "${images[@]}"; do
    if [ -f "$ASSETS_DIR/$image" ]; then
        echo "⊘ Already exists: $image"
        ((skipped++))
        continue
    fi
    
    # Create a clean text for the placeholder (replace underscores with spaces, remove .jpg)
    text=$(echo "$image" | sed 's/\.jpg//' | sed 's/_/+/g')
    
    # Download from placeholder.com with green background
    url="https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=$text"
    
    if curl -s -o "$ASSETS_DIR/$image" "$url"; then
        echo "✓ Downloaded: $image"
        ((downloaded++))
    else
        echo "✗ Failed to download: $image"
    fi
done

echo "----------------------------------------"
echo "Download complete!"
echo "Downloaded: $downloaded"
echo "Skipped: $skipped"
echo "Total: ${#images[@]}"

