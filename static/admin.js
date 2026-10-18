// State holders
let allUsers = [];

// Switch sidebar tabs
function switchTab(tabName) {
    // Update nav button active states
    document.querySelectorAll('.nav-menu button').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update panel active states
    document.querySelectorAll('.section-panel').forEach(panel => panel.classList.remove('active-panel'));
    const targetPanel = document.getElementById(`panel-${tabName}`);
    if (targetPanel) {
        targetPanel.classList.add('active-panel');
    }

    // Update header breadcrumb
    const breadcrumb = document.getElementById('headerBreadcrumb');
    if (breadcrumb) {
        const titles = {
            'dashboard': 'Dashboard Overview',
            'users': 'Registered Students Directory',
            'questions': 'Psychometric Question Bank',
            'results': 'Student Assessment Results',
            'careers': 'Manage Careers'
        };
        breadcrumb.innerText = titles[tabName] || 'Dashboard';
    }
}

// Fetch stats and user directory from Flask
async function loadDashboardStats() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.innerText = "⏳ Loading Data...";

    try {
        const response = await fetch('/api/admin/data');
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            // 1. Update numeric metric counters
            document.getElementById('stat-students').innerText = data.stats.total_students;
            document.getElementById('stat-questions').innerText = data.stats.assessment_questions;
            document.getElementById('stat-tests').innerText = data.stats.assessments_completed;
            document.getElementById('stat-careers').innerText = data.stats.curated_careers;

            // 2. Save users and render table
            allUsers = data.users || [];
            renderUsersTable();
        } else {
            console.error("Failed to load admin stats:", data.message);
        }
    } catch (err) {
        console.error("Network error fetching admin data:", err);
    } finally {
        if (refreshBtn) refreshBtn.innerText = "⚡ Refresh Cloud Data";
    }
}

// Render student rows into the table
function renderUsersTable() {
    const tbody = document.getElementById('userTableBody');
    const searchInput = document.getElementById('searchUser');
    const countBadge = document.getElementById('userTableCount');
    
    if (!tbody) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter users by search input
    const filtered = allUsers.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.stream && u.stream.toLowerCase().includes(query))
    );

    if (countBadge) {
        countBadge.innerText = `Showing ${filtered.length} student${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #71717a; padding: 2rem;">
                    No registered student records found.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(user => `
        <tr>
            <td>
                <div style="font-weight: 700; color: #ffffff;">${escapeHtml(user.name)}</div>
            </td>
            <td>${escapeHtml(user.email)}</td>
            <td>
                <span class="tag-badge">${escapeHtml(user.stream)}</span>
            </td>
            <td>
                ${user.testCompleted 
                    ? '<span class="tag-badge tag-green">Completed</span>' 
                    : '<span class="tag-badge tag-yellow">Pending</span>'}
            </td>
            <td style="font-family: monospace; font-size: 0.75rem; color: #71717a;">
                ${user.uid.substring(0, 10)}...
            </td>
        </tr>
    `).join('');
}

// Utility to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Automatically fetch data when admin page loads
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});