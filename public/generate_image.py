import os
import sys
from diffusers import StableDiffusionPipeline

def generate_image(prompt):
  model_id = "runwayml/stable-diffusion-v1-5"
  device = "cpu"

  pipe = StableDiffusionPipeline.from_pretrained(model_id)
  pipe = pipe.to(device)

  image = pipe(prompt).images[0]
  home_dir = os.path.expanduser("~")
  image_path = os.path.join(home_dir, "generated_image.png")
  image.save(image_path)

  return image_path

if __name__ == "__main__":
  prompt = sys.argv[1]
  try:
    image_path = generate_image(prompt)
    print(image_path)
  except Exception as e:
    print(f"Error during image generation: {e}")