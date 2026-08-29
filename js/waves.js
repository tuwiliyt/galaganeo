// 10 Distinct Dynamic Wave Formations, Squadron Entry Paths, and Escalating Fleet Compositions

class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentStage = 1;
        this.currentWave = 1;
        this.totalWavesPerStage = 10;
        this.isWaveInProgress = false;
        this.waveTransitionTimer = 0;
    }

    reset() {
        this.currentStage = 1;
        this.currentWave = 1;
        this.isWaveInProgress = false;
        this.waveTransitionTimer = 0;
    }

    startStage(stageNum, waveNum = 1) {
        this.currentStage = stageNum;
        this.currentWave = waveNum;
        this.isWaveInProgress = false;
        this.startWave(this.currentWave);
    }

    startWave(waveNum) {
        this.currentWave = waveNum;
        this.isWaveInProgress = true;
        this.game.enemies = [];

        // Wave 10 is the Climax Boss Encounter
        if (this.currentWave === 10) {
            this.game.triggerBossEncounter(this.currentStage);
            return;
        }

        // Announcement Banner
        const waveNames = [
            "WAVE 1: CLASSIC V-SHAPE SQUADRON",
            "WAVE 2: TWIN FLANKING COLUMNS",
            "WAVE 3: ARROWHEAD ASSAULT WEDGE",
            "WAVE 4: SNIPER CROSSFIRE DIAMOND",
            "WAVE 5: CRESCENT PINCER ARC",
            "WAVE 6: STEPPED MATRIX WALL",
            "WAVE 7: SPIRAL SWIRL INVASION",
            "WAVE 8: DOUBLE PHALANX ARMADA",
            "WAVE 9: SINGULARITY CHAOS VORTEX"
        ];
        const bannerText = waveNames[this.currentWave - 1] || `WAVE ${this.currentWave}`;
        if (this.game.particles) {
            this.game.particles.spawnFloatingText(bannerText, this.game.width / 2, this.game.height * 0.4, '#00f0ff', 24);
        }
        window.audio.playPowerup();

        this.spawnWaveFormation(this.currentWave);
    }

    spawnWaveFormation(waveNum) {
        const cx = this.game.width / 2;
        const cy = 150;
        const enemiesToSpawn = [];

        switch (waveNum) {
            case 1: { // 8 Ships V-Shape
                const count = 8;
                for (let i = 0; i < count; i++) {
                    const side = i % 2 === 0 ? 1 : -1;
                    const step = Math.floor(i / 2) + 1;
                    const gx = cx + side * (step * 45);
                    const gy = cy + (step * 30);
                    const type = step === 1 ? 'INTERCEPTOR' : 'DRONE';
                    const path = this.generateEntryPath(side > 0 ? 'RIGHT' : 'LEFT', gx, gy);
                    enemiesToSpawn.push(new Enemy(this.game, type, gx, gy, path));
                }
                break;
            }
            case 2: { // 10 Ships Twin Columns
                for (let i = 0; i < 5; i++) {
                    const gy = cy - 20 + i * 38;
                    const type = i === 0 ? 'STRIKER' : 'INTERCEPTOR';
                    enemiesToSpawn.push(new Enemy(this.game, type, cx - 120, gy, this.generateEntryPath('LEFT', cx - 120, gy)));
                    enemiesToSpawn.push(new Enemy(this.game, type, cx + 120, gy, this.generateEntryPath('RIGHT', cx + 120, gy)));
                }
                break;
            }
            case 3: { // 12 Ships Arrowhead Wedge
                enemiesToSpawn.push(new Enemy(this.game, 'COMMANDER', cx, cy - 40, this.generateEntryPath('TOP', cx, cy - 40)));
                for (let i = 1; i <= 5; i++) {
                    const type = i % 2 === 0 ? 'STRIKER' : 'DRONE';
                    enemiesToSpawn.push(new Enemy(this.game, type, cx - i * 40, cy - 40 + i * 35, this.generateEntryPath('LEFT', cx - i * 40, cy - 40 + i * 35)));
                    enemiesToSpawn.push(new Enemy(this.game, type, cx + i * 40, cy - 40 + i * 35, this.generateEntryPath('RIGHT', cx + i * 40, cy - 40 + i * 35)));
                }
                break;
            }
            case 4: { // 12 Ships Diamond Crossfire
                enemiesToSpawn.push(new Enemy(this.game, 'SNIPER', cx, cy - 50, this.generateEntryPath('TOP', cx, cy - 50)));
                enemiesToSpawn.push(new Enemy(this.game, 'SNIPER', cx, cy + 70, this.generateEntryPath('TOP', cx, cy + 70)));
                enemiesToSpawn.push(new Enemy(this.game, 'MINELAYER', cx - 110, cy + 10, this.generateEntryPath('LEFT', cx - 110, cy + 10)));
                enemiesToSpawn.push(new Enemy(this.game, 'MINELAYER', cx + 110, cy + 10, this.generateEntryPath('RIGHT', cx + 110, cy + 10)));
                for (let i = 1; i <= 4; i++) {
                    enemiesToSpawn.push(new Enemy(this.game, 'INTERCEPTOR', cx - 55, cy - 30 + i * 25, this.generateEntryPath('LEFT', cx - 55, cy - 30 + i * 25)));
                    enemiesToSpawn.push(new Enemy(this.game, 'INTERCEPTOR', cx + 55, cy - 30 + i * 25, this.generateEntryPath('RIGHT', cx + 55, cy - 30 + i * 25)));
                }
                break;
            }
            case 5: { // 14 Ships Crescent Pincer Arc
                const total = 14;
                for (let i = 0; i < total; i++) {
                    const angle = Math.PI * 0.15 + (i / (total - 1)) * (Math.PI * 0.7);
                    const gx = cx + Math.cos(angle) * 230;
                    const gy = cy + Math.sin(angle) * 90 - 40;
                    let type = 'DRONE';
                    if (i === 0 || i === total - 1) type = 'WARP_HUNTER';
                    else if (i === Math.floor(total / 2) || i === Math.floor(total / 2) - 1) type = 'COMMANDER';
                    else if (i % 2 === 0) type = 'STRIKER';
                    enemiesToSpawn.push(new Enemy(this.game, type, gx, gy, this.generateEntryPath(gx < cx ? 'LEFT' : 'RIGHT', gx, gy)));
                }
                break;
            }
            case 6: { // 16 Ships Stepped Matrix Wall
                for (let row = 0; row < 2; row++) {
                    for (let col = 0; col < 8; col++) {
                        const gx = cx - 210 + col * 60;
                        const gy = cy - 30 + row * 45;
                        let type = row === 0 ? (col % 2 === 0 ? 'SENTINEL' : 'SNIPER') : (col % 2 === 0 ? 'PHANTOM' : 'STRIKER');
                        enemiesToSpawn.push(new Enemy(this.game, type, gx, gy, this.generateEntryPath(col < 4 ? 'LEFT' : 'RIGHT', gx, gy)));
                    }
                }
                break;
            }
            case 7: { // 16 Ships Concentric Spiral Swirl
                for (let i = 0; i < 16; i++) {
                    const rad = 60 + (i % 2) * 80;
                    const ang = (i / 8) * Math.PI * 2;
                    const gx = cx + Math.cos(ang) * rad;
                    const gy = cy + Math.sin(ang) * (rad * 0.7);
                    let type = i % 4 === 0 ? 'SPLITTER' : (i % 3 === 0 ? 'WARP_HUNTER' : 'INTERCEPTOR');
                    enemiesToSpawn.push(new Enemy(this.game, type, gx, gy, this.generateEntryPath(ang > Math.PI ? 'TOP' : 'BOTTOM', gx, gy)));
                }
                break;
            }
            case 8: { // 18 Ships Double Phalanx Armada
                for (let r = 0; r < 2; r++) {
                    for (let c = 0; c < 9; c++) {
                        const gx = cx - 240 + c * 60;
                        const gy = cy - 40 + r * 50;
                        let type = r === 0 ? 'SENTINEL' : (c % 2 === 0 ? 'MINELAYER' : 'COMMANDER');
                        enemiesToSpawn.push(new Enemy(this.game, type, gx, gy, this.generateEntryPath(c % 2 === 0 ? 'LEFT' : 'RIGHT', gx, gy)));
                    }
                }
                break;
            }
            case 9: { // 20 Ships Singularity Chaos Vortex
                enemiesToSpawn.push(new Enemy(this.game, 'COMMANDER', cx - 60, cy - 40, this.generateEntryPath('TOP', cx - 60, cy - 40)));
                enemiesToSpawn.push(new Enemy(this.game, 'COMMANDER', cx + 60, cy - 40, this.generateEntryPath('TOP', cx + 60, cy - 40)));
                enemiesToSpawn.push(new Enemy(this.game, 'SENTINEL', cx, cy - 10, this.generateEntryPath('TOP', cx, cy - 10)));
                
                for (let i = 0; i < 17; i++) {
                    const ang = (i / 17) * Math.PI * 2;
                    const radX = 220;
                    const radY = 100;
                    const gx = cx + Math.cos(ang) * radX;
                    const gy = cy + Math.sin(ang) * radY;
                    const types = ['WARP_HUNTER', 'SNIPER', 'SPLITTER', 'PHANTOM', 'STRIKER'];
                    const type = types[i % types.length];
                    enemiesToSpawn.push(new Enemy(this.game, type, gx, gy, this.generateEntryPath(gx < cx ? 'LEFT' : 'RIGHT', gx, gy)));
                }
                break;
            }
        }

        // Staggered entry deployment
        enemiesToSpawn.forEach((enemy, idx) => {
            setTimeout(() => {
                if (this.game.state === 'PLAYING') {
                    this.game.enemies.push(enemy);
                }
            }, idx * 110);
        });
    }

    generateEntryPath(origin, targetX, targetY) {
        const path = [];
        const w = this.game.width;
        const h = this.game.height;

        if (origin === 'LEFT') {
            path.push({ x: -40, y: 100 });
            path.push({ x: 120, y: 220 });
            path.push({ x: targetX - 50, y: targetY + 60 });
            path.push({ x: targetX, y: targetY });
        } else if (origin === 'RIGHT') {
            path.push({ x: w + 40, y: 100 });
            path.push({ x: w - 120, y: 220 });
            path.push({ x: targetX + 50, y: targetY + 60 });
            path.push({ x: targetX, y: targetY });
        } else if (origin === 'BOTTOM') {
            path.push({ x: targetX > w / 2 ? w + 30 : -30, y: h * 0.7 });
            path.push({ x: targetX, y: targetY + 90 });
            path.push({ x: targetX, y: targetY });
        } else {
            path.push({ x: targetX, y: -50 });
            path.push({ x: targetX + (targetX > w / 2 ? -60 : 60), y: 120 });
            path.push({ x: targetX, y: targetY });
        }
        return path;
    }

    update() {
        // Wave state processing
    }

    checkWaveCompletion() {
        if (!this.isWaveInProgress || this.currentWave === 10) return;

        if (this.game.enemies.length === 0) {
            this.isWaveInProgress = false;
            if (this.game.particles) {
                this.game.particles.spawnFloatingText(`WAVE ${this.currentWave} CLEARED!`, this.game.width / 2, this.game.height * 0.45, '#39ff14', 22);
            }
            window.audio.playPowerup();

            const waveBonus = this.currentWave * 500 * this.currentStage;
            this.game.addScore(waveBonus, this.game.width / 2, this.game.height * 0.5);

            setTimeout(() => {
                if (this.game.state === 'PLAYING') {
                    this.startWave(this.currentWave + 1);
                }
            }, 1800);
        }
    }
}
