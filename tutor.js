let db = {
    students: [{ id: 1, name: "Jean Dupont", email: "jean@test.com" }],
    classes: [{ id: 1, name: "Maths Avancées", price: 25 }],
    payments: [],
    enrollments: [],
    sessions: []
};

function setupDateConstraints() {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayDate = `${yyyy}-${mm}-${dd}`;
    document.getElementById('new-payment-date').setAttribute('max', todayDate);

    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const nowDateTime = `${todayDate}T${hh}:${min}`;
    document.getElementById('new-session-date').setAttribute('min', nowDateTime);
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-target')).classList.add('active');
        document.getElementById('main-title').innerText = item.getAttribute('data-title');
    });
});

function openModal(title, formId) {
    document.getElementById('modal-title').innerText = title;
    document.querySelectorAll('.api-form').forEach(f => f.style.display = 'none');
    document.getElementById(formId).style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }


function updateDropdowns() {
    const studentSelects = document.querySelectorAll('#new-enrollment-student, #new-session-student, #new-payment-student');
    const studentOptions = db.students.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    studentSelects.forEach(select => { if(select) select.innerHTML = studentOptions; });

    const classSelect = document.getElementById('new-enrollment-class');
    if(classSelect) {
        classSelect.innerHTML = db.classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
}

function renderAll() {
    renderStudents();
    renderClasses();
    renderPayments();
    renderEnrollments();
    renderSessions();
    updateDropdowns();
}

function renderStudents() {
    document.getElementById('stat-students').innerText = db.students.length;
    const tbody = document.getElementById('table-students-body');
    tbody.innerHTML = '';
    db.students.forEach(s => {
        tbody.innerHTML += `<tr>
            <td><strong>${s.name}</strong></td><td>${s.email}</td>
            <td><button class="btn-text danger" onclick="deleteItem('students', ${s.id})">Supprimer</button></td>
        </tr>`;
    });
}

function renderClasses() {
    document.getElementById('stat-classes').innerText = db.classes.length;
    const tbody = document.getElementById('table-classes-body');
    tbody.innerHTML = '';
    db.classes.forEach(c => {
        tbody.innerHTML += `<tr>
            <td><strong>${c.name}</strong></td><td>${c.price} DT /h</td>
            <td><button class="btn-text danger" onclick="deleteItem('classes', ${c.id})">Supprimer</button></td>
        </tr>`;
    });
}

function renderPayments() {
    const tbody = document.getElementById('table-payments-body');
    tbody.innerHTML = '';
    let total = 0;
    db.payments.forEach(p => {
        total += parseFloat(p.amount);
        tbody.innerHTML += `<tr>
            <td>${p.date}</td><td><strong>${p.student}</strong></td><td>${p.amount} DT</td>
            <td><button class="btn-text danger" onclick="deleteItem('payments', ${p.id})">Supprimer</button></td>
        </tr>`;
    });
    document.getElementById('stat-revenues').innerText = total + " DT";
}

function renderEnrollments() {
    const tbody = document.getElementById('table-enrollments-body');
    tbody.innerHTML = '';
    db.enrollments.forEach(e => {
        tbody.innerHTML += `<tr>
            <td><strong>${e.student}</strong></td><td>${e.class}</td>
            <td><span class="badge badge-success">${e.status}</span></td>
            <td><button class="btn-text danger" onclick="deleteItem('enrollments', ${e.id})">Supprimer</button></td>
        </tr>`;
    });
}

function renderSessions() {
    document.getElementById('stat-sessions').innerText = db.sessions.length;

    const dashTbody = document.getElementById('table-dashboard-sessions');
    dashTbody.innerHTML = '';
    
    if(db.sessions.length === 0) {
        dashTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#6b7280;">Aucune session planifiée</td></tr>`;
    } else {
        let sortedSessions = [...db.sessions].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
        sortedSessions.forEach(s => {
            dashTbody.innerHTML += `<tr>
                <td><strong>${s.displayDate}</strong> à ${s.time}</td>
                <td>${s.student}</td>
                <td><button class="btn-text danger" onclick="deleteItem('sessions', ${s.id})">Annuler</button></td>
            </tr>`;
        });
    }

    const cal = document.getElementById('calendar-body');
    cal.innerHTML = ''; 
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    days.forEach(d => cal.innerHTML += `<div class="day-header">${d}</div>`);
    
    for(let i = 1; i <= 31; i++) {
        cal.innerHTML += `<div class="day" id="cal-day-${i}">${i}</div>`;
    }

    db.sessions.forEach(s => {
        const targetDayDiv = document.getElementById(`cal-day-${s.day}`);
        if (targetDayDiv) {
            targetDayDiv.innerHTML += `<span class="event-tag">${s.time} - ${s.student}</span>`;
        }
    });
}

window.deleteItem = function(table, id) {
    if(confirm("Supprimer cet élément ?")) {
        db[table] = db[table].filter(item => item.id !== id);
        renderAll(); 
    }
}

document.getElementById('form-student').addEventListener('submit', function(e) {
    e.preventDefault();
    db.students.push({ id: Date.now(), name: document.getElementById('new-student-name').value, email: document.getElementById('new-student-email').value });
    closeModal(); this.reset(); renderAll();
});

document.getElementById('form-class').addEventListener('submit', function(e) {
    e.preventDefault();
    db.classes.push({ id: Date.now(), name: document.getElementById('new-class-name').value, price: document.getElementById('new-class-price').value });
    closeModal(); this.reset(); renderAll();
});

document.getElementById('form-payment').addEventListener('submit', function(e) {
    e.preventDefault();
    const dateInput = new Date(document.getElementById('new-payment-date').value).toLocaleDateString('fr-FR');
    db.payments.push({ id: Date.now(), student: document.getElementById('new-payment-student').value, amount: document.getElementById('new-payment-amount').value, date: dateInput });
    closeModal(); this.reset(); renderAll();
});

document.getElementById('form-enrollment').addEventListener('submit', function(e) {
    e.preventDefault();
    db.enrollments.push({ id: Date.now(), student: document.getElementById('new-enrollment-student').value, class: document.getElementById('new-enrollment-class').value, status: "Actif" });
    closeModal(); this.reset(); renderAll();
});

document.getElementById('form-session').addEventListener('submit', function(e) {
    e.preventDefault();
    const student = document.getElementById('new-session-student').value;
    const dateObj = new Date(document.getElementById('new-session-date').value);
    
    db.sessions.push({
        id: Date.now(),
        student: student,
        rawDate: dateObj,
        displayDate: dateObj.toLocaleDateString('fr-FR'),
        day: dateObj.getDate(),
        time: `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
    });

    closeModal(); this.reset(); renderAll();
});

setupDateConstraints();
renderAll();
