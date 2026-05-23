
let subscriptions = JSON.parse(localStorage.getItem("subtrack_final")) || [];
let editIndex = -1;
let categoryChart, trendChart;

function saveToLocalStorage() {
    localStorage.setItem("subtrack_final", JSON.stringify(subscriptions));
}

function showToast(msg) {
    let t = document.getElementById('toastMsg');
    t.innerText = msg;
    t.style.opacity = '1';
    setTimeout(() => t.style.opacity = '0', 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== METRICS CALCULATIONS ==========
function monthlyTotal() {
    let total = 0;
    subscriptions.forEach(s => {
        if (s.cycle === 'Monthly') total += s.amount;
        else if (s.cycle === 'Yearly') total += s.amount / 12;
        else if (s.cycle === 'Quarterly') total += s.amount / 3;
    });
    return total;
}

function yearlyTotal() {
    let total = 0;
    subscriptions.forEach(s => {
        if (s.cycle === 'Monthly') total += s.amount * 12;
        else if (s.cycle === 'Yearly') total += s.amount;
        else total += s.amount * 4;
    });
    return total;
}

function categoryData() {
    let cats = {};
    subscriptions.forEach(s => {
        let monthly = (s.cycle === 'Monthly') ? s.amount : (s.cycle === 'Yearly') ? s.amount / 12 : s.amount / 3;
        cats[s.category] = (cats[s.category] || 0) + monthly;
    });
    return { labels: Object.keys(cats), values: Object.values(cats) };
}

function upcomingRenewals() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    return subscriptions.filter(s => {
        let d = new Date(s.renewal);
        return d >= today && d <= nextWeek;
    }).sort((a, b) => new Date(a.renewal) - new Date(b.renewal));
}

function daysLeft(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(dateStr) - today) / (1000 * 3600 * 24));
}

function trendData() {
    let monthly = monthlyTotal();
    let labels = [], vals = [];
    for (let i = 5; i >= 0; i--) {
        let d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push(d.toLocaleString('default', { month: 'short' }));
        vals.push(+(monthly * (1 + Math.sin(i) * 0.05)).toFixed(2));
    }
    return { labels, vals };
}

