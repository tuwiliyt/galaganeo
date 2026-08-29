// High-Fidelity Realistic Sci-Fi Spacecraft Renderers & Entity Systems

// --- BULLETS ---
class Bullet {
    constructor(x, y, vx, vy, isEnemy = false, type = 'normal', damage = 20) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.isEnemy = isEnemy;
        this.type = type;
        this.damage = damage;
        this.radius = type === 'laser' ? 4 : (type === 'missile' ? 6 : (type === 'orb' ? 7 : (type === 'mine' ? 10 : 3.5)));
        this.isDead = false;
        this.trail = [];
        this.timer = 0;
    }

    update() {
        this.timer++;
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'missile' || this.type === 'laser' || this.type === 'sniper') {
            this.trail.push({ x: this.x, y: this.y, alpha: 0.8 });
            if (this.trail.length > 5) this.trail.shift();
            for (let t of this.trail) t.alpha -= 0.15;
        }

        if (this.type === 'mine' && this.timer > 180) {
            this.isDead = true;
            if (window.game) {
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
                    window.game.enemyBullets.push(new Bullet(this.x, this.y, Math.cos(a) * 4, Math.sin(a) * 4, true, 'shrapnel', 15));
                }
                window.game.particles.spawnExplosion(this.x, this.y, '#bf00ff', 12, 0.6);
            }
        }

        if (this.y < -60 || this.y > 900 || this.x < -60 || this.x > 860) {
            this.isDead = true;
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.isEnemy) {
            if (this.type === 'orb' || this.type === 'plasma') {
                const grad = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.radius);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.4, '#ff0055');
                grad.addColorStop(1, 'rgba(255,0,85,0)');
                ctx.fillStyle = grad;
                ctx.shadowColor = '#ff0055';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'sniper') {
                ctx.strokeStyle = '#ffe600';
                ctx.shadowColor = '#ffe600';
                ctx.shadowBlur = 12;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
                ctx.lineTo(this.x + this.vx * 1.5, this.y + this.vy * 1.5);
                ctx.stroke();
            } else if (this.type === 'mine') {
                const grad = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.radius);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, '#bf00ff');
                grad.addColorStop(1, '#3a0050');
                ctx.fillStyle = grad;
                ctx.shadowColor = '#bf00ff';
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#e0a0ff';
                ctx.lineWidth = 2;
                for (let i = 0; i < 4; i++) {
                    const ang = (Date.now() * 0.005) + i * (Math.PI / 2);
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x + Math.cos(ang) * 14, this.y + Math.sin(ang) * 14);
                    ctx.stroke();
                }
            } else if (this.type === 'shrapnel') {
                ctx.fillStyle = '#ff00aa';
                ctx.shadowColor = '#ff00aa';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#ff5500';
                ctx.shadowColor = '#ff5500';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            if (this.type === 'laser') {
                ctx.strokeStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 12;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + 12);
                ctx.lineTo(this.x, this.y - 12);
                ctx.stroke();
            } else if (this.type === 'spread') {
                ctx.fillStyle = '#ff00ff';
                ctx.shadowColor = '#ff00ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, 3, 9, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, 1.5, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
}

// --- POWER-UPS ---
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vy = 1.6;
        this.angle = 0;
        this.isDead = false;
        this.radius = 16;
        
        const colors = {
            DUAL: '#00f0ff',
            SPREAD: '#ff00ff',
            LASER: '#39ff14',
            SHIELD: '#00bfff',
            BOMB: '#ff3366',
            DRONE: '#ffea00',
            HEAL: '#33ff88',
            '1UP': '#ff00cc'
        };
        this.color = colors[type] || '#ffffff';
    }

    update() {
        this.y += this.vy;
        this.angle += 0.04;
        this.x += Math.sin(this.angle) * 0.8;
        if (this.y > 850) this.isDead = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = 'rgba(10, 20, 40, 0.85)';
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const symbols = {
            DUAL: '2X',
            SPREAD: 'SP',
            LASER: 'LZ',
            SHIELD: 'SH',
            BOMB: '💣',
            DRONE: 'DR',
            HEAL: 'HP',
            '1UP': '+1UP'
        };
        ctx.fillText(symbols[this.type] || 'UP', 0, 1);
        ctx.restore();
    }
}

// --- PLAYER SHIP: AERO-VIPER STEALTH FIGHTER ---
class Player {
    constructor(game) {
        this.game = game;
        this.x = game.width / 2;
        this.y = game.height * 0.85;
        this.targetX = this.x;
        this.targetY = this.y;
        
        this.width = 38;
        this.height = 46;
        this.radius = 18;

        this.lives = 3;
        this.maxLives = 5;

        this.hp = 100;
        this.maxHp = 100;
        this.shield = 100;
        this.maxShield = 100;
        this.shieldRegenTimer = 0;

        this.bombs = 3;
        this.maxBombs = 5;

        this.weaponType = 'normal';
        this.fireCooldown = 0;
        
        this.isDualFighter = false;
        this.hasDrone = false;
        this.droneAngle = 0;

        this.invulnerableTimer = 120;
        this.isCaptured = false;
        this.isDead = false;
        this.rollAngle = 0;
    }

    reset(keepLivesAndBombs = false) {
        this.x = this.game.width / 2;
        this.y = this.game.height * 0.85;
        this.hp = this.maxHp;
        this.shield = this.maxShield;
        if (!keepLivesAndBombs) {
            this.lives = 3;
            this.bombs = 3;
        }
        this.invulnerableTimer = 180;
        this.isCaptured = false;
        this.isDead = false;
    }

