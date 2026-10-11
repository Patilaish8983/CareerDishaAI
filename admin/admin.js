// Storage keys used across Career Disha AI
const KEYS = {
    USERS: 'cd_admin_users',
    QUESTIONS: 'cd_admin_questions',
    RESULTS: 'cd_admin_results',
    CAREERS: 'cd_admin_careers',
    TRAFFIC: 'cd_page_views'
};

// Seed baseline master questions synchronized with Anushka's test.html (5 Options Each)
function initStorage() {
    if (!localStorage.getItem(KEYS.TRAFFIC)) {
        localStorage.setItem(KEYS.TRAFFIC, '1420');
    }

    if (!localStorage.getItem(KEYS.CAREERS)) {
        const defaultCareers = [
            {
                tag: "Computer Science & IT",
                title: "AI, ML & Full Stack Software Engineer",
                desc: "Build scalable web applications, machine learning pipelines, and cloud software. Demanded across product firms.",
                salary: "₹6,00,000 – ₹28,00,000 / year"
            },
            {
                tag: "Electronics & Telecommunication",
                title: "VLSI Design & Embedded Systems Engineer",
                desc: "Design semiconductor chips, microcontrollers, IoT devices, and 5G communication systems.",
                salary: "₹5,50,000 – ₹22,00,000 / year"
            },
            {
                tag: "Mechanical Engineering",
                title: "Robotics, CAD Design & EV Systems Specialist",
                desc: "Work on Electric Vehicle powertrain systems, industrial automation, and CAD modeling.",
                salary: "₹4,50,000 – ₹16,00,000 / year"
            },
            {
                tag: "Commerce & Business",
                title: "Financial Analyst & Business Product Manager",
                desc: "Analyze equity markets, manage product roadmaps, and oversee corporate operations.",
                salary: "₹5,00,000 – ₹24,00,000 / year"
            }
        ];
        localStorage.setItem(KEYS.CAREERS, JSON.stringify(defaultCareers));
    }

    if (!localStorage.getItem(KEYS.QUESTIONS)) {
        // Exact 7 master questions with all 5 options matching test.html
        const defaultQuestions = [
            {
                q: "1. What type of activity excites you the most when learning or working on a project?",
                options: [
                    { text: "Building software, coding apps, or working with data & AI algorithms", tag: "Tech & Software" },
                    { text: "Understanding human biology, diagnosing health issues, or medical care", tag: "Medical & Life Sciences" },
                    { text: "Analyzing financial markets, managing business growth, or stock trading", tag: "Finance & Management" },
                    { text: "Designing visual layouts, video editing, UI/UX, or writing creative content", tag: "Creative Arts & Design" },
                    { text: "Debating legal rights, civil administration, sociology, or public policy", tag: "Law & Civil Services" }
                ]
            },
            {
                q: "2. If given a free weekend workshop, which topic would you register for first?",
                options: [
                    { text: "Web Development & Machine Learning Bootcamp", tag: "Tech & Software" },
                    { text: "First Aid, Clinical Physiology, & Modern Biotechnology", tag: "Medical & Life Sciences" },
                    { text: "Startup Pitching, Digital Marketing & Stock Market Fundamentals", tag: "Finance & Management" },
                    { text: "Graphic Design, Digital Illustration & Brand Storytelling", tag: "Creative Arts & Design" },
                    { text: "Moot Court, Civil Service Strategy & Political Science Analysis", tag: "Law & Civil Services" }
                ]
            },
            {
                q: "3. What kind of problem-solving approach suits your natural strengths best?",
                options: [
                    { text: "Logical debugging, mathematical formulas, and algorithmic reasoning", tag: "Tech & Software" },
                    { text: "Scientific observation, biological research, and patient care empathy", tag: "Medical & Life Sciences" },
                    { text: "Risk assessment, strategic planning, and financial decision-making", tag: "Finance & Management" },
                    { text: "Visualizing aesthetic concepts, sketching, and artistic expression", tag: "Creative Arts & Design" },
                    { text: "Analyzing documentation, persuasive argument, and social leadership", tag: "Law & Civil Services" }
                ]
            },
            {
                q: "4. What is your preferred work or study environment?",
                options: [
                    { text: "Tech innovation hub, software studio, or data laboratory", tag: "Tech & Software" },
                    { text: "Hospital, diagnostic research lab, or pharmaceutical center", tag: "Medical & Life Sciences" },
                    { text: "Corporate office, investment bank, or managing your own business", tag: "Finance & Management" },
                    { text: "Media agency, design studio, or freelance creative workspace", tag: "Creative Arts & Design" },
                    { text: "Courtroom, government IAS/IPS office, or non-profit advocacy organization", tag: "Law & Civil Services" }
                ]
            },
            {
                q: "5. What type of impact do you aspire to make in your career?",
                options: [
                    { text: "Inventing disruptive software technology, automation, or smart gadgets", tag: "Tech & Software" },
                    { text: "Saving lives, advancing medical cures, or improving public healthcare", tag: "Medical & Life Sciences" },
                    { text: "Creating profitable companies, generating jobs, and leading markets", tag: "Finance & Management" },
                    { text: "Inspiring people through art, design, media, and storytelling", tag: "Creative Arts & Design" },
                    { text: "Ensuring social justice, enacting fair laws, and governance leadership", tag: "Law & Civil Services" }
                ]
            },
            {
                q: "6. Which school or college subject did/do you find most engaging?",
                options: [
                    { text: "Computer Science / Information Technology / Mathematics", tag: "Tech & Software" },
                    { text: "Biology / Physiology / Chemistry", tag: "Medical & Life Sciences" },
                    { text: "Economics / Accountancy / Business Studies", tag: "Finance & Management" },
                    { text: "Fine Arts / Graphic Design / Mass Communication", tag: "Creative Arts & Design" },
                    { text: "Political Science / History / Legal Studies / Sociology", tag: "Law & Civil Services" }
                ]
            },
            {
                q: "7. When working in a team project, what role do you naturally fall into?",
                options: [
                    { text: "The technical builder who codes or constructs the core solution", tag: "Tech & Software" },
                    { text: "The detail-oriented researcher checking scientific facts and health safety", tag: "Medical & Life Sciences" },
                    { text: "The team lead managing deadlines, budgets, and client presentations", tag: "Finance & Management" },
                    { text: "The creative vision creator designing slides, graphics, and visuals", tag: "Creative Arts & Design" },
                    { text: "The communicator drafting arguments, policies, and handling legal terms", tag: "Law & Civil Services" }
                ]
            }
        ];
        localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(defaultQuestions));
    }

    if (!localStorage.getItem(KEYS.USERS)) {
        const defaultUsers = [
            { name: "Rahul Deshmukh", email: "rahul.d@gmail.com", level: "Undergraduate (UG)", stream: "Computer Science & Engineering", testCompleted: true },
            { name: "Pooja Patil", email: "pooja.p@outlook.com", level: "High School (11th-12th)", stream: "Science (PCB)", testCompleted: true },
            { name: "Amit Kulkarni", email: "amit.k@gmail.com", level: "Undergraduate (UG)", stream: "Mechanical Engineering", testCompleted: false },
            { name: "Sneha Shinde", email: "sneha.s@yahoo.com", level: "Postgraduate (PG)", stream: "MBA (Finance)", testCompleted: true }
        ];
        localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(KEYS.RESULTS)) {
        const defaultResults = [
            { studentName: "Rahul Deshmukh", domain: "Tech & Software", topCareer: "Software & AI Engineer / Data Specialist", matchScore: 96, date: "2026-10-02" },
            { studentName: "Pooja Patil", domain: "Medical & Life Sciences", topCareer: "Medical Professional / Biotechnologist", matchScore: 93, date: "2026-10-04" },
            { studentName: "Sneha Shinde", domain: "Finance & Management", topCareer: "Business Strategy / Investment Banking", matchScore: 95, date: "2026-10-07" }
        ];
        localStorage.setItem(KEYS.RESULTS, JSON.stringify(defaultResults));
    }
}