// ========== RENDER FUNCTIONS ==========
function renderDashboard() {
    const container = document.getElementById('pageContainer');
    const mTotal = monthlyTotal(), yTotal = yearlyTotal(), count = subscriptions.length, upcoming = upcomingRenewals().length;
    const avg = count ? mTotal / count : 0;
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-credit-card"></i></div><h3>Active Subscriptions</h3><div class="value">${count}</div><div class="trend">Total plans</div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-dollar-sign"></i></div><h3>Monthly Spend</h3><div class="value">$${mTotal.toFixed(2)}</div><div class="trend">$${avg.toFixed(2)} avg/sub</div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-chart-line"></i></div><h3>Yearly Projection</h3><div class="value">$${yTotal.toFixed(2)}</div><div class="trend">Annual forecast</div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-bell"></i></div><h3>Upcoming Renewals</h3><div class="value">${upcoming}</div><div class="trend">Next 7 days</div></div>
        </div>
        <div class="charts-row">
            <div class="chart-card"><h3><i class="fas fa-chart-pie"></i> Category Distribution</h3><canvas id="pieCanvas"></canvas></div>
            <div class="chart-card"><h3><i class="fas fa-chart-line"></i> 6-Month Trend</h3><canvas id="lineCanvas"></canvas></div>
        </div>
        <div class="renewals-card"><h3><i class="fas fa-clock"></i> Upcoming Renewals (7 days)</h3><div id="renewalList"></div></div>
    `;

    // Charts
    const cat = categoryData();
    const ctxPie = document.getElementById('pieCanvas')?.getContext('2d');
    if (ctxPie) {
        if (categoryChart) categoryChart.destroy();
        categoryChart = new Chart(ctxPie, {
            type: 'doughnut',
            data: { labels: cat.labels, datasets: [{ data: cat.values, backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'], borderWidth: 0 }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8' } } } }
        });
    }

    const trend = trendData();
    const ctxLine = document.getElementById('lineCanvas')?.getContext('2d');
    if (ctxLine) {
        if (trendChart) trendChart.destroy();
        trendChart = new Chart(ctxLine, {
            type: 'line',
            data: { labels: trend.labels, datasets: [{ label: 'Monthly Spend ($)', data: trend.vals, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.3, pointBackgroundColor: '#3B82F6' }] },
            options: { responsive: true, scales: { y: { ticks: { color: '#94A3B8' } }, x: { ticks: { color: '#94A3B8' } } } }
        });
    }

    // Renewals
    const renewContainer = document.getElementById('renewalList');
    const upcomingList = upcomingRenewals();
    if (upcomingList.length === 0) renewContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#64748B;">✨ No renewals in the next 7 days</div>';
    else renewContainer.innerHTML = upcomingList.map(s => `<div class="renewal-item"><div class="renewal-info"><div class="renewal-icon"><i class="fas fa-calendar"></i></div><div><h4>${escapeHtml(s.name)}</h4><p>$${s.amount} · ${s.cycle}</p></div></div><div class="renewal-days">${daysLeft(s.renewal) === 0 ? 'Today' : daysLeft(s.renewal) + ' days'}</div></div>`).join('');
    document.getElementById('reminderBadge').innerText = upcomingList.length;
}

function renderSubscriptions() {
    const container = document.getElementById('pageContainer');
    container.innerHTML = `<div class="table-card"><h3><i class="fas fa-list"></i> Manage Subscriptions</h3><div class="table-responsive"><table class="data-table"><thead><tr><th>Service</th><th>Category</th><th>Amount</th><th>Cycle</th><th>Renewal</th><th>Actions</th></tr></thead><tbody id="subsTableBody"></tbody></table></div></div>`;
    const tbody = document.getElementById('subsTableBody');
    if (subscriptions.length === 0) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">No subscriptions yet. Click "Add Subscription"</td></tr>';
    else tbody.innerHTML = subscriptions.map((s, idx) => `
        <tr>
            <td><strong>${escapeHtml(s.name)}</strong></td>
            <td>${escapeHtml(s.category)}</td>
            <td>$${s.amount.toFixed(2)}</td>
            <td><span class="badge-cycle">${s.cycle}</span></td>
            <td>${s.renewal}</td>
            <td><span class="action-icon edit" onclick="editSubscription(${idx})"><i class="fas fa-edit"></i></span> <span class="action-icon delete" onclick="deleteSubscription(${idx})"><i class="fas fa-trash"></i></span></td>
        </tr>
    `).join('');
}

function renderAnalytics() {
    const container = document.getElementById('pageContainer');
    const cat = categoryData();
    container.innerHTML = `<div class="stats-grid"><div class="stat-card"><div class="stat-icon"><i class="fas fa-chart-line"></i></div><h3>Monthly Avg</h3><div class="value">$${monthlyTotal().toFixed(2)}</div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-chart-bar"></i></div><h3>Annual Total</h3><div class="value">$${yearlyTotal().toFixed(2)}</div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-tag"></i></div><h3>Top Category</h3><div class="value">${cat.labels[0] || '—'}</div></div></div><div class="chart-card"><h3>Category Spend (Monthly)</h3><canvas id="analyticsBar"></canvas></div>`;
    const ctx = document.getElementById('analyticsBar')?.getContext('2d');
    if (ctx) new Chart(ctx, { type: 'bar', data: { labels: cat.labels, datasets: [{ label: 'Monthly ($)', data: cat.values, backgroundColor: '#3B82F6', borderRadius: 8 }] }, options: { responsive: true, scales: { y: { ticks: { color: '#94A3B8' } }, x: { ticks: { color: '#94A3B8' } } } } });
}

function renderInsights() {
    const container = document.getElementById('pageContainer');
    const mTotal = monthlyTotal(), yTotal = yearlyTotal(), count = subscriptions.length;
    const highCost = subscriptions.filter(s => s.amount > 20 && s.cycle === 'Monthly').length;
    const cat = categoryData();
    const savings = Math.round((highCost * 10) + (count > 5 ? 15 : 0) + 20);
    const score = Math.min(95, Math.round(85 - (highCost * 4)));
    let tip = highCost > 1 ? "Multiple expensive subscriptions detected. Audit your usage." : (count > 8 ? "Consider consolidating similar services." : "Switch to annual billing for long-term savings.");
    container.innerHTML = `<div class="chart-card" style="background:linear-gradient(135deg,#0F1117,#0A0C10);"><div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;"><div style="width:50px;height:50px;background:#3B82F620;border-radius:16px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-robot" style="font-size:1.8rem;color:#3B82F6;"></i></div><div><h2>Gemini AI Intelligence</h2><p style="color:#64748B;">Spending optimization analysis</p></div></div><p style="line-height:1.6;">You're spending <strong>$${mTotal.toFixed(2)}/month</strong> across ${count} subscriptions ($${yTotal.toFixed(2)}/year). ${highCost > 0 ? `⚠️ ${highCost} premium subscriptions >$20. ` : ''}Top category: ${cat.labels[0] || 'none'}.</p><div class="stats-grid" style="margin-top:20px;"><div class="stat-card"><div class="stat-icon"><i class="fas fa-coins"></i></div><h3>Potential Savings</h3><div class="value">$${savings}/yr</div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-chart-simple"></i></div><h3>Efficiency Score</h3><div class="value">${score}%</div></div></div><div style="margin-top:20px;padding:16px;background:#1E293B;border-radius:20px;"><i class="fas fa-lightbulb"></i> <strong>Pro Tip:</strong> ${tip}</div></div>`;
}

