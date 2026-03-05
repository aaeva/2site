/**
 * SMART HOME DASHBOARD — SCRIPT.JS
 * Modular vanilla JS, clean and well-commented
 */

// ============================================================
// 1. LIVE CLOCK
// ============================================================
function updateClock() {
  const now = new Date();

  const timeEl = document.getElementById('clockTime');
  const dateEl = document.getElementById('clockDate');
  if (!timeEl || !dateEl) return;

  // Format time HH:MM:SS
  const hours   = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  timeEl.textContent = `${hours}:${minutes}:${seconds}`;

  // Format date in Russian
  const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formatted = now.toLocaleDateString('ru-RU', dateOpts);
  // Capitalize first letter
  dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Run immediately and update every second
updateClock();
setInterval(updateClock, 1000);


// ============================================================
// 2. SIDEBAR NAVIGATION
// ============================================================
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    // Update page title
    const section = item.dataset.section;
    const sectionNames = {
      dashboard: 'Дашборд',
      devices: 'Устройства',
      cameras: 'Камеры',
      security: 'Безопасность',
      energy: 'Энергия',
      automation: 'Автоматизация',
      settings: 'Настройки'
    };
    const titleEl = document.querySelector('.page-title');
    if (titleEl && sectionNames[section]) {
      titleEl.textContent = sectionNames[section];
    }
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) closeSidebar();
  });
});

// Mobile sidebar toggle
const menuToggle  = document.getElementById('menuToggle');
const sidebar     = document.getElementById('sidebar');
const overlay     = document.getElementById('overlay');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

menuToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

overlay.addEventListener('click', closeSidebar);


// ============================================================
// 3. NOTIFICATION PANEL
// ============================================================
const notifBtn   = document.getElementById('notifBtn');
const notifPanel = document.getElementById('notifPanel');
const clearBtn   = document.getElementById('clearNotif');
const notifBadge = document.getElementById('notifBadge');

let notifCount = 3;

function updateBadge() {
  if (notifCount > 0) {
    notifBadge.textContent = notifCount;
    notifBadge.style.display = 'grid';
  } else {
    notifBadge.style.display = 'none';
  }
}

notifBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = notifPanel.classList.toggle('open');
  if (isOpen) {
    // Mark unread as read
    notifCount = 0;
    updateBadge();
    document.querySelectorAll('.notif-item.unread').forEach(n => n.classList.remove('unread'));
  }
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
  if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
    notifPanel.classList.remove('open');
  }
});

clearBtn.addEventListener('click', () => {
  const list = document.getElementById('notifList');
  // Animate out each item
  const items = list.querySelectorAll('.notif-item');
  items.forEach((item, i) => {
    setTimeout(() => {
      item.style.transition = 'all 0.25s ease';
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';
      setTimeout(() => item.remove(), 250);
    }, i * 60);
  });
  notifCount = 0;
  updateBadge();
});

// Dynamically add a new notification
function addNotification(icon, color, title, time = 'только что') {
  const list = document.getElementById('notifList');
  const item = document.createElement('div');
  item.className = 'notif-item unread';
  item.innerHTML = `
    <div class="notif-icon ${color}"><i class="fa-solid ${icon}"></i></div>
    <div class="notif-body">
      <div class="notif-title">${title}</div>
      <div class="notif-time">${time}</div>
    </div>`;
  list.prepend(item);
  notifCount++;
  updateBadge();
}


// ============================================================
// 4. LIGHTING CONTROL
// ============================================================
const lightToggle      = document.getElementById('lightToggle');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessVal    = document.getElementById('brightnessVal');
const lightPreview     = document.getElementById('lightPreview');
const lightLed         = document.getElementById('lightLed');

function updateLighting() {
  const isOn = lightToggle.checked;
  const brightness = brightnessSlider.value;

  // Update brightness label
  brightnessVal.textContent = brightness + '%';

  // Update light preview bar
  lightPreview.style.opacity = isOn ? (brightness / 100) : '0';
  const alpha = isOn ? (brightness / 100) * 0.6 : 0;
  lightPreview.style.boxShadow = `0 0 ${brightness / 4}px rgba(245,158,11,${alpha})`;

  // Update slider fill
  const pct = brightness + '%';
  brightnessSlider.style.background = isOn
    ? `linear-gradient(to right, var(--warning) 0%, var(--warning) ${pct}, rgba(255,255,255,0.1) ${pct})`
    : 'rgba(255,255,255,0.1)';

  // LED indicator
  if (isOn) {
    lightLed.classList.add('on');
  } else {
    lightLed.classList.remove('on');
  }
}

