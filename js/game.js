// Main Game Engine Controller with Cutscenes, Visual Wave Tracker, Lives & Continue System

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = 800;
        this.height = 700;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.starfield = new Starfield(this.width, this.height);
        this.particles = new ParticleSystem();
        this.shake = new ScreenShake();
        this.input = new InputManager(this.canvas);
        this.waveManager = new WaveManager(this);
        this.cutscenes = new CutsceneManager(this);

        this.player = new Player(this);
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.currentBoss = null;

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('neo_galaga_high_score') || '0', 10);
        this.multiplier = 1;
        this.comboTimer = 0;
        this.waveTick = 0;

        this.state = 'TITLE'; // TITLE, CUTSCENE, PLAYING, BOSS_WARNING, STAGE_CLEAR, GAME_OVER, VICTORY
        this.warningTimer = 0;

        this.initDOM();
        this.initCutsceneInputs();
    }

    initDOM() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('continueBtn').addEventListener('click', () => {
            this.continueGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('nextStageBtn').addEventListener('click', () => {
            this.proceedNextStage();
        });

        document.getElementById('victoryBtn').addEventListener('click', () => {
            this.startGame();
        });

        const audioToggle = document.getElementById('audioToggle');
        audioToggle.addEventListener('click', () => {
            const muted = window.audio.toggleMute();
            audioToggle.innerText = muted ? '🔇 MUTED' : '🔊 AUDIO ON';
            audioToggle.classList.toggle('muted', muted);
        });

        const autoFireBtn = document.getElementById('autoFireBtn');
        autoFireBtn.addEventListener('click', () => {
            this.input.autoFire = !this.input.autoFire;
            autoFireBtn.innerText = this.input.autoFire ? '⚡ AUTO-FIRE: ON' : '⚡ AUTO-FIRE: OFF';
            autoFireBtn.classList.toggle('off', !this.input.autoFire);
        });

        const bombBtn = document.getElementById('bombBtn');
        bombBtn.addEventListener('click', () => {
            if (this.state === 'PLAYING') {
                this.player.triggerBomb();
            }
        });
    }

    initCutsceneInputs() {
        this.canvas.addEventListener('click', (e) => {
            if (this.state === 'CUTSCENE' && this.cutscenes.active) {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const clickX = (e.clientX - rect.left) * scaleX;
                const clickY = (e.clientY - rect.top) * scaleY;

                // Check if Skip area clicked (top-right)
                if (clickX > this.width - 240 && clickY < 60) {
                    this.cutscenes.skip();
                } else {
                    this.cutscenes.advance();
                }
            }
        });

        window.addEventListener('keydown', (e) => {
            if (this.state === 'CUTSCENE' && this.cutscenes.active) {
                if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyZ') {
                    this.cutscenes.advance();
                } else if (e.code === 'Escape' || e.code === 'KeyS') {
                    this.cutscenes.skip();
                }
            }
        });
    }

    startGame() {
        window.audio.init();
        window.audio.resume();
        window.audio.setBossMode(false);
        window.audio.startBGM();

        this.score = 0;
        this.multiplier = 1;
        this.comboTimer = 0;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.currentBoss = null;

        this.player.reset(false);
        this.waveManager.reset();
        this.hideAllModals();

        // 🎬 Play Mission Prologue Cutscene
        this.state = 'CUTSCENE';
        this.cutscenes.playScene('PROLOGUE', () => {
            this.state = 'PLAYING';
            this.waveManager.startStage(1, 1);
        });
    }

    continueGame() {
        window.audio.resume();
        window.audio.setBossMode(false);
        window.audio.startBGM();

        this.multiplier = 1;
        this.comboTimer = 0;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.currentBoss = null;

        this.player.reset(false);

        const currentStage = this.waveManager.currentStage;
        this.waveManager.startStage(currentStage, 1);

        this.state = 'PLAYING';
        this.hideAllModals();
    }

    proceedNextStage() {
        this.hideAllModals();
        this.enemies = [];
        this.enemyBullets = [];
        this.currentBoss = null;
        this.starfield.setWarp(false);

        const nextStage = this.waveManager.currentStage + 1;
        window.audio.setBossMode(false);
        this.waveManager.startStage(nextStage, 1);
        this.state = 'PLAYING';
    }

    hideAllModals() {
        document.getElementById('startModal').style.display = 'none';
        document.getElementById('gameOverModal').style.display = 'none';
        document.getElementById('stageClearModal').style.display = 'none';
        document.getElementById('victoryModal').style.display = 'none';
    }

    addScore(points, x, y) {
        const gained = points * this.multiplier;
        this.score += gained;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neo_galaga_high_score', this.highScore.toString());
        }

        this.comboTimer = 180;
        if (this.multiplier < 5) this.multiplier++;

        this.particles.spawnFloatingText(`+${gained}`, x, y - 10, '#ffea00', 16);
    }

    triggerBossEncounter(stageNum) {
        const bossSceneKey = stageNum === 1 ? 'BOSS_1_INTRO' : (stageNum === 2 ? 'BOSS_2_INTRO' : 'BOSS_3_INTRO');

        // 🎬 Play Cinematic Boss Reveal Cutscene
        this.state = 'CUTSCENE';
        this.cutscenes.playScene(bossSceneKey, () => {
            this.state = 'BOSS_WARNING';
            this.warningTimer = 100;
            window.audio.playBossWarning();
            window.audio.setBossMode(true);

            setTimeout(() => {
                if (stageNum === 1) {
                    this.currentBoss = new IronMantis(this);
                } else if (stageNum === 2) {
                    this.currentBoss = new VoidDreadnought(this);
                } else {
                    this.currentBoss = new OmegaCoreMatrix(this);
                }
                this.state = 'PLAYING';
            }, 1800);
        });
    }

    onBossDefeated() {
        this.currentBoss = null;
        this.starfield.setWarp(true);
        window.audio.playPowerup();

        const currentStage = this.waveManager.currentStage;

        if (currentStage >= 3) {
            // 🎬 Play Grand Epilogue Cutscene upon final victory
            this.state = 'CUTSCENE';
            this.cutscenes.playScene('EPILOGUE', () => {
                this.onVictory();
            });
            return;
        }

        // 🎬 Play Warp Cutscene between stages
        const warpScene = currentStage === 1 ? 'STAGE_1_CLEAR_WARP' : 'STAGE_2_CLEAR_WARP';
        this.state = 'CUTSCENE';
        this.cutscenes.playScene(warpScene, () => {
            this.state = 'STAGE_CLEAR';
            document.getElementById('stageClearModal').style.display = 'flex';
            document.getElementById('clearStageText').innerText = `STAGE ${currentStage} CLEARED!`;
            document.getElementById('clearScoreText').innerText = `CURRENT SCORE: ${this.score}`;
        });
    }

    onVictory() {
        this.state = 'VICTORY';
        this.starfield.setWarp(true);
        setTimeout(() => {
            document.getElementById('victoryModal').style.display = 'flex';
            document.getElementById('victoryScoreText').innerText = `FINAL SCORE: ${this.score}`;
            document.getElementById('victoryHighScoreText').innerText = `HIGH SCORE: ${this.highScore}`;
        }, 800);
    }

    onPlayerDeath() {
        this.state = 'GAME_OVER';
        window.audio.stopBGM();
        setTimeout(() => {
            document.getElementById('gameOverModal').style.display = 'flex';
            document.getElementById('finalScoreText').innerText = `FINAL SCORE: ${this.score}`;
            document.getElementById('finalHighScoreText').innerText = `HIGH SCORE: ${this.highScore}`;
            document.getElementById('continueStageInfo').innerText = `Resume at Stage ${this.waveManager.currentStage} with 3 Lives`;
        }, 1000);
    }

    checkCollisions() {
        for (let b of this.playerBullets) {
            if (b.isDead) continue;

            for (let e of this.enemies) {
                if (e.isDead) continue;
                const dist = Math.hypot(b.x - e.x, b.y - e.y);
                if (dist < b.radius + e.radius) {
                    e.takeDamage(b.damage);
                    if (b.type !== 'laser') b.isDead = true;
                    break;
                }
            }

            if (this.currentBoss && !this.currentBoss.isDead) {
                if (this.currentBoss.shields) {
                    for (let i = 0; i < this.currentBoss.shields.length; i++) {
                        const s = this.currentBoss.shields[i];
                        if (!s.active) continue;
                        const curAngle = this.currentBoss.shieldAngle + s.angle;
                        const sx = this.currentBoss.x + Math.cos(curAngle) * 80;
                        const sy = this.currentBoss.y + Math.sin(curAngle) * 60;
                        if (Math.hypot(b.x - sx, b.y - sy) < b.radius + 14) {
                            this.currentBoss.damageShield(i, b.damage);
                            b.isDead = true;
                            break;
                        }
                    }
                }

                if (!b.isDead) {
                    const bDist = Math.hypot(b.x - this.currentBoss.x, b.y - this.currentBoss.y);
                    if (bDist < b.radius + 50) {
                        this.currentBoss.takeDamage(b.damage);
                        if (b.type !== 'laser') b.isDead = true;
                    }
                }
            }
        }

        if (!this.player.isDead && !this.player.isCaptured) {
            for (let eb of this.enemyBullets) {
                if (eb.isDead) continue;
                const dist = Math.hypot(eb.x - this.player.x, eb.y - this.player.y);
                if (dist < eb.radius + this.player.radius) {
                    this.player.takeDamage(eb.damage);
                    eb.isDead = true;
                }
            }

            for (let e of this.enemies) {
                if (e.isDead) continue;
                const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
                if (dist < e.radius + this.player.radius) {
                    this.player.takeDamage(25);
                    e.takeDamage(100);
                }
            }

            for (let p of this.powerUps) {
                if (p.isDead) continue;
                const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
                if (dist < p.radius + this.player.radius + 15) {
                    this.player.applyPowerUp(p.type);
                    p.isDead = true;
                }
            }
        }
    }

    update() {
        this.waveTick++;
        this.starfield.update();
        this.particles.update();
        this.shake.update();

        if (this.state === 'CUTSCENE') {
            this.cutscenes.update();
            return;
        }

        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else {
            this.multiplier = 1;
        }

        if (this.state === 'PLAYING') {
            this.player.update(this.input);
            this.waveManager.update();
            this.waveManager.checkWaveCompletion();

            this.playerBullets.forEach(b => b.update());
            this.enemyBullets.forEach(b => b.update());
            this.powerUps.forEach(p => p.update());
            this.enemies.forEach(e => e.update());

            if (this.currentBoss) {
                this.currentBoss.update();
            }

            this.checkCollisions();

            this.playerBullets = this.playerBullets.filter(b => !b.isDead);
            this.enemyBullets = this.enemyBullets.filter(b => !b.isDead);
            this.powerUps = this.powerUps.filter(p => !p.isDead);
            this.enemies = this.enemies.filter(e => !e.isDead);
        } else if (this.state === 'BOSS_WARNING') {
            this.warningTimer--;
            this.player.update(this.input);
        } else if (this.state === 'STAGE_CLEAR') {
            this.player.update(this.input);
        }
    }

    drawHUD() {
        const ctx = this.ctx;
        ctx.save();

        ctx.fillStyle = 'rgba(8, 12, 28, 0.85)';
        ctx.fillRect(0, 0, this.width, 42);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 42);
        ctx.lineTo(this.width, 42);
        ctx.stroke();

        ctx.font = 'bold 15px Orbitron, sans-serif';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, 20, 26);

        ctx.fillStyle = '#ffea00';
        ctx.fillText(`HIGH: ${this.highScore.toLocaleString()}`, 210, 26);

        if (this.multiplier > 1) {
            ctx.fillStyle = '#ff0077';
            ctx.shadowColor = '#ff0077';
            ctx.shadowBlur = 8;
            ctx.fillText(`x${this.multiplier} MULTIPLIER`, 390, 26);
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        const waveLabel = this.waveManager.currentWave === 10 ? '🔥 BOSS 10/10' : `WAVE ${this.waveManager.currentWave}/10`;
        ctx.fillText(`STAGE ${this.waveManager.currentStage} | ${waveLabel}`, this.width - 20, 26);

        // 10 Dots Wave Tracker
        const dotStartX = this.width / 2 - 80;
        for (let i = 1; i <= 10; i++) {
            const dx = dotStartX + (i - 1) * 18;
            const isCompleted = i < this.waveManager.currentWave;
            const isCurrent = i === this.waveManager.currentWave;

            ctx.beginPath();
            ctx.arc(dx, 48, isCurrent ? 5 : 3.5, 0, Math.PI * 2);
            if (i === 10) {
                ctx.fillStyle = isCurrent ? '#ff0055' : (isCompleted ? '#39ff14' : 'rgba(255, 0, 85, 0.4)');
                ctx.shadowColor = '#ff0055';
            } else {
                ctx.fillStyle = isCurrent ? '#00f0ff' : (isCompleted ? '#39ff14' : 'rgba(255, 255, 255, 0.25)');
                ctx.shadowColor = '#00f0ff';
            }
            ctx.shadowBlur = isCurrent ? 8 : 0;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        const barW = 100;
        const barH = 10;
        const bottomY = this.height - 18;

        ctx.font = 'bold 14px Orbitron, sans-serif';
        ctx.fillStyle = '#ff00cc';
        ctx.shadowColor = '#ff00cc';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'left';
        let livesIcon = "🚀 ".repeat(Math.max(0, this.player.lives));
        ctx.fillText(`LIVES: ${livesIcon}`, 20, bottomY - 14);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(160, bottomY - 12, barW, barH);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 6;
        ctx.fillRect(160, bottomY - 12, (this.player.hp / this.player.maxHp) * barW, barH);
        ctx.shadowBlur = 0;

        ctx.font = '10px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`HP: ${Math.ceil(this.player.hp)}%`, 160, bottomY - 16);

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(280, bottomY - 12, barW, barH);
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
        ctx.fillRect(280, bottomY - 12, (this.player.shield / this.player.maxShield) * barW, barH);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.fillText(`SHIELD: ${Math.ceil(this.player.shield)}%`, 280, bottomY - 16);

        ctx.textAlign = 'right';
        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.fillStyle = '#ff3366';
        let bombsText = "BOMBS: ";
        for (let i = 0; i < this.player.bombs; i++) bombsText += "💣 ";
        ctx.fillText(bombsText, this.width - 20, bottomY - 4);

        if (this.currentBoss && !this.currentBoss.isDead) {
            const bossBarW = 360;
            const bossBarH = 14;
            const bossBarX = (this.width - bossBarW) / 2;
            const bossBarY = 62;

            ctx.font = 'bold 13px Orbitron, sans-serif';
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 10;
            ctx.textAlign = 'center';
            ctx.fillText(`⚠️ ${this.currentBoss.name} ⚠️`, this.width / 2, bossBarY - 4);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(10, 10, 25, 0.85)';
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 2;
            ctx.strokeRect(bossBarX, bossBarY, bossBarW, bossBarH);
            ctx.fillRect(bossBarX, bossBarY, bossBarW, bossBarH);

            const bossHpRatio = Math.max(0, this.currentBoss.hp / this.currentBoss.maxHp);
            const fillGrad = ctx.createLinearGradient(bossBarX, 0, bossBarX + bossBarW, 0);
            fillGrad.addColorStop(0, '#ff0055');
            fillGrad.addColorStop(1, '#ffaa00');

            ctx.fillStyle = fillGrad;
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 8;
            ctx.fillRect(bossBarX + 2, bossBarY + 2, (bossBarW - 4) * bossHpRatio, bossBarH - 4);
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, this.width, this.height);

        this.shake.apply(ctx);
        this.starfield.draw(ctx);

        if (this.state === 'CUTSCENE') {
            this.cutscenes.draw(ctx);
            ctx.restore();
            return;
        }

        this.powerUps.forEach(p => p.draw(ctx));
        this.playerBullets.forEach(b => b.draw(ctx));
        this.enemyBullets.forEach(b => b.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));

        if (this.currentBoss) {
            this.currentBoss.draw(ctx);
        }

        this.player.draw(ctx);
        this.particles.draw(ctx);

        if (this.state === 'BOSS_WARNING') {
            ctx.save();
            const flash = Math.sin(Date.now() * 0.015) > 0;
            if (flash) {
                ctx.fillStyle = 'rgba(255, 0, 50, 0.15)';
                ctx.fillRect(0, 0, this.width, this.height);

                ctx.font = 'bold 34px Orbitron, sans-serif';
                ctx.fillStyle = '#ff0055';
                ctx.shadowColor = '#ff0055';
                ctx.shadowBlur = 20;
                ctx.textAlign = 'center';
                ctx.fillText("⚠️ WARNING: BOSS APPROACHING ⚠️", this.width / 2, this.height * 0.45);
            }
            ctx.restore();
        }

        this.drawHUD();
        ctx.restore();
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    run() {
        requestAnimationFrame(() => this.loop());
    }
}

window.onload = () => {
    window.game = new Game();
    window.game.run();
};
