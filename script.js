const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");
let CENTER, RADIUS;
let currentTheme = 'dark';
let neonPulse = 0;
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.92;
  
  canvas.width  = size * dpr;
  canvas.height = size * dpr;
  
  canvas.style.width  = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  CENTER = size / 2;
  RADIUS = size / 2 - 20;
  draw();
}
window.addEventListener("resize", resize);
resize();
const degToRad = (deg) => (deg * Math.PI) / 180;
function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.controls button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  draw();
}
document.querySelectorAll('.controls button').forEach(btn => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});

function updateNeonPulse() {
  if (currentTheme === 'neon') {
    neonPulse = (neonPulse + 0.018) % (Math.PI * 2);
    draw();
  }
}
setInterval(updateNeonPulse, 40);

function drawHand(angle, text, maxLength, step, baseColor) {
  ctx.save();
  ctx.translate(CENTER, CENTER);
  ctx.rotate(angle);
  const fontSize = Math.max(13, RADIUS * 0.048);
  ctx.font = `500 ${fontSize}px "Exo 2", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const computed = getComputedStyle(document.documentElement);
  const accentColor = computed.getPropertyValue('--text').trim() || "#fff";
  if (currentTheme === 'neon') {
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 18 + Math.sin(neonPulse) * 10;
  } else {
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 12;
  }
  let y = 12;
  while (y < maxLength) {
    const progress = y / maxLength;
    ctx.globalAlpha = Math.max(0.38, 0.96 - progress * 0.62);
    ctx.fillStyle = currentTheme === 'neon' ? accentColor : baseColor;
    ctx.fillText(text, 0, -y);
    y += step;
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawClockFace() {
  const computed = getComputedStyle(document.documentElement);
  ctx.strokeStyle = computed.getPropertyValue('--face').trim() || "#888";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = computed.getPropertyValue('--text').trim() || "#fff";
  for (let i = 0; i < 12; i++) {
    const a = degToRad(i * 30);
    const len = RADIUS * 0.97;
    const x = CENTER + Math.cos(a) * len;
    const y = CENTER + Math.sin(a) * len;
    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const now = new Date();
  const h = String(now.getHours() % 12 || 12).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const secAngle  = degToRad(sec * 6);
  const minAngle  = degToRad(now.getMinutes() * 6 + sec * 0.1);
  const hourAngle = degToRad((now.getHours() % 12) * 30 + now.getMinutes() * 0.5);
  drawClockFace();
  drawHand(hourAngle, h, RADIUS * 0.52, 21, "#ffdd57");
  drawHand(minAngle,  m, RADIUS * 0.78, 17, "#57ffdd");
  drawHand(secAngle,  s, RADIUS * 0.93, 13, "#ff57dd");
  const computed = getComputedStyle(document.documentElement);
  ctx.fillStyle = computed.getPropertyValue('--center').trim() || "#ffcc00";
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 5, 0, Math.PI * 2);
  ctx.fill();
}

function tick() {
  draw();
  const delay = 1000 - (Date.now() % 1000);
  setTimeout(tick, delay > 0 ? delay : 1000);
}

tick();
setTheme('dark');
