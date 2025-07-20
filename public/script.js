// public/script.js - Frontend JavaScript with Chat Functionality

// Global variables for chat
let chatIsOpen = false;

// Logo click animation
function logoClick() {
    const logo = document.querySelector('.logo');
    logo.style.animation = 'none';
    logo.offsetHeight; // Trigger reflow
    logo.style.animation = 'float 2s ease-in-out';
}

// Contact panel toggle
function toggleContactPanel() {
    const panel = document.getElementById('contactPanel');
    const overlay = document.getElementById('overlay');
    const hamburger = document.querySelector('.hamburger-menu');
    
    panel.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Chat interface functions
function toggleChatInterface() {
    const chatInterface = document.getElementById('chatInterface');
    const chatButton = document.querySelector('.chat-bot-button');
    
    chatIsOpen = !chatIsOpen;
    
    if (chatIsOpen) {
        chatInterface.classList.add('active');
        chatInterface.style.display = 'flex';
        chatButton.style.transform = 'scale(0.9)';
        
        // Focus on input when opening
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

// Handle Enter key press in chat input
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send message function
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Disable input and button
    input.disabled = true;
    sendButton.disabled = true;
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send to backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message
            })
        });
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        if (data.success && data.answer) {
            // Add bot response
            addMessage(data.answer, 'bot');
        } else {
            // Add error message
            addMessage("Sorry, I couldn't process your request. Please try again!", 'bot');
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        addMessage("I'm having trouble connecting right now. Please check your internet connection and try again!", 'bot');
    }
    
    // Re-enable input and button
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
}

// Add message to chat
function addMessage(text, type) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = text;
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 50);
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.add('active');
    
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.remove('active');
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('WeSearch initialized successfully!');
    console.log('WeBot is ready to help with research questions!');
    
    // Test connection to backend
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            console.log('Backend status:', data);
        })
        .catch(error => {
            console.warn('Backend connection test failed:', error);
        });
});

// Handle window resize for mobile responsiveness
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768 && chatIsOpen) {
        const chatInterface = document.getElementById('chatInterface');
        chatInterface.style.width = '90%';
        chatInterface.style.right = '5%';
    }
});

// Close chat when clicking outside (for mobile)
document.addEventListener('click', function(event) {
    const chatInterface = document.getElementById('chatInterface');
    const chatButton = document.querySelector('.chat-bot-button');
    
    if (chatIsOpen && 
        !chatInterface.contains(event.target) && 
        !chatButton.contains(event.target)) {
        // Don't auto-close on mobile to prevent accidental closes
        if (window.innerWidth > 768) {
            toggleChatInterface();
        }
    }
});

// Prevent form submission on Enter in chat
document.addEventListener('keydown', function(event) {
    if (event.target.id === 'chatInput' && event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
    }
});