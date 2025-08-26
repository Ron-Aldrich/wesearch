from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime

app = Flask(__name__, static_folder='static')

# Your Gemini API Key
GEMINI_API_KEY = "AIzaSyCbnf25fZYiAa8ZAjaZhM3YZaTzVIvvyB8"

# Gemini endpoint
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"


def call_gemini(question):
    try:
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": question}
                    ]
                }
            ]
        }

        res = requests.post(GEMINI_URL, headers=headers, json=payload, timeout=10)
        data = res.json()

        if "candidates" in data and len(data["candidates"]) > 0:
            answer = data["candidates"][0]["content"]["parts"][0]["text"]
            return f"WeBot says:\n\n{answer}"

        return "WeBot says:\n\nSorry, I couldn’t get a response from Gemini."

    except Exception as e:
        print("[Gemini ERROR]", e)
        return "WeBot says:\n\nSorry, Gemini is currently unavailable. Please try again later."


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "").strip()

    if not message:
        return jsonify(success=False, error="Message is required")

    print("[User]:", message)

    ai_response = call_gemini(message)

    return jsonify(success=True, answer=ai_response, timestamp=datetime.utcnow().isoformat())


@app.route("/health")
def health():
    return jsonify(
        status="OK",
        message="WeSearch Backend with Gemini AI is running!",
        aiApiStatus="Connected to Gemini"
    )


@app.route("/test-ai")
def test_ai():
    test_question = request.args.get("q", "What is pi?")
    response = call_gemini(test_question)
    return jsonify(question=test_question, answer=response)


@app.route("/interface")
def interface():
    return render_template("interface.html")


@app.route("/team")
def team():
    return render_template("team.html")


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
