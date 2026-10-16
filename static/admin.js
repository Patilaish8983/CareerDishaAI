let liveStudents = [];
let liveQuestions = [];
let liveResults = [];
let liveCareers = [];

function switchTab(tabId) {
    document.querySelectorAll('.section-panel').forEach(panel => panel.classList.remove('active-panel'));
    document.querySelectorAll('.nav-item button').forEach(btn => btn.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) targetPanel.classList.add('active-panel');

    const clickedBtn = Array.from(document.querySelectorAll('.nav-item button')).find(b => b.getAttribute('onclick')?.includes(tabId));
    if (clickedBtn) clickedBtn.classList.add('active');

    const breadcrumb = document.getElementById('headerBreadcrumb');
    const titles = {
        dashboard: "Dashboard Overview",
        users: "Registered Students Directory",
        questions: "Psychometric Question Bank",
        results: "Student Evaluation Analytics",
        careers: "Curated Career Pathways"
    };
    if (breadcrumb) breadcrumb.textContent = titles[tabId] || "Admin Console";
}

async function loadDashboardStats() {
    try {
        const [resUsers, resQuestions, resResults, resCareers, resMetrics] = await Promise.all([
            fetch('/api/admin/students').then(r => r.json()).catch(() => []),
            fetch('/api/admin/questions').then(r => r.json()).catch(() => []),
            fetch('/api/admin/results').then(r => r.json()).catch(() => []),
            fetch('/api/admin/careers').then(r => r.json()).catch(() => []),
            fetch('/api/admin/metrics').then(r => r.json()).catch(() => ({}))
        ]);

        liveStudents = Array.isArray(resUsers) ? resUsers : [];
        liveQuestions = Array.isArray(resQuestions) ? resQuestions : [];
        liveResults = Array.isArray(resResults) ? resResults : [];
        liveCareers = Array.isArray(resCareers) ? resCareers : [];

        // Safe metrics update
        if (resMetrics && resMetrics.total_visits !== undefined) {
            const visitorEl = document.getElementById('visitorCount');
            if (visitorEl) visitorEl.textContent = Number(resMetrics.total_visits).toLocaleString();
        }

        const elStudents = document.getElementById('stat-students');
        const elQuestions = document.getElementById('stat-questions');
        const elTests = document.getElementById('stat-tests');
        const elCareers = document.getElementById('stat-careers');

        if (elStudents) elStudents.textContent = liveStudents.length;
        if (elQuestions) elQuestions.textContent = liveQuestions.length;
        if (elTests) elTests.textContent = liveResults.length;
        if (elCareers) elCareers.textContent = liveCareers.length;

        const breakdownContainer = document.getElementById('careerBreakdownList');
        if (breakdownContainer) {
            breakdownContainer.innerHTML = '';
            liveCareers.slice(0, 3).forEach((c, idx) => {
                const item = document.createElement('div');
                item.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #09090b; border-radius: 8px; border: 1px solid #27272a;";
                item.innerHTML = `
                    <div>
                        <strong style="color: #ffffff; font-size: 0.9rem;">${idx + 1}. ${c.title || 'Career'}</strong>
                        <div style="font-size: 0.75rem; color: #a1a1aa;">${c.tag || 'General'}</div>
                    </div>
                    <span class="tag-badge tag-yellow">${c.salary || 'Competitive'}</span>
                    `;
                breakdownContainer.appendChild(item);
            });
        }

        renderUsersTable();
        renderQuestionsTable();
        renderResultsTable();
        renderCareersTable();
    } catch (err) {
        console.error("Error loading dashboard data:", err);
    }
}

/* ==========================================
   USERS TABLE
========================================== */
function renderUsersTable() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    const query = (document.getElementById('searchUser')?.value || '').toLowerCase();
    const filtered = liveStudents.filter(u => 
        (u.name || u.full_name || '').toLowerCase().includes(query) || 
        (u.email || '').toLowerCase().includes(query) || 
        (u.stream || '').toLowerCase().includes(query)
    );

    const countEl = document.getElementById('userTableCount');
    if (countEl) countEl.textContent = `Showing ${filtered.length} of ${liveStudents.length} registered students`;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#71717a; padding: 2rem;">No registered students in Firestore.</td></tr>`;
        return;
    }

    filtered.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color: #ffffff;">${user.full_name || user.name || 'Student'}</strong></td>
            <td style="color: #a1a1aa;">${user.email || 'N/A'}</td>
            <td>
                <div>${user.stream || 'General'}</div>
                <div style="font-size:0.75rem; color:#71717a;">${user.academicLevel || user.level || 'Standard Track'}</div>
            </td>
            <td>
                ${user.testCompleted ? '<span class="tag-badge tag-green">✓ Test Completed</span>' : '<span class="tag-badge" style="color:#eab308;">⏳ Pending</span>'}
            </td>
            <td>
                <span style="font-size:0.75rem; color:#71717a;">UID: ${user.id ? user.id.slice(0, 6) + '...' : 'Live'}</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==========================================
   QUESTIONS MODULE (WITH EDIT & DELETE)
