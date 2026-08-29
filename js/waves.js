// 10 Distinct Waves with Unique Geometric Formations (V-Shape, Diamond, Crescent, Double Phalanx, etc.)

class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentStage = 1;
        this.currentWave = 1;
        this.totalWavesPerStage = 10;
        
        this.isSpawningWave = false;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveState = 'IDLE';
        this.stateTimer = 0;

        this.waveInfo = {
            1: [
                { title: "WAVE 1: V-FORMATION SCOUTS", desc: "Formasi V Klasik • Drone Pengintai" },
                { title: "WAVE 2: TWIN COLUMN INTERCEPTORS", desc: "Dua Kolom Manuver • Interceptor Cepat" },
                { title: "WAVE 3: ARROWHEAD WEDGE", desc: "Formasi Mata Panah • Striker Tembakan Ganda" },
                { title: "WAVE 4: SNIPER CROSSFIRE DIAMOND", desc: "Bidikan Laser Terarah • Diamond Formation" },
                { title: "WAVE 5: CRESCENT PINCER ARC", desc: "Formasi Busur Menjepit • Pasukan Lapis Baja" },
                { title: "WAVE 6: STEPPED MATRIX WALL", desc: "Tembok Berundak • Serangan Menyilang" },
                { title: "WAVE 7: SPIRAL SWIRL INVASION", desc: "Pusaran Melingkar • Pasukan Tempur Elit" },
                { title: "WAVE 8: DOUBLE PHALANX FLEET", desc: "Barikade Ganda • Armada Kapal Tempur Berat" },
                { title: "WAVE 9: SINGULARITY CHAOS VORTEX", desc: "Serbuan Habis-habisan 20 Pesawat Tempur" },
                { title: "WAVE 10: BOSS - IRON MANTIS", desc: "⚠️ CLIMAX BOSS STAGE 1: MECHA INSECT CRUISER ⚠️" }
            ],
            2: [
                { title: "WAVE 1: MINELAYER PERIMETER", desc: "Ranjau Melayang • Formasi Perimeter" },
                { title: "WAVE 2: TRACTOR BEAM PINCH", desc: "Penyedotan Sinar Penarik • Komandan Void" },
                { title: "WAVE 3: STEALTH PHANTOM DIAMOND", desc: "Formasi Siluman • Kamuflase Penghilang Jejak" },
                { title: "WAVE 4: BIO-SPLITTER HORDE", desc: "Pecahan Mini-Drone • Bio-Alien Hijau" },
                { title: "WAVE 5: SNIPER & MINE COMBINED WING", desc: "Kombinasi Ranjau Peledak & Railgun" },
                { title: "WAVE 6: DUAL TRACTOR CAPTOR DUO", desc: "Pengepungan Ganda Sinar Penarik" },
                { title: "WAVE 7: SPLITTER PHALANX", desc: "Barisan Pembelah Massal" },
                { title: "WAVE 8: VOID CRUISER ARMADA", desc: "Armada Tempur Angkasa Luar" },
                { title: "WAVE 9: TOTAL VOID SIEGE", desc: "Pengepungan Total Skuadron Void" },
                { title: "WAVE 10: BOSS - VOID DREADNOUGHT", desc: "⚠️ CLIMAX BOSS STAGE 2: CARRIER MOTHERSHIP ⚠️" }
            ],
            3: [
                { title: "WAVE 1: CYBER SENTINEL HEXAGON", desc: "Perisai Berputar • Benteng Heksagonal" },
                { title: "WAVE 2: WARP HUNTER FLANKERS", desc: "Teleportasi Kilat • Manuver Menghindar" },
                { title: "WAVE 3: DANMAKU SPINNER RING", desc: "Pola Peluru Spiral Geometris" },
                { title: "WAVE 4: MATRIX COMMAND FLEET", desc: "Komando Matriks Terpadu" },
                { title: "WAVE 5: CHAOS SPLITTER CORPS", desc: "Pasukan Pembelah Multidimensi" },
                { title: "WAVE 6: SENTINEL & SNIPER VANGUARD", desc: "Bidikan Laser Penetrasi Tinggi" },
                { title: "WAVE 7: PHANTOM WARP SIEGE", desc: "Pengepungan Siluman & Teleportasi" },
                { title: "WAVE 8: OVERDRIVE MATRIX ARMADA", desc: "Armada Pertahanan Inti Matriks" },
                { title: "WAVE 9: EVENT HORIZON SINGULARITY", desc: "Serbuan Pamungkas Menuju Inti" },
                { title: "WAVE 10: FINAL BOSS - OMEGA CORE", desc: "⚠️ FINAL BOSS: SUPREME MATRIX CORE ⚠️" }
            ]
        };
    }

    reset() {
        this.currentStage = 1;
        this.currentWave = 1;
        this.isSpawningWave = false;
        this.spawnQueue = [];
        this.waveState = 'IDLE';
    }

    generateBezierPoints(p0, p1, p2, p3, steps = 30) {
        const points = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            const uuu = uu * u;
            const ttt = tt * t;

            const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
            const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
            points.push({ x, y });
        }
        return points;
    }

    startStage(stageNum, startWave = 1) {
        this.currentStage = stageNum;
        this.currentWave = startWave;
        this.totalWavesPerStage = 10;
        this.announceAndStartWave();
    }

    announceAndStartWave() {
        this.waveState = 'ANNOUNCING';
        this.stateTimer = 90;

        const info = (this.waveInfo[this.currentStage] && this.waveInfo[this.currentStage][this.currentWave - 1]) 
            ? this.waveInfo[this.currentStage][this.currentWave - 1] 
            : { title: `WAVE ${this.currentWave} / 10`, desc: "Invasion Force" };

        this.game.particles.spawnFloatingText(info.title, this.game.width / 2, this.game.height * 0.4, '#00f0ff', 24);
        this.game.particles.spawnFloatingText(info.desc, this.game.width / 2, this.game.height * 0.46, '#ffea00', 16);
    }

    buildWaveSpawns() {
        this.isSpawningWave = true;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveState = 'SPAWNING';

        if (this.currentWave === 10) {
            this.isSpawningWave = false;
            this.waveState = 'BOSS_PREP';
            this.game.triggerBossEncounter(this.currentStage);
            return;
        }

        const w = this.game.width;
        const s = this.currentStage;
        const wv = this.currentWave;

        // Path generator helpers
        const pathLeftLoop = (targetX, targetY) => this.generateBezierPoints(
            { x: -40, y: 100 }, { x: w * 0.7, y: 150 }, { x: w * 0.1, y: 320 }, { x: targetX, y: targetY }, 28
        );
        const pathRightLoop = (targetX, targetY) => this.generateBezierPoints(
            { x: w + 40, y: 100 }, { x: w * 0.3, y: 150 }, { x: w * 0.9, y: 320 }, { x: targetX, y: targetY }, 28
        );
        const pathTopDrop = (targetX, targetY) => this.generateBezierPoints(
            { x: targetX, y: -40 }, { x: targetX + 40, y: 120 }, { x: targetX - 40, y: 180 }, { x: targetX, y: targetY }, 28
        );

        // --- FORMATION GEOMETRIES PER WAVE ---

        if (wv === 1) {
            // 🌟 FORMATION 1: CLASSIC V-SHAPE (8 Enemies)
            const count = 8;
            for (let i = 0; i < count; i++) {
                const side = i % 2 === 0 ? -1 : 1;
                const dist = Math.floor(i / 2) + 1;
                const gx = (w / 2) + side * (dist * 42);
                const gy = 60 + dist * 22;
                const type = (s === 1) ? 'DRONE' : (s === 2 ? 'MINELAYER' : 'SENTINEL');
                const path = side === -1 ? pathLeftLoop(gx, gy) : pathRightLoop(gx, gy);
                this.spawnQueue.push({ type, gx, gy, path, delay: i * 8 });
            }
        } 
        else if (wv === 2) {
            // 🌟 FORMATION 2: TWIN FLANKING COLUMNS (10 Enemies)
            for (let col = 0; col < 2; col++) {
                const sideX = col === 0 ? 160 : w - 160;
                for (let r = 0; r < 5; r++) {
                    const gx = sideX + (r % 2 === 0 ? -15 : 15);
                    const gy = 60 + r * 28;
                    const type = (s === 1) ? 'INTERCEPTOR' : (s === 2 ? 'COMMANDER' : 'WARP_HUNTER');
                    const path = col === 0 ? pathLeftLoop(gx, gy) : pathRightLoop(gx, gy);
                    this.spawnQueue.push({ type, gx, gy, path, delay: (col * 5 + r) * 7 });
                }
            }
        }
        else if (wv === 3) {
            // 🌟 FORMATION 3: ARROWHEAD WEDGE (12 Enemies)
            const rows = 4;
            let idx = 0;
            for (let r = 0; r < rows; r++) {
                const countInRow = r * 2 + 1;
                const startRowX = (w / 2) - (r * 40);
                for (let c = 0; c < countInRow; c++) {
                    if (idx >= 12) break;
                    const gx = startRowX + c * 40;
                    const gy = 55 + r * 26;
                    const type = (s === 1) ? 'STRIKER' : (s === 2 ? 'PHANTOM' : 'DANMAKU_SPINNER');
                    const path = c % 2 === 0 ? pathLeftLoop(gx, gy) : pathRightLoop(gx, gy);
                    this.spawnQueue.push({ type: (type === 'DANMAKU_SPINNER' ? 'SENTINEL' : type), gx, gy, path, delay: idx * 6 });
                    idx++;
                }
            }
        }
        else if (wv === 4) {
            // 🌟 FORMATION 4: DIAMOND CROSSFIRE (14 Enemies with Snipers at Core)
            const diamondCoords = [
                { x: 0, y: -40, type: 'SNIPER' },
                { x: -50, y: -20, type: 'STRIKER' }, { x: 50, y: -20, type: 'STRIKER' },
                { x: -90, y: 0, type: 'INTERCEPTOR' }, { x: -30, y: 0, type: 'SNIPER' }, { x: 30, y: 0, type: 'SNIPER' }, { x: 90, y: 0, type: 'INTERCEPTOR' },
                { x: -50, y: 20, type: 'STRIKER' }, { x: 50, y: 20, type: 'STRIKER' },
                { x: 0, y: 40, type: 'SNIPER' },
                { x: -140, y: 0, type: 'DRONE' }, { x: 140, y: 0, type: 'DRONE' },
                { x: -180, y: 20, type: 'DRONE' }, { x: 180, y: 20, type: 'DRONE' }
            ];

            diamondCoords.forEach((pt, i) => {
                const gx = (w / 2) + pt.x;
                const gy = 90 + pt.y;
                let actualType = pt.type;
                if (s === 2 && actualType === 'STRIKER') actualType = 'SPLITTER';
                if (s === 3 && actualType === 'STRIKER') actualType = 'WARP_HUNTER';

                const path = pt.x < 0 ? pathLeftLoop(gx, gy) : pathRightLoop(gx, gy);
                this.spawnQueue.push({ type: actualType, gx, gy, path, delay: i * 6 });
            });
        }
        else if (wv === 5) {
            // 🌟 FORMATION 5: CRESCENT PINCER ARC (16 Enemies)
            for (let i = 0; i < 16; i++) {
                const angle = Math.PI * 0.15 + (i / 15) * Math.PI * 0.7;
                const radius = 220;
                const gx = (w / 2) - Math.cos(angle) * radius;
                const gy = 180 - Math.sin(angle) * 110;
                
                let type = (i === 7 || i === 8) ? 'COMMANDER' : ((i % 3 === 0) ? 'SNIPER' : 'STRIKER');
                if (s === 2) type = (i % 2 === 0) ? 'MINELAYER' : 'SPLITTER';
                if (s === 3) type = (i % 2 === 0) ? 'SENTINEL' : 'WARP_HUNTER';

                const path = gx < w / 2 ? pathLeftLoop(gx, gy) : pathRightLoop(gx, gy);
                this.spawnQueue.push({ type, gx, gy, path, delay: i * 5 });
            }
        }
        else if (wv === 6) {
            // 🌟 FORMATION 6: STEPPED MATRIX WALL (16 Enemies in 2 offset rows)
            for (let r = 0; r < 2; r++) {
                const count = 8;
                const spacing = (w - 140) / (count - 1);
                const offsetX = r * 20;
                for (let c = 0; c < count; c++) {
                    const gx = 70 + offsetX + c * spacing;
                    const gy = 60 + r * 38;
                    let type = (c % 2 === 0) ? 'SNIPER' : 'STRIKER';
                    if (s === 2) type = (c % 2 === 0) ? 'COMMANDER' : 'PHANTOM';
                    if (s === 3) type = (c % 2 === 0) ? 'SENTINEL' : 'WARP_HUNTER';

                    const path = r === 0 ? pathLeftLoop(gx, gy) : pathRightLoop(gx, gy);
                    this.spawnQueue.push({ type, gx, gy, path, delay: (r * 8 + c) * 5 });
                }
            }
        }
        else if (wv === 7) {
            // 🌟 FORMATION 7: SPIRAL SWIRL INVASION (16 Fast Interceptors & Elites)
            for (let i = 0; i < 16; i++) {
                const ring = Math.floor(i / 8);
                const posInRing = i % 8;
                const rad = 80 + ring * 65;
                const ang = (posInRing / 8) * Math.PI * 2;
                const gx = (w / 2) + Math.cos(ang) * rad;
                const gy = 110 + Math.sin(ang) * (rad * 0.55);

                let type = ring === 0 ? 'INTERCEPTOR' : 'SNIPER';
                if (s === 2) type = ring === 0 ? 'SPLITTER' : 'MINELAYER';
                if (s === 3) type = ring === 0 ? 'WARP_HUNTER' : 'SENTINEL';

                const path = pathTopDrop(gx, gy);
                this.spawnQueue.push({ type, gx, gy, path, delay: i * 5 });
            }
        }
        else if (wv === 8) {
            // 🌟 FORMATION 8: DOUBLE PHALANX ARMADA (18 Heavy Enemies)
            for (let r = 0; r < 2; r++) {
                const count = 9;
                const spacing = (w - 120) / (count - 1);
                for (let c = 0; c < count; c++) {
                    const gx = 60 + c * spacing;
                    const gy = 60 + r * 35;
                    let type = (r === 0) ? 'STRIKER' : 'SNIPER';
                    if (c === 4) type = 'COMMANDER';
                    if (s === 2 && r === 1) type = 'MINELAYER';
                    if (s === 3) type = (c % 2 === 0) ? 'SENTINEL' : 'WARP_HUNTER';

                    const path = c < 5 ? pathLeftLoop(gx, gy) : pathRightLoop(gx, gy);
                    this.spawnQueue.push({ type, gx, gy, path, delay: (r * 9 + c) * 4 });
                }
            }
        }
        else if (wv === 9) {
            // 🌟 FORMATION 9: SINGULARITY CHAOS VORTEX (20 Elite Armada before Boss!)
            for (let i = 0; i < 20; i++) {
                const col = i % 10;
                const row = Math.floor(i / 10);
                const spacing = (w - 100) / 9;
                const gx = 50 + col * spacing;
                const gy = 55 + row * 40;

                let type = (i % 4 === 0) ? 'COMMANDER' : ((i % 3 === 0) ? 'SNIPER' : 'INTERCEPTOR');
                if (s === 2) type = (i % 3 === 0) ? 'SPLITTER' : ((i % 2 === 0) ? 'PHANTOM' : 'MINELAYER');
                if (s === 3) type = (i % 3 === 0) ? 'SENTINEL' : ((i % 2 === 0) ? 'WARP_HUNTER' : 'COMMANDER');

                const path = i % 2 === 0 ? pathLeftLoop(gx, gy) : pathRightLoop(gx, gy);
                this.spawnQueue.push({ type, gx, gy, path, delay: i * 4 });
            }
        }
    }

    update() {
        if (this.waveState === 'ANNOUNCING') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.buildWaveSpawns();
            }
            return;
        }

        if (this.waveState === 'CLEARED') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.currentWave++;
                this.announceAndStartWave();
            }
            return;
        }

        if (this.isSpawningWave) {
            this.spawnTimer++;
            for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
                const item = this.spawnQueue[i];
                if (this.spawnTimer >= item.delay) {
                    const enemy = new Enemy(this.game, item.type, item.gx, item.gy, item.path);
                    this.game.enemies.push(enemy);
                    this.spawnQueue.splice(i, 1);
                }
            }

            if (this.spawnQueue.length === 0) {
                this.isSpawningWave = false;
                this.waveState = 'COMBAT';
            }
        }
    }

    checkWaveCompletion() {
        if (this.waveState !== 'COMBAT' || this.isSpawningWave || this.game.enemies.length > 0 || this.game.currentBoss) return;

        this.waveState = 'CLEARED';
        this.stateTimer = 60;
        window.audio.playPowerup();

        this.game.addScore(500 * this.currentWave, this.game.width / 2, this.game.height * 0.45);
        this.game.particles.spawnFloatingText(`✓ WAVE ${this.currentWave} COMPLETED!`, this.game.width / 2, this.game.height * 0.42, '#39ff14', 24);
    }
}
