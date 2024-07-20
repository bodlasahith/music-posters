import torch
from diffusers import StableDiffusionPipeline

# Load the pre-trained Stable Diffusion model from Hugging Face
model_id = "CompVis/stable-diffusion-v1-4"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe = pipe.to("cuda")

# Define your text prompt
prompt = "A futuristic cityscape at sunset"

# Generate an image from the text prompt
with torch.autocast("cuda"):
    image = pipe(prompt)["sample"][0]

# Save the generated image
image.save("public/images/generated_image.png")