// Navigation Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll('.section-panel').forEach(panel => panel.classList.remove('active-panel'));
    document.querySelectorAll('.nav-item button').forEach(btn => btn.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) targetPanel.classList.add('active-panel');

    const clickedBtn = Array.from(document.querySelectorAll('.nav-item button')).find(b => b.getAttribute('onclick').includes(tabId));
    if (clickedBtn) clickedBtn.classList.add('active');

    const breadcrumb = document.getElementById('headerBreadcrumb');
    const titles = {
        dashboard: "Dashboard Overview",
        users: "Registered Students Directory",
        questions: "Psychometric Question Bank",
        results: "Student Evaluation Analytics",
        careers: "Curated Career Pathways"
    };
    breadcrumb.textContent = titles[tabId] || "Admin Console";

    if (tabId === 'dashboard') renderDashboardStats();
    if (tabId === 'users') renderUsersTable();
    if (tabId === 'questions') renderQuestionsTable();
    if (tabId === 'results') renderResultsTable();
    if (tabId === 'careers') renderCareersTable();
}

// 1. Dashboard Overview logic
function renderDashboardStats() {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    const questions = JSON.parse(localStorage.getItem(KEYS.QUESTIONS)) || [];
    const results = JSON.parse(localStorage.getItem(KEYS.RESULTS)) || [];
    const careers = JSON.parse(localStorage.getItem(KEYS.CAREERS)) || [];
    const traffic = localStorage.getItem(KEYS.TRAFFIC) || '1420';

    document.getElementById('stat-students').textContent = users.length;
    document.getElementById('stat-questions').textContent = questions.length;
    document.getElementById('stat-tests').textContent = results.length;
    document.getElementById('stat-careers').textContent = careers.length;
    document.getElementById('visitorCount').textContent = Number(traffic).toLocaleString();

    const breakdownContainer = document.getElementById('careerBreakdownList');
    breakdownContainer.innerHTML = '';
    careers.slice(0, 3).forEach((c, idx) => {
        const item = document.createElement('div');
        item.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #09090b; border-radius: 8px; border: 1px solid #27272a;";
        item.innerHTML = `
            <div>
                <strong style="color: #ffffff; font-size: 0.9rem;">${idx + 1}. ${c.title}</strong>
                <div style="font-size: 0.75rem; color: #a1a1aa;">${c.tag}</div>
            </div>
            <span class="tag-badge tag-yellow">${c.salary.split('–')[0].trim()}</span>
        `;
        breakdownContainer.appendChild(item);
    });
}

