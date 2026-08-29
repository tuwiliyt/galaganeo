// High-Fidelity Realistic Boss Flagships (Iron Mantis Mecha, Void Dreadnought Carrier, Omega Core Matrix)

// ==========================================
// BOSS 1: IRON MANTIS (Mecha-Insect Dread Cruiser)
// ==========================================
class IronMantis {
    constructor(game) {
        this.game = game;
        this.name = "IRON MANTIS";
        this.level = 1;
        this.x = game.width / 2;
        this.y = -100;
        this.targetY = 110;
        this.hp = 950;
        this.maxHp = 950;
        this.isDead = false;
        this.isEnraged = false;

        this.attackTimer = 0;
        this.pincerAngle = 0;
        this.diveProgress = 0;
        this.isDiving = false;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.game.particles.spawnExplosion(this.x + (Math.random() * 60 - 30), this.y + (Math.random() * 30 - 15), '#ff5500', 4, 0.4);
        window.audio.playHit();

        if (this.hp <= this.maxHp * 0.45 && !this.isEnraged) {
            this.isEnraged = true;
            this.game.particles.spawnFloatingText("BOSS ENRAGED!", this.x, this.y + 60, '#ff0033', 24);
            this.game.shake.addTrauma(0.5);
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.destroy();
        }
    }

