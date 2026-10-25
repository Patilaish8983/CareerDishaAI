let allUsers = [];
let allQuestions = [];
let allCareers = [];
let allResults = [];

// Tab Switcher
function switchTab(tabName) {
    document.querySelectorAll('.nav-menu button').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.currentTarget) window.event.currentTarget.classList.add('active');

    document.querySelectorAll('.section-panel').forEach(panel => panel.classList.remove('active-panel'));
    const targetPanel = document.getElementById(`panel-${tabName}`);
    if (targetPanel) targetPanel.classList.add('active-panel');

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
    if (tabName === 'results') {
        loadResults();
    }
}

// 1. Fetch Overview & Student Data
async function loadDashboardStats() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.innerText = "⏳ Loading Data...";

    try {
        const response = await fetch('/api/admin/data');
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            document.getElementById('stat-students').innerText = data.stats.total_students || 0;
            document.getElementById('stat-questions').innerText = data.stats.assessment_questions || 0;
            document.getElementById('stat-tests').innerText = data.stats.assessments_completed || 0;
            document.getElementById('stat-careers').innerText = data.stats.curated_careers || 0;

            allUsers = data.users || [];
            renderUsersTable();
        }
    } catch (err) {
        console.error("Error loading admin stats:", err);
    } finally {
        if (refreshBtn) refreshBtn.innerText = "⚡ Refresh Cloud Data";
    }
}

// 2. Fetch Questions from Firestore
async function loadQuestions() {
    try {
        const res = await fetch('/api/admin/questions');
        const data = await res.json();
        if (res.ok && data.status === 'success') {
            allQuestions = data.questions || [];
            renderQuestionsTable();
        }
    } catch (err) {
        console.error("Error loading questions:", err);
    }
}

// 3. Fetch Careers from Firestore
async function loadCareers() {
    try {
        const res = await fetch('/api/admin/careers');
        const data = await res.json();
        if (res.ok && data.status === 'success') {
            allCareers = data.careers || [];
            renderCareersTable();
            renderCareerBreakdown();
        }
    } catch (err) {
        console.error("Error loading careers:", err);
    }
}

// Render Users Table
function renderUsersTable() {
    const tbody = document.getElementById('userTableBody');
    const searchInput = document.getElementById('searchUser');
    const countBadge = document.getElementById('userTableCount');
    if (!tbody) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filtered = allUsers.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.stream && u.stream.toLowerCase().includes(query))
    );

    if (countBadge) countBadge.innerText = `Showing ${filtered.length} student${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#71717a; padding:2rem;">No registered student records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(user => `
        <tr>
            <td><div style="font-weight: 700; color: #ffffff;">${escapeHtml(user.name || 'Student')}</div></td>
            <td>${escapeHtml(user.email)}</td>
            <td><span class="tag-badge">${escapeHtml(user.stream || 'General')}</span></td>
            <td>${user.testCompleted ? '<span class="tag-badge tag-green">Completed</span>' : '<span class="tag-badge tag-yellow">Pending</span>'}</td>
            <td style="font-family: monospace; font-size: 0.75rem; color: #71717a;">${user.uid ? user.uid.substring(0, 10) + '...' : '-'}</td>
        </tr>
    `).join('');
}

// Render Questions Table with Clean Alignment
function renderQuestionsTable() {
    const tbody = document.getElementById('questionsTableBody');
    if (!tbody) return;

    if (allQuestions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#71717a; padding:2rem;">No assessment questions found in Firestore.</td></tr>`;
        return;
    }

    tbody.innerHTML = allQuestions.map((q, idx) => `
        <tr>
            <td style="font-weight: 700; color: #facc15; vertical-align: top; width: 5%;">
                #${idx + 1}
            </td>
            <td style="vertical-align: top; width: 35%; padding-right: 1.5rem;">
                <div style="font-weight: 600; line-height: 1.5; color: #ffffff;">
                    ${escapeHtml(q.q || 'Untitled Question')}
                </div>
            </td>
            <td style="vertical-align: top; width: 45%;">
                <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                    ${(q.options || []).map(opt => `
                        <div style="display: flex; align-items: center; justify-content: space-between; background: #141416; border: 1px solid #27272a; padding: 0.45rem 0.75rem; border-radius: 8px; font-size: 0.82rem;">
                            <span style="color: #d4d4d8; margin-right: 0.75rem;">${escapeHtml(opt.text || opt.label || '')}</span>
                            <span class="tag-badge tag-yellow" style="white-space: nowrap; font-size: 0.7rem;">${escapeHtml(opt.domain || opt.tag || '')}</span>
                        </div>
                    `).join('')}
                </div>
            </td>
            <td style="text-align: right; vertical-align: top; width: 15%; white-space: nowrap;">
                <button class="btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; margin-right: 0.35rem;" onclick="editQuestion('${q.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteQuestion('${q.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Render Careers Table with Edit & Delete Options
function renderCareersTable() {
    const tbody = document.getElementById('careersTableBody');
    if (!tbody) return;

    if (allCareers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#71717a; padding:2rem;">No curated career pathways found in Firestore.</td></tr>`;
        return;
    }

    tbody.innerHTML = allCareers.map(c => `
        <tr>
            <td>
                <div style="font-weight:700; color:#ffffff;">${escapeHtml(c.title)}</div>
                <span class="tag-badge tag-yellow">${escapeHtml(c.domain || c.tag)}</span>
            </td>
            <td><div style="max-width:350px; font-size:0.85rem; color:#a1a1aa;">${escapeHtml(c.description || c.desc || c.short_desc || c.details || c.scope || 'No description provided')}</div></td>
            <td><strong style="color:#22c55e;">${escapeHtml(c.salary || c.salary_range || 'Competitive')}</strong></td>
            <td style="text-align:right; white-space:nowrap;">
                <button class="btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; margin-right: 0.35rem;" onclick="editCareer('${c.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteCareer('${c.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Render Dashboard Career Breakdown Widget
function renderCareerBreakdown() {
    const list = document.getElementById('careerBreakdownList');
    if (!list) return;
    list.innerHTML = allCareers.slice(0, 5).map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#09090b; padding:0.6rem 0.8rem; border-radius:8px;">
            <span style="font-size:0.85rem; font-weight:600;">${escapeHtml(c.title)}</span>
            <span class="tag-badge">${escapeHtml(c.domain || c.tag)}</span>
        </div>
    `).join('');
}