========================================== */
function renderQuestionsTable() {
    const tbody = document.getElementById('questionsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (liveQuestions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#71717a; padding: 2rem;">No psychometric questions found. Click "+ Add New" to create one.</td></tr>`;
        return;
    }

    liveQuestions.forEach((q, index) => {
        const tr = document.createElement('tr');
        const optionsList = (q.options || []).map((o, optIdx) => `
            <div style="margin-bottom: 4px; line-height: 1.4;">
                <span style="color:#facc15; font-weight:700;">(${String.fromCharCode(65 + optIdx)})</span> ${o.text} 
                <span class="tag-badge tag-yellow" style="font-size:0.68rem; margin-left: 4px;">${o.tag}</span>
            </div>
        `).join('');

        tr.innerHTML = `
            <td><strong class="yellow-text">#${index + 1}</strong></td>
            <td><div style="font-weight:600; color:#ffffff; font-size:0.92rem;">${q.q}</div></td>
            <td><div style="font-size:0.8rem; display:flex; flex-direction:column;">${optionsList}</div></td>
            <td style="text-align:right; white-space: nowrap;">
                <button class="btn-primary" style="padding: 4px 10px; font-size: 0.8rem; margin-right: 6px; background: #27272a; border: 1px solid #3f3f46; color: #fff; border-radius: 4px; cursor: pointer;" onclick="openEditQuestionModal('${q.id}')">Edit</button>
                <button class="btn-danger" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px; cursor: pointer;" onclick="deleteQuestion('${q.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openQuestionModal() {
    document.getElementById('questionForm')?.reset();
    
    const idxInput = document.getElementById('editQuestionIndex');
    if (idxInput) idxInput.value = '-1';

    const submitBtn = document.querySelector('#questionModal button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Save 5-Option Question';

    document.getElementById('questionModal').style.display = 'flex';
}

function openEditQuestionModal(id) {
    const item = liveQuestions.find(q => q.id === id);
    if (!item) return;

    const idxInput = document.getElementById('editQuestionIndex');
    if (idxInput) idxInput.value = item.id;

    document.getElementById('form-q-text').value = item.q || '';

    (item.options || []).forEach((opt, idx) => {
        const textInput = document.getElementById(`form-opt-${idx}`);
        const tagInput = document.getElementById(`form-tag-${idx}`);
        if (textInput) textInput.value = opt.text || '';
        if (tagInput) tagInput.value = opt.tag || '';
    });

    const submitBtn = document.querySelector('#questionModal button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Update Question';

    document.getElementById('questionModal').style.display = 'flex';
}

async function handleQuestionSubmit(e) {
    e.preventDefault();

    const editingId = document.getElementById('editQuestionIndex')?.value;
    const promptText = document.getElementById('form-q-text')?.value;
    if (!promptText) {
        alert("Please enter a question prompt.");
        return;
    }

    const options = [];
    for (let i = 0; i < 5; i++) {
        const optText = document.getElementById(`form-opt-${i}`)?.value || '';
        const optTag = document.getElementById(`form-tag-${i}`)?.value || 'General';
        options.push({ text: optText, tag: optTag });
    }

    const isEdit = Boolean(editingId && editingId !== '-1');
    const payload = {
        q: promptText,
        options: options
    };

    if (isEdit) {
        payload.id = editingId;
    } else {
        payload.createdAt = new Date().toISOString();
    }

    try {
        const response = await fetch('/api/admin/questions', {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to save question");

        closeModals();
        await loadDashboardStats();
    } catch (err) {
        console.error("Error saving question:", err);
        alert(`Error: ${err.message}`);
    }
}

async function deleteQuestion(id) {
    if (!confirm("Remove this question from Firebase?")) return;
    try {
        const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete question");
        await loadDashboardStats();
    } catch (err) {
        alert(err.message);
    }
}

/* ==========================================
   RESULTS TABLE
========================================== */
function renderResultsTable() {
    const tbody = document.getElementById('resultsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (liveResults.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#71717a; padding: 2rem;">No student assessment test results recorded yet.</td></tr>`;
        return;
    }

    liveResults.forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color: #ffffff;">${res.studentName || res.userName || 'Student'}</strong></td>
            <td><span class="tag-badge tag-yellow">${res.domain || 'Tech & Software'}</span></td>
            <td>${res.topCareer || res.allottedCareer || 'Software & AI Engineer'}</td>
            <td><span class="tag-badge tag-green">${res.matchScore || 90}% Match</span></td>
            <td style="color:#71717a;">${res.date || 'Recent'}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==========================================
   CAREERS MODULE (WITH EDIT & DELETE)
========================================== */
function renderCareersTable() {
    const tbody = document.getElementById('careersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (liveCareers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#71717a; padding: 2rem;">No careers configured yet.</td></tr>`;
        return;
    }

    liveCareers.forEach(career => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong style="color: #ffffff; font-size:0.95rem;">${career.title}</strong>
                <div style="font-size:0.75rem; color:#facc15; margin-top:2px;">${career.tag}</div>
            </td>
            <td style="color: #a1a1aa; max-width: 400px; font-size: 0.85rem;">${career.desc}</td>
            <td><strong style="color:#ffffff;">${career.salary}</strong></td>
            <td style="text-align:right; white-space: nowrap;">
                <button class="btn-primary" style="padding: 4px 10px; font-size: 0.8rem; margin-right: 6px; background: #27272a; border: 1px solid #3f3f46; color: #fff; border-radius: 4px; cursor: pointer;" onclick="openEditCareerModal('${career.id}')">Edit</button>
                <button class="btn-danger" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px; cursor: pointer;" onclick="deleteCareer('${career.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openCareerModal() {
    document.getElementById('careerForm')?.reset();

    // Reset your existing editCareerIndex to -1
    const idxInput = document.getElementById('editCareerIndex');
    if (idxInput) idxInput.value = '-1';

    const titleEl = document.getElementById('careerModalTitle');
    if (titleEl) titleEl.textContent = 'Add Career Pathway';

    const submitBtn = document.querySelector('#careerModal button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Save Career Pathway';

    document.getElementById('careerModal').style.display = 'flex';
}

function openEditCareerModal(id) {
    const item = liveCareers.find(c => c.id === id);
    if (!item) return;

    // Put document ID in your existing editCareerIndex input
    const idxInput = document.getElementById('editCareerIndex');
    if (idxInput) idxInput.value = item.id;

    document.getElementById('form-c-title').value = item.title || '';
    document.getElementById('form-c-tag').value = item.tag || '';
    document.getElementById('form-c-salary').value = item.salary || '';
    document.getElementById('form-c-desc').value = item.desc || '';

    const titleEl = document.getElementById('careerModalTitle');
    if (titleEl) titleEl.textContent = 'Edit Career Pathway';

    const submitBtn = document.querySelector('#careerModal button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Update Career';

    document.getElementById('careerModal').style.display = 'flex';
}

async function handleCareerSubmit(e) {
    e.preventDefault();

    const editingId = document.getElementById('editCareerIndex')?.value;
    const isEdit = Boolean(editingId && editingId !== '-1');

    const payload = {
        title: document.getElementById('form-c-title')?.value,
        tag: document.getElementById('form-c-tag')?.value,
        salary: document.getElementById('form-c-salary')?.value,
        desc: document.getElementById('form-c-desc')?.value
    };

    if (isEdit) {
        payload.id = editingId;
    } else {
        payload.createdAt = new Date().toISOString();
    }

    try {
        const response = await fetch('/api/admin/careers', {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to save career");

        closeModals();
        await loadDashboardStats();
    } catch (err) {
        console.error("Error saving career:", err);
        alert(`Error: ${err.message}`);
    }
}

async function deleteCareer(id) {
    if (!confirm("Remove this career pathway?")) return;
    try {
        const res = await fetch(`/api/admin/careers?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete career");
        await loadDashboardStats();
    } catch (err) {
        alert(err.message);
    }
}

/* ==========================================
   MODAL CONTROLS & INIT
========================================== */
function closeModals() {
    const qModal = document.getElementById('questionModal');
    const cModal = document.getElementById('careerModal');
    if (qModal) qModal.style.display = 'none';
    if (cModal) cModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});