    takeDamage(amount) {
        if (this.invulnerableTimer > 0 || this.isCaptured || this.isDead) return;

        if (this.shield > 0) {
            this.shield -= amount;
            if (this.shield < 0) {
                this.hp += this.shield;
                this.shield = 0;
            }
        } else {
            this.hp -= amount;
        }

        this.shieldRegenTimer = 180;
        this.game.shake.addTrauma(0.35);
        window.audio.playHit();

        if (this.hp <= 0) {
            this.hp = 0;
            this.handleDeathOrRespawn();
        }
    }

    handleDeathOrRespawn() {
        if (this.isDualFighter) {
            this.isDualFighter = false;
            this.hp = 50;
            this.shield = 50;
            this.invulnerableTimer = 150;
            this.game.particles.spawnExplosion(this.x + 20, this.y, '#ff3366', 30, 1.2);
            window.audio.playExplosion('large');
            this.game.particles.spawnFloatingText("DUAL SHIP LOST!", this.x, this.y - 40, '#ff3366', 20);
            return;
        }

        this.game.particles.spawnExplosion(this.x, this.y, '#00f0ff', 40, 1.5);
        this.game.particles.spawnExplosion(this.x, this.y, '#ff3366', 30, 1.2);
        this.game.shake.addTrauma(0.8);
        window.audio.playExplosion('boss');

        this.lives--;

        if (this.lives > 0) {
            this.hp = this.maxHp;
            this.shield = this.maxShield;
            this.invulnerableTimer = 180;
            this.x = this.game.width / 2;
            this.y = this.game.height * 0.85;

            this.game.enemyBullets.forEach(b => {
                if (Math.hypot(b.x - this.x, b.y - this.y) < 250) b.isDead = true;
            });

            this.game.particles.spawnShockwave(this.x, this.y, 250, '#00f0ff');
            this.game.particles.spawnFloatingText(`LIVES LEFT: ${this.lives}`, this.x, this.y - 50, '#ffea00', 24);
        } else {
            this.isDead = true;
            this.game.onPlayerDeath();
        }
    }

    triggerBomb() {
        if (this.bombs <= 0 || this.isDead || this.isCaptured) return false;
        this.bombs--;
        window.audio.playBomb();
        this.game.shake.addTrauma(0.9);
        this.game.particles.spawnShockwave(this.x, this.y, 600, '#00ffff');

        this.game.enemyBullets.forEach(b => {
            this.game.particles.spawnExplosion(b.x, b.y, '#ff00ff', 5, 0.5);
            b.isDead = true;
        });

        this.game.enemies.forEach(e => {
            e.takeDamage(150);
            this.game.particles.spawnExplosion(e.x, e.y, '#ffea00', 8, 0.8);
        });

        if (this.game.currentBoss && !this.game.currentBoss.isDead) {
            this.game.currentBoss.takeDamage(200);
        }

        this.game.particles.spawnFloatingText("EMP BLAST!", this.x, this.y - 40, '#00ffff', 24);
        return true;
    }

    applyPowerUp(type) {
        window.audio.playPowerup();
        switch (type) {
            case '1UP':
                if (this.lives < this.maxLives) this.lives++;
                this.game.particles.spawnFloatingText("+1 EXTRA LIFE!", this.x, this.y - 35, '#ff00cc', 22);
                break;
            case 'DUAL':
                this.isDualFighter = true;
                this.game.particles.spawnFloatingText("DUAL FIGHTER!", this.x, this.y - 30, '#00f0ff', 22);
                break;
            case 'SPREAD':
                this.weaponType = 'spread';
                this.game.particles.spawnFloatingText("SPREAD CANNON!", this.x, this.y - 30, '#ff00ff', 20);
                break;
            case 'LASER':
                this.weaponType = 'laser';
                this.game.particles.spawnFloatingText("BEAM LASER!", this.x, this.y - 30, '#39ff14', 20);
                break;
            case 'SHIELD':
                this.shield = this.maxShield;
                this.invulnerableTimer = 90;
                this.game.particles.spawnFloatingText("SHIELD MAX!", this.x, this.y - 30, '#00bfff', 20);
                break;
            case 'BOMB':
                if (this.bombs < this.maxBombs) this.bombs++;
                this.game.particles.spawnFloatingText("+1 EMP BOMB!", this.x, this.y - 30, '#ff3366', 20);
                break;
            case 'DRONE':
                this.hasDrone = true;
                this.game.particles.spawnFloatingText("+SUPPORT DRONE!", this.x, this.y - 30, '#ffea00', 20);
                break;
            case 'HEAL':
                this.hp = Math.min(this.maxHp, this.hp + 40);
                this.game.particles.spawnFloatingText("+HP REPAIR!", this.x, this.y - 30, '#33ff88', 20);
                break;
        }
    }

