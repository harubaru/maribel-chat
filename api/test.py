import requests

url = 'http://127.0.0.1:8000/distilgpt2/generate'
params = {
    'prompt': 'Hello, world!',
    'length': 100,
    'count': 5
}
response = requests.get(url, json=params)
print(response.json())