// Room chip interaction
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.closest('.room-chips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

lightToggle.addEventListener('change', updateLighting);
brightnessSlider.addEventListener('input', updateLighting);
updateLighting(); // initialize


// ============================================================
// 5. THERMOSTAT CONTROL
// ============================================================
let thermoTarget  = 22;
let thermoCurrent = 20;

const thermoUpBtn    = document.getElementById('thermoUp');
const thermoDownBtn  = document.getElementById('thermoDown');
const thermoDisplay  = document.getElementById('thermoDisplay');
const thermoArc      = document.getElementById('thermoArc');
const thermoCurrentEl = document.getElementById('thermoCurrent');

function updateThermostat() {
  thermoDisplay.textContent = thermoTarget + '°';
  thermoCurrentEl.textContent = thermoCurrent + '°C';

  // Arc goes from 10°C (min) to 30°C (max) = 270 degrees arc = 326px dasharray
  const minTemp = 10, maxTemp = 30;
  const pct = (thermoTarget - minTemp) / (maxTemp - minTemp);
  const dashLength = 326;
  const offset = dashLength - pct * dashLength * 0.75; // 75% of arc
  thermoArc.style.strokeDashoffset = offset;

  // Color based on temperature
  if (thermoTarget <= 18) {
    thermoArc.style.stroke = '#06b6d4';
    thermoArc.style.filter = 'drop-shadow(0 0 6px rgba(6,182,212,0.5))';
  } else if (thermoTarget <= 23) {
    thermoArc.style.stroke = '#22c55e';
    thermoArc.style.filter = 'drop-shadow(0 0 6px rgba(34,197,94,0.5))';
  } else {
    thermoArc.style.stroke = '#f59e0b';
    thermoArc.style.filter = 'drop-shadow(0 0 6px rgba(245,158,11,0.5))';
  }

  document.querySelector('.thermo-temp').style.color =
    thermoTarget <= 18 ? 'var(--cyan)' : thermoTarget <= 23 ? 'var(--secondary)' : 'var(--warning)';
}

thermoUpBtn.addEventListener('click', () => {
  if (thermoTarget < 30) {
    thermoTarget++;
    updateThermostat();
    addNotification('temperature-half', 'blue', `Температура установлена: ${thermoTarget}°C`);
  }
});

thermoDownBtn.addEventListener('click', () => {
  if (thermoTarget > 10) {
    thermoTarget--;
    updateThermostat();
    addNotification('temperature-half', 'blue', `Температура установлена: ${thermoTarget}°C`);
  }
});

// Thermostat mode chips
document.querySelectorAll('.mode-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

updateThermostat(); // initialize

// Simulate temperature changing gradually
setInterval(() => {
  if (Math.random() < 0.3) {
    const diff = thermoTarget - thermoCurrent;
    if (diff > 0 && thermoCurrent < thermoTarget) thermoCurrent += 0.1;
    if (diff < 0 && thermoCurrent > thermoTarget) thermoCurrent -= 0.1;
    thermoCurrent = Math.round(thermoCurrent * 10) / 10;
    thermoCurrentEl.textContent = thermoCurrent + '°C';
  }
}, 3000);


// ============================================================
// 6. DOOR LOCKS
// ============================================================
const lockStates = { lock1: true, lock2: false, lock3: true }; // true = locked

window.toggleLock = function(lockId) {
  lockStates[lockId] = !lockStates[lockId];
  const isLocked = lockStates[lockId];
  const btn = document.getElementById(lockId + 'Btn');
  const status = document.getElementById(lockId + 'Status');

  btn.className = 'lock-toggle-btn ' + (isLocked ? 'locked' : 'unlocked');
  btn.innerHTML = `<i class="fa-solid fa-${isLocked ? 'lock' : 'lock-open'}"></i>`;
  status.textContent = isLocked ? 'Закрыта' : 'Открыт';
  status.className = 'lock-status ' + (isLocked ? 'locked' : 'unlocked');

  // Notification
  const lockNames = { lock1: 'Входная дверь', lock2: 'Гараж', lock3: 'Задняя дверь' };
  const action = isLocked ? 'закрыт(а)' : 'открыт(а)';
  addNotification(isLocked ? 'lock' : 'lock-open', isLocked ? 'green' : 'orange',
    `${lockNames[lockId]} ${action}`);
};


// ============================================================
// 7. AIR CONDITIONING
// ============================================================
let acTemp = 18;
const acTempEl = document.getElementById('acTemp');
const acToggle = document.getElementById('acToggle');
const fanSlider = document.getElementById('fanSlider');
const fanVal    = document.getElementById('fanVal');

window.adjustAcTemp = function(delta) {
  if (!acToggle.checked) {
    acToggle.checked = true;
  }
  acTemp = Math.max(16, Math.min(30, acTemp + delta));
  acTempEl.textContent = acTemp + '°C';
};

fanSlider.addEventListener('input', () => {
  fanVal.textContent = fanSlider.value + '%';
  // Update slider fill
  const pct = fanSlider.value + '%';
  fanSlider.style.background =
    `linear-gradient(to right, var(--cyan) 0%, var(--cyan) ${pct}, rgba(255,255,255,0.1) ${pct})`;
});

// AC mode chips
document.querySelectorAll('.ac-mode').forEach(mode => {
  mode.addEventListener('click', () => {
    document.querySelectorAll('.ac-mode').forEach(m => m.classList.remove('active'));
    mode.classList.add('active');
  });
});

// Initialize fan slider background
fanSlider.dispatchEvent(new Event('input'));


// ============================================================
// 8. SMART PLUGS — update total wattage
// ============================================================
window.updatePlugs = function() {
  const plugItems = document.querySelectorAll('.plug-item');
  let totalWatts = 0;
  const wattValues = [85, 320, 600, 7400, 45]; // watts per device
  plugItems.forEach((item, i) => {
    const toggle = item.querySelector('input[type="checkbox"]');
    if (toggle && toggle.checked) totalWatts += wattValues[i] || 0;
  });
  // Update current power display
  const kw = (totalWatts / 1000).toFixed(1);
  const powerEl = document.getElementById('currentPower');
  if (powerEl) powerEl.textContent = kw + ' кВт';
};


// ============================================================
// 9. MOTION SENSORS — random simulation
// ============================================================
const motionZones = ['mz1','mz2','mz3','mz4','mz5','mz6'];

function simulateMotion() {
  motionZones.forEach(id => {
    const zone = document.getElementById(id);
    if (!zone) return;
    const willActivate = Math.random() < 0.25;
    if (willActivate) {
      zone.classList.add('active');
      const nameEl = zone.querySelector('span:first-of-type');
      const statusEl = zone.querySelector('.zone-status');
      if (statusEl) statusEl.textContent = 'Активно';
      // Deactivate after 3-6 seconds
      setTimeout(() => {
        zone.classList.remove('active');
        if (statusEl) statusEl.textContent = 'Тихо';
      }, 3000 + Math.random() * 3000);
    }
  });
}

setInterval(simulateMotion, 5000);


// ============================================================
// 10. ENERGY CHART — animated canvas
// ============================================================
(function initEnergyChart() {
  const canvas = document.getElementById('energyChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Device-pixel-ratio aware canvas
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width * dpr;
    canvas.height = 108 * dpr;
    canvas.style.width  = rect.width + 'px';
    canvas.style.height = '108px';
    ctx.scale(dpr, dpr);
  }

  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); drawChart(); });

  const hoursData = [1.2, 0.8, 0.5, 0.4, 0.6, 0.9, 1.8, 2.4, 2.1, 1.9, 2.3, 2.0,
                     2.5, 2.2, 1.8, 1.9, 2.8, 3.2, 2.9, 2.6, 2.1, 1.7, 1.4, 1.1];
  const weekData  = [18.4, 22.1, 19.8, 21.3, 20.5, 17.9, 23.2];
  const weekLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  let currentData   = hoursData;
  let currentLabels = Array.from({length: 24}, (_, i) => i % 6 === 0 ? i + ':00' : '');
  let animProgress  = 0;
  let animFrame;

  function drawChart(progress = 1) {
    const w = parseInt(canvas.style.width);
    const h = parseInt(canvas.style.height);
    const pad = { top: 10, right: 10, bottom: 24, left: 32 };

    ctx.clearRect(0, 0, w, h);

    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;
    const maxVal = Math.max(...currentData) * 1.2;
    const n = currentData.length;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH * (1 - i / 4);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
      // Y-axis labels
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.font = '10px Space Grotesk, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((maxVal * i / 4).toFixed(1), pad.left - 4, y + 3);
    }

    // Area gradient
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    gradient.addColorStop(0, 'rgba(59,130,246,0.4)');
    gradient.addColorStop(1, 'rgba(59,130,246,0.01)');

    // Build path
    const points = currentData.map((val, i) => ({
      x: pad.left + (i / (n - 1)) * chartW,
      y: pad.top + chartH * (1 - (val / maxVal) * progress)
    }));

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length-1].x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      // Smooth curves
      const cp1x = (points[i-1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cp1x, points[i-1].y, cp1x, points[i].y, points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots at data points (only every few)
    ctx.fillStyle = '#3b82f6';
    points.forEach((p, i) => {
      if (n <= 8 || i % Math.floor(n / 8) === 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // X-axis labels
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = '10px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    currentLabels.forEach((label, i) => {
      if (!label) return;
      const x = pad.left + (i / (n - 1)) * chartW;
      ctx.fillText(label, x, pad.top + chartH + 16);
    });
  }

  function animateChart() {
    animProgress = 0;
    cancelAnimationFrame(animFrame);
    (function frame() {
      animProgress = Math.min(1, animProgress + 0.04);
      drawChart(animProgress);
      if (animProgress < 1) animFrame = requestAnimationFrame(frame);
    })();
  }

  animateChart();

  // Period tabs switch
  document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.period === 'week') {
        currentData = weekData;
        currentLabels = weekLabels;
      } else {
        currentData = hoursData;
        currentLabels = Array.from({length: 24}, (_, i) => i % 6 === 0 ? i + ':00' : '');
      }
      animateChart();
    });
  });

  // Re-animate every 10 seconds with slightly varied data
  setInterval(() => {
    if (document.querySelector('.period-tab[data-period="day"]').classList.contains('active')) {
      const now = new Date().getHours();
      hoursData[now] = +(1 + Math.random() * 2.5).toFixed(2);
      currentData = hoursData;
      animateChart();
      // Update stats
      const total = hoursData.slice(0, now+1).reduce((a,b) => a+b, 0);
      const dailyEl = document.getElementById('dailyKwh');
      if (dailyEl) dailyEl.textContent = total.toFixed(1);
      const costEl = document.getElementById('energyCost');
      if (costEl) costEl.textContent = Math.round(total * 5.12) + ' ₽';
    }
  }, 10000);
})();


