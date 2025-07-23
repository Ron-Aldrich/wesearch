// public/script.js - Frontend JavaScript with Chat Functionality

let chatIsOpen = false;

function logoClick() {
    const logo = document.querySelector('.logo');
    logo.style.animation = 'none';
    logo.offsetHeight;
    logo.style.animation = 'float 2s ease-in-out';
}

function toggleContactPanel() {
    const panel = document.getElementById('contactPanel');
    const overlay = document.getElementById('overlay');
    const hamburger = document.querySelector('.hamburger-menu');
    panel.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function toggleChatInterface() {
    const chatInterface = document.getElementById('chatInterface');
    const chatButton = document.querySelector('.chat-bot-button');
    chatIsOpen = !chatIsOpen;
    if (chatIsOpen) {
        chatInterface.classList.add('active');
        chatInterface.style.display = 'flex';
        chatButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 300);
    } else {
        chatInterface.classList.remove('active');
        setTimeout(() => {
            chatInterface.style.display = 'none';
        }, 300);
        chatButton.style.transform = 'scale(1)';
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const message = input.value.trim();
    if (!message) return;

    input.disabled = true;
    sendButton.disabled = true;
    addMessage(message, 'user');
    input.value = '';
    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        hideTypingIndicator();
        if (data.success && data.answer) {
            addMessage(data.answer, 'bot');
        } else {
            addMessage("Sorry, I couldn't process your request. Please try again!", 'bot');
        }
    } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        addMessage("I'm having trouble connecting right now. Please check your internet connection and try again!", 'bot');
    }

    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
}

function addMessage(text, type) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    if (type === 'bot') {
        messageContent.innerHTML = formatText(text);
    } else {
        messageContent.textContent = text;
    }

    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 50);
}

function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.add('active');
    document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('WeSearch initialized successfully!');
    console.log('WeBot is ready to help with research questions!');
    fetch('/health')
        .then(response => response.json())
        .then(data => console.log('Backend status:', data))
        .catch(error => console.warn('Backend connection test failed:', error));
});

window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && chatIsOpen) {
        const chatInterface = document.getElementById('chatInterface');
        chatInterface.style.width = '90%';
        chatInterface.style.right = '5%';
    }
});

document.addEventListener('click', (event) => {
    const chatInterface = document.getElementById('chatInterface');
    const chatButton = document.querySelector('.chat-bot-button');
    if (chatIsOpen && !chatInterface.contains(event.target) && !chatButton.contains(event.target)) {
        if (window.innerWidth > 768) toggleChatInterface();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.target.id === 'chatInput' && event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
    }
});

// Converts raw AI text into clean HTML
function formatText(text) {
    // Wrap paragraphs
    text = text.replace(/\n{2,}/g, '</p><p>');
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    // Bold, Italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Basic bullet support
    text = text.replace(/(?:^|\n)[\*\-] (.*?)(?=\n|$)/g, '<br>&bull; $1');
    return `<p>${text}</p>`;
}