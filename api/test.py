import requests

url = 'http://127.0.0.1:8000/convogpt-6b/generate'
params = {
    'prompt': 'Hello, world!',
    'length': 10,
    'count': 1
}
response = requests.get(url, json=params)
print(response.json())