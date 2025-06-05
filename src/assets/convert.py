import os
from PIL import Image

def resize_pngs_in_directory(target_width, target_height):
    """
    Resizes all PNG images in the current directory to the specified dimensions.
    Resized images are saved with a '_resized' suffix.

    Args:
        target_width (int): The desired width in pixels.
        target_height (int): The desired height in pixels.
    """
    current_directory = "./" # Represents the current directory
    
    print(f"Searching for PNG images in: {os.path.abspath(current_directory)}")
    
    resized_count = 0
    for filename in os.listdir(current_directory):
        if filename.lower().endswith(".png"):
            input_path = os.path.join(current_directory, filename)
            
            # Create a new filename for the resized image
            name, ext = os.path.splitext(filename)
            output_path = os.path.join(current_directory, f"{name}_resized{ext}")
            
            try:
                img = Image.open(input_path)
                resized_img = img.resize((target_width, target_height), Image.LANCZOS) # Use LANCZOS for high-quality downsampling
                resized_img.save(output_path)
                print(f"Resized '{filename}' to {target_width}x{target_height} and saved as '{os.path.basename(output_path)}'")
                resized_count += 1
            except Exception as e:
                print(f"Could not resize '{filename}': {e}")
                
    if resized_count > 0:
        print(f"\nFinished! Resized {resized_count} PNG images.")
    else:
        print("\nNo PNG images found in the current directory to resize.")

# --- Run the resizing ---
if __name__ == "__main__":
    TARGET_WIDTH = 1280
    TARGET_HEIGHT = 800
    
    resize_pngs_in_directory(TARGET_WIDTH, TARGET_HEIGHT)
