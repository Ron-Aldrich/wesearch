// Team member data - Replace with your actual research team data
const teamMembers = [
    {
        name: "Ronaldrich Duterte",
        gender: "male",
        email: "ronaldrichd@gmail.com",
        image: "/static/TeamAssets/img/ron.jpg"
    },
    {
        name: "Keyser Alcabedas",
        gender: "male",
        email: "#",
        image: "/static/TeamAssets/img/keyser.jpg"
    },
    {
        name: "Jared Ramos",
        gender: "male",
        email: "#",
        image: "https://via.placeholder.com/200x200/4ecdc4/ffffff?text=JR"
    },
    {
        name: "Hance Calimag",
        gender: "Male",
        email: "#",
        image: "https://via.placeholder.com/200x200/ff6b6b/ffffff?text=HC"
    },
    {
        name: "Miko Olivas",
        gender: "male",
        email: "#",
        image: "https://via.placeholder.com/200x200/4ecdc4/ffffff?text=MO"
    },
    {
        name: "Steven Magili",
        gender: "male",
        email: "stevenross647@gmail.com",
        image: "/static/TeamAssets/img/steve.jpeg"
    },
    {
        name: "Lance Culasing",
        gender: "male",
        email: "#",
        image: "https://via.placeholder.com/200x200/ff6b6b/ffffff?text=GB"
    },
    {
        name: "Lance Culasing",
        gender: "male",
        email: "#",
        image: "https://via.placeholder.com/200x200/ff6b6b/ffffff?text=GB"
    },
    {
        name: "Jannier Maruzzo",
        gender: "male",
        email: "#",
        image: "https://via.placeholder.com/200x200/ff6b6b/ffffff?text=GB"
    },
    {
        name: "Iron Cabrera",
        gender: "male",
        email: "#",
        image: "/static/TeamAssets/img/iron.jpg"
    },
    {
        name: "Rainz Maltu",
        gender: "male",
        email: "#",
        image: "/static/TeamAssets/img/rain.jpg"
    },
    {
        name: "Jasper Castellano Repollo",
        gender: "male",
        email: "#",
        image: "/static/TeamAssets/img/jasper.jpg"
    }
];

let currentFilter = 'all';
let currentSearch = '';


document.addEventListener('DOMContentLoaded', function() {
    animateStats();
    setupEventListeners();
    updateCounts();
});

// Animate the statistics numbers on landing page
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 30);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchBar');
    const clearSearch = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', function() {
        currentSearch = this.value;
        if (this.value) {
            clearSearch.style.display = 'block';
        } else {
            clearSearch.style.display = 'none';
        }
        renderTeamMembers();
    });
    
    clearSearch.addEventListener('click', function() {
        searchInput.value = '';
        currentSearch = '';
        this.style.display = 'none';
        renderTeamMembers();
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            renderTeamMembers();
        });
    });
    
    // Modal close on overlay click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Navigation functions
function enterDirectory() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('directoryPage').style.display = 'block';
    renderTeamMembers();
}

function backToLanding() {
    document.getElementById('directoryPage').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
    
    // Reset search and filters
    currentSearch = '';
    currentFilter = 'all';
    document.getElementById('searchBar').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    
    // Reset active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
}

// Update member counts
function updateCounts() {
    const total = teamMembers.length;
    const maleCount = teamMembers.filter(member => member.gender.toLowerCase() === 'male').length;
    const femaleCount = teamMembers.filter(member => member.gender.toLowerCase() === 'female').length;
    
    document.getElementById('allCount').textContent = total;
    document.getElementById('maleCount').textContent = maleCount;
    document.getElementById('femaleCount').textContent = femaleCount;
    
    // Update landing page stat
    const statNumber = document.querySelector('.stat-number[data-count="7"]');
    if (statNumber) {
        statNumber.setAttribute('data-count', total);
    }
}

// Render team members
function renderTeamMembers() {
    const grid = document.getElementById('teamGrid');
    const noResults = document.getElementById('noResults');
    
    // Filter members
    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                            member.email.toLowerCase().includes(currentSearch.toLowerCase());
        const matchesGender = currentFilter === 'all' || member.gender.toLowerCase() === currentFilter;
        return matchesSearch && matchesGender;
    });
    
    // Clear grid
    grid.innerHTML = '';
    
    if (filteredMembers.length === 0) {
        noResults.style.display = 'block';
        return;
    } else {
        noResults.style.display = 'none';
    }
    
    // Create member cards
    filteredMembers.forEach((member, index) => {
        const card = document.createElement('div');
        card.className = 'member-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="member-avatar">
                <img src="${member.image}" alt="${member.name}" 
                     onerror="this.style.display='none'; this.parentElement.innerHTML='${getInitials(member.name)}';">
            </div>
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-role" style="text-transform: none;">${member.email}</div>
            </div>
        `;
        
        card.addEventListener('click', () => showModal(member));
        grid.appendChild(card);
    });
}

// Get initials from name
function getInitials(name) {
    return name.split(' ')
               .map(word => word.charAt(0).toUpperCase())
               .join('');
}

function showModal(member) {
    const modal = document.getElementById('memberModal');
    const modalAvatar = document.getElementById('modalAvatar');
    const modalName = document.getElementById('modalName');
    const modalEmailHeader = document.getElementById('modalEmailHeader');
    const modalName2 = document.getElementById('modalName2');
    const modalEmail = document.getElementById('modalEmail');
    
 
    modalAvatar.innerHTML = `<img src="${member.image}" alt="${member.name}" 
                                  onerror="this.style.display='none'; this.parentElement.innerHTML='${getInitials(member.name)}';">`;
    modalName.textContent = member.name;
    modalEmailHeader.textContent = member.email;
    modalName2.textContent = member.name;
    modalEmail.textContent = member.email;
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Ensure email elements don't have text-transform applied
    modalEmailHeader.style.textTransform = 'none';
    modalEmail.style.textTransform = 'none';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('memberModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Initialize counts on page load
updateCounts();