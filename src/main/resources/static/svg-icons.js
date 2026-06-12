(function () {
    const icons = {
        "chart-line": `<svg viewBox="0 0 24 24"><path d="M4 19h16"/><path d="M4 15l5-5 4 4 7-8"/><path d="M16 6h4v4"/></svg>`,
        "gauge-high": `<svg viewBox="0 0 24 24"><path d="M4 14a8 8 0 0 1 16 0"/><path d="M12 14l4-4"/><path d="M5 20h14"/></svg>`,
        "credit-card": `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></svg>`,
        "chart-pie": `<svg viewBox="0 0 24 24"><path d="M12 3v9h9"/><path d="M21 12a9 9 0 1 1-9-9"/></svg>`,
        "brain": `<svg viewBox="0 0 24 24"><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 5 2.2"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-5 2.2"/><path d="M12 4v16"/></svg>`,
        "bell": `<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>`,
        "right-from-bracket": `<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18h-8"/></svg>`,
        "plus": `<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
        "xmark": `<svg viewBox="0 0 24 24"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>`,
        "plus-circle": `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
        "floppy-disk": `<svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3"/><path d="M8 17h8"/></svg>`,
        "envelope": `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
        "lock": `<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
        "eye": `<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
        "eye-slash": `<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.5 10.5a3 3 0 0 0 3 3"/><path d="M7 7.5C3.8 9.7 2 12 2 12s4 7 10 7c1.7 0 3.2-.5 4.5-1.2"/><path d="M14 5.3C19 6.4 22 12 22 12s-1 1.8-2.8 3.6"/></svg>`,
        "user": `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
        "right-to-bracket": `<svg viewBox="0 0 24 24"><path d="M14 7l5 5-5 5"/><path d="M19 12H8"/><path d="M5 3h8v18H5"/></svg>`,
        "user-plus": `<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6"/><path d="M16 11h6"/></svg>`,
        "flask": `<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 16h10"/></svg>`,
        "circle-dot": `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>`,
        "shield-check": `<svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V7z"/><path d="M8 12l3 3 5-6"/></svg>`,
        "list": `<svg viewBox="0 0 24 24"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>`,
        "pen": `<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14 6l4 4"/></svg>`,
        "trash": `<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`,
        "calendar": `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 10h18"/></svg>`,
        "calendar-check": `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 10h18"/><path d="M8 16l2 2 5-5"/></svg>`,
        "wallet": `<svg viewBox="0 0 24 24"><path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z"/><path d="M4 7l12-3v3"/><path d="M17 14h.01"/></svg>`,
        "trophy": `<svg viewBox="0 0 24 24"><path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M6 6H3a5 5 0 0 0 5 5"/><path d="M18 6h3a5 5 0 0 1-5 5"/><path d="M12 14v5"/><path d="M8 21h8"/></svg>`,
        "chart-column": `<svg viewBox="0 0 24 24"><path d="M4 20h16"/><rect x="6" y="11" width="3" height="7"/><rect x="11" y="7" width="3" height="11"/><rect x="16" y="4" width="3" height="14"/></svg>`,
        "robot": `<svg viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 8V4"/><path d="M8 13h.01"/><path d="M16 13h.01"/><path d="M9 17h6"/></svg>`,
        "lightbulb": `<svg viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4z"/></svg>`,
        "coins": `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>`,
        "dollar-sign": `<svg viewBox="0 0 24 24"><path d="M12 2v20"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg>`,
        "clock": `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
        "film": `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16"/><path d="M16 4v16"/><path d="M4 9h4"/><path d="M16 9h4"/><path d="M4 15h4"/><path d="M16 15h4"/></svg>`,
        "music": `<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>`,
        "code": `<svg viewBox="0 0 24 24"><path d="M8 9l-4 3 4 3"/><path d="M16 9l4 3-4 3"/><path d="M14 4l-4 16"/></svg>`,
        "briefcase": `<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2"/><path d="M3 12h18"/></svg>`,
        "graduation-cap": `<svg viewBox="0 0 24 24"><path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v5c3 2 7 2 10 0v-5"/><path d="M21 8v7"/></svg>`,
        "gamepad": `<svg viewBox="0 0 24 24"><path d="M7 9h10a5 5 0 0 1 5 5v2a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-2a5 5 0 0 1 5-5z"/><path d="M7 13h4"/><path d="M9 11v4"/><path d="M16 13h.01"/><path d="M19 13h.01"/></svg>`,
        "cloud": `<svg viewBox="0 0 24 24"><path d="M17 18H7a5 5 0 1 1 1-9 6 6 0 0 1 11 3 3 3 0 0 1-2 6z"/></svg>`,
        "layer-group": `<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/></svg>`,
        "spark": `<svg viewBox="0 0 24 24"><path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>`
    };

    function renderIcon(name) {
        return `<span data-icon="${name}"></span>`;
    }

    function refresh(root) {
        const scope = root || document;

        scope.querySelectorAll("[data-icon]").forEach(function (el) {
            const key = el.getAttribute("data-icon");
            const svg = icons[key];

            if (!svg) return;

            const classes = el.className || "";

            el.className = ("svg-icon " + classes).trim();
            el.innerHTML = svg;
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        refresh();
    });

    window.SavexIcons = {
        refresh: refresh,
        icon: renderIcon
    };
})();