// Modals Management
function openQuestionModal() { 
    document.getElementById('questionForm').reset();
    const hiddenId = document.getElementById('editQuestionIndex');
    if (hiddenId) hiddenId.value = "-1";
    const modalTitle = document.getElementById('questionModalTitle');
    if (modalTitle) modalTitle.innerText = "Add 5-Option Assessment Question";
    document.getElementById('questionModal').style.display = 'flex'; 
}

function openCareerModal() { 
    document.getElementById('careerForm').reset();
    const hiddenId = document.getElementById('editCareerIndex');
    if (hiddenId) hiddenId.value = "-1";
    const modalTitle = document.getElementById('careerModalTitle');
    if (modalTitle) modalTitle.innerText = "Add New Career Pathway";
    document.getElementById('careerModal').style.display = 'flex'; 
}

function closeModals() {
    document.getElementById('questionModal').style.display = 'none';
    document.getElementById('careerModal').style.display = 'none';
}

// Edit Form Populators
function editQuestion(id) {
    const q = allQuestions.find(item => item.id === id);
    if (!q) return;

    const hiddenId = document.getElementById('editQuestionIndex');
    if (hiddenId) hiddenId.value = q.id;

    const modalTitle = document.getElementById('questionModalTitle');
    if (modalTitle) modalTitle.innerText = "Edit Assessment Question";

    // Prioritize q, then prompt
    document.getElementById('form-q-text').value = q.q || '';

    (q.options || []).forEach((opt, idx) => {
        if (idx < 5) {
            const optInput = document.getElementById(`form-opt-${idx}`);
            const tagSelect = document.getElementById(`form-tag-${idx}`);
            if (optInput) optInput.value = opt.text || opt.label || '';
            if (tagSelect) tagSelect.value = opt.domain || opt.tag || 'Tech & Software';
        }
    });

    document.getElementById('questionModal').style.display = 'flex';
}

