// Visuals, Parallax Starfield, Cosmic Planets, Space Station Wreckage, Particle System, Input Manager, and Math Utilities

class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) { this.x = x; this.y = y; return this; }
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    mult(n) { this.x *= n; this.y *= n; return this; }
    dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
    normalize() {
        const len = Math.hypot(this.x, this.y);
        if (len > 0) { this.x /= len; this.y /= len; }
        return this;
    }
}

// --- ADVANCED PARALLAX STARFIELD WITH PLANETS & DESTROYED SPACE STATIONS ---
class Starfield {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.warpSpeed = 1;
        this.targetWarp = 1;
        this.stars = [];
        
        // 🪐 High-Fidelity Celestial Bodies (Planets & Moons)
        this.planets = [
            {
                x: width * 0.8,
                y: 120,
                radius: 65,
                vy: 0.12,
                type: 'GAS_GIANT', // Ringed Planet
                color1: '#4a154b',
                color2: '#00d2ff',
                ringColor: 'rgba(0, 240, 255, 0.35)',
                ringTilt: 0.4
            },
            {
                x: width * 0.2,
                y: -150,
                radius: 50,
                vy: 0.08,
                type: 'TERRESTRIAL', // Earth-like with atmosphere
                color1: '#004080',
                color2: '#00cc88',
                atmosphere: 'rgba(0, 240, 255, 0.4)'
            },
            {
                x: width * 0.7,
                y: height + 200,
                radius: 40,
                vy: 0.15,
                type: 'CRIMSON_MOON',
                color1: '#660022',
                color2: '#ff4400'
            }
        ];

        // 🛰️ Destroyed Space Station Wreckage & Orbital Debris
        this.wreckage = [
            {
                x: width * 0.3,
                y: -80,
                vy: 0.35,
                rot: 0.2,
                rotSpeed: 0.004,
                type: 'SOLAR_ARRAY_STATION',
                sparkTimer: 0
            },
            {
                x: width * 0.75,
                y: height * 0.5,
                vy: 0.28,
                rot: 1.5,
                rotSpeed: -0.003,
                type: 'BROKEN_COMMAND_DOME',
                sparkTimer: 0
            }
        ];

        // Glowing Nebulae
        this.nebulae = [
            { x: width * 0.2, y: height * 0.3, radius: 260, color: 'rgba(90, 20, 160, 0.16)' },
            { x: width * 0.8, y: height * 0.7, radius: 320, color: 'rgba(0, 140, 200, 0.14)' },
            { x: width * 0.5, y: -100, radius: 360, color: 'rgba(230, 40, 120, 0.12)' }
        ];

