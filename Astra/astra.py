import requests
import time
import os

API_KEY = "3eef878356d3b8497e3d3ef4532c88dc"

URL = "https://api.kie.ai/codex/v1/responses"

conversation = []

print("GPT-6 Astra Chatbot")
print("Type 'exit' to quit")
print("Type 'image <path>' to send an image")


def send_image(image_path):
    if not os.path.isfile(image_path):
        return f"File not found: {image_path}"
    conversation.append({
        "role": "user",
        "content": [
            {
                "type": "input_image",
                "image_url": os.path.abspath(image_path)
            }
        ]
    })
    return "Image added to conversation."


def ask_gpt(message):
    conversation.append({
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": message
            }
        ]
    })

    payload = {
        "model": "gpt-6-astra",
        "input": conversation,
        "stream": False,
        "reasoning": {
            "effort": "medium"
        }
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    for attempt in range(3):
        try:
            response = requests.post(URL, headers=headers, json=payload, timeout=60)
            if response.status_code == 500:
                print(f"Server error, retrying... ({attempt + 1}/3)")
                time.sleep(5)
                continue
            response.raise_for_status()
            data = response.json()

            assistant_message = ""
            for item in data.get("output", []):
                if item.get("type") == "message":
                    for content in item.get("content", []):
                        if content.get("type") == "output_text":
                            assistant_message += content.get("text", "")

            conversation.append({
                "role": "assistant",
                "content": [
                    {
                        "type": "output_text",
                        "text": assistant_message
                    }
                ]
            })
            return assistant_message
        except Exception as e:
            if attempt == 2:
                return f"Error: {e}"
            time.sleep(5)


while True:
    user_message = input("You: ")

    if user_message.lower() in ["exit", "quit", "bye"]:
        print("Bot: Goodbye!")
        break

    if user_message.lower().startswith("image "):
        print(send_image(user_message[6:].strip()))
        continue

    print("Bot is thinking...")
    answer = ask_gpt(user_message)
    print("GPT-6 Astra:", answer)
    print()