    destroy() {
        this.isDead = true;
        this.game.shake.addTrauma(0.8);
        window.audio.playExplosion('boss');

        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const ox = (Math.random() - 0.5) * 120;
                const oy = (Math.random() - 0.5) * 80;
                this.game.particles.spawnExplosion(this.x + ox, this.y + oy, '#ff3300', 30, 1.5);
                window.audio.playExplosion('large');
            }, i * 140);
        }

        this.game.addScore(5000, this.x, this.y);
        setTimeout(() => this.game.onBossDefeated(), 1400);
    }

    update() {
        if (this.isDead) return;

        if (this.y < this.targetY && !this.isDiving) {
            this.y += 2;
            return;
        }

        this.attackTimer++;
        this.pincerAngle = Math.sin(this.attackTimer * 0.06) * 0.25;

        if (!this.isDiving) {
            this.x = this.game.width / 2 + Math.sin(this.attackTimer * 0.025) * (this.game.width * 0.3);
        }

        const interval = this.isEnraged ? 100 : 150;

        if (this.attackTimer % interval === 0) {
            const attackType = Math.floor(Math.random() * (this.isEnraged ? 3 : 2));

            if (attackType === 0) {
                this.firePincerSpread();
            } else if (attackType === 1) {
                this.fireMissileBarrage();
            } else if (attackType === 2 && this.isEnraged && !this.isDiving) {
                this.isDiving = true;
                this.diveProgress = 0;
            }
        }

        if (this.isDiving) {
            this.diveProgress += 0.018;
            this.y = this.targetY + Math.sin(this.diveProgress * Math.PI) * 220;

            if (this.attackTimer % 14 === 0) {
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
                    const spd = 4;
                    this.game.enemyBullets.push(new Bullet(this.x, this.y, Math.cos(a) * spd, Math.sin(a) * spd, true, 'spread', 12));
                }
                window.audio.playEnemyLaser();
            }

            if (this.diveProgress >= 1) {
                this.isDiving = false;
                this.y = this.targetY;
            }
        }
    }

    firePincerSpread() {
        window.audio.playEnemyLaser();
        const leftX = this.x - 50;
        const rightX = this.x + 50;

        for (let a = -0.3; a <= 0.3; a += 0.2) {
            const spd = 4.5;
            this.game.enemyBullets.push(new Bullet(leftX, this.y + 25, Math.sin(a) * spd, Math.cos(a) * spd, true, 'orb', 14));
            this.game.enemyBullets.push(new Bullet(rightX, this.y + 25, Math.sin(a) * spd, Math.cos(a) * spd, true, 'orb', 14));
        }
    }

    fireMissileBarrage() {
        window.audio.playEnemyLaser();
        for (let i = -1; i <= 1; i++) {
            const angle = Math.atan2(this.game.player.y - this.y, (this.game.player.x + i * 50) - this.x);
            this.game.enemyBullets.push(new Bullet(this.x + i * 30, this.y + 25, Math.cos(angle) * 5, Math.sin(angle) * 5, true, 'missile', 16));
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        const glowColor = this.isEnraged ? '#ff0033' : '#ff7700';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;

        // Realistic Heavy Gunship Hull Gradient
        const hullGrad = ctx.createLinearGradient(-50, 0, 50, 0);
        hullGrad.addColorStop(0, '#151822');
        hullGrad.addColorStop(0.3, '#3a4258');
        hullGrad.addColorStop(0.5, '#7382a8');
        hullGrad.addColorStop(0.7, '#3a4258');
        hullGrad.addColorStop(1, '#151822');

        ctx.fillStyle = hullGrad;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2.5;

        // Main Heavy Chassis
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(40, -12);
        ctx.lineTo(55, 15);
        ctx.lineTo(35, 45);
        ctx.lineTo(0, 30);
        ctx.lineTo(-35, 45);
        ctx.lineTo(-55, 15);
        ctx.lineTo(-40, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Armor Plate Insets & Panel Lines
        ctx.strokeStyle = 'rgba(255, 119, 0, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-25, -5);
        ctx.lineTo(-40, 15);
        ctx.moveTo(25, -5);
        ctx.lineTo(40, 15);
        ctx.stroke();

        // Glowing Center Reactor
        const reactorGrad = ctx.createRadialGradient(0, 6, 2, 0, 6, 16);
        reactorGrad.addColorStop(0, '#ffffff');
        reactorGrad.addColorStop(0.5, glowColor);
        reactorGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = reactorGrad;
        ctx.beginPath();
        ctx.arc(0, 6, 14, 0, Math.PI * 2);
        ctx.fill();

        // Articulated Titanium Pincers (Left & Right)
        ctx.save();
        ctx.translate(-55, 5);
        ctx.rotate(-this.pincerAngle);
        ctx.fillStyle = '#252a3b';
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-30, 20);
        ctx.lineTo(-12, 52);
        ctx.lineTo(10, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Weapon Pod Nozzle
        ctx.fillStyle = '#ff7700';
        ctx.fillRect(-14, 48, 5, 6);
        ctx.restore();

        ctx.save();
        ctx.translate(55, 5);
        ctx.rotate(this.pincerAngle);
        ctx.fillStyle = '#252a3b';
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30, 20);
        ctx.lineTo(12, 52);
        ctx.lineTo(-10, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Weapon Pod Nozzle
        ctx.fillStyle = '#ff7700';
        ctx.fillRect(9, 48, 5, 6);
        ctx.restore();

        ctx.restore();
    }
}

// ==========================================
// BOSS 2: VOID DREADNOUGHT (Carrier Flagship)
// ==========================================
class VoidDreadnought {
    constructor(game) {
        this.game = game;
        this.name = "VOID DREADNOUGHT";
        this.level = 2;
        this.x = game.width / 2;
        this.y = -120;
        this.targetY = 120;
        this.hp = 1400;
        this.maxHp = 1400;
        this.isDead = false;

        this.attackTimer = 0;
        this.shieldAngle = 0;
        this.shields = [
            { angle: 0, hp: 60, maxHp: 60, active: true },
            { angle: Math.PI * 0.5, hp: 60, maxHp: 60, active: true },
            { angle: Math.PI, hp: 60, maxHp: 60, active: true },
            { angle: Math.PI * 1.5, hp: 60, maxHp: 60, active: true }
        ];

        this.isTelegraphingTractor = false;
        this.tractorWarningTimer = 0;
    }

    takeDamage(amount) {
        const hasActiveShield = this.shields.some(s => s.active);
        const actualDamage = hasActiveShield ? amount * 0.5 : amount;

        this.hp -= actualDamage;
        this.game.particles.spawnExplosion(this.x + (Math.random() * 80 - 40), this.y + (Math.random() * 30 - 15), '#b000ff', 4, 0.5);
        window.audio.playHit();

        if (this.hp <= 0) {
            this.hp = 0;
            this.destroy();
        }
    }

    damageShield(index, amount) {
        const s = this.shields[index];
        if (!s || !s.active) return;
        s.hp -= amount;
        if (s.hp <= 0) {
            s.active = false;
            const curAngle = this.shieldAngle + s.angle;
            const sx = this.x + Math.cos(curAngle) * 85;
            const sy = this.y + Math.sin(curAngle) * 65;
            
            this.game.particles.spawnExplosion(sx, sy, '#00ffff', 25, 1.2);
            window.audio.playExplosion('large');
            this.game.particles.spawnFloatingText("SHIELD BROKEN!", sx, sy - 15, '#00ffff', 18);
            this.game.powerUps.push(new PowerUp(sx, sy, Math.random() < 0.5 ? 'SHIELD' : 'HEAL'));
        }
    }

    destroy() {
        this.isDead = true;
        this.game.shake.addTrauma(0.9);
        window.audio.playExplosion('boss');

        for (let i = 0; i < 9; i++) {
            setTimeout(() => {
                const ox = (Math.random() - 0.5) * 140;
                const oy = (Math.random() - 0.5) * 80;
                this.game.particles.spawnExplosion(this.x + ox, this.y + oy, '#b000ff', 35, 1.8);
                window.audio.playExplosion('large');
            }, i * 130);
        }

        this.game.addScore(10000, this.x, this.y);
        setTimeout(() => this.game.onBossDefeated(), 1500);
    }

    update() {
        if (this.isDead) return;

        if (this.y < this.targetY) {
            this.y += 2;
            return;
        }

        this.attackTimer++;
        this.shieldAngle += 0.025;

        this.x = this.game.width / 2 + Math.sin(this.attackTimer * 0.018) * (this.game.width * 0.22);

        if (this.attackTimer % 180 === 0) {
            const roll = Math.random();
            if (roll < 0.4) {
                this.spawnDroneSupport();
            } else if (roll < 0.7) {
                this.fireBroadsideBarrage();
            } else {
                this.telegraphTractorBeam();
            }
        }

        if (this.isTelegraphingTractor) {
            this.tractorWarningTimer++;
            if (this.tractorWarningTimer === 50) {
                this.executeTractorWave();
            } else if (this.tractorWarningTimer > 110) {
                this.isTelegraphingTractor = false;
                this.tractorWarningTimer = 0;
            }
        }
    }

    spawnDroneSupport() {
        for (let i = -1; i <= 1; i += 2) {
            const drone = new Enemy(this.game, 'DRONE', this.x + i * 50, this.y + 35);
            drone.state = 'DIVING';
            drone.speed = 3.5;
            this.game.enemies.push(drone);
        }
        this.game.particles.spawnFloatingText("DRONES DEPLOYED", this.x, this.y + 45, '#ffea00', 18);
    }

    telegraphTractorBeam() {
        this.isTelegraphingTractor = true;
        this.tractorWarningTimer = 0;
        this.game.particles.spawnFloatingText("⚠️ TRACTOR BEAM CHARGING ⚠️", this.x, this.y + 50, '#00ffff', 20);
    }

    executeTractorWave() {
        window.audio.playTractorBeam();
        for (let a = -0.4; a <= 0.4; a += 0.25) {
            this.game.enemyBullets.push(new Bullet(this.x, this.y + 30, Math.sin(a) * 3.8, Math.cos(a) * 3.8, true, 'orb', 15));
        }
    }

    fireBroadsideBarrage() {
        window.audio.playEnemyLaser();
        for (let a = -0.5; a <= 0.5; a += 0.25) {
            const spd = 4.2;
            this.game.enemyBullets.push(new Bullet(this.x, this.y + 30, Math.sin(a) * spd, Math.cos(a) * spd, true, 'plasma', 16));
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.shadowColor = '#b000ff';
        ctx.shadowBlur = 18;

        // Carrier Battleship Metallic Hull
        const hullGrad = ctx.createLinearGradient(-80, 0, 80, 0);
        hullGrad.addColorStop(0, '#100522');
        hullGrad.addColorStop(0.3, '#33125d');
        hullGrad.addColorStop(0.5, '#7a32d6');
        hullGrad.addColorStop(0.7, '#33125d');
        hullGrad.addColorStop(1, '#100522');

        ctx.fillStyle = hullGrad;
        ctx.strokeStyle = '#b000ff';
        ctx.lineWidth = 3;

        // Realistic Carrier Geometry
        ctx.beginPath();
        ctx.moveTo(0, -45);        // Bow
        ctx.lineTo(60, -18);       // Starboard Armor
        ctx.lineTo(85, 25);        // Flank
        ctx.lineTo(40, 52);        // Engine Bay
        ctx.lineTo(0, 38);         // Hangar Bay
        ctx.lineTo(-40, 52);
        ctx.lineTo(-85, 25);
        ctx.lineTo(-60, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Hangar Bay Interior Glow
        ctx.fillStyle = '#ff00aa';
        ctx.beginPath();
        ctx.arc(0, 10, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Orbiting Shield Crystals
        for (let s of this.shields) {
            if (!s.active) continue;
            const curAngle = this.shieldAngle + s.angle;
            const sx = this.x + Math.cos(curAngle) * 85;
            const sy = this.y + Math.sin(curAngle) * 65;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.x - sx, this.y - sy);
            ctx.stroke();
            ctx.restore();
        }

        if (this.isTelegraphingTractor && this.tractorWarningTimer < 50) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(this.x - 30, this.y + 35);
            ctx.lineTo(this.x - 60, this.game.height);
            ctx.moveTo(this.x + 30, this.y + 35);
            ctx.lineTo(this.x + 60, this.game.height);
            ctx.stroke();
            ctx.restore();
        }
    }
}

// ==========================================
// BOSS 3: OMEGA CORE MATRIX (Cyber Godhead)
// ==========================================
class OmegaCoreMatrix {
    constructor(game) {
        this.game = game;
        this.name = "OMEGA CORE MATRIX";
        this.level = 3;
        this.x = game.width / 2;
        this.y = -140;
        this.targetY = 130;
        this.hp = 2600;
        this.maxHp = 2600;
        this.isDead = false;

        this.attackTimer = 0;
        this.danmakuAngle = 0;
        this.matrixRingAngle = 0;
        this.isChargingDeathRay = false;
        this.deathRayTimer = 0;
        this.teleportCooldown = 260;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.game.particles.spawnExplosion(this.x + (Math.random() * 60 - 30), this.y + (Math.random() * 60 - 30), '#ffe600', 5, 0.6);
        window.audio.playHit();

        if (this.hp <= 0) {
            this.hp = 0;
            this.destroy();
        }
    }

    destroy() {
        this.isDead = true;
        this.game.shake.addTrauma(1.0);
        window.audio.playExplosion('boss');

        for (let i = 0; i < 14; i++) {
            setTimeout(() => {
                const ox = (Math.random() - 0.5) * 180;
                const oy = (Math.random() - 0.5) * 130;
                const colors = ['#ffe600', '#00ffff', '#ff0055'];
                this.game.particles.spawnExplosion(this.x + ox, this.y + oy, colors[i % 3], 40, 2.2);
                window.audio.playExplosion('large');
            }, i * 120);
        }

        this.game.addScore(25000, this.x, this.y);
        setTimeout(() => this.game.onVictory(), 2000);
    }

    update() {
        if (this.isDead) return;

        if (this.y < this.targetY) {
            this.y += 2.5;
            return;
        }

        this.attackTimer++;
        this.danmakuAngle += 0.08;
        this.matrixRingAngle += 0.035;

        this.teleportCooldown--;
        if (this.teleportCooldown <= 0 && !this.isChargingDeathRay) {
            this.teleport();
            this.teleportCooldown = 300;
        }

        if (this.attackTimer % 9 === 0 && !this.isChargingDeathRay) {
            const speed = 4.5;
            const bulletsPerRing = 3;
            for (let i = 0; i < bulletsPerRing; i++) {
                const a = this.danmakuAngle + (i * (Math.PI * 2 / bulletsPerRing));
                this.game.enemyBullets.push(new Bullet(this.x, this.y, Math.cos(a) * speed, Math.sin(a) * speed, true, 'orb', 13));
            }
        }

        if (this.attackTimer % 340 === 0 && !this.isChargingDeathRay) {
            this.isChargingDeathRay = true;
            this.deathRayTimer = 0;
            this.game.particles.spawnFloatingText("⚠️ DEATH RAY CHARGING ⚠️", this.x, this.y + 60, '#ff0033', 22);
        }

        if (this.isChargingDeathRay) {
            this.deathRayTimer++;
            this.game.shake.addTrauma(0.05);

            if (this.deathRayTimer > 70 && this.deathRayTimer < 130) {
                const p = this.game.player;
                if (!p.isDead && Math.abs(p.x - this.x) < 32 && p.y > this.y) {
                    p.takeDamage(3);
                }
            }

            if (this.deathRayTimer >= 130) {
                this.isChargingDeathRay = false;
            }
        }
    }

    teleport() {
        this.game.particles.spawnShockwave(this.x, this.y, 200, '#ffe600');
        window.audio.playExplosion('large');

        this.x = 120 + Math.random() * (this.game.width - 240);
        this.y = 90 + Math.random() * 100;

        this.game.particles.spawnShockwave(this.x, this.y, 200, '#ffe600');
        this.game.particles.spawnFloatingText("WARP SHIFT!", this.x, this.y - 35, '#ffe600', 18);
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 20;

        // Rotating Solar Rings
        ctx.save();
        ctx.rotate(this.matrixRingAngle);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-55, -55, 110, 110);
        ctx.restore();

        ctx.save();
        ctx.rotate(-this.matrixRingAngle * 1.5);
        ctx.strokeStyle = '#ff0077';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-42, -42, 84, 84);
        ctx.restore();

        // Singularity Sphere
        const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#ffe600');
        coreGrad.addColorStop(1, '#ff3300');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (this.isChargingDeathRay) {
            ctx.save();
            if (this.deathRayTimer <= 70) {
                ctx.strokeStyle = 'rgba(255, 0, 80, 0.6)';
                ctx.lineWidth = 2 + (this.deathRayTimer / 70) * 6;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + 25);
                ctx.lineTo(this.x, this.game.height);
                ctx.stroke();
            } else {
                const beamGrad = ctx.createLinearGradient(this.x - 32, 0, this.x + 32, 0);
                beamGrad.addColorStop(0, 'rgba(255, 0, 50, 0)');
                beamGrad.addColorStop(0.5, '#ffffff');
                beamGrad.addColorStop(1, 'rgba(255, 0, 50, 0)');

                ctx.fillStyle = beamGrad;
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 25;
                ctx.fillRect(this.x - 32, this.y + 25, 64, this.game.height - (this.y + 25));
            }
            ctx.restore();
        }
    }
}
