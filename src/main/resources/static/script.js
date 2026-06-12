document.addEventListener("DOMContentLoaded", function () {

    if (localStorage.getItem("savex_logged_in") !== "true") {
        window.location.href = "index.html";
        return;
    }

    const API_URL = "http://localhost:8080/subscriptions";

    let subscriptions = [];
    let editIndex = -1;
    let categoryChart = null;
    let trendChart = null;
    let analyticsChart = null;
    let cycleChart = null;

    const pageContent = document.getElementById("pageContent");
    const pageTitle = document.getElementById("pageTitle");
    const notificationBadge = document.getElementById("notificationBadge");
    const modalOverlay = document.getElementById("modalOverlay");
    const openModalBtn = document.getElementById("openModalBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const subscriptionForm = document.getElementById("subscriptionForm");
    const modalTitle = document.getElementById("modalTitle");
    const serviceName = document.getElementById("serviceName");
    const serviceAmount = document.getElementById("serviceAmount");
    const serviceCategory = document.getElementById("serviceCategory");
    const serviceCycle = document.getElementById("serviceCycle");
    const serviceRenewal = document.getElementById("serviceRenewal");
    const subscriptionId = document.getElementById("subscriptionId");
    const toast = document.getElementById("toast");
    const notificationBtn = document.getElementById("notificationBtn");

    if (!pageContent) return;

    function icon(name) {
        return window.SavexIcons ? window.SavexIcons.icon(name) : "";
    }

    function refreshIcons() {
        if (window.SavexIcons) {
            window.SavexIcons.refresh(document);
        }
    }

    function initializeUser() {
        const userName = localStorage.getItem("subtracker_user_name") || "SaveX User";
        const firstName = userName.split(" ")[0];

        const welcomeEl = document.getElementById("welcomeText");
        const profileNameEl = document.getElementById("profileName");
        const profileAvatarEl = document.getElementById("profileAvatar");

        if (welcomeEl) {
            welcomeEl.textContent = "Welcome back, " + firstName;
        }

        if (profileNameEl) {
            profileNameEl.textContent = userName;
        }

        if (profileAvatarEl) {
            profileAvatarEl.textContent = userName
                .split(" ")
                .map(function (word) {
                    return word.charAt(0).toUpperCase();
                })
                .join("")
                .slice(0, 2) || "SX";
        }
    }

    async function fetchSubscriptions() {
        try {
            const res = await fetch(API_URL);

            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }

            const data = await res.json();

            subscriptions = data.map(function (s) {
                return {
                    id: s.id,
                    name: s.serviceName,
                    amount: Number(s.amount),
                    category: s.category,
                    cycle: s.billingCycle,
                    renewal: s.nextBillingDate
                };
            });

        } catch (err) {
            console.error("Fetch error:", err);
            showToast("Cannot reach backend. Is Spring Boot running?", "error");
            subscriptions = [];
        }
    }

    function showToast(message, type) {
        if (!toast) {
            alert(message);
            return;
        }

        toast.textContent = message;
        toast.className = "toast show" + (type ? " toast-" + type : "");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function money(n) {
        return "$" + Number(n || 0).toFixed(2);
    }

    function normalizeDateForInput(v) {
        if (!v) return "";
        return String(v).split("T")[0];
    }

    function formatDateForDisplay(v) {
        if (!v) return "";

        const parts = String(v).split("T")[0].split("-");

        if (parts.length === 3) {
            return parts[2] + "/" + parts[1] + "/" + parts[0];
        }

        return v;
    }

    function monthlyValue(s) {
        if (s.cycle === "Monthly") return s.amount;
        if (s.cycle === "Yearly") return s.amount / 12;
        if (s.cycle === "Quarterly") return s.amount / 3;

        return s.amount;
    }

    function yearlyValue(s) {
        if (s.cycle === "Monthly") return s.amount * 12;
        if (s.cycle === "Yearly") return s.amount;
        if (s.cycle === "Quarterly") return s.amount * 4;

        return s.amount;
    }

    function getMonthlySpend() {
        return subscriptions.reduce(function (total, sub) {
            return total + monthlyValue(sub);
        }, 0);
    }

    function getYearlySpend() {
        return subscriptions.reduce(function (total, sub) {
            return total + yearlyValue(sub);
        }, 0);
    }

    function getCategoryData() {
        const data = {};

        subscriptions.forEach(function (sub) {
            data[sub.category] = (data[sub.category] || 0) + monthlyValue(sub);
        });

        return {
            labels: Object.keys(data),
            values: Object.values(data)
        };
    }

    function daysUntil(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const date = new Date(normalizeDateForInput(dateString));
        date.setHours(0, 0, 0, 0);

        return Math.ceil((date - today) / 86400000);
    }

    function getUpcomingRenewals() {
        return subscriptions
            .filter(function (sub) {
                const days = daysUntil(sub.renewal);
                return days >= 0 && days <= 7;
            })
            .sort(function (a, b) {
                return daysUntil(a.renewal) - daysUntil(b.renewal);
            });
    }

    function getOverdueRenewals() {
        return subscriptions.filter(function (sub) {
            return daysUntil(sub.renewal) < 0;
        });
    }

    function updateBadge() {
        if (notificationBadge) {
            notificationBadge.textContent = getUpcomingRenewals().length;
        }
    }

    function destroyCharts() {
        const charts = [categoryChart, trendChart, analyticsChart, cycleChart];

        charts.forEach(function (chart) {
            if (chart) {
                chart.destroy();
            }
        });

        categoryChart = null;
        trendChart = null;
        analyticsChart = null;
        cycleChart = null;
    }

    const COLORS = [
        "#8b5cf6",
        "#22d3ee",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#ec4899",
        "#84cc16",
        "#a855f7"
    ];

    const TOOLTIP = {
        backgroundColor: "rgba(12, 8, 24, 0.97)",
        titleColor: "#f5f0ff",
        bodyColor: "#d8ccff",
        borderColor: "rgba(216, 180, 254, 0.25)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12
    };

    const SCALES = {
        x: {
            ticks: {
                color: "#9184b8"
            },
            grid: {
                color: "rgba(145, 132, 184, 0.10)"
            }
        },
        y: {
            ticks: {
                color: "#9184b8"
            },
            grid: {
                color: "rgba(145, 132, 184, 0.10)"
            }
        }
    };

    function renderDashboard() {
        destroyCharts();

        const monthly = getMonthlySpend();
        const yearly = getYearlySpend();
        const upcoming = getUpcomingRenewals().length;
        const average = subscriptions.length > 0 ? monthly / subscriptions.length : 0;

        pageContent.innerHTML = `
            <div class="stats-grid">

                <div class="stat-card animate-in">
                    <div class="stat-icon purple">${icon("credit-card")}</div>
                    <div class="stat-body">
                        <h3>Active Subscriptions</h3>
                        <div class="value">${subscriptions.length}</div>
                        <p>Total active plans</p>
                    </div>
                </div>

                <div class="stat-card animate-in">
                    <div class="stat-icon blue">${icon("dollar-sign")}</div>
                    <div class="stat-body">
                        <h3>Monthly Spend</h3>
                        <div class="value">${money(monthly)}</div>
                        <p>${money(average)} average per subscription</p>
                    </div>
                </div>

                <div class="stat-card animate-in">
                    <div class="stat-icon green">${icon("chart-line")}</div>
                    <div class="stat-body">
                        <h3>Yearly Projection</h3>
                        <div class="value">${money(yearly)}</div>
                        <p>Annual forecast</p>
                    </div>
                </div>

                <div class="stat-card animate-in">
                    <div class="stat-icon amber">${icon("bell")}</div>
                    <div class="stat-body">
                        <h3>Upcoming Renewals</h3>
                        <div class="value">${upcoming}</div>
                        <p>Next 7 days</p>
                    </div>
                </div>

            </div>

            <div class="charts-grid">

                <div class="chart-card animate-in">
                    <h3 class="chart-title">${icon("chart-pie")} Category Distribution</h3>
                    <div class="chart-box">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>

                <div class="chart-card animate-in">
                    <h3 class="chart-title">${icon("chart-line")} 6-Month Trend</h3>
                    <div class="chart-box">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>

            </div>

            <div class="renewals-card animate-in">
                <h3 class="chart-title">
                    ${icon("clock")} Upcoming Renewals
                    <span class="badge-inline">${upcoming}</span>
                </h3>
                <div class="renewal-list" id="renewalList"></div>
            </div>
        `;

        refreshIcons();

        const catCanvas = document.getElementById("categoryChart");

        if (catCanvas && typeof Chart !== "undefined") {
            const data = getCategoryData();

            if (data.labels.length === 0) {
                catCanvas.parentElement.innerHTML = `
                    <div class="empty-state">
                        ${icon("chart-pie")}
                        <p>No data yet</p>
                    </div>
                `;
                refreshIcons();
            } else {
                categoryChart = new Chart(catCanvas, {
                    type: "doughnut",
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                data: data.values,
                                backgroundColor: COLORS,
                                borderWidth: 4,
                                borderColor: "#080312"
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "64%",
                        plugins: {
                            legend: {
                                position: "bottom",
                                labels: {
                                    color: "#d8ccff",
                                    font: {
                                        size: 13,
                                        weight: "600"
                                    },
                                    padding: 18,
                                    usePointStyle: true
                                }
                            },
                            tooltip: TOOLTIP
                        }
                    }
                });
            }
        }

        const trendCanvas = document.getElementById("trendChart");

        if (trendCanvas && typeof Chart !== "undefined") {
            const total = getMonthlySpend();
            const labels = [];
            const values = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);

                labels.push(date.toLocaleString("default", {
                    month: "short"
                }));

                values.push(Number((total * (1 + Math.sin(i * 0.9) * 0.06)).toFixed(2)));
            }

            trendChart = new Chart(trendCanvas, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Monthly Spend",
                            data: values,
                            borderColor: "#a855f7",
                            backgroundColor: "rgba(168,85,247,0.14)",
                            fill: true,
                            tension: 0.42,
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            pointBackgroundColor: "#a855f7",
                            pointBorderColor: "#080312",
                            pointBorderWidth: 2,
                            borderWidth: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: TOOLTIP
                    },
                    scales: SCALES
                }
            });
        }

        renderRenewalList("renewalList", getUpcomingRenewals(), false);
        updateBadge();
    }

    function renderSubscriptions() {
        destroyCharts();

        pageContent.innerHTML = `
            <div class="table-card animate-in">

                <div class="table-header-row">
                    <h3 class="chart-title">${icon("list")} Manage Subscriptions</h3>

                    <div class="table-meta">
                        <span class="badge-count">${subscriptions.length} plan${subscriptions.length !== 1 ? "s" : ""}</span>
                        <span class="badge-amount">${money(getMonthlySpend())} / month</span>
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

        refreshIcons();

        const table = document.getElementById("subscriptionTable");

        if (subscriptions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            ${icon("credit-card")}
                            <p>No subscriptions yet.</p>
                            <small>Click <strong>Add Subscription</strong> to get started.</small>
                        </div>
                    </td>
                </tr>
            `;
            refreshIcons();
            return;
        }

        const catIcons = {
            Entertainment: "film",
            Music: "music",
            Software: "code",
            Productivity: "briefcase",
            Education: "graduation-cap",
            Gaming: "gamepad",
            Cloud: "cloud",
            Other: "layer-group"
        };

        table.innerHTML = subscriptions.map(function (sub, index) {
            const days = daysUntil(sub.renewal);
            const renewalClass = days < 0 ? "overdue" : days <= 3 ? "urgent" : days <= 7 ? "upcoming" : "";
            const cycleClass = String(sub.cycle || "").toLowerCase();

            return `
                <tr class="table-row-animate">

                    <td>
                        <div class="service-cell">
                            <div class="service-icon">
                                ${icon(catIcons[sub.category] || "layer-group")}
                            </div>
                            <span class="service-name">${escapeHtml(sub.name)}</span>
                        </div>
                    </td>

                    <td>
                        <span class="category-pill">${escapeHtml(sub.category)}</span>
                    </td>

                    <td class="amount-cell">${money(sub.amount)}</td>

                    <td class="monthly-cell">${money(monthlyValue(sub))}</td>

                    <td>
                        <span class="cycle-badge cycle-${cycleClass}">
                            ${escapeHtml(sub.cycle)}
                        </span>
                    </td>

                    <td class="renewal-cell ${renewalClass}">
                        ${formatDateForDisplay(sub.renewal)}
                        ${
                            renewalClass
                                ? `<span class="renewal-tag">${days < 0 ? "Overdue" : days === 0 ? "Today" : days + "d"}</span>`
                                : ""
                        }
                    </td>

                    <td>
                        <div class="action-buttons">
                            <button type="button" class="icon-action edit-btn" onclick="editSubscription(${index})">
                                ${icon("pen")}
                            </button>

                            <button type="button" class="icon-action delete-btn" onclick="deleteSubscription(${index})">
                                ${icon("trash")}
                            </button>
                        </div>
                    </td>

                </tr>
            `;
        }).join("");

        refreshIcons();
    }

    function renderAnalytics() {
        destroyCharts();

        const monthlyCount = subscriptions.filter(function (s) {
            return s.cycle === "Monthly";
        }).length;

        const yearlyCount = subscriptions.filter(function (s) {
            return s.cycle === "Yearly";
        }).length;

        const quarterlyCount = subscriptions.filter(function (s) {
            return s.cycle === "Quarterly";
        }).length;

        const monthlyOnly = subscriptions
            .filter(function (s) {
                return s.cycle === "Monthly";
            })
            .reduce(function (total, s) {
                return total + s.amount;
            }, 0);

        const yearlyOnly = subscriptions
            .filter(function (s) {
                return s.cycle === "Yearly";
            })
            .reduce(function (total, s) {
                return total + s.amount;
            }, 0);

        const category = getCategoryData();

        const topCategory = category.labels.length > 0
            ? category.labels[category.values.indexOf(Math.max.apply(null, category.values))]
            : "None";

        pageContent.innerHTML = `
            <div class="stats-grid">

                <div class="stat-card animate-in">
                    <div class="stat-icon purple">${icon("calendar")}</div>
                    <div class="stat-body">
                        <h3>Monthly Plans</h3>
                        <div class="value">${monthlyCount}</div>
                        <p>${money(monthlyOnly)} / month</p>
                    </div>
                </div>

                <div class="stat-card animate-in">
                    <div class="stat-icon blue">${icon("calendar-check")}</div>
                    <div class="stat-body">
                        <h3>Yearly Plans</h3>
                        <div class="value">${yearlyCount}</div>
                        <p>${money(yearlyOnly)} / year</p>
                    </div>
                </div>

                <div class="stat-card animate-in">
                    <div class="stat-icon green">${icon("wallet")}</div>
                    <div class="stat-body">
                        <h3>Monthly Equivalent</h3>
                        <div class="value">${money(getMonthlySpend())}</div>
                        <p>All cycles normalized</p>
                    </div>
                </div>

                <div class="stat-card animate-in">
                    <div class="stat-icon amber">${icon("trophy")}</div>
                    <div class="stat-body">
                        <h3>Top Category</h3>
                        <div class="value medium-value">${topCategory}</div>
                        <p>${quarterlyCount} quarterly plan${quarterlyCount !== 1 ? "s" : ""}</p>
                    </div>
                </div>

            </div>

            <div class="charts-grid">

                <div class="chart-card animate-in">
                    <h3 class="chart-title">${icon("chart-column")} Category Spending</h3>
                    <div class="chart-box">
                        <canvas id="analyticsChart"></canvas>
                    </div>
                </div>

                <div class="chart-card animate-in">
                    <h3 class="chart-title">${icon("chart-pie")} Billing Cycle Split</h3>
                    <div class="chart-box">
                        <canvas id="cycleChart"></canvas>
                    </div>
                </div>

            </div>
        `;

        refreshIcons();

        const barCanvas = document.getElementById("analyticsChart");

        if (barCanvas && typeof Chart !== "undefined" && category.labels.length > 0) {
            analyticsChart = new Chart(barCanvas, {
                type: "bar",
                data: {
                    labels: category.labels,
                    datasets: [
                        {
                            label: "Monthly",
                            data: category.values,
                            backgroundColor: COLORS,
                            borderRadius: 12,
                            borderSkipped: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: TOOLTIP
                    },
                    scales: SCALES
                }
            });
        }

        const cycleCanvas = document.getElementById("cycleChart");

        if (cycleCanvas && typeof Chart !== "undefined") {
            cycleChart = new Chart(cycleCanvas, {
                type: "doughnut",
                data: {
                    labels: ["Monthly", "Yearly", "Quarterly"],
                    datasets: [
                        {
                            data: [monthlyCount, yearlyCount, quarterlyCount],
                            backgroundColor: ["#8b5cf6", "#22d3ee", "#10b981"],
                            borderColor: "#080312",
                            borderWidth: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "64%",
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: {
                                color: "#d8ccff",
                                font: {
                                    weight: "600"
                                },
                                padding: 18,
                                usePointStyle: true
                            }
                        },
                        tooltip: TOOLTIP
                    }
                }
            });
        }
    }

    function renderInsights() {
        destroyCharts();

        const monthly = getMonthlySpend();
        const yearly = getYearlySpend();

        const highCost = subscriptions.filter(function (sub) {
            return monthlyValue(sub) >= 20;
        });

        const entertainmentBased = subscriptions.filter(function (sub) {
            return ["Entertainment", "Gaming", "Music"].includes(sub.category);
        }).length;

        pageContent.innerHTML = `
            <div class="insights-grid">

                <div class="ai-card animate-in">

                    <div class="ai-card-header">
                        <div class="ai-icon">${icon("brain")}</div>

                        <div>
                            <h3>Smart Expense Summary</h3>
                            <p>Generated using your current subscription data.</p>
                        </div>
                    </div>

                    <div class="insight-list">

                        <div class="insight-item">
                            <div class="insight-icon">${icon("wallet")}</div>

                            <div>
                                <h4>Spending Pattern</h4>
                                <p>
                                    Your current monthly equivalent spending is
                                    <strong>${money(monthly)}</strong>, with a yearly projection of
                                    <strong>${money(yearly)}</strong>.
                                </p>
                            </div>
                        </div>

                        <div class="insight-item">
                            <div class="insight-icon">${icon("lightbulb")}</div>

                            <div>
                                <h4>Optimization Suggestion</h4>
                                <p>
                                    ${
                                        highCost.length > 0
                                            ? `Review ${highCost.length} high-cost subscription${highCost.length !== 1 ? "s" : ""} to reduce recurring expenses.`
                                            : "Your subscriptions are currently balanced based on monthly cost."
                                    }
                                </p>
                            </div>
                        </div>

                        <div class="insight-item">
                            <div class="insight-icon">${icon("bell")}</div>

                            <div>
                                <h4>Renewal Alert</h4>
                                <p>
                                    ${getUpcomingRenewals().length} renewal${getUpcomingRenewals().length !== 1 ? "s" : ""}
                                    coming within the next 7 days.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

                <div class="metrics-panel animate-in">

                    <div class="insight-metric-card">
                        <span>${icon("spark")}</span>
                        <h4>${subscriptions.length}</h4>
                        <p>Total subscriptions</p>
                    </div>

                    <div class="insight-metric-card">
                        <span>${icon("coins")}</span>
                        <h4>${money(monthly)}</h4>
                        <p>Monthly equivalent</p>
                    </div>

                    <div class="insight-metric-card">
                        <span>${icon("chart-pie")}</span>
                        <h4>${entertainmentBased}</h4>
                        <p>Entertainment-based services</p>
                    </div>

                </div>

            </div>
        `;

        refreshIcons();
    }

    function renderReminders() {
        destroyCharts();

        const upcoming = getUpcomingRenewals();
        const overdue = getOverdueRenewals();

        pageContent.innerHTML = `
            <div class="renewals-card animate-in">

                <h3 class="chart-title">${icon("bell")} Renewal Center</h3>

                <div class="reminder-section">
                    <h4>Upcoming renewals</h4>
                    <div class="renewal-list" id="upcomingReminderList"></div>
                </div>

                <div class="reminder-section">
                    <h4>Overdue renewals</h4>
                    <div class="renewal-list" id="overdueReminderList"></div>
                </div>

            </div>
        `;

        refreshIcons();

        renderRenewalList("upcomingReminderList", upcoming, false);
        renderRenewalList("overdueReminderList", overdue, true);
    }

    function renderRenewalList(containerId, list, isOverdue) {
        const container = document.getElementById(containerId);

        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state compact">
                    ${icon(isOverdue ? "calendar-check" : "bell")}
                    <p>${isOverdue ? "No overdue renewals." : "No upcoming renewals in the next 7 days."}</p>
                </div>
            `;
            refreshIcons();
            return;
        }

        container.innerHTML = list.map(function (sub) {
            const days = daysUntil(sub.renewal);
            const label = days < 0
                ? Math.abs(days) + " days overdue"
                : days === 0
                    ? "Due today"
                    : days + " days left";

            return `
                <div class="renewal-item">

                    <div class="renewal-icon">
                        ${icon("calendar")}
                    </div>

                    <div class="renewal-info">
                        <h4>${escapeHtml(sub.name)}</h4>
                        <p>${escapeHtml(sub.category)} • ${escapeHtml(sub.cycle)} • ${formatDateForDisplay(sub.renewal)}</p>
                    </div>

                    <span class="renewal-status ${days < 0 ? "overdue" : days <= 3 ? "urgent" : "upcoming"}">
                        ${label}
                    </span>

                </div>
            `;
        }).join("");

        refreshIcons();
    }

    function setPage(page) {
        document.querySelectorAll(".menu-item").forEach(function (item) {
            item.classList.toggle("active", item.dataset.page === page);
        });

        const titles = {
            dashboard: "Dashboard",
            subscriptions: "Subscriptions",
            analytics: "Analytics",
            insights: "AI Insights",
            reminders: "Reminders"
        };

        pageTitle.textContent = titles[page] || "Dashboard";

        if (page === "subscriptions") {
            renderSubscriptions();
        } else if (page === "analytics") {
            renderAnalytics();
        } else if (page === "insights") {
            renderInsights();
        } else if (page === "reminders") {
            renderReminders();
        } else {
            renderDashboard();
        }
    }

    function openModal() {
        editIndex = -1;

        subscriptionForm.reset();

        if (subscriptionId) {
            subscriptionId.value = "";
        }

        modalTitle.innerHTML = `${icon("plus-circle")} Add Subscription`;

        modalOverlay.classList.add("show");

        refreshIcons();
    }

    function closeModal() {
        modalOverlay.classList.remove("show");
        editIndex = -1;

        if (subscriptionId) {
            subscriptionId.value = "";
        }
    }

    async function saveSubscription(e) {
        e.preventDefault();

        const name = serviceName.value.trim();
        const amount = Number(serviceAmount.value);
        const category = serviceCategory.value;
        const cycle = serviceCycle.value;
        const renewal = serviceRenewal.value;

        if (!name) {
            showToast("Please enter a service name.", "error");
            return;
        }

        if (amount <= 0 || isNaN(amount)) {
            showToast("Please enter a valid amount.", "error");
            return;
        }

        if (!renewal) {
            showToast("Please select a renewal date.", "error");
            return;
        }

        const payload = {
            serviceName: name,
            amount: amount,
            category: category,
            billingCycle: cycle,
            nextBillingDate: renewal
        };

        try {
            let res;

            if (editIndex === -1) {
                res = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    throw new Error("Add failed: " + res.status);
                }

                showToast(`"${name}" added successfully.`, "success");

            } else {
                const id = subscriptionId ? subscriptionId.value : subscriptions[editIndex].id;

                res = await fetch(`${API_URL}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    throw new Error("Update failed: " + res.status);
                }

                showToast(`"${name}" updated successfully.`, "success");
            }

            await fetchSubscriptions();

            closeModal();

            const activePage = document.querySelector(".menu-item.active")?.dataset.page || "dashboard";

            setPage(activePage);

            updateBadge();

        } catch (err) {
            console.error("Save error:", err);
            showToast("Failed to save. Check backend console.", "error");
        }
    }

    window.editSubscription = function (index) {
        const sub = subscriptions[index];

        if (!sub) return;

        if (subscriptionId) {
            subscriptionId.value = sub.id;
        }

        serviceName.value = sub.name;
        serviceAmount.value = sub.amount;
        serviceCategory.value = sub.category;
        serviceCycle.value = sub.cycle;
        serviceRenewal.value = normalizeDateForInput(sub.renewal);

        editIndex = index;

        modalTitle.innerHTML = `${icon("pen")} Edit Subscription`;

        modalOverlay.classList.add("show");

        refreshIcons();
    };

    window.deleteSubscription = async function (index) {
        const sub = subscriptions[index];

        if (!sub) return;

        const confirmDelete = confirm(`Delete "${sub.name}"?`);

        if (!confirmDelete) return;

        try {
            const res = await fetch(`${API_URL}/${sub.id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error("Delete failed: " + res.status);
            }

            await fetchSubscriptions();

            const activePage = document.querySelector(".menu-item.active")?.dataset.page || "dashboard";

            setPage(activePage);

            updateBadge();

            showToast(`"${sub.name}" deleted.`, "error");

        } catch (err) {
            console.error("Delete error:", err);
            showToast("Failed to delete. Check backend console.", "error");
        }
    };

    function setupEvents() {
        document.querySelectorAll(".menu-item").forEach(function (item) {
            item.addEventListener("click", function () {
                setPage(item.dataset.page);
            });
        });

        if (openModalBtn) {
            openModalBtn.addEventListener("click", openModal);
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener("click", closeModal);
        }

        if (cancelModalBtn) {
            cancelModalBtn.addEventListener("click", closeModal);
        }

        if (subscriptionForm) {
            subscriptionForm.addEventListener("submit", saveSubscription);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener("click", function (e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        }

        if (notificationBtn) {
            notificationBtn.addEventListener("click", function () {
                setPage("reminders");
            });
        }

        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                localStorage.setItem("savex_logged_in", "false");
                window.location.href = "index.html";
            });
        }
    }

    async function init() {
        initializeUser();
        setupEvents();

        await fetchSubscriptions();

        setPage("dashboard");
        updateBadge();
        refreshIcons();
    }

    init();
});