function editCareer(id) {
    const c = allCareers.find(item => item.id === id);
    if (!c) return;

    const hiddenId = document.getElementById('editCareerIndex');
    if (hiddenId) hiddenId.value = c.id;

    const modalTitle = document.getElementById('careerModalTitle');
    if (modalTitle) modalTitle.innerText = "Edit Career Pathway";

    document.getElementById('form-c-title').value = c.title || '';
    document.getElementById('form-c-tag').value = c.domain || c.tag || '';
    document.getElementById('form-c-salary').value = c.salary || c.salary_range || '';
    document.getElementById('form-c-desc').value = c.description || c.desc || c.short_desc || '';

    document.getElementById('careerModal').style.display = 'flex';
}

// Question Submission Handler (Handles both Create [POST] and Update [PUT])
async function handleQuestionSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editQuestionIndex')?.value;
    const isEdit = editId && editId !== "-1";

    const promptText = document.getElementById('form-q-text').value.trim();
    const options = [0, 1, 2, 3, 4].map(i => {
        const val = document.getElementById(`form-tag-${i}`).value;
        return {
            text: document.getElementById(`form-opt-${i}`).value.trim(),
            domain: val,
            tag: val
        };
    });

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/admin/questions/${editId}` : '/api/admin/questions';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: promptText, options: options })       
        });
        const result = await res.json();

        if (res.ok && result.status === 'success') {
            closeModals();
            document.getElementById('questionForm').reset();
            loadQuestions();
            loadDashboardStats();
        } else {
            alert(result.message || "Failed to save question.");
        }
    } catch (err) {
        console.error("Save question error:", err);
    }
}

// Fetch Assessment Results from Firestore
async function loadResults() {
    try {
        const res = await fetch('/api/admin/results');
        const data = await res.json();
        if (res.ok && data.status === 'success') {
            allResults = data.results || [];
            renderResultsTable();
        }
    } catch (err) {
        console.error("Error loading assessment results:", err);
    }
}

// Render Results Table
function renderResultsTable() {
    const tbody = document.getElementById('resultsTableBody');
    if (!tbody) return;

    if (allResults.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#71717a; padding:2.5rem;">No student assessment submissions found.</td></tr>`;
        return;
    }

    tbody.innerHTML = allResults.map(r => `
        <tr>
            <td>
                <div style="font-weight:700; color:#ffffff;">${escapeHtml(r.studentName || r.name || r.userEmail || 'Anonymous Student')}</div>
                <div style="font-size:0.75rem; color:#71717a; font-family:monospace;">${escapeHtml(r.studentEmail || r.email || '')}</div>
            </td>
            <td>
                <span class="tag-badge tag-yellow">${escapeHtml(r.dominantDomain || r.domain || 'N/A')}</span>
            </td>
            <td>
                <strong style="color:#ffffff;">${escapeHtml(r.topCareer || r.recommendedCareer || 'General Pathway')}</strong>
            </td>
            <td>
                <span style="font-weight:700; color:#22c55e;">${escapeHtml(String(r.matchScore || r.score || '100'))}%</span>
            </td>
            <td style="color:#a1a1aa; font-size:0.85rem;">
                ${escapeHtml(r.formattedDate || 'Recent')}
            </td>
        </tr>
    `).join('');
}

// Career Submission Handler (Handles both Create [POST] and Update [PUT])
async function handleCareerSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editCareerIndex')?.value;
    const isEdit = editId && editId !== "-1";

    const payload = {
        title: document.getElementById('form-c-title').value.trim(),
        domain: document.getElementById('form-c-tag').value.trim(),
        salary: document.getElementById('form-c-salary').value.trim(),
        description: document.getElementById('form-c-desc').value.trim()
    };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/admin/careers/${editId}` : '/api/admin/careers';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (res.ok && result.status === 'success') {
            closeModals();
            document.getElementById('careerForm').reset();
            loadCareers();
            loadDashboardStats();
        } else {
            alert(result.message || "Failed to save career pathway.");
        }
    } catch (err) {
        console.error("Save career error:", err);
    }
}

// Delete Question Handler
async function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
        const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadQuestions();
            loadDashboardStats();
        }
    } catch (err) {
        console.error("Delete question error:", err);
    }
}

// Delete Career Handler
async function deleteCareer(id) {
    if (!confirm('Are you sure you want to delete this career?')) return;
    try {
        const res = await fetch(`/api/admin/careers/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadCareers();
            loadDashboardStats();
        }
    } catch (err) {
        console.error("Delete career error:", err);
    }
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

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadQuestions();
    loadCareers();
    loadResults();
});