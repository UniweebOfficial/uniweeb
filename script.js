(function() {
    emailjs.init("CyodEGcRSBwMk2WN9");
})();
const EMAIL_CONFIG = {
    serviceId: "service_wm5965u",
    contactTemplateId: "template_k87bzxg", 
    autoReplyTemplateId: "template_2w0jfao", 
    adminEmail: "uniweebofficial@gmail.com"
};
const GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvPyk8YLAcI2zPOnkN-7bft0wjwKjX-aIzMOuBBU-N1oH7OaWdDA6UoJHARICB9-tPNu9RQb4Tce-P/pub?output=csv";

let events = [];
let isAdminLoggedIn = false;
let logoClickCount = 0;
let logoClickTimer = null;
let autoRefreshInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    loadEventsFromSheet();
    initNavbar();
    initTypingEffect();
    initSmoothScroll();
    initContactForm();
    initSocialLinks();
    initScrollReveal();
    initPopupClose();
    checkAdminSession();
    addAnimationStyles();
    initAdminLogoTrigger();
    initBackToTop();
    
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(loadEventsFromSheet, 30000);
    
    setTimeout(() => {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100,
                easing: 'ease-out'
            });
        }
    }, 100);
});

function initAdminLogoTrigger() {
    const logo = document.getElementById('adminLogoTrigger');
    if (!logo) return;
    
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        logoClickCount++;
        logo.classList.add('logo-click-effect');
        setTimeout(() => {
            logo.classList.remove('logo-click-effect');
        }, 300);

        if (logoClickTimer) {
            clearTimeout(logoClickTimer);
        }

        if (logoClickCount >= 3) {
            logoClickCount = 0;
            if (logoClickTimer) clearTimeout(logoClickTimer);
            if (isAdminLoggedIn) {
                openAdminDashboard();
                showToast('🔓 Selamat datang kembali, Admin!', 'success');
            } else {
                openAdminModal();
                showToast('🔐 Silakan masukkan password admin', 'info');
            }
        } else {
            logoClickTimer = setTimeout(() => {
                logoClickCount = 0;
            }, 1000);
        }
    });
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`📋 ${text} berhasil disalin!`, 'success');
    }).catch(() => {
        showToast('❌ Gagal menyalin teks', 'error');
    });
}

async function loadEventsFromSheet() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    try {
        const response = await fetch(GOOGLE_SHEETS_URL);
        const csvText = await response.text();
        
        const rows = csvText.split('\n').filter(row => row.trim());
        if (rows.length < 2) {
            container.innerHTML = '<div class="loading">✨ Belum ada event. Login sebagai admin untuk menambahkan event.</div>';
            return;
        }
        
        events = [];
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',').map(v => v.replace(/"/g, '').trim());
            if (values.length >= 4 && values[0]) {
                events.push({
                    name: values[0] || 'Event',
                    date: values[1] || 'TBA',
                    location: values[2] || 'TBA',
                    price: values[3] || 'Free',
                    image: values[4] || 'https://via.placeholder.com/300x450?text=No+Image'
                });
            }
        }
        
        renderEvents();
        renderEventListAdmin();
        updateEventCount();
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<div class="loading">⚠️ Gagal memuat event. Periksa koneksi internet.</div>';
    }
}

function renderEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = '<div class="loading">✨ Belum ada event. Login sebagai admin untuk menambahkan event.</div>';
        return;
    }
    
    container.innerHTML = events.map((event, index) => `
        <div class="project-card" style="animation-delay: ${index * 0.1}s">
            <div class="project-image">
                <img src="${event.image}" alt="${event.name}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            </div>
            <div class="project-content">
                <h3>${escapeHtml(event.name)}</h3>
                <div class="project-tech">
                    <span><i class="fas fa-calendar-alt"></i> ${escapeHtml(event.date)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</span>
                    <span><i class="fas fa-ticket-alt"></i> ${escapeHtml(event.price)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderEventListAdmin() {
    const listContainer = document.getElementById('eventList');
    if (!listContainer) return;
    
    if (events.length === 0) {
        listContainer.innerHTML = '<p style="color:rgba(255,255,255,0.6)">📭 Belum ada event. Buka Google Sheets untuk menambah event.</p>';
        return;
    }
    
    listContainer.innerHTML = events.map((event, index) => `
        <div class="event-list-item">
            <div style="flex:1">
                <strong>🎪 ${escapeHtml(event.name)}</strong><br>
                <small><i class="fas fa-calendar-alt"></i> ${escapeHtml(event.date)} | <i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</small>
            </div>
        </div>
    `).join('');
}

function updateEventCount() {
    const countElement = document.getElementById('eventCount');
    if (countElement) {
        countElement.textContent = events.length;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
function openAdminModal() {
    document.getElementById('adminModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
    document.getElementById('adminPassword').value = '';
    document.body.style.overflow = '';
}

function openAdminDashboard() {
    document.getElementById('adminDashboard').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAdminDashboard() {
    document.getElementById('adminDashboard').classList.remove('active');
    document.body.style.overflow = '';
}

function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'uniweebIDofficial') {
        isAdminLoggedIn = true;
        localStorage.setItem('uniweeb_admin', 'true');
        closeAdminModal();
        openAdminDashboard();
        showAdminButton();
        showToast('✅ Login berhasil! Selamat datang Admin.', 'success');
    } else {
        showToast('❌ Password salah! Coba lagi.', 'error');
        const input = document.getElementById('adminPassword');
        input.style.animation = 'shake 0.3s ease';
        setTimeout(() => {
            input.style.animation = '';
        }, 300);
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    localStorage.removeItem('uniweeb_admin');
    closeAdminDashboard();
    hideAdminButton();
    showToast('👋 Logout berhasil!', 'info');
}

function showAdminButton() {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.style.display = 'flex';
        adminBtn.style.animation = 'float 0.5s ease-out';
    }
}

function hideAdminButton() {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.style.display = 'none';
    }
}

function checkAdminSession() {
    const savedAdmin = localStorage.getItem('uniweeb_admin');
    if (savedAdmin === 'true') {
        isAdminLoggedIn = true;
        showAdminButton();
    }
}

let pendingUrl = '';

function openSocialConfirm(e, url, platform, title, desc, color, emoji) {
    e.preventDefault();
    pendingUrl = url;
    const icon = document.getElementById('confirmIcon');
    icon.textContent = emoji;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmDesc').textContent = desc;
    document.getElementById('confirmBtn').style.background = color;
    document.getElementById('socialConfirmOverlay').classList.add('active');
}

function closeSocialConfirm() {
    document.getElementById('socialConfirmOverlay').classList.remove('active');
    pendingUrl = '';
}

function proceedSocialLink() {
    if (pendingUrl) {
        window.open(pendingUrl, '_blank');
    }
    closeSocialConfirm();
}

function openVisiMisi(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVisiMisi(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if