        // Multi-tier Starfield (180 stars)
        for (let i = 0; i < 180; i++) {
            this.stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 1.5 + 0.5,
                layer: Math.floor(Math.random() * 3) + 1,
                alpha: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.05 + 0.01
            });
        }
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    setWarp(warp) {
        this.targetWarp = warp ? 8 : 1;
    }

    update() {
        this.warpSpeed += (this.targetWarp - this.warpSpeed) * 0.05;

        // Move Nebulae
        for (let neb of this.nebulae) {
            neb.y += 0.2 * this.warpSpeed;
            if (neb.y - neb.radius > this.height) {
                neb.y = -neb.radius;
                neb.x = Math.random() * this.width;
            }
        }

        // Move Planets
        for (let p of this.planets) {
            p.y += p.vy * this.warpSpeed;
            if (p.y - p.radius * 2 > this.height) {
                p.y = -p.radius * 2 - 100;
                p.x = Math.random() * (this.width - p.radius * 2) + p.radius;
            }
        }

        // Move Wreckage
        for (let w of this.wreckage) {
            w.y += w.vy * this.warpSpeed;
            w.rot += w.rotSpeed;
            w.sparkTimer++;

            if (w.y > this.height + 150) {
                w.y = -150;
                w.x = Math.random() * (this.width - 100) + 50;
            }
        }

        // Move Stars
        for (let star of this.stars) {
            star.y += star.speed * star.layer * 0.8 * this.warpSpeed;
            star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.02;
            if (star.alpha > 1) star.alpha = 1;
            if (star.alpha < 0.2) star.alpha = 0.2;

            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        }
    }

    draw(ctx) {
        // Deep Space Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#040510');
        bgGrad.addColorStop(0.5, '#070920');
        bgGrad.addColorStop(1, '#090826');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // 1. Nebulae
        for (let neb of this.nebulae) {
            const radGrad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
            radGrad.addColorStop(0, neb.color);
            radGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Planets
        for (let p of this.planets) {
            this.drawPlanet(ctx, p);
        }

        // 3. Destroyed Space Stations Wreckage
        for (let w of this.wreckage) {
            this.drawWreckage(ctx, w);
        }

        // 4. Stars
        for (let star of this.stars) {
            ctx.fillStyle = star.layer === 3 ? `rgba(180, 240, 255, ${star.alpha})` :
                            star.layer === 2 ? `rgba(255, 230, 180, ${star.alpha})` :
                                               `rgba(255, 255, 255, ${star.alpha})`;

            if (this.warpSpeed > 2) {
                ctx.strokeStyle = ctx.fillStyle;
                ctx.lineWidth = star.size;
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x, star.y - star.speed * 8 * this.warpSpeed);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawPlanet(ctx, p) {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Planet Sphere with 3D Spherical Light Gradient
        const pGrad = ctx.createRadialGradient(-p.radius * 0.35, -p.radius * 0.35, p.radius * 0.1, 0, 0, p.radius);
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.3, p.color2);
        pGrad.addColorStop(0.8, p.color1);
        pGrad.addColorStop(1, '#02030a');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Atmospheric Corona / Glow
        if (p.atmosphere) {
            ctx.strokeStyle = p.atmosphere;
            ctx.lineWidth = 4;
            ctx.shadowColor = p.atmosphere;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Planetary Rings for Gas Giant
        if (p.type === 'GAS_GIANT') {
            ctx.save();
            ctx.rotate(p.ringTilt);
            ctx.strokeStyle = p.ringColor;
            ctx.lineWidth = 7;
            ctx.shadowColor = p.color2;
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius * 1.8, p.radius * 0.45, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    drawWreckage(ctx, w) {
        ctx.save();
        ctx.translate(w.x, w.y);
        ctx.rotate(w.rot);

        ctx.strokeStyle = '#3a4460';
        ctx.fillStyle = '#181d2a';
        ctx.lineWidth = 1.5;

        if (w.type === 'SOLAR_ARRAY_STATION') {
            // Broken Central Truss
            ctx.strokeRect(-60, -4, 120, 8);
            ctx.fillRect(-60, -4, 120, 8);

            // Left Intact Solar Panel
            ctx.fillStyle = 'rgba(0, 150, 255, 0.4)';
            ctx.strokeStyle = '#00f0ff';
            ctx.strokeRect(-55, -35, 30, 70);
            ctx.fillRect(-55, -35, 30, 70);

            // Solar Grid Lines
            for (let y = -25; y <= 25; y += 10) {
                ctx.beginPath();
                ctx.moveTo(-55, y);
                ctx.lineTo(-25, y);
                ctx.stroke();
            }

            // Right Severed Shattered Solar Panel
            ctx.beginPath();
            ctx.moveTo(25, -35);
            ctx.lineTo(55, -35);
            ctx.lineTo(40, 10);
            ctx.lineTo(25, -10);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 150, 255, 0.25)';
            ctx.fill();
            ctx.stroke();

            // Blinking Red Beacon on Truss
            if (Math.floor(Date.now() / 400) % 2 === 0) {
                ctx.fillStyle = '#ff0033';
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Electrical Sparks
            if (w.sparkTimer % 90 < 10) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(40, 10);
                ctx.lineTo(48 + Math.random() * 8, 14 + Math.random() * 8);
                ctx.lineTo(54, 8);
                ctx.stroke();
            }
        } else {
            // Shattered Command Dome Ring
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 1.4);
            ctx.stroke();

            ctx.fillStyle = '#222838';
            ctx.fillRect(-15, -15, 30, 30);

            // Blinking Cyan Beacon
            if (Math.floor(Date.now() / 600) % 2 === 0) {
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(-10, -10, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}

// --- PARTICLE SYSTEM ---
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.shockwaves = [];
    }

    spawnThruster(x, y, color = '#00f0ff', isDual = false) {
        const count = isDual ? 2 : 1;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() * 6 - 3),
                y: y + Math.random() * 4,
                vx: (Math.random() - 0.5) * 1.5,
                vy: Math.random() * 4 + 3,
                size: Math.random() * 4 + 2,
                color: color,
                alpha: 0.9,
                life: 1.0,
                decay: Math.random() * 0.05 + 0.04
            });
        }
    }

    spawnExplosion(x, y, color = '#ff3366', count = 25, speedMult = 1) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 5 + 2) * speedMult;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 5 + 2,
                color: Math.random() > 0.4 ? color : '#ffea00',
                alpha: 1.0,
                life: 1.0,
                decay: Math.random() * 0.03 + 0.02
            });
        }
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: 40 * speedMult,
            color: color,
            alpha: 0.8,
            decay: 0.05
        });
    }

    spawnRockDust(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1.5,
                color: Math.random() > 0.5 ? '#8c7e72' : '#bfa99b',
                alpha: 0.8,
                life: 1.0,
                decay: 0.04
            });
        }
    }

    spawnShockwave(x, y, maxRadius = 300, color = '#00f0ff') {
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 10,
            maxRadius: maxRadius,
            color: color,
            alpha: 1.0,
            decay: 0.02
        });
    }

    spawnFloatingText(text, x, y, color = '#ffea00', size = 18) {
        this.floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            size: size,
            vy: -1.8,
            alpha: 1.0,
            life: 1.0,
            decay: 0.02
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.alpha = Math.max(0, p.life);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const s = this.shockwaves[i];
            s.radius += (s.maxRadius - s.radius) * 0.12 + 2;
            s.alpha -= s.decay;
            if (s.alpha <= 0 || s.radius >= s.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.life -= t.decay;
            t.alpha = Math.max(0, t.life);
            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        for (let s of this.shockwaves) {
            ctx.strokeStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (let p of this.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let t of this.floatingTexts) {
            ctx.fillStyle = t.color;
            ctx.globalAlpha = t.alpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = t.color;
            ctx.font = `bold ${t.size}px 'Orbitron', 'Segoe UI', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(t.text, t.x, t.y);
        }
        ctx.restore();
    }
}

// --- INPUT MANAGER ---
class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.mousePos = new Vec2(canvas.width / 2, canvas.height * 0.85);
        this.isMouseDown = false;
        this.isRightMouseDown = false;
        this.autoFire = true;
        
        this.keys = {};
        this.bombTriggered = false;

        this.initListeners();
    }

    initListeners() {
        const updateCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
            const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
            
            this.mousePos.x = (clientX - rect.left) * scaleX;
            this.mousePos.y = (clientY - rect.top) * scaleY;

            this.mousePos.x = Math.max(20, Math.min(this.canvas.width - 20, this.mousePos.x));
            this.mousePos.y = Math.max(30, Math.min(this.canvas.height - 20, this.mousePos.y));
        };

        window.addEventListener('mousemove', (e) => updateCoords(e));

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.isMouseDown = true;
            if (e.button === 2) {
                e.preventDefault();
                this.bombTriggered = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.isMouseDown = false;
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isMouseDown = true;
            updateCoords(e);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            updateCoords(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isMouseDown = false;
        });

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'KeyB') {
                this.bombTriggered = true;
            }
            if (e.code === 'KeyF') {
                this.autoFire = !this.autoFire;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    consumeBomb() {
        const triggered = this.bombTriggered;
        this.bombTriggered = false;
        return triggered;
    }
}

// --- SCREEN SHAKE CONTROLLER ---
class ScreenShake {
    constructor() {
        this.trauma = 0;
        this.maxOffset = 18;
        this.maxAngle = 0.05;
    }

    addTrauma(amount) {
        this.trauma = Math.min(1.0, this.trauma + amount);
    }

    update() {
        this.trauma = Math.max(0, this.trauma - 0.03);
    }

    apply(ctx) {
        if (this.trauma <= 0) return;
        const shake = this.trauma * this.trauma;
        const offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
        const offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;
        const angle = (Math.random() * 2 - 1) * this.maxAngle * shake;

        ctx.translate(offsetX, offsetY);
        ctx.rotate(angle);
    }
}
