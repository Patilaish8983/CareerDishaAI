// LocalStorage data management for Career Disha AI User Module
const Storage = {
    getUser: () => JSON.parse(localStorage.getItem('cd_user')) || {
        name: 'Student',
        email: '',
        class: 'Standard Track',
        stream: 'General',
        marks: {},
        testCompleted: false,
        testAnswers: {}
    },
    setUser: (data) => localStorage.setItem('cd_user', JSON.stringify(data)),
    getResults: () => JSON.parse(localStorage.getItem('cd_results')) || null,
    setResults: (data) => localStorage.setItem('cd_results', JSON.stringify(data))
};

// Common Navbar Header Component Injector
function renderUserNavbar(activeTab) {
    const navContainer = document.getElementById('user-nav');
    if (!navContainer) return;

    navContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="logo-box bg-yellow">CD</div>
            <span class="brand-name">Career Disha AI</span>
        </div>

        <div class="nav-links">
            <a href="/user/dashboard" class="${activeTab === 'dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="/user/profile" class="${activeTab === 'profile' ? 'active' : ''}">Profile & Marks</a>
            <a href="/user/test" class="${activeTab === 'test' ? 'active' : ''}">Psychometric Test</a>
            <a href="/user/results" class="${activeTab === 'results' ? 'active' : ''}">Results</a>
            <a href="/user/careers" class="${activeTab === 'careers' ? 'active' : ''}">Careers & Roadmap</a>
            <a href="/user/chatbot" class="${activeTab === 'chatbot' ? 'active' : ''}">AI Counselor</a>
        </div>

        <div class="nav-actions">
            <span style="font-size: 0.85rem; color: #a1a1aa;">
                Welcome, <strong id="nav-user-first-name" style="color: #ffffff;">Loading...</strong>
            </span>
            <a href="/" class="nav-links" style="font-size: 0.85rem; color: #a1a1aa; text-decoration: none;">Home</a>
            <button id="logoutBtn" class="logout-btn">Logout</button>
        </div>
    `;
}

// Global Event Listener for Logout Button (Works across all pages)
document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'logoutBtn') {
        e.preventDefault();
        try {
            const { getAuth, signOut } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
            const auth = getAuth();
            await signOut(auth);
            window.location.href = "/auth";
        } catch (err) {
            console.error("Logout error:", err);
            window.location.href = "/auth";
        }
    }
});