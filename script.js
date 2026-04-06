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
                showNotification('Selamat datang kembali, Admin!', '#4caf50');
            } else {
                openAdminModal();
                showNotification('Silakan masukkan password admin', '#ff9800');
            }
        } else {
            logoClickTimer = setTimeout(() => {
                logoClickCount = 0;
            }, 1000);
        }
    });
}

function showNotification(message, bgColor) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    `;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function loadEventsFromSheet() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    try {
        const response = await fetch(GOOGLE_SHEETS_URL);
        const csvText = await response.text();
        
        const rows = csvText.split('\n').filter(row => row.trim());
        if (rows.length < 2) {
            container.innerHTML = '<div class="loading">Belum ada event. Login sebagai admin untuk menambahkan event.</div>';
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
        container.innerHTML = '<div class="loading">Gagal memuat event. Periksa koneksi internet.</div>';
    }
}

function renderEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = '<div class="loading">Belum ada event. Login sebagai admin untuk menambahkan event.</div>';
        return;
    }
    
    container.innerHTML = events.map((event, index) => `
        <div class="project-card" style="animation-delay: ${index * 0.1}s">
            <div class="project-image">
                <img src="${event.image}" alt="${event.name}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            </div>
            <div class="project-content">
                <h3>${event.name}</h3>
                <div class="project-tech">
                    <span><i class="fas fa-calendar-alt"></i> ${event.date}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                    <span><i class="fas fa-ticket-alt"></i> ${event.price}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderEventListAdmin() {
    const listContainer = document.getElementById('eventList');
    if (!listContainer) return;
    
    if (events.length === 0) {
        listContainer.innerHTML = '<p style="color:rgba(255,255,255,0.6)">Belum ada event. Buka Google Sheets untuk menambah event.</p>';
        return;
    }
    
    listContainer.innerHTML = events.map((event, index) => `
        <div class="event-list-item">
            <div style="flex:1">
                <strong>${event.name}</strong><br>
                <small><i class="fas fa-calendar-alt"></i> ${event.date} | <i class="fas fa-map-marker-alt"></i> ${event.location}</small>
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
        showNotification('Login berhasil! Selamat datang Admin.', '#4caf50');
    } else {
        alert('Password salah!');
        showNotification('Password salah! Coba lagi.', '#f44336');
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
    showNotification('Logout berhasil!', '#ff9800');
}

function showAdminButton() {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.style.display = 'flex';
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
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            btn.disabled = true;

            emailjs.sendForm(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.contactTemplateId, this)
                .then(() => {
                    showNotification('Pesan berhasil dikirim! Kami akan segera membalas.', '#4caf50');
                    form.reset();
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                })
                .catch((error) => {
                    console.error('EmailJS Error:', error);
                    showNotification('Gagal mengirim pesan. Silakan coba lagi.', '#f44336');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        });
    }
}

function initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link, .social-icon');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('data-url');
            const platform = link.getAttribute('data-platform');
            const title = link.getAttribute('data-title');
            const desc = link.getAttribute('data-desc');
            const color = link.getAttribute('data-color');
            const emoji = link.getAttribute('data-emoji');
            
            if (url) {
                openSocialConfirm(e, url, platform, title, desc, color, emoji);
            }
        });
    });
}

function initNavbar() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                const activeLink = document.querySelector(`a[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -80px 0px' });
    
    sections.forEach(section => observer.observe(section));

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            navbar.style.backdropFilter = 'blur(15px)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.85)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });
}

function initTypingEffect() {
    const typingText = document.getElementById('typing-text');
    if (!typingText) return;
    
    const phrase = 'UNIWEEB';
    let i = 0;
    
    function type() {
        if (i < phrase.length) {
            typingText.textContent = phrase.substring(0, i + 1);
            i++;
            setTimeout(type, 100);
        }
    }
    
    type();
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.hero-text, .about-desc, .visi-misi-card, .contact-info, .contact-form');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0) translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        if (el.classList.contains('hero-text') || el.classList.contains('contact-info')) {
            el.style.transform = 'translateX(-30px)';
        } else if (el.classList.contains('contact-form')) {
            el.style.transform = 'translateX(30px)';
        } else {
            el.style.transform = 'translateY(30px)';
        }
        observer.observe(el);
    });
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
}

function initPopupClose() {
    document.getElementById('visiOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeVisiMisi('visiOverlay');
    });
    document.getElementById('misiOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeVisiMisi('misiOverlay');
    });
    document.getElementById('socialConfirmOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeSocialConfirm();
    });
    document.getElementById('adminModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeAdminModal();
    });
    document.getElementById('adminDashboard')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeAdminDashboard();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVisiMisi('visiOverlay');
            closeVisiMisi('misiOverlay');
            closeSocialConfirm();
            closeAdminModal();
            closeAdminDashboard();
        }
    });
}

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
    initAdminLogoTrigger();
    initBackToTop();
    
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

    setInterval(loadEventsFromSheet, 30000);
});
