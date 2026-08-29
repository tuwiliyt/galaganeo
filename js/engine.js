// Visuals, Starfield, Particle System, Input Manager, and Math Utilities

// --- VECTOR 2D UTILS ---
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

// --- STARFIELD & NEBULA PARALLAX ---
class Starfield {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.warpSpeed = 1;
        this.targetWarp = 1;
        this.stars = [];
        this.nebulae = [
            { x: width * 0.2, y: height * 0.3, radius: 250, color: 'rgba(90, 20, 160, 0.15)' },
            { x: width * 0.8, y: height * 0.7, radius: 300, color: 'rgba(0, 140, 200, 0.12)' },
            { x: width * 0.5, y: -100, radius: 350, color: 'rgba(230, 40, 120, 0.1)' }
        ];

        // Generate 3 layers of stars
        for (let i = 0; i < 160; i++) {
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

        // Move nebulae
        for (let neb of this.nebulae) {
            neb.y += 0.2 * this.warpSpeed;
            if (neb.y - neb.radius > this.height) {
                neb.y = -neb.radius;
                neb.x = Math.random() * this.width;
            }
        }

        // Move stars
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
        // Deep space gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#050512');
        bgGrad.addColorStop(1, '#090824');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw glowing nebulae
        for (let neb of this.nebulae) {
            const radGrad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
            radGrad.addColorStop(0, neb.color);
            radGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw stars
        for (let star of this.stars) {
            ctx.fillStyle = star.layer === 3 ? `rgba(180, 240, 255, ${star.alpha})` :
                            star.layer === 2 ? `rgba(255, 230, 180, ${star.alpha})` :
                                               `rgba(255, 255, 255, ${star.alpha})`;

            if (this.warpSpeed > 2) {
                // Streak stars in warp
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
        // Small shockwave
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
        // Update particles
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

        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const s = this.shockwaves[i];
            s.radius += (s.maxRadius - s.radius) * 0.12 + 2;
            s.alpha -= s.decay;
            if (s.alpha <= 0 || s.radius >= s.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }

        // Update floating text
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
        // Draw Shockwaves
        for (let s of this.shockwaves) {
            ctx.strokeStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw Particles
        for (let p of this.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Floating Text
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

// --- INPUT MANAGER (MOUSE, TOUCH, KEYBOARD) ---
class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.mousePos = new Vec2(canvas.width / 2, canvas.height * 0.85);
        this.isMouseDown = false;
        this.isRightMouseDown = false;
        this.autoFire = true;
        
        this.keys = {};
        this.justPressedKeys = {};
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

            // Clamp inside canvas
            this.mousePos.x = Math.max(20, Math.min(this.canvas.width - 20, this.mousePos.x));
            this.mousePos.y = Math.max(30, Math.min(this.canvas.height - 20, this.mousePos.y));
        };

        // Mouse Events
        window.addEventListener('mousemove', (e) => {
            updateCoords(e);
        });

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

        // Touch Events
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

        // Keyboard Events
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
