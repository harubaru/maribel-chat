import os
import requests

url = 'http://127.0.0.1:8000/convogpt-6b/generate'
feedback_url = 'http://127.0.0.1:8000/convogpt-6b/feedback'

def gen(prompt: str, length: int, count: int) -> list:
    params = {
        'prompt': prompt,
        'length': length,
        'count': count
    }
    response = requests.get(url, json=params)
    if response.status_code != 200:
        raise Exception(response.text)
    return response.json()

def feedback(prompt: str, response: str, good: bool):
    params = {
        'input': prompt,
        'output': response,
        'reward': 1.0 if good else 0.0
    }
    requests.post(feedback_url, json=params)

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

agent = input('Agent-Name: ')
user = input('User-Name: ')
convo_chain = []
while True:
    clear()
    # print the conversation chain
    formatted_chain = "\n".join(convo_chain)
    print(formatted_chain)
    convo_chain.append(f'{user}: ' + input(f'{user}: '))
    convo_chain.append(f'{agent}:')

    prompt = '\n'.join(convo_chain)

    result = gen(prompt, 50, 4)

    # ask the user to select one of the generated responses
    for i, r in enumerate(result):
        print(f'{i}: {r}')
    
    choice = input('Select a response: ')
    if choice == 'q':
        exit()
    
    if choice == 'e':
        result.append(input('Enter a custom response: '))  
        choice = result.index(result[-1])

    # send the selected response to the feedback endpoint
    feedback(prompt, result[int(choice)].lstrip(), True)
    # send the other responses to the feedback endpoint with a negative reward
    for i, r in enumerate(result):
        if i != int(choice):
            feedback(prompt, r, False)

    convo_chain[-1] = f'{convo_chain[-1]} {result[int(choice)].rstrip().lstrip()}'
