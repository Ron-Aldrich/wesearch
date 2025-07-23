from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime

app = Flask(__name__, static_folder='static')

API_KEY = "897b24be38192e26a2203a67aa80792e478fa3b80bc41c3063bb6045d22121a1"


GEMINI_URL = "https://haji-mix-api.gleeze.com/api/gemini"
XDASH_URL = "https://haji-mix-api.gleeze.com/api/xdash"


def call_ai_with_fallback(question):

    try:
        gemini_params = {
            "ask": question,
            "model": "gemini-1.5-flash",
            "uid": "",
            "roleplay": "You're Gemini AI Assistant",
            "google_api_key": "",
            "file_url": "",
            "max_tokens": "",
            "api_key": API_KEY
        }
        gemini_res = requests.get(GEMINI_URL, params=gemini_params, timeout=10)
        gemini_data = gemini_res.json()

        if "answer" in gemini_data and gemini_data["answer"]:
            print("[Gemini] AI model used:", gemini_data.get("model_used"))
            return gemini_data["answer"]
    except Exception as e:
        print("[Gemini ERROR]", e)

    # Fallback 
    try:
        xdash_params = {
            "ask": question,
            "stream": "false",
            "api_key": API_KEY
        }
        xdash_res = requests.get(XDASH_URL, params=xdash_params, timeout=10)
        xdash_data = xdash_res.json()
        if "answer" in xdash_data and "llm_response" in xdash_data["answer"]:
            print("[XDash] Fallback AI used.")
            return xdash_data["answer"]["llm_response"]
    except Exception as e:
        print("[XDash ERROR]", e)

    return None

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "").strip()

    if not message:
        return jsonify(success=False, error="Message is required")

    print("User question:", message)

    ai_response = call_ai_with_fallback(message)

    if ai_response:
        print("AI response:", ai_response)
        return jsonify(success=True, answer=ai_response, timestamp=datetime.utcnow().isoformat())

    fallback_response = "I'm sorry, both AI models are currently unavailable. Please try again later."
    return jsonify(success=True, answer=fallback_response, timestamp=datetime.utcnow().isoformat())

@app.route("/health")
def health():
    return jsonify(
        status="OK",
        message="WeSearch Backend with AI is running!",
        aiApiStatus="Connected to Gemini + XDash API"
    )

@app.route("/test-ai")
def test_ai():
    test_question = request.args.get("q", "Hello, can you help me with research?")
    response = call_ai_with_fallback(test_question)
    return jsonify(question=test_question, answer=response or "No response")

@app.route('/interface')
def interface():
    return render_template("interface.html")

@app.route("/team")
def team():
    return render_template("team.html")

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
