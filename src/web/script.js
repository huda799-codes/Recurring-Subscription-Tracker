document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("savex_logged_in");

    if (isLoggedIn !== "true") {
        window.location.href = "index.html";
        return;
    }

    let subscriptions = JSON.parse(localStorage.getItem("subtracker_subscriptions")) || [];
    let editIndex = -1;

    let categoryChart = null;
    let trendChart = null;
    let analyticsChart = null;

    const pageContent = document.getElementById("pageContent");
    const pageTitle = document.getElementById("pageTitle");
    const notificationBadge = document.getElementById("notificationBadge");

    const subscriptionModal = document.getElementById("subscriptionModal");
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

    const toast = document.getElementById("toast");
    const notificationBtn = document.getElementById("notificationBtn");

    if (!pageContent) {
        return;
    }

    function initializeUser() {
        const userName = localStorage.getItem("subtracker_user_name") || "SaveX User";
        const firstName = userName.split(" ")[0];

        const welcomeText = document.getElementById("welcomeText");
        const profileName = document.getElementById("profileName");
        const profileAvatar = document.getElementById("profileAvatar");

        if (welcomeText) {
            welcomeText.textContent = `Welcome back, ${firstName} ✨`;
        }

        if (profileName) {
            profileName.textContent = userName;
        }

        if (profileAvatar) {
            const initials = userName
                .split(" ")
                .map(function (word) {
                    return word.charAt(0).toUpperCase();
                })
                .join("")
                .slice(0, 2);

            profileAvatar.textContent = initials || "SX";
        }
    }

    function saveData() {
        localStorage.setItem("subtracker_subscriptions", JSON.stringify(subscriptions));
    }

    function showToast(message) {
        if (!toast) {
            alert(message);
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 2500);
    }

    function escapeHtml(text) {
        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function money(amount) {
        return "$" + Number(amount).toFixed(2);
    }

    function normalizeDateForInput(dateValue) {
        if (!dateValue) {
            return "";
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
            const parts = dateValue.split("/");
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        return "";
    }

    function formatDateForDisplay(dateValue) {
        if (!dateValue) {
            return "";
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            const parts = dateValue.split("-");
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        return dateValue;
    }

    function monthlyValue(sub) {
        if (sub.cycle === "Monthly") {
            return sub.amount;
        }

        if (sub.cycle === "Yearly") {
            return sub.amount / 12;
        }

        if (sub.cycle === "Quarterly") {
            return sub.amount / 3;
        }

        return sub.amount;
    }

    function yearlyValue(sub) {
        if (sub.cycle === "Monthly") {
            return sub.amount * 12;
        }

        if (sub.cycle === "Yearly") {
            return sub.amount;
        }

        if (sub.cycle === "Quarterly") {
            return sub.amount * 4;
        }

        return sub.amount;
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
            if (!data[sub.category]) {
                data[sub.category] = 0;
            }

            data[sub.category] += monthlyValue(sub);
        });

        return {
            labels: Object.keys(data),
            values: Object.values(data)
        };
    }

    function getUpcomingRenewals() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDays = new Date(today);
        sevenDays.setDate(today.getDate() + 7);
        sevenDays.setHours(23, 59, 59, 999);

        return subscriptions
            .filter(function (sub) {
                const normalizedDate = normalizeDateForInput(sub.renewal);
                const date = new Date(normalizedDate);
                date.setHours(0, 0, 0, 0);

                return date >= today && date <= sevenDays;
            })
            .sort(function (a, b) {
                return new Date(normalizeDateForInput(a.renewal)) - new Date(normalizeDateForInput(b.renewal));
            });
    }

    function getOverdueRenewals() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return subscriptions.filter(function (sub) {
            const normalizedDate = normalizeDateForInput(sub.renewal);
            const date = new Date(normalizedDate);
            date.setHours(0, 0, 0, 0);

            return date < today;
        });
    }

    function daysLeft(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const normalizedDate = normalizeDateForInput(dateString);
        const renewalDate = new Date(normalizedDate);
        renewalDate.setHours(0, 0, 0, 0);

        return Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    }

    function updateBadge() {
        if (notificationBadge) {
            notificationBadge.textContent = getUpcomingRenewals().length;
        }
    }

    function destroyCharts() {
        if (categoryChart) {
            categoryChart.destroy();
            categoryChart = null;
        }

        if (trendChart) {
            trendChart.destroy();
            trendChart = null;
        }

        if (analyticsChart) {
            analyticsChart.destroy();
            analyticsChart = null;
        }
    }

    function renderDashboard() {
        destroyCharts();

        const active = subscriptions.length;
        const monthlySpend = getMonthlySpend();
        const yearlySpend = getYearlySpend();
        const upcoming = getUpcomingRenewals().length;
        const average = active > 0 ? monthlySpend / active : 0;

        pageContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-credit-card"></i>
                    </div>
                    <h3>Active Subscriptions</h3>
                    <div class="value">${active}</div>
                    <p>Total plans</p>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-dollar-sign"></i>
                    </div>
                    <h3>Monthly Spend</h3>
                    <div class="value">${money(monthlySpend)}</div>
                    <p>${money(average)} avg/sub</p>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-chart-line"></i>
                    </div>
                    <h3>Yearly Projection</h3>
                    <div class="value">${money(yearlySpend)}</div>
                    <p>Annual forecast</p>
                </div>

                <div class="stat-card small-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-bell"></i>
                    </div>
                    <h3>Upcoming Renewals</h3>
                    <div class="value">${upcoming}</div>
                    <p>Next 7 days</p>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <h3 class="chart-title">
                        <i class="fa-solid fa-chart-pie"></i>
                        Category Distribution
                    </h3>
                    <div class="chart-box">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <h3 class="chart-title">
                        <i class="fa-solid fa-chart-line"></i>
                        6-Month Trend
                    </h3>
                    <div class="chart-box">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="renewals-card">
                <h3 class="chart-title">
                    <i class="fa-solid fa-clock"></i>
                    Upcoming Renewals (7 days)
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

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        const data = getCategoryData();

        categoryChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: data.labels,
                datasets: [
                    {
                        data: data.values,
                        backgroundColor: [
                            "#7c3aed",
                            "#a855f7",
                            "#22d3ee",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#ec4899",
                            "#84cc16"
                        ],
                        borderWidth: 0,
                        cutout: "50%"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#c4b5fd",
                            font: {
                                size: 14,
                                weight: "700"
                            },
                            padding: 18
                        }
                    }
                }
            }
        });
    }

    function drawTrendChart() {
        const canvas = document.getElementById("trendChart");

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        const total = getMonthlySpend();
        const labels = [];
        const values = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            labels.push(date.toLocaleString("default", {
                month: "short"
            }));

            const value = total * (1 + Math.sin(i) * 0.05);
            values.push(Number(value.toFixed(2)));
        }

        trendChart = new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Monthly Spend ($)",
                        data: values,
                        borderColor: "#a855f7",
                        backgroundColor: "rgba(168, 85, 247, 0.15)",
                        fill: true,
                        tension: 0.42,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: "#a855f7",
                        borderWidth: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function renderRenewalList(containerId, list, overdue) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    No renewals found.
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(function (sub) {
            const left = daysLeft(sub.renewal);

            let text = "";

            if (overdue) {
                text = "Overdue";
            } else if (left === 0) {
                text = "Today";
            } else if (left === 1) {
                text = "Tomorrow";
            } else {
                text = left + " days";
            }

            return `
                <div class="renewal-item">
                    <div class="renewal-left">
                        <div class="renewal-icon">
                            <i class="fa-solid fa-calendar-days"></i>
                        </div>

                        <div>
                            <h4>${escapeHtml(sub.name)}</h4>
                            <p>${money(sub.amount)} · ${escapeHtml(sub.cycle)} · ${escapeHtml(sub.category)}</p>
                        </div>
                    </div>

                    <span class="days-badge ${overdue ? "overdue-badge" : ""}">
                        ${text}
                    </span>
                </div>
            `;
        }).join("");
    }

    function renderSubscriptions() {
        destroyCharts();

        pageContent.innerHTML = `
            <div class="table-card">
                <h3 class="chart-title">
                    <i class="fa-solid fa-list"></i>
                    Manage Subscriptions
                </h3>

                <div class="table-wrapper">
                    <table class="subscription-table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Category</th>
                                <th>Amount</th>
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
                <tr>
                    <td colspan="6">
                        <div class="empty-state">No subscriptions added yet.</div>
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = subscriptions.map(function (sub, index) {
            return `
                <tr>
                    <td>
                        <div class="service-cell">
                            <div class="service-icon">
                                <i class="fa-solid fa-layer-group"></i>
                            </div>
                            ${escapeHtml(sub.name)}
                        </div>
                    </td>

                    <td>${escapeHtml(sub.category)}</td>
                    <td>${money(sub.amount)}</td>

                    <td>
                        <span class="cycle-badge">${escapeHtml(sub.cycle)}</span>
                    </td>

                    <td>${formatDateForDisplay(sub.renewal)}</td>

                    <td>
                        <div class="action-buttons">
                            <button type="button" class="icon-action" onclick="editSubscription(${index})">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button type="button" class="icon-action delete" onclick="deleteSubscription(${index})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function renderAnalytics() {
        destroyCharts();

        const monthlyCount = subscriptions.filter(function (sub) {
            return sub.cycle === "Monthly";
        }).length;

        const yearlyCount = subscriptions.filter(function (sub) {
            return sub.cycle === "Yearly";
        }).length;

        const monthlyOnly = subscriptions
            .filter(function (sub) {
                return sub.cycle === "Monthly";
            })
            .reduce(function (sum, sub) {
                return sum + sub.amount;
            }, 0);

        const yearlyOnly = subscriptions
            .filter(function (sub) {
                return sub.cycle === "Yearly";
            })
            .reduce(function (sum, sub) {
                return sum + sub.amount;
            }, 0);

        const categoryData = getCategoryData();

        pageContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-calendar"></i>
                    </div>
                    <h3>Monthly Active</h3>
                    <div class="value">${monthlyCount}</div>
                    <p>${money(monthlyOnly)} monthly plans</p>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <h3>Yearly Active</h3>
                    <div class="value">${yearlyCount}</div>
                    <p>${money(yearlyOnly)} yearly plans</p>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                    <h3>Monthly Equivalent</h3>
                    <div class="value">${money(getMonthlySpend())}</div>
                    <p>All cycles converted</p>
                </div>
            </div>

            <div class="chart-card">
                <h3 class="chart-title">
                    <i class="fa-solid fa-chart-column"></i>
                    Category Wise Monthly Spending
                </h3>

                <div class="chart-box">
                    <canvas id="analyticsChart"></canvas>
                </div>
            </div>
        `;

        const canvas = document.getElementById("analyticsChart");

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        analyticsChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: categoryData.labels,
                datasets: [
                    {
                        label: "Monthly Spend",
                        data: categoryData.values,
                        backgroundColor: "#a855f7",
                        borderRadius: 12
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function renderInsights() {
        destroyCharts();

        const monthly = getMonthlySpend();
        const yearly = getYearlySpend();

        const expensive = subscriptions.filter(function (sub) {
            return sub.cycle === "Monthly" && sub.amount >= 20;
        }).length;

        const savings = expensive * 10 + (subscriptions.length >= 5 ? 25 : 0);
        const score = Math.max(45, 92 - expensive * 8 - (monthly > 100 ? 10 : 0));

        let tip = "Your subscription spending looks controlled. Keep reviewing renewals every month.";

        if (expensive >= 2) {
            tip = "You have multiple expensive monthly subscriptions. Check which ones you rarely use.";
        } else if (subscriptions.length > 6) {
            tip = "You have many active plans. Try removing duplicate services from the same category.";
        } else if (monthly > 80) {
            tip = "Your monthly cost is getting high. Try yearly plans for services you use regularly.";
        }

        pageContent.innerHTML = `
            <div class="insight-grid">
                <div class="ai-card">
                    <div class="ai-header">
                        <div class="ai-icon">
                            <i class="fa-solid fa-robot"></i>
                        </div>

                        <div>
                            <h2>AI Spending Insights</h2>
                            <p>Smart subscription analysis</p>
                        </div>
                    </div>

                    <p>
                        You currently have <strong>${subscriptions.length}</strong> active subscriptions.
                        Your monthly spend is <strong>${money(monthly)}</strong>, and your estimated yearly cost is
                        <strong>${money(yearly)}</strong>.
                    </p>

                    <div class="tip-box">
                        <i class="fa-solid fa-lightbulb"></i>
                        <strong>Recommendation:</strong>
                        ${escapeHtml(tip)}
                    </div>
                </div>

                <div class="insight-card">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fa-solid fa-coins"></i>
                        </div>
                        <h3>Potential Savings</h3>
                        <div class="value">${money(savings)}</div>
                        <p>Estimated yearly saving</p>
                    </div>

                    <br>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fa-solid fa-shield-heart"></i>
                        </div>
                        <h3>Efficiency Score</h3>
                        <div class="value">${score}%</div>
                        <p>Budget health</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderReminders() {
        destroyCharts();

        pageContent.innerHTML = `
            <div class="renewals-card">
                <h3 class="chart-title">
                    <i class="fa-solid fa-bell"></i>
                    Upcoming Renewals
                </h3>

                <div id="upcomingList"></div>
            </div>

            <div class="renewals-card">
                <h3 class="chart-title">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Overdue Renewals
                </h3>

                <div id="overdueList"></div>
            </div>
        `;

        renderRenewalList("upcomingList", getUpcomingRenewals(), false);
        renderRenewalList("overdueList", getOverdueRenewals(), true);
        updateBadge();
    }

    function setPage(page) {
        document.querySelectorAll(".menu-item").forEach(function (item) {
            item.classList.remove("active");

            if (item.dataset.page === page) {
                item.classList.add("active");
            }
        });

        pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);

        if (page === "dashboard") {
            renderDashboard();
        } else if (page === "subscriptions") {
            renderSubscriptions();
        } else if (page === "analytics") {
            renderAnalytics();
        } else if (page === "insights") {
            renderInsights();
        } else if (page === "reminders") {
            renderReminders();
        }
    }

    function openModal() {
        editIndex = -1;
        subscriptionForm.reset();

        modalTitle.innerHTML = `
            <i class="fa-solid fa-plus-circle"></i>
            Add Subscription
        `;

        subscriptionModal.classList.add("show");
    }

    function closeModal() {
        subscriptionModal.classList.remove("show");
        editIndex = -1;
    }

    function saveSubscription(event) {
        event.preventDefault();

        const name = serviceName.value.trim();
        const amount = Number(serviceAmount.value);
        const category = serviceCategory.value;
        const cycle = serviceCycle.value;
        const renewal = serviceRenewal.value;

        if (name === "") {
            showToast("Please enter service name.");
            return;
        }

        if (amount <= 0 || isNaN(amount)) {
            showToast("Please enter valid amount.");
            return;
        }

        if (renewal === "") {
            showToast("Please select renewal date.");
            return;
        }

        const sub = {
            id: editIndex === -1 ? Date.now() : subscriptions[editIndex].id,
            name: name,
            amount: amount,
            category: category,
            cycle: cycle,
            renewal: renewal
        };

        if (editIndex === -1) {
            subscriptions.push(sub);
            showToast("Subscription added successfully.");
        } else {
            subscriptions[editIndex] = sub;
            showToast("Subscription updated successfully.");
        }

        saveData();
        closeModal();

        const activePage = document.querySelector(".menu-item.active").dataset.page;
        setPage(activePage);
        updateBadge();
    }

    window.editSubscription = function (index) {
        const sub = subscriptions[index];

        serviceName.value = sub.name;
        serviceAmount.value = sub.amount;
        serviceCategory.value = sub.category;
        serviceCycle.value = sub.cycle;
        serviceRenewal.value = normalizeDateForInput(sub.renewal);

        editIndex = index;

        modalTitle.innerHTML = `
            <i class="fa-solid fa-pen"></i>
            Edit Subscription
        `;

        subscriptionModal.classList.add("show");
    };

    window.deleteSubscription = function (index) {
        const ok = confirm("Delete this subscription?");

        if (!ok) {
            return;
        }

        subscriptions.splice(index, 1);
        saveData();

        const activePage = document.querySelector(".menu-item.active").dataset.page;
        setPage(activePage);
        updateBadge();

        showToast("Subscription deleted.");
    };

    function loadDemoData() {
        if (subscriptions.length > 0) {
            return;
        }

        const today = new Date();

        const d1 = new Date(today);
        d1.setDate(today.getDate() + 3);

        const d2 = new Date(today);
        d2.setDate(today.getDate() + 9);

        const d3 = new Date(today);
        d3.setDate(today.getDate() + 5);

        const d4 = new Date(today);
        d4.setDate(today.getDate() - 2);

        subscriptions = [
            {
                id: 1,
                name: "Netflix",
                amount: 15.99,
                category: "Entertainment",
                cycle: "Monthly",
                renewal: d1.toISOString().split("T")[0]
            },
            {
                id: 2,
                name: "Spotify",
                amount: 11.99,
                category: "Music",
                cycle: "Monthly",
                renewal: d2.toISOString().split("T")[0]
            },
            {
                id: 3,
                name: "Adobe CC",
                amount: 299.99,
                category: "Software",
                cycle: "Yearly",
                renewal: d3.toISOString().split("T")[0]
            },
            {
                id: 4,
                name: "ChatGPT Plus",
                amount: 20.00,
                category: "Software",
                cycle: "Monthly",
                renewal: d4.toISOString().split("T")[0]
            }
        ];

        saveData();
    }

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

        if (subscriptionModal) {
            subscriptionModal.addEventListener("click", function (event) {
                if (event.target === subscriptionModal) {
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

    initializeUser();
    loadDemoData();
    setupEvents();
    setPage("dashboard");
    updateBadge();
});