// ============================================================
// 11. OUTDOOR TEMPERATURE SIMULATION
// ============================================================
(function simulateOutdoor() {
  let temp = 8;
  setInterval(() => {
    if (Math.random() < 0.2) {
      temp += (Math.random() - 0.5) * 2;
      temp = Math.round(temp * 10) / 10;
      const el = document.getElementById('outdoorTemp');
      if (el) el.textContent = (temp >= 0 ? '+' : '') + temp + '°C';
    }
  }, 7000);
})();


// ============================================================
// 12. RANDOM DEVICE STATUS SIMULATION
// ============================================================
(function simulateDeviceActivity() {
  let deviceCount = 12;

  setInterval(() => {
    if (Math.random() < 0.15) {
      const delta = Math.random() < 0.5 ? 1 : -1;
      deviceCount = Math.max(8, Math.min(16, deviceCount + delta));
      const el = document.getElementById('activeDevices');
      if (el) el.textContent = deviceCount;
    }
  }, 8000);

  // Random notifications occasionally
  const randomNotifs = [
    { icon: 'wifi', color: 'green', text: 'Новое устройство подключено' },
    { icon: 'battery-low', color: 'yellow', text: 'Низкий заряд: датчик кухни' },
    { icon: 'person-running', color: 'yellow', text: 'Движение у входной двери' },
    { icon: 'temperature-high', color: 'orange', text: 'Высокая температура в кухне' },
  ];

  setInterval(() => {
    if (Math.random() < 0.3) {
      const n = randomNotifs[Math.floor(Math.random() * randomNotifs.length)];
      addNotification(n.icon, n.color, n.text);
    }
  }, 30000);
})();


// ============================================================
// 13. BUTTON PRESS ANIMATIONS
// ============================================================
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('mousedown', () => {
    btn.style.transform = 'scale(0.95)';
  });
  btn.addEventListener('mouseup', () => {
    btn.style.transform = '';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});


// ============================================================
// 14. CARD STAGGER ANIMATIONS ON LOAD
// ============================================================
(function staggerCards() {
  const cards = document.querySelectorAll('.card, .stat-card');
  cards.forEach((card, i) => {
    card.style.animationDelay = (i * 0.06) + 's';
  });
})();


// ============================================================
// 15. KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    notifPanel.classList.remove('open');
    closeSidebar();
  }
  // N to toggle notifications
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    notifPanel.classList.toggle('open');
  }
});

console.log('%c🏠 SmartHome Dashboard loaded', 'color:#3b82f6; font-size:14px; font-weight:bold;');