    update(input) {
        if (this.isDead) return;

        if (this.invulnerableTimer > 0) this.invulnerableTimer--;

        if (this.shieldRegenTimer > 0) {
            this.shieldRegenTimer--;
        } else if (this.shield < this.maxShield) {
            this.shield += 0.2;
        }

        if (this.isCaptured) {
            this.y -= 1.2;
            this.rollAngle += 0.1;
            if (this.y < -50) {
                this.handleDeathOrRespawn();
            }
            return;
        }

        this.targetX = input.mousePos.x;
        this.targetY = input.mousePos.y;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        this.x += dx * 0.22;
        this.y += dy * 0.22;

        this.rollAngle = dx * 0.02;

        this.x = Math.max(25, Math.min(this.game.width - 25, this.x));
        this.y = Math.max(50, Math.min(this.game.height - 35, this.y));

        if (this.isDualFighter) {
            this.game.particles.spawnThruster(this.x - 18, this.y + 20, '#00f0ff', true);
            this.game.particles.spawnThruster(this.x + 18, this.y + 20, '#00f0ff', true);
        } else {
            this.game.particles.spawnThruster(this.x, this.y + 20, '#00f0ff', false);
        }

        if (this.fireCooldown > 0) this.fireCooldown--;

        const shouldFire = input.isMouseDown || input.autoFire;
        if (shouldFire && this.fireCooldown <= 0) {
            this.shoot();
        }

        if (input.consumeBomb()) {
            this.triggerBomb();
        }

        if (this.hasDrone) {
            this.droneAngle += 0.05;
        }
    }

    shoot() {
        this.fireCooldown = this.weaponType === 'laser' ? 6 : (this.weaponType === 'spread' ? 12 : 9);
        window.audio.playLaser(this.weaponType);

        const offsets = this.isDualFighter ? [-20, 20] : [0];

        offsets.forEach(offX => {
            const posX = this.x + offX;
            if (this.weaponType === 'spread') {
                for (let a = -0.3; a <= 0.3; a += 0.15) {
                    const speed = 14;
                    this.game.playerBullets.push(new Bullet(posX, this.y - 15, Math.sin(a) * speed, -Math.cos(a) * speed, false, 'spread', 24));
                }
            } else if (this.weaponType === 'laser') {
                this.game.playerBullets.push(new Bullet(posX, this.y - 20, 0, -18, false, 'laser', 32));
            } else {
                this.game.playerBullets.push(new Bullet(posX - 8, this.y - 15, 0, -15, false, 'normal', 25));
                this.game.playerBullets.push(new Bullet(posX + 8, this.y - 15, 0, -15, false, 'normal', 25));
            }
        });

        if (this.hasDrone) {
            const droneX1 = this.x + Math.cos(this.droneAngle) * 45;
            const droneY1 = this.y + Math.sin(this.droneAngle) * 20;
            const droneX2 = this.x + Math.cos(this.droneAngle + Math.PI) * 45;
            const droneY2 = this.y + Math.sin(this.droneAngle + Math.PI) * 20;
            
            this.game.playerBullets.push(new Bullet(droneX1, droneY1, 0, -14, false, 'normal', 15));
            this.game.playerBullets.push(new Bullet(droneX2, droneY2, 0, -14, false, 'normal', 15));
        }
    }

    drawShip(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rollAngle);

        if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        // 1. Aerodynamic Wings with Metallic Gradient
        const wingGrad = ctx.createLinearGradient(-22, 0, 22, 0);
        wingGrad.addColorStop(0, '#10223d');
        wingGrad.addColorStop(0.3, '#d8e6f8');
        wingGrad.addColorStop(0.5, '#ffffff');
        wingGrad.addColorStop(0.7, '#d8e6f8');
        wingGrad.addColorStop(1, '#10223d');

        ctx.fillStyle = wingGrad;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;

        // Main Swept Wing Geometry
        ctx.beginPath();
        ctx.moveTo(0, -24);        // Nose
        ctx.lineTo(8, -6);         // Canard transition
        ctx.lineTo(22, 12);        // Right wingtip
        ctx.lineTo(18, 18);        // Right trailing edge
        ctx.lineTo(6, 14);         // Engine nacelle right
        ctx.lineTo(0, 20);         // Center tail
        ctx.lineTo(-6, 14);        // Engine nacelle left
        ctx.lineTo(-18, 18);       // Left trailing edge
        ctx.lineTo(-22, 12);       // Left wingtip
        ctx.lineTo(-8, -6);        // Canard transition left
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Armor Panel Lines & Insets
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(-16, 10);
        ctx.moveTo(6, -4);
        ctx.lineTo(16, 10);
        ctx.stroke();

        // 3. Realistic Cockpit Canopy (Tinted Glass with Light Glint)
        const canopyGrad = ctx.createLinearGradient(0, -12, 0, 4);
        canopyGrad.addColorStop(0, '#00ffff');
        canopyGrad.addColorStop(0.4, '#003366');
        canopyGrad.addColorStop(0.8, '#ff0077');
        canopyGrad.addColorStop(1, '#000022');

