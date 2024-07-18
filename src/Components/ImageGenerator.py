import requests

# Replace with actual API endpoint and your API key
api_endpoint = 'https://api.example.com/image-generator'
api_key = 'your_api_key_here'

# Example parameters (replace with actual data or prompts)
params = {
    'text': 'A surreal landscape with floating islands'
}

# Headers with API key
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

# Make a GET request to the API
response = requests.get(api_endpoint, headers=headers, params=params)

# Check if request was successful (status code 200)
if response.status_code == 200:
    # Handle the response data (assuming JSON response)
    response_data = response.json()
    # Example: Save or display the generated image
    image_url = response_data.get('image_url')
    print(f'Generated image URL: {image_url}')
else:
    print(f'Error: {response.status_code}, {response.text}')