function renderReminders() {
    const container = document.getElementById('pageContainer');
    const upcoming = upcomingRenewals();
    const past = subscriptions.filter(s => new Date(s.renewal) < new Date());
    container.innerHTML = `<div class="renewals-card"><h3><i class="fas fa-bell"></i> Upcoming (7 days)</h3><div id="remUpcoming"></div></div><div class="renewals-card" style="margin-top:20px;"><h3><i class="fas fa-history"></i> Overdue Renewals</h3><div id="remPast"></div></div>`;
    const upDiv = document.getElementById('remUpcoming');
    if (upcoming.length === 0) upDiv.innerHTML = '<div style="padding:20px;text-align:center;">No upcoming renewals ✨</div>';
    else upDiv.innerHTML = upcoming.map(s => `<div class="renewal-item"><div><strong>${escapeHtml(s.name)}</strong> - ${s.cycle}</div><div class="renewal-days">${daysLeft(s.renewal)} days</div></div>`).join('');
    const pastDiv = document.getElementById('remPast');
    if (past.length === 0) pastDiv.innerHTML = '<div style="padding:20px;text-align:center;">All renewals up to date ✅</div>';
    else pastDiv.innerHTML = past.map(s => `<div class="renewal-item"><div><strong>${escapeHtml(s.name)}</strong> - ${s.cycle}</div><div class="renewal-days" style="background:#EF444420;color:#EF4444;">Overdue</div></div>`).join('');
}

window.editSubscription = (idx) => {
    const s = subscriptions[idx];
    document.getElementById('subName').value = s.name;
    document.getElementById('subAmount').value = s.amount;
    document.getElementById('subCategory').value = s.category;
    document.getElementById('subCycle').value = s.cycle;
    document.getElementById('subRenewal').value = s.renewal;
    editIndex = idx;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Subscription';
    document.getElementById('subscriptionModal').style.display = 'flex';
};

window.deleteSubscription = (idx) => {
    if (confirm('Delete this subscription?')) {
        subscriptions.splice(idx, 1);