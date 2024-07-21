import torch
from diffusers import StableDiffusionPipeline
import sys

try:
    model_id = "CompVis/stable-diffusion-v1-4"
    print(f"Loading model {model_id}...")
    pipe = StableDiffusionPipeline.from_pretrained(model_id)
    pipe = pipe.to("cuda")

    prompt = sys.argv[1]
    print(f"Generating image for prompt: {prompt}")

    with torch.no_grad():
        image = pipe(prompt)["sample"][0]

    image_path = "generated_image.png"
    image.save(image_path)

    print(f"Image saved at {image_path}")

except Exception as e:
    print(f"Error during image generation: {e}")
