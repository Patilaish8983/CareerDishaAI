// LocalStorage data management for Career Disha AI User Module
const Storage = {
    getUser: () => JSON.parse(localStorage.getItem('cd_user')) || {
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        class: '12th Grade',
        stream: 'Science (PCM)',
        marks: { physics: 88, math: 92, chemistry: 81, english: 95, cs: 94 },
        testCompleted: false,
        testAnswers: {}
    },
    setUser: (data) => localStorage.setItem('cd_user', JSON.stringify(data)),
    getResults: () => JSON.parse(localStorage.getItem('cd_results')) || null,
    setResults: (data) => localStorage.setItem('cd_results', JSON.stringify(data))
};

// Common Navbar Header Component Injector
function renderUserNavbar(activeTab) {
    const nav = document.getElementById('user-nav');
    if (!nav) return;

    // Ensure the main container has structural styling classes applied
    if (!nav.classList.contains('user-navbar')) {
        nav.classList.add('user-navbar');
    }

    // Clean Flask Endpoints including Back to Home
    const links = [
        { name: 'Dashboard', url: '/user/dashboard', id: 'dashboard' },
        { name: 'Profile & Marks', url: '/user/profile', id: 'profile' },
        { name: 'Psychometric Test', url: '/user/test', id: 'test' },
        { name: 'Results', url: '/user/results', id: 'results' },
        { name: 'Careers & Roadmap', url: '/user/careers', id: 'careers' },
        { name: 'AI Counselor', url: '/user/chatbot', id: 'chatbot' }
    ];

    nav.innerHTML = `
        <div class="logo-area">
            <a href="/user/dashboard" style="display:flex; align-items:center; gap:0.75rem; text-decoration:none;">
                <div class="logo-box bg-yellow">CD</div>
                <span class="brand-name">Career Disha <span class="yellow-text">AI</span></span>
            </a>
        </div>
        <div class="nav-links">
            ${links.map(l => `<a href="${l.url}" class="${activeTab === l.id ? 'active' : ''}">${l.name}</a>`).join('')}
        </div>
        <div class="nav-actions" style="display:flex; align-items:center; gap:1rem;">
            <span style="font-size: 0.85rem; color: #a1a1aa;">Welcome, <strong id="user-display-name" style="color:#ffffff;">Student</strong></span>
            <a href="/" class="nav-btn home-btn" style="text-decoration:none; color:#a1a1aa; font-size:0.85rem;">Home</a>
            <a href="/auth?mode=login" class="nav-btn logout-btn">Logout</a>
        </div>
    `;

    const user = Storage.getUser();
    const nameEl = document.getElementById('user-display-name');
    if (nameEl && user.name) nameEl.textContent = user.name.split(' ')[0];
}