        ctx.fillStyle = canopyGrad;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, -2, 4, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Canopy Glint Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(-1.5, -5, 1.5, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // 4. Twin Vectoring Engine Nozzles with Blue Heat Glow
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(-6, 15, 3.5, 4);
        ctx.fillRect(2.5, 15, 3.5, 4);

        // Wingtip Navigation Strobe Lights (Port Red, Starboard Green)
        ctx.fillStyle = '#39ff14'; // Green right
        ctx.beginPath();
        ctx.arc(21, 12, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0033'; // Red left
        ctx.beginPath();
        ctx.arc(-21, 12, 2, 0, Math.PI * 2);
        ctx.fill();

        // Shield Bubble
        if (this.shield > 0) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 + (this.shield / this.maxShield) * 0.5})`;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 14;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 28, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    draw(ctx) {
        if (this.isDead) return;

        if (this.isDualFighter) {
            this.drawShip(ctx, this.x - 20, this.y);
            this.drawShip(ctx, this.x + 20, this.y);
        } else {
            this.drawShip(ctx, this.x, this.y);
        }

        if (this.hasDrone) {
            const d1X = this.x + Math.cos(this.droneAngle) * 45;
            const d1Y = this.y + Math.sin(this.droneAngle) * 20;
            const d2X = this.x + Math.cos(this.droneAngle + Math.PI) * 45;
            const d2Y = this.y + Math.sin(this.droneAngle + Math.PI) * 20;
            
            this.drawDrone(ctx, d1X, d1Y);
            this.drawDrone(ctx, d2X, d2Y);
        }
    }

    drawDrone(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#ffea00';
        ctx.shadowColor = '#ffea00';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// --- REALISTIC ALIEN SPACECRAFT WITH METALLIC GRADIENTS & DETAILED PANELS ---
class Enemy {
    constructor(game, type, gridX, gridY, entryPath = null) {
        this.game = game;
        this.type = type;
        this.gridTarget = { x: gridX, y: gridY };
        this.x = entryPath ? entryPath[0].x : gridX;
        this.y = entryPath ? entryPath[0].y : gridY;

        this.entryPath = entryPath;
        this.pathIndex = 0;
        this.state = entryPath ? 'ENTERING' : 'IN_FORMATION';

        const wave = game.waveManager.currentWave;
        const stage = game.waveManager.currentStage;
        const statMult = 1.0 + (wave - 1) * 0.15 + (stage - 1) * 0.4;
        const speedMult = 1.0 + (wave - 1) * 0.05;

        this.diveTimer = Math.random() * (350 / speedMult) + (180 / speedMult);
        this.fireTimer = Math.random() * 140 + 70;
        this.angle = 0;
        this.speed = 4 * speedMult;
        this.isDead = false;

        this.sniperAimTimer = 0;
        this.isAimingSniper = false;
        this.sniperTarget = { x: 0, y: 0 };
        this.cloakAlpha = 1.0;
        this.cloakTimer = 0;
        this.warpCooldown = 0;
        this.animTick = Math.random() * 100;

        switch (type) {
            case 'COMMANDER':
                this.hp = Math.round(75 * statMult);
                this.scoreValue = 400;
                this.color = '#ffea00';
                this.radius = 22;
                this.tractorBeamTimer = 0;
                break;
            case 'STRIKER':
                this.hp = Math.round(40 * statMult);
                this.scoreValue = 250;
                this.color = '#ff3366';
                this.radius = 18;
                break;
            case 'INTERCEPTOR':
                this.hp = Math.round(28 * statMult);
                this.scoreValue = 250;
                this.color = '#00ffcc';
                this.radius = 16;
                this.speed = 5.5 * speedMult;
                break;
            case 'SNIPER':
                this.hp = Math.round(45 * statMult);
                this.scoreValue = 350;
                this.color = '#ff8800';
                this.radius = 18;
                break;
            case 'PHANTOM':
                this.hp = Math.round(35 * statMult);
                this.scoreValue = 300;
                this.color = '#bf00ff';
                this.radius = 16;
                break;
            case 'SPLITTER':
                this.hp = Math.round(50 * statMult);
                this.scoreValue = 350;
                this.color = '#39ff14';
                this.radius = 19;
                break;
            case 'MINELAYER':
                this.hp = Math.round(60 * statMult);
                this.scoreValue = 320;
                this.color = '#e000ff';
                this.radius = 20;
                break;
            case 'SENTINEL':
                this.hp = Math.round(85 * statMult);
                this.scoreValue = 450;
                this.color = '#00bfff';
                this.radius = 22;
                this.shieldAngle = 0;
                break;
            case 'WARP_HUNTER':
                this.hp = Math.round(45 * statMult);
                this.scoreValue = 400;
                this.color = '#ff00aa';
                this.radius = 18;
                this.speed = 5.0 * speedMult;
                break;
            default: // DRONE
                this.hp = Math.round(22 * statMult);
                this.scoreValue = 120;
                this.color = '#00f0ff';
                this.radius = 15;
                break;
        }
        this.maxHp = this.hp;
    }

    takeDamage(amount) {
        if (this.type === 'WARP_HUNTER' && Math.random() < 0.35 && this.warpCooldown <= 0) {
            this.warpDash();
            return;
        }

        this.hp -= amount;
        this.game.particles.spawnExplosion(this.x, this.y, this.color, 4, 0.4);
        window.audio.playHit();

        if (this.hp <= 0) {
            this.hp = 0;
            this.destroy();
        }
    }

    warpDash() {
        this.warpCooldown = 90;
        this.game.particles.spawnShockwave(this.x, this.y, 60, '#ff00aa');
        this.x += (Math.random() - 0.5) * 120;
        this.x = Math.max(40, Math.min(this.game.width - 40, this.x));
        this.game.particles.spawnShockwave(this.x, this.y, 60, '#ff00aa');
    }

    destroy() {
        this.isDead = true;
        this.game.particles.spawnExplosion(this.x, this.y, this.color, 25, 1.0);
        window.audio.playExplosion('medium');
        this.game.addScore(this.scoreValue, this.x, this.y);

        if (this.type === 'SPLITTER') {
            for (let i = -1; i <= 1; i += 2) {
                const subDrone = new Enemy(this.game, 'DRONE', this.x + i * 20, this.y);
                subDrone.state = 'DIVING';
                subDrone.speed = 4.8;
                this.game.enemies.push(subDrone);
            }
            this.game.particles.spawnFloatingText("SPLIT!", this.x, this.y - 20, '#39ff14', 16);
        }

        if (Math.random() < 0.14) {
            const types = ['DUAL', 'SPREAD', 'LASER', 'SHIELD', 'BOMB', 'DRONE', 'HEAL'];
            if (Math.random() < 0.08) types.push('1UP');
            const chosen = types[Math.floor(Math.random() * types.length)];
            this.game.powerUps.push(new PowerUp(this.x, this.y, chosen));
        }
    }

    update() {
        if (this.isDead) return;
        this.animTick += 0.05;

        if (this.warpCooldown > 0) this.warpCooldown--;

        if (this.type === 'PHANTOM') {
            this.cloakTimer++;
            this.cloakAlpha = 0.25 + 0.75 * Math.abs(Math.sin(this.cloakTimer * 0.04));
        }

        if (this.type === 'SENTINEL') {
            this.shieldAngle += 0.04;
        }

        if (this.type === 'SNIPER' && this.isAimingSniper) {
            this.sniperAimTimer++;
            this.sniperTarget.x = this.game.player.x;
            this.sniperTarget.y = this.game.player.y;

            if (this.sniperAimTimer >= 40) {
                this.isAimingSniper = false;
                this.sniperAimTimer = 0;
                window.audio.playLaser('laser');
                const angle = Math.atan2(this.sniperTarget.y - this.y, this.sniperTarget.x - this.x);
                this.game.enemyBullets.push(new Bullet(this.x, this.y + 15, Math.cos(angle) * 9.0, Math.sin(angle) * 9.0, true, 'sniper', 24));
            }
        }

        if (this.state === 'ENTERING') {
            if (this.entryPath && this.pathIndex < this.entryPath.length - 1) {
                const targetPoint = this.entryPath[this.pathIndex + 1];
                const dx = targetPoint.x - this.x;
                const dy = targetPoint.y - this.y;
                const dist = Math.hypot(dx, dy);

                this.angle = Math.atan2(dy, dx) + Math.PI / 2;

                if (dist < this.speed * 1.5) {
                    this.pathIndex++;
                } else {
                    this.x += (dx / dist) * this.speed;
                    this.y += (dy / dist) * this.speed;
                }
            } else {
                this.state = 'IN_FORMATION';
            }
        }
        else if (this.state === 'IN_FORMATION') {
            const waveOffset = Math.sin(this.game.waveTick * 0.03 + this.gridTarget.x * 0.02) * 12;
            const targetX = this.gridTarget.x + waveOffset;
            const targetY = this.gridTarget.y;

            this.x += (targetX - this.x) * 0.1;
            this.y += (targetY - this.y) * 0.1;
            this.angle = 0;

            this.diveTimer--;
            if (this.diveTimer <= 0) {
                this.startDive();
            }
        }
        else if (this.state === 'DIVING') {
            this.y += this.speed * 1.15;
            this.x += Math.sin(this.y * 0.025) * 3.8;
            this.angle = Math.PI;

            this.fireTimer--;
            if (this.fireTimer <= 0) {
                this.fireTimer = 110;
                this.shoot();
            }

            if (this.y > this.game.height + 40) {
                this.y = -40;
                this.state = 'IN_FORMATION';
                this.diveTimer = Math.random() * 350 + 180;
            }
        }
        else if (this.state === 'CAPTURING') {
            this.tractorBeamTimer++;
            window.audio.playTractorBeam();

            const beamTopY = this.y + 20;
            const beamBottomY = this.game.height;
            const beamWidthBottom = 140;

            const p = this.game.player;
            if (!p.isDead && !p.isCaptured && p.y > beamTopY) {
                const beamLeft = this.x - (beamWidthBottom / 2) * ((p.y - beamTopY) / (beamBottomY - beamTopY));
                const beamRight = this.x + (beamWidthBottom / 2) * ((p.y - beamTopY) / (beamBottomY - beamTopY));

                if (p.x >= beamLeft && p.x <= beamRight) {
                    p.x += (this.x - p.x) * 0.06;
                    p.y -= 1.0;
                    if (this.tractorBeamTimer > 75 && Math.abs(p.x - this.x) < 25) {
                        p.isCaptured = true;
                        this.game.particles.spawnFloatingText("SHIP CAPTURED!", p.x, p.y - 30, '#ff0055', 20);
                    }
                }
            }

            if (this.tractorBeamTimer > 150) {
                this.state = 'DIVING';
                this.tractorBeamTimer = 0;
            }
        }
    }

    startDive() {
        if (this.type === 'COMMANDER' && Math.random() < 0.35 && !this.game.player.isCaptured) {
            this.state = 'CAPTURING';
            this.tractorBeamTimer = 0;
        } else if (this.type === 'SNIPER' && !this.isAimingSniper) {
            this.isAimingSniper = true;
            this.sniperAimTimer = 0;
            this.diveTimer = 220;
        } else {
            this.state = 'DIVING';
            this.fireTimer = 30;
        }
    }

    shoot() {
        if (this.isDead || this.y > this.game.height - 90) return;
        window.audio.playEnemyLaser();

        if (this.type === 'MINELAYER') {
            this.game.enemyBullets.push(new Bullet(this.x, this.y + 10, 0, 1.2, true, 'mine', 25));
        } else if (this.type === 'COMMANDER') {
            this.game.enemyBullets.push(new Bullet(this.x, this.y + 15, 0, 4.8, true, 'orb', 18));
        } else if (this.type === 'STRIKER') {
            const angleToPlayer = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
            this.game.enemyBullets.push(new Bullet(this.x - 8, this.y + 15, Math.cos(angleToPlayer) * 5.2, Math.sin(angleToPlayer) * 5.2, true, 'normal', 14));
            this.game.enemyBullets.push(new Bullet(this.x + 8, this.y + 15, Math.cos(angleToPlayer) * 5.2, Math.sin(angleToPlayer) * 5.2, true, 'normal', 14));
        } else if (this.type === 'WARP_HUNTER') {
            for (let a = -0.2; a <= 0.2; a += 0.2) {
                this.game.enemyBullets.push(new Bullet(this.x, this.y + 15, Math.sin(a) * 5, Math.cos(a) * 5, true, 'normal', 15));
            }
        } else {
            this.game.enemyBullets.push(new Bullet(this.x, this.y + 12, 0, 4.8, true, 'normal', 10));
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        // Sniper Laser Sight Line
        if (this.type === 'SNIPER' && this.isAimingSniper) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 60, 0, ${0.3 + (this.sniperAimTimer / 40) * 0.7})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 15);
            ctx.lineTo(this.sniperTarget.x, this.sniperTarget.y);
            ctx.stroke();

            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.sniperTarget.x, this.sniperTarget.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (this.type === 'PHANTOM') {
            ctx.globalAlpha = this.cloakAlpha;
        }

        // Elite Aura
        if (this.game.waveManager.currentWave >= 7) {
            ctx.strokeStyle = 'rgba(255, 0, 85, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // --- DETAILED REALISTIC SPACECRAFT VECTOR DRAWINGS ---
        
        if (this.type === 'COMMANDER') {
            // 👑 TITAN COMMAND CRUISER (Gold / Heavy Composite Armor)
            const hullGrad = ctx.createLinearGradient(-24, 0, 24, 0);
            hullGrad.addColorStop(0, '#553300');
            hullGrad.addColorStop(0.3, '#ffcc00');
            hullGrad.addColorStop(0.5, '#ffffff');
            hullGrad.addColorStop(0.7, '#ffcc00');
            hullGrad.addColorStop(1, '#553300');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#ffe600';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#ffea00';
            ctx.shadowBlur = 10;

            // Main Heavy Command Fuselage
            ctx.beginPath();
            ctx.moveTo(0, -22);        // Prow
            ctx.lineTo(16, -10);       // Shoulder
            ctx.lineTo(24, 6);         // Upper mandible
            ctx.lineTo(18, 20);        // Engine boom
            ctx.lineTo(6, 14);         // Reactor recess
            ctx.lineTo(0, 18);         // Tail center
            ctx.lineTo(-6, 14);
            ctx.lineTo(-18, 20);
            ctx.lineTo(-24, 6);
            ctx.lineTo(-16, -10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Bridge Sensor Array
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, -2, 5, 0, Math.PI * 2);
            ctx.fill();

            // Heavy Dual Engine Exhaust
            ctx.fillStyle = '#ff7700';
            ctx.fillRect(-14, 16, 4, 4);
            ctx.fillRect(10, 16, 4, 4);
        }
        else if (this.type === 'STRIKER') {
            // 🔴 CRIMSON ASSAULT HORNET (Heavy Gunship with Swept Wings)
            const hullGrad = ctx.createLinearGradient(-20, 0, 20, 0);
            hullGrad.addColorStop(0, '#3a0010');
            hullGrad.addColorStop(0.4, '#ff1a4a');
            hullGrad.addColorStop(0.5, '#ffffff');
            hullGrad.addColorStop(0.6, '#ff1a4a');
            hullGrad.addColorStop(1, '#3a0010');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#ff3366';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 8;

            // Forward-Swept Wings Geometry
            ctx.beginPath();
            ctx.moveTo(0, 18);         // Forward strike nose
            ctx.lineTo(20, -10);       // Wingtip right
            ctx.lineTo(16, -16);       // Aileron
            ctx.lineTo(6, -10);        // Intake
            ctx.lineTo(0, -18);        // Tail fin
            ctx.lineTo(-6, -10);
            ctx.lineTo(-16, -16);
            ctx.lineTo(-20, -10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Wing Cannon Hardpoints
            ctx.fillStyle = '#111111';
            ctx.fillRect(16, -6, 3, 10);
            ctx.fillRect(-19, -6, 3, 10);

            // Cockpit Window Inset
            ctx.fillStyle = '#ffea00';
            ctx.beginPath();
            ctx.ellipse(0, 4, 3, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (this.type === 'INTERCEPTOR') {
            // 💠 TWIN-BOOM SPACE INTERCEPTOR (Cyan / Lightning Fast)
            const hullGrad = ctx.createLinearGradient(-18, 0, 18, 0);
            hullGrad.addColorStop(0, '#002b3d');
            hullGrad.addColorStop(0.5, '#00ffcc');
            hullGrad.addColorStop(1, '#002b3d');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 8;

            // Twin Boom Fuselage
            ctx.beginPath();
            ctx.moveTo(0, 16);         // Central Cockpit Nose
            ctx.lineTo(6, 4);
            ctx.lineTo(16, 2);         // Right Boom Nose
            ctx.lineTo(16, -14);       // Right Engine
            ctx.lineTo(10, -14);
            ctx.lineTo(8, -6);         // Wing connector
            ctx.lineTo(0, -10);        // Central Tail
            ctx.lineTo(-8, -6);
            ctx.lineTo(-10, -14);
            ctx.lineTo(-16, -14);      // Left Engine
            ctx.lineTo(-16, 2);        // Left Boom Nose
            ctx.lineTo(-6, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Dual Thruster Glows
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(11, -16, 4, 3);
            ctx.fillRect(-15, -16, 4, 3);
        }
        else if (this.type === 'SNIPER') {
            // 🔶 RAILGUN STRIKE FIGHTER (Long Barrel with Power Coils)
            const hullGrad = ctx.createLinearGradient(-16, 0, 16, 0);
            hullGrad.addColorStop(0, '#4a2500');
            hullGrad.addColorStop(0.5, '#ff8800');
            hullGrad.addColorStop(1, '#4a2500');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#ff8800';
            ctx.shadowBlur = 8;

            // Extended Needle Railgun
            ctx.beginPath();
            ctx.moveTo(0, 24);         // Railgun Tip
            ctx.lineTo(3, 4);
            ctx.lineTo(16, -10);       // Right Canard
            ctx.lineTo(12, -16);
            ctx.lineTo(4, -10);
            ctx.lineTo(0, -14);        // Tail
            ctx.lineTo(-4, -10);
            ctx.lineTo(-12, -16);
            ctx.lineTo(-16, -10);      // Left Canard
            ctx.lineTo(-3, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Electromagnetic Coils along barrel
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, 10, 4, 2);
            ctx.fillRect(-2, 16, 4, 2);
        }
        else if (this.type === 'MINELAYER') {
            // 🟣 ARMORED ORDNANCE CRUISER (Heavy Hexagon with Spikes)
            const hullGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
            hullGrad.addColorStop(0, '#ffffff');
            hullGrad.addColorStop(0.4, '#e000ff');
            hullGrad.addColorStop(1, '#1b0028');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#e000ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#e000ff';
            ctx.shadowBlur = 10;

            // Armored Hexagon
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = i * (Math.PI / 3);
                const px = Math.cos(a) * 16;
                const py = Math.sin(a) * 16;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Mine Release Ports
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff00aa';
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (this.type === 'SPLITTER') {
            // 🟢 BIO-MECHANICAL ALIEN CARAPACE (Emerald Diamond)
            const hullGrad = ctx.createLinearGradient(-18, 0, 18, 0);
            hullGrad.addColorStop(0, '#0a3805');
            hullGrad.addColorStop(0.5, '#39ff14');
            hullGrad.addColorStop(1, '#0a3805');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#39ff14';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#39ff14';
            ctx.shadowBlur = 8;

            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(20, 0);
            ctx.lineTo(0, 20);
            ctx.lineTo(-20, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Organic Splitting Seam
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(0, 18);
            ctx.stroke();
        }
        else if (this.type === 'SENTINEL') {
            // 🛡️ CYBER SENTINEL (Heavy Shield Fortress)
            const hullGrad = ctx.createLinearGradient(-20, 0, 20, 0);
            hullGrad.addColorStop(0, '#001a33');
            hullGrad.addColorStop(0.5, '#00bfff');
            hullGrad.addColorStop(1, '#001a33');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#00bfff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00bfff';
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(18, -8);
            ctx.lineTo(18, 12);
            ctx.lineTo(0, 18);
            ctx.lineTo(-18, 12);
            ctx.lineTo(-18, -8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Rotating Energy Shield Ring
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 22, this.shieldAngle, this.shieldAngle + Math.PI);
            ctx.stroke();
        }
        else if (this.type === 'WARP_HUNTER') {
            // 🔮 QUANTUM PHASE FIGHTER (Magenta Variable Geometry)
            const hullGrad = ctx.createLinearGradient(-18, 0, 18, 0);
            hullGrad.addColorStop(0, '#3d0028');
            hullGrad.addColorStop(0.5, '#ff00aa');
            hullGrad.addColorStop(1, '#3d0028');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#ff00aa';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#ff00aa';
            ctx.shadowBlur = 8;

            ctx.beginPath();
            ctx.moveTo(0, 18);
            ctx.lineTo(18, -16);
            ctx.lineTo(0, -8);
            ctx.lineTo(-18, -16);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -2, 4, 8);
        }
        else if (this.type === 'PHANTOM') {
            // 👤 STEALTH SHROUD GHOST (Obsidian Faceted Jet)
            ctx.fillStyle = 'rgba(25, 10, 45, 0.9)';
            ctx.strokeStyle = '#bf00ff';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#bf00ff';
            ctx.shadowBlur = 8;

            ctx.beginPath();
            ctx.moveTo(0, 18);
            ctx.lineTo(16, -10);
            ctx.lineTo(0, -14);
            ctx.lineTo(-16, -10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        else {
            // 🛸 AERO-SCOUT DRONE (Cyan Sleek Delta Fighter)
            const hullGrad = ctx.createLinearGradient(-15, 0, 15, 0);
            hullGrad.addColorStop(0, '#002533');
            hullGrad.addColorStop(0.5, '#00f0ff');
            hullGrad.addColorStop(1, '#002533');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 6;

            ctx.beginPath();
            ctx.moveTo(0, 16);
            ctx.lineTo(14, -6);
            ctx.lineTo(8, -14);
            ctx.lineTo(-8, -14);
            ctx.lineTo(-14, -6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cockpit Glint
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, 2.5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Tractor Beam Cone
        if (this.state === 'CAPTURING') {
            ctx.save();
            const beamGrad = ctx.createLinearGradient(this.x, this.y + 15, this.x, this.game.height);
            beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.6)');
            beamGrad.addColorStop(1, 'rgba(255, 0, 128, 0.1)');

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(this.x - 10, this.y + 15);
            ctx.lineTo(this.x + 10, this.y + 15);
            ctx.lineTo(this.x + 70, this.game.height);
            ctx.lineTo(this.x - 70, this.game.height);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
}

// --- DESTRUCTIBLE DRIFTING ASTEROIDS (BONGKAHAN ASTEROID PENGGANGGU) ---
class Asteroid {
    constructor(game, x, y, size = 'large', vx = null, vy = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = size; // 'large', 'medium', 'small'
        this.isDead = false;
        
        if (size === 'large') {
            this.radius = 32;
            this.hp = 65;
            this.scoreValue = 150;
            this.vy = vy !== null ? vy : (Math.random() * 1.2 + 0.8);
            this.vx = vx !== null ? vx : ((Math.random() - 0.5) * 1.0);
        } else if (size === 'medium') {
            this.radius = 20;
            this.hp = 35;
            this.scoreValue = 100;
            this.vy = vy !== null ? vy : (Math.random() * 1.6 + 1.0);
            this.vx = vx !== null ? vx : ((Math.random() - 0.5) * 1.5);
        } else {
            this.radius = 12;
            this.hp = 15;
            this.scoreValue = 50;
            this.vy = vy !== null ? vy : (Math.random() * 2.0 + 1.2);
            this.vx = vx !== null ? vx : ((Math.random() - 0.5) * 2.0);
        }
        this.maxHp = this.hp;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;

        // Procedural Jagged Rock Vertices
        this.numVertices = size === 'large' ? 12 : (size === 'medium' ? 10 : 8);
        this.vertices = [];
        for (let i = 0; i < this.numVertices; i++) {
            const angle = (i / this.numVertices) * Math.PI * 2;
            const variance = 0.75 + Math.random() * 0.5; // 75% to 125% radius
            this.vertices.push({
                x: Math.cos(angle) * this.radius * variance,
                y: Math.sin(angle) * this.radius * variance
            });
        }

        // Procedural Craters
        this.craters = [];
        const numCraters = size === 'large' ? 3 : (size === 'medium' ? 2 : 1);
        for (let i = 0; i < numCraters; i++) {
            const dist = Math.random() * (this.radius * 0.5);
            const ang = Math.random() * Math.PI * 2;
            this.craters.push({
                x: Math.cos(ang) * dist,
                y: Math.sin(ang) * dist,
                r: Math.random() * (this.radius * 0.25) + 3
            });
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.game.particles.spawnRockDust(this.x, this.y, 4);
        window.audio.playHit();

        if (this.hp <= 0) {
            this.hp = 0;
            this.destroy();
        }
    }

    destroy() {
        this.isDead = true;
        this.game.particles.spawnExplosion(this.x, this.y, '#8c7e72', 15, 0.8);
        this.game.particles.spawnRockDust(this.x, this.y, 12);
        window.audio.playExplosion('small');
        this.game.addScore(this.scoreValue, this.x, this.y);

        // Split into smaller sub-asteroids
        if (this.size === 'large') {
            for (let i = -1; i <= 1; i += 2) {
                const sub = new Asteroid(this.game, this.x + i * 15, this.y, 'medium', this.vx + i * 0.8, this.vy * 1.2);
                this.game.asteroids.push(sub);
            }
        } else if (this.size === 'medium') {
            for (let i = -1; i <= 1; i += 2) {
                const sub = new Asteroid(this.game, this.x + i * 10, this.y, 'small', this.vx + i * 1.2, this.vy * 1.3);
                this.game.asteroids.push(sub);
            }
        }

        // Powerup drop chance
        if (Math.random() < 0.10 && this.size !== 'small') {
            const types = ['DUAL', 'SPREAD', 'LASER', 'SHIELD', 'BOMB', 'HEAL'];
            const chosen = types[Math.floor(Math.random() * types.length)];
            this.game.powerUps.push(new PowerUp(this.x, this.y, chosen));
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;

        if (this.y > this.game.height + 60 || this.x < -60 || this.x > this.game.width + 60) {
            this.isDead = true;
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 3D Spherical Rocky Gradient
        const rockGrad = ctx.createRadialGradient(-this.radius * 0.35, -this.radius * 0.35, 2, 0, 0, this.radius);
        rockGrad.addColorStop(0, '#d1c2b4');
        rockGrad.addColorStop(0.4, '#8a7868');
        rockGrad.addColorStop(0.8, '#4a3d32');
        rockGrad.addColorStop(1, '#241c16');

        ctx.fillStyle = rockGrad;
        ctx.strokeStyle = '#a69280';
        ctx.lineWidth = 1.5;

        // Jagged Polygon Outline
        ctx.beginPath();
        for (let i = 0; i < this.vertices.length; i++) {
            const v = this.vertices[i];
            if (i === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shaded Craters
        for (let c of this.craters) {
            ctx.fillStyle = 'rgba(25, 18, 12, 0.6)';
            ctx.strokeStyle = 'rgba(210, 195, 180, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
}
