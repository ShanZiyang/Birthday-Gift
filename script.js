const canvas = document.querySelector("#fireworks");
const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
const cover = document.querySelector("#cover");
const card = document.querySelector("#card");
const openCard = document.querySelector("#openCard");
const replay = document.querySelector("#replay");
const letterBody = document.querySelector("#letterBody");

const letterParagraphs = [
  "辛苦了！！这一年是你工作的第一年，于你而言很重要的一年。",
  "从青涩的高中到大学再到一起备考，真的是很长的一段时间呢，好的朋友就像家人，这句话好像在我们身上完美地印证了，虽然偶尔缺席，但永远不会迟到。",
  "去年独处时偶尔我也会想到出租屋的黄焖鸡，想起当时我们一起畅想未来，时常我也觉得你很厉害，非常，尤其，绝对。",
  "在这群朋友里面我们是最像的，就像世界上两个截然不同的土壤，长出一样的树，一样的叶子，一样的花。",
  "毕业的前半年随着倒计时的是你的一个个消息。工作稳定了，交际变多了，有了新的重要的人和事。",
  "发自内心地，我为你感到开心。",
  "有时我也会莫名其妙地给你打电话，说一些没什么厘头的话，或者无聊地听着你分享生活。",
  "神经，隔着电话你总这样说，但每次讲完又会一起笑。这样的时刻描绘着毕业后的上半年，是那段时间里印象深刻的碎片。",
  "工作很辛苦，偶尔还有很多很多不顺心的事情。离开家的我后知后觉地体会到你的感受。",
  "可能以后还有很多很多不顺意的时刻，难过的时刻，孤独的时刻，但同样有人记录着你的成长，你的坚韧，你的能量。",
  "希望新的一岁的胡某，顺顺遂遂，平平安安，当然最重要的是天天开心。",
  "爱能抵岁月漫长，无论怎样，我们都在你身边。",
  "---",
  "本来答应了做一个上线的小程序给你，但是要备案加上最近实在是太忙没有把代码写完，改成了这一封信，希望以后能有机会补上。",
  "生日快乐！",
];

const colors = ["#ff7aa8", "#ffd166", "#74f2ce", "#86b6ff", "#f8f1ff", "#ff9f6e"];
const rockets = [];
const particles = [];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmallScreen = window.matchMedia("(max-width: 720px)").matches;
const maxParticles = isSmallScreen ? 320 : 560;
const maxRockets = isSmallScreen ? 4 : 7;
const particleRange = isSmallScreen ? [28, 46] : [38, 64];
const glowBlur = isSmallScreen ? 7 : 11;
const launchChance = isSmallScreen ? 0.018 : 0.027;
let width = 0;
let height = 0;
let animationStarted = false;
let rafId = 0;
let resizeTimer = 0;

function resizeCanvas() {
  const maxRatio = isSmallScreen ? 1.2 : 1.5;
  const ratio = Math.min(window.devicePixelRatio || 1, maxRatio);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function launchRocket(x = random(width * 0.18, width * 0.82), targetY = random(height * 0.15, height * 0.52)) {
  if (reduceMotion || rockets.length >= maxRockets) return;

  rockets.push({
    x,
    y: height + 20,
    targetY,
    speed: random(7, 10),
    color: colors[Math.floor(Math.random() * colors.length)],
    trail: [],
  });
}

function explode(x, y, color, power = 1) {
  const count = Math.min(Math.floor(random(particleRange[0], particleRange[1]) * power), maxParticles - particles.length);
  if (count <= 0) return;

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + random(-0.09, 0.09);
    const speed = random(1.4, 5.2) * power;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: random(52, 86),
      age: 0,
      color,
      size: random(1.2, 2.7),
    });
  }
}

function drawRocket(rocket) {
  rocket.trail.push({ x: rocket.x, y: rocket.y });
  rocket.trail = rocket.trail.slice(-10);

  ctx.beginPath();
  rocket.trail.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = rocket.color;
  ctx.globalAlpha = 0.42;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(rocket.x, rocket.y, 2.6, 0, Math.PI * 2);
  ctx.fillStyle = rocket.color;
  ctx.shadowColor = rocket.color;
  ctx.shadowBlur = glowBlur;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function tick() {
  rafId = requestAnimationFrame(tick);

  if (document.hidden) return;

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(10, 12, 25, 0.22)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  for (let i = rockets.length - 1; i >= 0; i -= 1) {
    const rocket = rockets[i];
    rocket.y -= rocket.speed;
    rocket.x += Math.sin(rocket.y * 0.035) * 0.65;
    drawRocket(rocket);

    if (rocket.y <= rocket.targetY) {
      explode(rocket.x, rocket.y, rocket.color, random(0.9, 1.35));
      rockets.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.age += 1;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.035;
    p.vx *= 0.99;

    const alpha = Math.max(0, 1 - p.age / p.life);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = glowBlur;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    if (p.age >= p.life) particles.splice(i, 1);
  }

  if (animationStarted && Math.random() < launchChance) {
    launchRocket();
  }
}

function burstShow() {
  startFireworks();
  const bursts = isSmallScreen ? 5 : 7;
  for (let i = 0; i < bursts; i += 1) {
    setTimeout(() => launchRocket(random(width * 0.12, width * 0.88), random(height * 0.12, height * 0.48)), i * 180);
  }
}

function renderLetter() {
  letterBody.innerHTML = "";
  letterParagraphs.forEach((line, index) => {
    const element = document.createElement(line === "---" ? "div" : "p");
    if (line === "---") {
      element.className = "divider";
    } else {
      element.textContent = line;
      element.style.opacity = "0";
      element.style.transform = "translateY(12px)";
      element.style.transition = "opacity 520ms ease, transform 520ms ease";
      setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, 160 * index);
    }
    letterBody.appendChild(element);
  });
}

function openBirthdayCard() {
  animationStarted = true;
  cover.classList.add("is-hidden");
  card.classList.remove("is-hidden");
  renderLetter();
  burstShow();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startFireworks() {
  if (!rafId && !reduceMotion) {
    rafId = requestAnimationFrame(tick);
  }
}

window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(resizeCanvas, 120);
});
openCard.addEventListener("click", openBirthdayCard);
replay.addEventListener("click", burstShow);

resizeCanvas();
const warmUp = () => {
  startFireworks();
  setTimeout(() => launchRocket(width * 0.72, height * 0.34), 450);
};

if ("requestIdleCallback" in window) {
  window.requestIdleCallback(warmUp, { timeout: 1400 });
} else {
  window.setTimeout(warmUp, 900);
}