function incrementTrafficDemo() {
    let traffic = parseInt(localStorage.getItem(KEYS.TRAFFIC) || '1420') + 1;
    localStorage.setItem(KEYS.TRAFFIC, traffic.toString());
    document.getElementById('visitorCount').textContent = traffic.toLocaleString();
}

// 2. Users Management
function renderUsersTable() {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    const tbody = document.getElementById('userTableBody');
    const query = (document.getElementById('searchUser').value || '').toLowerCase();

    const filtered = users.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) || 
        (u.stream && u.stream.toLowerCase().includes(query))
    );

    document.getElementById('userTableCount').textContent = `Showing ${filtered.length} of ${users.length} students`;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#71717a; padding: 2rem;">No matching student records found.</td></tr>`;
        return;
    }

    filtered.forEach((user, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color: #ffffff;">${user.name}</strong></td>
            <td style="color: #a1a1aa;">${user.email}</td>
            <td>
                <div>${user.stream || 'Not Specified'}</div>
                <div style="font-size:0.75rem; color:#71717a;">${user.level || 'Standard Track'}</div>
            </td>
            <td>
                ${user.testCompleted ? '<span class="tag-badge tag-green">✓ Test Completed</span>' : '<span class="tag-badge" style="color:#eab308;">⏳ Pending</span>'}
            </td>
            <td>
                <button class="btn-danger" onclick="deleteUser(${index})">Remove</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteUser(index) {
    if (!confirm("Are you sure you want to remove this student account?")) return;
    const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    users.splice(index, 1);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    renderUsersTable();
    renderDashboardStats();
}

// 3. Question Bank Management (5-Option CRUD)
function renderQuestionsTable() {
    const questions = JSON.parse(localStorage.getItem(KEYS.QUESTIONS)) || [];
    const tbody = document.getElementById('questionsTableBody');
    tbody.innerHTML = '';

    questions.forEach((q, index) => {
        const tr = document.createElement('tr');
        
        // Render all 5 options cleanly with color-coded tags
        const optionsList = q.options.map((o, optIdx) => `
            <div style="margin-bottom: 4px; line-height: 1.4;">
                <span style="color:#facc15; font-weight:700;">(${String.fromCharCode(65 + optIdx)})</span> ${o.text} 
                <span class="tag-badge tag-yellow" style="font-size:0.68rem; margin-left: 4px;">${o.tag}</span>
            </div>
        `).join('');
        
        tr.innerHTML = `
            <td><strong class="yellow-text">#${index + 1}</strong></td>
            <td><div style="font-weight:600; color:#ffffff; font-size:0.92rem;">${q.q}</div></td>
            <td><div style="font-size:0.8rem; display:flex; flex-direction:column;">${optionsList}</div></td>
            <td style="text-align:right;">
                <button class="btn-secondary" onclick="editQuestion(${index})" style="margin-right:6px;">Edit</button>
                <button class="btn-danger" onclick="deleteQuestion(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openQuestionModal() {
    document.getElementById('questionForm').reset();
    document.getElementById('editQuestionIndex').value = "-1";
    document.getElementById('questionModalTitle').textContent = "Add 5-Option Assessment Question";
    document.getElementById('questionModal').style.display = 'flex';
}

function editQuestion(index) {
    const questions = JSON.parse(localStorage.getItem(KEYS.QUESTIONS)) || [];
    const q = questions[index];
    if (!q) return;

    document.getElementById('editQuestionIndex').value = index;
    document.getElementById('questionModalTitle').textContent = `Edit Question #${index + 1}`;
    document.getElementById('form-q-text').value = q.q;

    // Populate all 5 options into the edit modal
    for (let i = 0; i < 5; i++) {
        if (q.options[i]) {
            document.getElementById(`form-opt-${i}`).value = q.options[i].text;
            document.getElementById(`form-tag-${i}`).value = q.options[i].tag;
        } else {
            document.getElementById(`form-opt-${i}`).value = '';
        }
    }

    document.getElementById('questionModal').style.display = 'flex';
}

function handleQuestionSubmit(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('editQuestionIndex').value);
    const questions = JSON.parse(localStorage.getItem(KEYS.QUESTIONS)) || [];

    // Construct Question Object with 5 options
    const newQuestion = {
        q: document.getElementById('form-q-text').value,
        options: [
            { text: document.getElementById('form-opt-0').value, tag: document.getElementById('form-tag-0').value },
            { text: document.getElementById('form-opt-1').value, tag: document.getElementById('form-tag-1').value },
            { text: document.getElementById('form-opt-2').value, tag: document.getElementById('form-tag-2').value },
            { text: document.getElementById('form-opt-3').value, tag: document.getElementById('form-tag-3').value },
            { text: document.getElementById('form-opt-4').value, tag: document.getElementById('form-tag-4').value }
        ]
    };

    if (idx >= 0) {
        questions[idx] = newQuestion;
    } else {
        questions.push(newQuestion);
    }

    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
    closeModals();
    renderQuestionsTable();
    renderDashboardStats();
}

function deleteQuestion(index) {
    if (!confirm("Are you sure you want to remove this question?")) return;
    const questions = JSON.parse(localStorage.getItem(KEYS.QUESTIONS)) || [];
    questions.splice(index, 1);
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
    renderQuestionsTable();
    renderDashboardStats();
}

// 4. Student Results Table
function renderResultsTable() {
    const results = JSON.parse(localStorage.getItem(KEYS.RESULTS)) || [];
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    if (results.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#71717a; padding: 2rem;">No student assessment test results recorded yet.</td></tr>`;
        return;
    }

    results.forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color: #ffffff;">${res.studentName || 'Student'}</strong></td>
            <td><span class="tag-badge tag-yellow">${res.domain}</span></td>
            <td>${res.topCareer}</td>
            <td><span class="tag-badge tag-green">${res.matchScore}% Match</span></td>
            <td style="color:#71717a;">${res.date || 'Recent'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. Careers Management (CRUD)
function renderCareersTable() {
    const careers = JSON.parse(localStorage.getItem(KEYS.CAREERS)) || [];
    const tbody = document.getElementById('careersTableBody');
    tbody.innerHTML = '';

    careers.forEach((career, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong style="color: #ffffff; font-size:0.95rem;">${career.title}</strong>
                <div style="font-size:0.75rem; color:#facc15; margin-top:2px;">${career.tag}</div>
            </td>
            <td style="color: #a1a1aa; max-width: 400px; font-size: 0.85rem;">${career.desc}</td>
            <td><strong style="color:#ffffff;">${career.salary}</strong></td>
            <td style="text-align:right;">
                <button class="btn-secondary" onclick="editCareer(${index})" style="margin-right:6px;">Edit</button>
                <button class="btn-danger" onclick="deleteCareer(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openCareerModal() {
    document.getElementById('careerForm').reset();
    document.getElementById('editCareerIndex').value = "-1";
    document.getElementById('careerModalTitle').textContent = "Add New Career Pathway";
    document.getElementById('careerModal').style.display = 'flex';
}

function editCareer(index) {
    const careers = JSON.parse(localStorage.getItem(KEYS.CAREERS)) || [];
    const c = careers[index];
    if (!c) return;

    document.getElementById('editCareerIndex').value = index;
    document.getElementById('careerModalTitle').textContent = `Edit Career Pathway`;
    document.getElementById('form-c-title').value = c.title;
    document.getElementById('form-c-tag').value = c.tag;
    document.getElementById('form-c-salary').value = c.salary;
    document.getElementById('form-c-desc').value = c.desc;

    document.getElementById('careerModal').style.display = 'flex';
}

function handleCareerSubmit(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('editCareerIndex').value);
    const careers = JSON.parse(localStorage.getItem(KEYS.CAREERS)) || [];

    const newCareer = {
        title: document.getElementById('form-c-title').value,
        tag: document.getElementById('form-c-tag').value,
        salary: document.getElementById('form-c-salary').value,
        desc: document.getElementById('form-c-desc').value
    };

    if (idx >= 0) {
        careers[idx] = newCareer;
    } else {
        careers.push(newCareer);
    }

    localStorage.setItem(KEYS.CAREERS, JSON.stringify(careers));
    closeModals();
    renderCareersTable();
    renderDashboardStats();
}

function deleteCareer(index) {
    if (!confirm("Are you sure you want to remove this career pathway?")) return;
    const careers = JSON.parse(localStorage.getItem(KEYS.CAREERS)) || [];
    careers.splice(index, 1);
    localStorage.setItem(KEYS.CAREERS, JSON.stringify(careers));
    renderCareersTable();
    renderDashboardStats();
}

// Helpers
function closeModals() {
    document.getElementById('questionModal').style.display = 'none';
    document.getElementById('careerModal').style.display = 'none';
}

function exportDataDump() {
    const dump = {
        version: "2.4",
        exportedAt: new Date().toISOString(),
        traffic: localStorage.getItem(KEYS.TRAFFIC),
        users: JSON.parse(localStorage.getItem(KEYS.USERS)),
        questions: JSON.parse(localStorage.getItem(KEYS.QUESTIONS)),
        results: JSON.parse(localStorage.getItem(KEYS.RESULTS)),
        careers: JSON.parse(localStorage.getItem(KEYS.CAREERS))
    };

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CareerDisha_Admin_DataDump_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function seedSampleData() {
    localStorage.removeItem(KEYS.CAREERS);
    localStorage.removeItem(KEYS.QUESTIONS);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.RESULTS);
    initStorage();
    renderDashboardStats();
    alert("Sample database reset & loaded with 7 master questions (5 options each)!");
}

// Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    renderDashboardStats();
});