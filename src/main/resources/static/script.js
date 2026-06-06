document.addEventListener("DOMContentLoaded", function () {
    /* ── Auth Guard ─────────────────────────────────────────────────── */
    if (localStorage.getItem("savex_logged_in") !== "true") {
        window.location.href = "index.html";
        return;
    }
    /* ── State ──────────────────────────────────────────────────────── */
    let subscriptions = JSON.parse(localStorage.getItem("subtracker_subscriptions")) || [];
    let editIndex = -1;
    let categoryChart = null;
    let trendChart   = null;
    let analyticsChart = null;
    /* ── DOM refs ───────────────────────────────────────────────────── */
    const pageContent      = document.getElementById("pageContent");
    const pageTitle        = document.getElementById("pageTitle");
    const notificationBadge = document.getElementById("notificationBadge");
    const modalOverlay     = document.getElementById("modalOverlay");
    const subscriptionModal = document.getElementById("subscriptionModal");
    const openModalBtn     = document.getElementById("openModalBtn");
    const closeModalBtn    = document.getElementById("closeModalBtn");
    const cancelModalBtn   = document.getElementById("cancelModalBtn");
    const subscriptionForm = document.getElementById("subscriptionForm");
    const modalTitle       = document.getElementById("modalTitle");
    const serviceName      = document.getElementById("serviceName");
    const serviceAmount    = document.getElementById("serviceAmount");
    const serviceCategory  = document.getElementById("serviceCategory");
    const serviceCycle     = document.getElementById("serviceCycle");
    const serviceRenewal   = document.getElementById("serviceRenewal");
    const toast            = document.getElementById("toast");
    const notificationBtn  = document.getElementById("notificationBtn");
    if (!pageContent) return;
    /* ── User init ──────────────────────────────────────────────────── */
    function initializeUser() {
        const userName   = localStorage.getItem("subtracker_user_name") || "SaveX User";
        const firstName  = userName.split(" ")[0];
        const welcomeEl  = document.getElementById("welcomeText");
        const profileNameEl = document.getElementById("profileName");
        const profileAvatarEl = document.getElementById("profileAvatar");
        if (welcomeEl)      welcomeEl.textContent  = `Welcome back, ${firstName} ✨`;
        if (profileNameEl)  profileNameEl.textContent = userName;
        if (profileAvatarEl) {
            profileAvatarEl.textContent = userName.split(" ")
                .map(w => w.charAt(0).toUpperCase()).join("").slice(0, 2) || "SX";
        }
    }
    /* ── Persistence ────────────────────────────────────────────────── */
    function saveData() {
        localStorage.setItem("subtracker_subscriptions", JSON.stringify(subscriptions));
    }
    /* ── Toast ──────────────────────────────────────────────────────── */
    function showToast(message, type) {
        if (!toast) { alert(message); return; }
        toast.textContent = message;
        toast.className   = "toast show" + (type ? " toast-" + type : "");
        setTimeout(() => toast.classList.remove("show"), 2800);
    }
    /* ── Helpers ────────────────────────────────────────────────────── */
    function escapeHtml(t) {
        return String(t)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    function money(n) { return "$" + Number(n).toFixed(2); }
    function normalizeDateForInput(v) {
        if (!v) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
            const p = v.split("/"); return `${p[2]}-${p[1]}-${p[0]}`;
        }
        return "";
    }
    function formatDateForDisplay(v) {
        if (!v) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
            const p = v.split("-"); return `${p[2]}/${p[1]}/${p[0]}`;
        }
        return v;
    }
    function monthlyValue(sub) {
        if (sub.cycle === "Monthly")   return sub.amount;
        if (sub.cycle === "Yearly")    return sub.amount / 12;
        if (sub.cycle === "Quarterly") return sub.amount / 3;
        return sub.amount;
    }
    function yearlyValue(sub) {
        if (sub.cycle === "Monthly")   return sub.amount * 12;
        if (sub.cycle === "Yearly")    return sub.amount;
        if (sub.cycle === "Quarterly") return sub.amount * 4;
        return sub.amount;
    }
    function getMonthlySpend() {
        return subscriptions.reduce((t, s) => t + monthlyValue(s), 0);
    }
    function getYearlySpend() {
        return subscriptions.reduce((t, s) => t + yearlyValue(s), 0);
    }
    function getCategoryData() {
        const data = {};
        subscriptions.forEach(s => {
            data[s.category] = (data[s.category] || 0) + monthlyValue(s);
        });
        return { labels: Object.keys(data), values: Object.values(data) };
    }
    function daysLeft(dateString) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const d     = new Date(normalizeDateForInput(dateString)); d.setHours(0, 0, 0, 0);
        return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    }
    function getUpcomingRenewals() {
        const today    = new Date(); today.setHours(0, 0, 0, 0);
        const sevenDays = new Date(today); sevenDays.setDate(today.getDate() + 7); sevenDays.setHours(23, 59, 59, 999);
        return subscriptions
            .filter(s => { const d = new Date(normalizeDateForInput(s.renewal)); d.setHours(0,0,0,0); return d >= today && d <= sevenDays; })
            .sort((a, b) => new Date(normalizeDateForInput(a.renewal)) - new Date(normalizeDateForInput(b.renewal)));
    }
    function getOverdueRenewals() {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return subscriptions.filter(s => {
            const d = new Date(normalizeDateForInput(s.renewal)); d.setHours(0,0,0,0); return d < today;
        });
    }
    function updateBadge() {
        if (notificationBadge) notificationBadge.textContent = getUpcomingRenewals().length;
    }
    /* ── Chart helpers ──────────────────────────────────────────────── */
    const CHART_COLORS = ["#7c3aed","#a855f7","#22d3ee","#10b981","#f59e0b","#ef4444","#ec4899","#84cc16"];
    const CHART_DEFAULTS = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: "#c4b5fd", font: { size: 13, weight: "600" }, padding: 16 }
            },
            tooltip: {
                backgroundColor: "rgba(15,10,30,0.95)",
                titleColor: "#e9d5ff",
                bodyColor: "#c4b5fd",
                borderColor: "rgba(168,85,247,0.4)",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10
            }
        },
        scales: {
            x: { ticks: { color: "#8b7eb8" }, grid: { color: "rgba(139,126,184,0.1)" } },
            y: { ticks: { color: "#8b7eb8" }, grid: { color: "rgba(139,126,184,0.1)" } }
        }
    };
    function destroyCharts() {
        [categoryChart, trendChart, analyticsChart].forEach(c => c && c.destroy());
        categoryChart = trendChart = analyticsChart = null;
    }
    /* ══════════════════════════════════════════════════════════════════
       PAGE: DASHBOARD
    ══════════════════════════════════════════════════════════════════ */
    function renderDashboard() {
        destroyCharts();
        const active       = subscriptions.length;
        const monthlySpend = getMonthlySpend();
        const yearlySpend  = getYearlySpend();
        const upcoming     = getUpcomingRenewals().length;
        const average      = active > 0 ? monthlySpend / active : 0;
        pageContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card animate-in" style="--delay:0.05s">
                <div class="stat-icon purple">
                    <i class="fa-solid fa-credit-card"></i>
                </div>
                <div class="stat-body">
                    <h3>Active Subscriptions</h3>
                    <div class="value counter" data-target="${active}">${active}</div>
                    <p>Total active plans</p>
                </div>
            </div>
            <div class="stat-card animate-in" style="--delay:0.1s">
                <div class="stat-icon blue">
                    <i class="fa-solid fa-dollar-sign"></i>
                </div>
                <div class="stat-body">
                    <h3>Monthly Spend</h3>
                    <div class="value">${money(monthlySpend)}</div>
                    <p>${money(average)} avg / sub</p>
                </div>
            </div>
            <div class="stat-card animate-in" style="--delay:0.15s">
                <div class="stat-icon green">
                    <i class="fa-solid fa-chart-line"></i>
                </div>
                <div class="stat-body">
                    <h3>Yearly Projection</h3>
                    <div class="value">${money(yearlySpend)}</div>
                    <p>Annual forecast</p>
                </div>
            </div>
            <div class="stat-card animate-in" style="--delay:0.2s">
                <div class="stat-icon amber">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div class="stat-body">
                    <h3>Upcoming Renewals</h3>
                    <div class="value">${upcoming}</div>
                    <p>Next 7 days</p>
                </div>
            </div>
        </div>
        <div class="charts-grid">
            <div class="chart-card animate-in" style="--delay:0.25s">
                <h3 class="chart-title">
                    <i class="fa-solid fa-chart-pie"></i>
                    Category Distribution
                </h3>
                <div class="chart-box">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
            <div class="chart-card animate-in" style="--delay:0.3s">
                <h3 class="chart-title">
                    <i class="fa-solid fa-chart-line"></i>
                    6-Month Trend
                </h3>
                <div class="chart-box">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
        </div>
        <div class="renewals-card animate-in" style="--delay:0.35s">
            <h3 class="chart-title">
                <i class="fa-solid fa-clock"></i>
                Upcoming Renewals <span class="badge-inline">${upcoming}</span>
            </h3>
            <div class="renewal-list" id="renewalList"></div>
        </div>
        `;
        drawCategoryChart();
        drawTrendChart();
        renderRenewalList("renewalList", getUpcomingRenewals(), false);
        updateBadge();
    }
    function drawCategoryChart() {
        const canvas = document.getElementById("categoryChart");
        if (!canvas || typeof Chart === "undefined") return;
        const data = getCategoryData();
        if (data.labels.length === 0) {
            canvas.parentElement.innerHTML = `<div class="empty-state"><i class="fa-solid fa-chart-pie"></i><p>No data yet</p></div>`;
            return;
        }
        categoryChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: CHART_COLORS,
                    borderWidth: 3,
                    borderColor: "#0f0a1e",
                    hoverBorderColor: "#1a0f35"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: "#c4b5fd", font: { size: 13, weight: "600" }, padding: 18, usePointStyle: true }
                    },
                    tooltip: CHART_DEFAULTS.plugins.tooltip
                }
            }
        });
    }
    function drawTrendChart() {
        const canvas = document.getElementById("trendChart");
        if (!canvas || typeof Chart === "undefined") return;
        const total  = getMonthlySpend();
        const labels = [], values = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            labels.push(d.toLocaleString("default", { month: "short" }));
            values.push(Number((total * (1 + Math.sin(i * 0.9) * 0.06)).toFixed(2)));
        }
        trendChart = new Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Monthly Spend ($)",
                    data: values,
                    borderColor: "#a855f7",
                    backgroundColor: "rgba(168,85,247,0.12)",
                    fill: true,
                    tension: 0.42,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: "#a855f7",
                    pointBorderColor: "#0f0a1e",
                    pointBorderWidth: 2,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: CHART_DEFAULTS.plugins.tooltip },
                scales: CHART_DEFAULTS.scales
            }
        });
    }
    /* ══════════════════════════════════════════════════════════════════
       PAGE: SUBSCRIPTIONS
    ══════════════════════════════════════════════════════════════════ */
    function renderSubscriptions() {
        destroyCharts();
        pageContent.innerHTML = `
        <div class="table-card animate-in" style="--delay:0.05s">
            <div class="table-header-row">
                <h3 class="chart-title">
                    <i class="fa-solid fa-list"></i>
                    Manage Subscriptions
                </h3>
                <div class="table-meta">
                    <span class="badge-count">${subscriptions.length} plan${subscriptions.length !== 1 ? "s" : ""}</span>
                    <span class="badge-amount">${money(getMonthlySpend())} / mo</span>
                </div>
            </div>
            <div class="table-wrapper">
                <table class="subscription-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Monthly</th>
                            <th>Cycle</th>
                            <th>Renewal</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="subscriptionTable"></tbody>
                </table>
            </div>
        </div>
        `;
        const table = document.getElementById("subscriptionTable");
        if (subscriptions.length === 0) {
            table.innerHTML = `
                <tr><td colspan="7">
                    <div class="empty-state">
                        <i class="fa-solid fa-credit-card"></i>
                        <p>No subscriptions added yet.</p>
                        <small>Click <strong>"Add Subscription"</strong> to get started.</small>
                    </div>
                </td></tr>`;
            return;
        }
        const catIcons = {
            Entertainment: "fa-film", Music: "fa-music", Software: "fa-code",
            Productivity: "fa-briefcase", Education: "fa-graduation-cap",
            Gaming: "fa-gamepad", Cloud: "fa-cloud", Other: "fa-layer-group"
        };
        table.innerHTML = subscriptions.map((sub, i) => {
            const left = daysLeft(sub.renewal);
            let renewClass = "";
            if (left < 0)  renewClass = "overdue";
            else if (left <= 3)  renewClass = "urgent";
            else if (left <= 7)  renewClass = "upcoming";
            return `
            <tr class="table-row-animate" style="--row-delay:${i * 0.04}s">
                <td>
                    <div class="service-cell">
                        <div class="service-icon">
                            <i class="fa-solid ${catIcons[sub.category] || "fa-layer-group"}"></i>
                        </div>
                        <span class="service-name">${escapeHtml(sub.name)}</span>
                    </div>
                </td>
                <td><span class="category-pill">${escapeHtml(sub.category)}</span></td>
                <td class="amount-cell">${money(sub.amount)}</td>
                <td class="monthly-cell">${money(monthlyValue(sub))}</td>
                <td><span class="cycle-badge cycle-${sub.cycle.toLowerCase()}">${escapeHtml(sub.cycle)}</span></td>
                <td class="renewal-cell ${renewClass}">
                    ${formatDateForDisplay(sub.renewal)}
                    ${renewClass ? `<span class="renewal-tag">${left < 0 ? "Overdue" : left === 0 ? "Today" : left + "d"}</span>` : ""}
                </td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="icon-action edit-btn" title="Edit" onclick="editSubscription(${i})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="icon-action delete-btn" title="Delete" onclick="deleteSubscription(${i})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join("");
    }
    /* ══════════════════════════════════════════════════════════════════
       PAGE: ANALYTICS
    ══════════════════════════════════════════════════════════════════ */
    function renderAnalytics() {
        destroyCharts();
        const monthlyCount = subscriptions.filter(s => s.cycle === "Monthly").length;
        const yearlyCount  = subscriptions.filter(s => s.cycle === "Yearly").length;
        const quarterlyCount = subscriptions.filter(s => s.cycle === "Quarterly").length;
        const monthlyOnly  = subscriptions.filter(s => s.cycle === "Monthly").reduce((sum, s) => sum + s.amount, 0);
        const yearlyOnly   = subscriptions.filter(s => s.cycle === "Yearly").reduce((sum, s) => sum + s.amount, 0);
        const catData = getCategoryData();
        const topCat  = catData.labels.length > 0
            ? catData.labels[catData.values.indexOf(Math.max(...catData.values))]
            : "—";
        pageContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card animate-in" style="--delay:0.05s">
                <div class="stat-icon purple"><i class="fa-solid fa-calendar"></i></div>
                <div class="stat-body">
                    <h3>Monthly Plans</h3>
                    <div class="value">${monthlyCount}</div>
                    <p>${money(monthlyOnly)} / mo</p>
                </div>
            </div>
            <div class="stat-card animate-in" style="--delay:0.1s">
                <div class="stat-icon blue"><i class="fa-solid fa-calendar-check"></i></div>
                <div class="stat-body">
                    <h3>Yearly Plans</h3>
                    <div class="value">${yearlyCount}</div>
                    <p>${money(yearlyOnly)} / yr</p>
                </div>
            </div>
            <div class="stat-card animate-in" style="--delay:0.15s">
                <div class="stat-icon green"><i class="fa-solid fa-wallet"></i></div>
                <div class="stat-body">
                    <h3>Monthly Equivalent</h3>
                    <div class="value">${money(getMonthlySpend())}</div>
                    <p>All cycles normalized</p>
                </div>
            </div>
            <div class="stat-card animate-in" style="--delay:0.2s">
                <div class="stat-icon amber"><i class="fa-solid fa-trophy"></i></div>
                <div class="stat-body">
                    <h3>Top Category</h3>
                    <div class="value" style="font-size:1.4rem">${topCat}</div>
                    <p>${quarterlyCount} quarterly plan${quarterlyCount !== 1 ? "s" : ""}</p>
                </div>
            </div>
        </div>
        <div class="charts-grid">
            <div class="chart-card animate-in" style="--delay:0.25s">
                <h3 class="chart-title">
                    <i class="fa-solid fa-chart-column"></i>
                    Category Spending
                </h3>
                <div class="chart-box">
                    <canvas id="analyticsChart"></canvas>
                </div>
            </div>
            <div class="chart-card animate-in" style="--delay:0.3s">
                <h3 class="chart-title">
                    <i class="fa-solid fa-chart-pie"></i>
                    Billing Cycle Split
                </h3>
                <div class="chart-box">
                    <canvas id="cycleChart"></canvas>
                </div>
            </div>
        </div>
        `;
        const barCanvas = document.getElementById("analyticsChart");
        if (barCanvas && typeof Chart !== "undefined" && catData.labels.length > 0) {
            analyticsChart = new Chart(barCanvas, {
                type: "bar",
                data: {
                    labels: catData.labels,
                    datasets: [{
                        label: "Monthly ($)",
                        data: catData.values,
                        backgroundColor: CHART_COLORS,
                        borderRadius: 10,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: CHART_DEFAULTS.plugins.tooltip },
                    scales: CHART_DEFAULTS.scales
                }
            });
        }
        const cycleCanvas = document.getElementById("cycleChart");
        if (cycleCanvas && typeof Chart !== "undefined") {
            new Chart(cycleCanvas, {
                type: "doughnut",
                data: {
                    labels: ["Monthly", "Yearly", "Quarterly"],
                    datasets: [{
                        data: [monthlyCount, yearlyCount, quarterlyCount],
                        backgroundColor: ["#7c3aed", "#22d3ee", "#f59e0b"],
                        borderWidth: 3,
                        borderColor: "#0f0a1e"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "58%",
                    plugins: {
                        legend: { position: "bottom", labels: { color: "#c4b5fd", font: { size: 13, weight: "600" }, padding: 16, usePointStyle: true } },
                        tooltip: CHART_DEFAULTS.plugins.tooltip
                    }
                }
            });
        }
    }
    /* ══════════════════════════════════════════════════════════════════
       PAGE: AI INSIGHTS
    ══════════════════════════════════════════════════════════════════ */
    function renderInsights() {
        destroyCharts();
        const monthly   = getMonthlySpend();
        const yearly    = getYearlySpend();
        const expensive = subscriptions.filter(s => s.cycle === "Monthly" && s.amount >= 20).length;
        const savings   = expensive * 10 + (subscriptions.length >= 5 ? 25 : 0);
        const score     = Math.max(45, 92 - expensive * 8 - (monthly > 100 ? 10 : 0));
        let tip = "Your subscription spending looks well-controlled. Keep reviewing renewals every month to stay on track.";
        if (expensive >= 2) tip = "You have multiple expensive monthly subscriptions. Consider auditing which ones you rarely use — cancelling just one could save you significantly.";
        else if (subscriptions.length > 6) tip = "You have many active plans. Try removing duplicate services from the same category to reduce overlap costs.";
        else if (monthly > 80) tip = "Your monthly cost is getting high. Switching to yearly plans for services you use regularly can save up to 20%.";
        const catData = getCategoryData();
        const topCat  = catData.labels.length > 0
            ? { name: catData.labels[catData.values.indexOf(Math.max(...catData.values))],
                val: Math.max(...catData.values) }
            : null;
        const scoreColor = score >= 75 ? "#10b981" : score >= 55 ? "#f59e0b" : "#ef4444";
        const scoreLabel = score >= 75 ? "Excellent" : score >= 55 ? "Fair" : "Needs Attention";
        pageContent.innerHTML = `
        <div class="insight-hero animate-in" style="--delay:0.05s">
            <div class="ai-card">
                <div class="ai-header">
                    <div class="ai-icon">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <h2>AI Spending Insights</h2>
                        <p>Smart subscription analysis powered by SaveX AI</p>
                    </div>
                    <div class="ai-badge">LIVE</div>
                </div>
                <p class="ai-summary">
                    You currently have <strong>${subscriptions.length}</strong> active subscriptions
                    costing you <strong>${money(monthly)} / month</strong> and an estimated
                    <strong>${money(yearly)} / year</strong>.
                    ${topCat ? `Your biggest spending category is <strong>${topCat.name}</strong> at <strong>${money(topCat.val)}/mo</strong>.` : ""}
                </p>
                <div class="tip-box">
                    <i class="fa-solid fa-lightbulb"></i>
                    <div>
                        <strong>AI Recommendation</strong>
                        <p>${escapeHtml(tip)}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="insight-stats animate-in" style="--delay:0.15s">
            <div class="insight-metric-card">
                <div class="metric-icon" style="background: rgba(16,185,129,0.15)">
                    <i class="fa-solid fa-coins" style="color:#10b981"></i>
                </div>
                <div>
                    <h3>Potential Savings</h3>
                    <div class="metric-value" style="color:#10b981">${money(savings)}</div>
                    <p>Estimated yearly saving</p>
                </div>
            </div>
            <div class="insight-metric-card">
                <div class="metric-icon" style="background: rgba(${score >= 75 ? "16,185,129" : score >= 55 ? "245,158,11" : "239,68,68"},0.15)">
                    <i class="fa-solid fa-shield-heart" style="color:${scoreColor}"></i>
                </div>
                <div>
                    <h3>Budget Health Score</h3>
                    <div class="metric-value" style="color:${scoreColor}">${score}%</div>
                    <p>${scoreLabel}</p>
                </div>
            </div>
            <div class="insight-metric-card">
                <div class="metric-icon" style="background: rgba(168,85,247,0.15)">
                    <i class="fa-solid fa-fire-flame-curved" style="color:#a855f7"></i>
                </div>
                <div>
                    <h3>High-Cost Plans</h3>
                    <div class="metric-value" style="color:#a855f7">${expensive}</div>
                    <p>Plans over $20/mo</p>
                </div>
            </div>
        </div>
        <div class="score-bar-card animate-in" style="--delay:0.25s">
            <h3 class="chart-title">
                <i class="fa-solid fa-gauge-simple-high"></i>
                Budget Health Score
            </h3>
            <div class="score-track">
                <div class="score-fill" style="width: ${score}%; background: ${scoreColor}"></div>
            </div>
            <div class="score-labels">
                <span>0%</span>
                <span style="color:${scoreColor}; font-weight:700">${score}% — ${scoreLabel}</span>
                <span>100%</span>
            </div>
        </div>
        `;
    }
    /* ══════════════════════════════════════════════════════════════════
       PAGE: REMINDERS
    ══════════════════════════════════════════════════════════════════ */
    function renderReminders() {
        destroyCharts();
        const upcoming = getUpcomingRenewals();
        const overdue  = getOverdueRenewals();
        pageContent.innerHTML = `
        <div class="reminders-hero animate-in" style="--delay:0.05s">
            <div class="reminder-stat upcoming-stat">
                <i class="fa-solid fa-clock"></i>
                <div>
                    <div class="rstat-num">${upcoming.length}</div>
                    <div class="rstat-label">Due in 7 days</div>
                </div>
            </div>
            <div class="reminder-stat overdue-stat">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div>
                    <div class="rstat-num">${overdue.length}</div>
                    <div class="rstat-label">Overdue</div>
                </div>
            </div>
        </div>
        <div class="renewals-card animate-in" style="--delay:0.15s">
            <h3 class="chart-title">
                <i class="fa-solid fa-bell"></i>
                Upcoming Renewals (Next 7 Days)
            </h3>
            <div id="upcomingList"></div>
        </div>
        <div class="renewals-card animate-in" style="--delay:0.25s">
            <h3 class="chart-title" style="color:#ef4444">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Overdue Renewals
            </h3>
            <div id="overdueList"></div>
        </div>
        `;
        renderRenewalList("upcomingList", upcoming, false);
        renderRenewalList("overdueList", overdue, true);
        updateBadge();
    }
    /* ── Shared renewal list ────────────────────────────────────────── */
    function renderRenewalList(containerId, list, overdue) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-${overdue ? "check-circle" : "calendar-check"}"></i>
                    <p>${overdue ? "No overdue renewals." : "No upcoming renewals in the next 7 days."}</p>
                </div>`;
            return;
        }
        container.innerHTML = list.map((sub, idx) => {
            const left = daysLeft(sub.renewal);
            let text = overdue ? "Overdue"
                : left === 0 ? "Today"
                : left === 1 ? "Tomorrow"
                : left + " days";
            return `
            <div class="renewal-item renewal-animate" style="--ri-delay:${idx * 0.05}s">
                <div class="renewal-left">
                    <div class="renewal-icon ${overdue ? "overdue-icon" : ""}">
                        <i class="fa-solid fa-calendar-days"></i>
                    </div>
                    <div>
                        <h4>${escapeHtml(sub.name)}</h4>
                        <p>${money(sub.amount)} · ${escapeHtml(sub.cycle)} · ${escapeHtml(sub.category)}</p>
                    </div>
                </div>
                <div class="renewal-right">
                    <span class="days-badge ${overdue ? "overdue-badge" : left <= 2 ? "urgent-badge" : ""}">${text}</span>
                    <span class="renewal-date">${formatDateForDisplay(sub.renewal)}</span>
                </div>
            </div>`;
        }).join("");
    }
    /* ── Page routing ───────────────────────────────────────────────── */
    function setPage(page) {
        document.querySelectorAll(".menu-item").forEach(item => {
            item.classList.toggle("active", item.dataset.page === page);
        });
        const names = { dashboard: "Dashboard", subscriptions: "Subscriptions", analytics: "Analytics", insights: "AI Insights", reminders: "Reminders" };
        pageTitle.textContent = names[page] || page;
        if (page === "dashboard")     renderDashboard();
        else if (page === "subscriptions") renderSubscriptions();
        else if (page === "analytics")     renderAnalytics();
        else if (page === "insights")      renderInsights();
        else if (page === "reminders")     renderReminders();
    }
    /* ── Modal ──────────────────────────────────────────────────────── */
    function openModal() {
        editIndex = -1;
        subscriptionForm.reset();
        modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Add Subscription`;
        modalOverlay.classList.add("show");
    }
    function closeModal() {
        modalOverlay.classList.remove("show");
        editIndex = -1;
    }
    function saveSubscription(e) {
        e.preventDefault();
        const name    = serviceName.value.trim();
        const amount  = Number(serviceAmount.value);
        const category = serviceCategory.value;
        const cycle   = serviceCycle.value;
        const renewal = serviceRenewal.value;
        if (!name)              { showToast("Please enter a service name.", "error"); return; }
        if (amount <= 0 || isNaN(amount)) { showToast("Please enter a valid amount.", "error"); return; }
        if (!renewal)           { showToast("Please select a renewal date.", "error"); return; }
        const sub = {
            id:       editIndex === -1 ? Date.now() : subscriptions[editIndex].id,
            name, amount, category, cycle, renewal
        };
        if (editIndex === -1) {
            subscriptions.push(sub);
            showToast(`✅ "${name}" added successfully.`, "success");
        } else {
            subscriptions[editIndex] = sub;
            showToast(`✏️ "${name}" updated successfully.`, "success");
        }
        saveData();
        closeModal();
        const activePage = document.querySelector(".menu-item.active").dataset.page;
        setPage(activePage);
        updateBadge();
    }
    /* ── Global edit/delete (called from inline onclick) ────────────── */
    window.editSubscription = function (index) {
        const sub = subscriptions[index];
        serviceName.value     = sub.name;
        serviceAmount.value   = sub.amount;
        serviceCategory.value = sub.category;
        serviceCycle.value    = sub.cycle;
        serviceRenewal.value  = normalizeDateForInput(sub.renewal);
        editIndex = index;
        modalTitle.innerHTML  = `<i class="fa-solid fa-pen"></i> Edit Subscription`;
        modalOverlay.classList.add("show");
    };
    window.deleteSubscription = function (index) {
        const name = subscriptions[index].name;
        if (!confirm(`Delete "${name}"?`)) return;
        subscriptions.splice(index, 1);
        saveData();
        const activePage = document.querySelector(".menu-item.active").dataset.page;
        setPage(activePage);
        updateBadge();
        showToast(`🗑️ "${name}" deleted.`, "error");
    };
    /* ── Demo data ──────────────────────────────────────────────────── */
    function loadDemoData() {
        if (subscriptions.length > 0) return;
        const today = new Date();
        const offset = (n) => { const d = new Date(today); d.setDate(today.getDate() + n); return d.toISOString().split("T")[0]; };
        subscriptions = [
            { id: 1, name: "Netflix",       amount: 15.99,  category: "Entertainment", cycle: "Monthly",   renewal: offset(3) },
            { id: 2, name: "Spotify",        amount: 11.99,  category: "Music",         cycle: "Monthly",   renewal: offset(9) },
            { id: 3, name: "Adobe CC",       amount: 299.99, category: "Software",      cycle: "Yearly",    renewal: offset(5) },
            { id: 4, name: "ChatGPT Plus",   amount: 20.00,  category: "Software",      cycle: "Monthly",   renewal: offset(-2) },
            { id: 5, name: "Notion",         amount: 16.00,  category: "Productivity",  cycle: "Monthly",   renewal: offset(14) },
            { id: 6, name: "YouTube Premium",amount: 13.99,  category: "Entertainment", cycle: "Monthly",   renewal: offset(1) }
        ];
        saveData();
    }
    /* ── Event wiring ───────────────────────────────────────────────── */
    function setupEvents() {
        document.querySelectorAll(".menu-item").forEach(item => {
            item.addEventListener("click", () => setPage(item.dataset.page));
        });
        if (openModalBtn) openModalBtn.addEventListener("click", openModal);
        if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
        if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
        if (subscriptionForm) subscriptionForm.addEventListener("submit", saveSubscription);
        if (modalOverlay) {
            modalOverlay.addEventListener("click", e => {
                if (e.target === modalOverlay) closeModal();
            });
        }
        if (notificationBtn) {
            notificationBtn.addEventListener("click", () => setPage("reminders"));
        }
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.setItem("savex_logged_in", "false");
                window.location.href = "index.html";
            });
        }
    }
    /* ── Boot ───────────────────────────────────────────────────────── */
    initializeUser();
    loadDemoData();
    setupEvents();
    setPage("dashboard");
    updateBadge();
});
