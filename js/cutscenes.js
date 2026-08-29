// Cinematic Cutscene Engine: Letterboxing, Typewriter Dialog, Cyber Hologram Avatars, and 2D Vector Choreography

class CutsceneManager {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.currentScene = null;
        this.stepIndex = 0;
        this.charIndex = 0;
        this.typewriterTimer = 0;
        this.animTimer = 0;
        this.letterboxHeight = 0;
        this.targetLetterbox = 0;
        this.onCompleteCallback = null;

        this.scenes = {
            PROLOGUE: {
                id: 'PROLOGUE',
                bgType: 'WARP_DOCK',
                steps: [
                    {
                        speaker: "COMMANDER VANCE",
                        title: "EARTH DEFENSE FLEET - SECTOR 7",
                        avatar: "HUMAN_COMMANDER",
                        color: "#00f0ff",
                        text: "Pilot neo-1! Radar kami mendeteksi pergerakan masif armada alien tak dikenal menuju garis orbit Bumi."
                    },
                    {
                        speaker: "COMMANDER VANCE",
                        title: "MISSION OBJECTIVE",
                        avatar: "HUMAN_COMMANDER",
                        color: "#00f0ff",
                        text: "Luncurkan pesawat tempur Neo-Galaga sekarang! Tembus barisan armada terdepan dan amankan Stasiun Alpha!"
                    },
                    {
                        speaker: "AI ONBOARD SYSTEM",
                        title: "SYSTEM READY",
                        avatar: "AI_CORE",
                        color: "#39ff14",
                        text: "Reaktor plasma 100% online. Kontrol navigasi mouse dan EMP Bomb siap digunakan. Meluncur dalam 3... 2... 1!"
                    }
                ]
            },

            BOSS_1_INTRO: {
                id: 'BOSS_1_INTRO',
                bgType: 'BOSS_1_REVEAL',
                steps: [
                    {
                        speaker: "WARNING SYSTEM",
                        title: "PROXIMITY ALERT",
                        avatar: "WARNING",
                        color: "#ff0055",
                        text: "⚠️ PERINGATAN: Sinyal energi raksasa terdeteksi di balik reruntuhan satelit orbital!"
                    },
                    {
                        speaker: "IRON MANTIS",
                        title: "MECHA-INSECT DREAD CRUISER",
                        avatar: "MANTIS_BOSS",
                        color: "#ff7700",
                        text: "TARGET TERKUNCI. MEMULAI PROTOKOL PEMBASMIAN ORGANIK. MATILAH, PENYUSUP!"
                    }
                ]
            },

            STAGE_1_CLEAR_WARP: {
                id: 'STAGE_1_CLEAR_WARP',
                bgType: 'HYPERDRIVE',
                steps: [
                    {
                        speaker: "COMMANDER VANCE",
                        title: "SECTOR 1 SECURED",
                        avatar: "HUMAN_COMMANDER",
                        color: "#00f0ff",
                        text: "Kerja bagus, Pilot! Iron Mantis berhasil dilumpuhkan. Namun sinyal komando utama mereka terlacak di Sabuk Asteroid."
                    },
                    {
                        speaker: "AI ONBOARD SYSTEM",
                        title: "WARPING TO SECTOR 2",
                        avatar: "AI_CORE",
                        color: "#39ff14",
                        text: "Memulai loncatan Hyperdrive menuju Asteroid Core. Bersiap untuk pertempuran di zona gravitasi tinggi!"
                    }
                ]
            },

            BOSS_2_INTRO: {
                id: 'BOSS_2_INTRO',
                bgType: 'BOSS_2_REVEAL',
                steps: [
                    {
                        speaker: "AI ONBOARD SYSTEM",
                        title: "SCANNER OVERLOAD",
                        avatar: "AI_CORE",
                        color: "#bf00ff",
                        text: "Medan gravitasi lokal terganggu! Kapal induk musuh sedang keluar dari kamuflase nebula ungu!"
                    },
                    {
                        speaker: "VOID DREADNOUGHT",
                        title: "VOID SUPREME OVERLORD",
                        avatar: "VOID_BOSS",
                        color: "#e000ff",
                        text: "KAU BERANI MEMASUKI SARANG VOID KAMI? SERAHKAN KAPALMU KEPADA SINAR TRAKTOR KAMI!"
                    }
                ]
            },

            STAGE_2_CLEAR_WARP: {
                id: 'STAGE_2_CLEAR_WARP',
                bgType: 'SINGULARITY_APPROACH',
                steps: [
                    {
                        speaker: "COMMANDER VANCE",
                        title: "CRITICAL BROADCAST",
                        avatar: "HUMAN_COMMANDER",
                        color: "#00f0ff",
                        text: "Luar biasa! Void Dreadnought telah hancur. Inti alien telah mundur ke dalam Singularity Nebula!"
                    },
                    {
                        speaker: "AI ONBOARD SYSTEM",
                        title: "EVENT HORIZON DETECTED",
                        avatar: "AI_CORE",
                        color: "#ff0077",
                        text: "Memasuki zona Event Horizon. Hukum fisika mulai terdistorsi. Pertahankan fokus penuh, Pilot!"
                    }
                ]
            },

            BOSS_3_INTRO: {
                id: 'BOSS_3_INTRO',
                bgType: 'BOSS_3_REVEAL',
                steps: [
                    {
                        speaker: "AI ONBOARD SYSTEM",
                        title: "CORE MATRIX IDENTIFIED",
                        avatar: "AI_CORE",
                        color: "#ffe600",
                        text: "Terdeteksi entitas sibernetik tertinggi: OMEGA CORE MATRIX! Memancarkan gelombang Danmaku spiral!"
                    },
                    {
                        speaker: "OMEGA CORE MATRIX",
                        title: "CYBERNETIC GODHEAD",
                        avatar: "OMEGA_BOSS",
                        color: "#ffe600",
                        text: "WAKTU SPESIES MANUSIA TELAH USAI. SAKSIKAN RESTRUKTURISASI TOTAL SEMESTA INI!"
                    }
                ]
            },

            EPILOGUE: {
                id: 'EPILOGUE',
                bgType: 'VICTORY_SUPERNOVA',
                steps: [
                    {
                        speaker: "AI ONBOARD SYSTEM",
                        title: "CORE COLLAPSE",
                        avatar: "AI_CORE",
                        color: "#39ff14",
                        text: "Omega Core Matrix mengalami reaksi berantai! Singularitas telah runtuh menjadi ledakan supernova terkendali!"
                    },
                    {
                        speaker: "COMMANDER VANCE",
                        title: "ALL FLEET SALUTE",
                        avatar: "HUMAN_COMMANDER",
                        color: "#00f0ff",
                        text: "Pilot, Anda telah menyelamatkan seluruh galaksi dari kehancuran total! Seluruh Bumi menyambut kepulangan Anda sebagai Pahlawan Legendaris!"
                    },
                    {
                        speaker: "NEO-GALAGA SYSTEM",
                        title: "MISSION ACCOMPLISHED",
                        avatar: "AI_CORE",
                        color: "#ffe600",
                        text: "Semua sistem stabil. Mengatur koordinat pulang. TERIMA KASIH TELAH BERJUANG, ACE PILOT!"
                    }
                ]
            }
        };
    }

    playScene(sceneKey, callback = null) {
        if (!this.scenes[sceneKey]) {
            if (callback) callback();
            return;
        }

        this.active = true;
        this.currentScene = this.scenes[sceneKey];
        this.stepIndex = 0;
        this.charIndex = 0;
        this.typewriterTimer = 0;
        this.animTimer = 0;
        this.targetLetterbox = 65; // Letterbox border height
        this.onCompleteCallback = callback;

        window.audio.playPowerup();
    }

    skip() {
        if (!this.active) return;
        this.active = false;
        this.currentScene = null;
        this.letterboxHeight = 0;
        this.targetLetterbox = 0;
        if (this.onCompleteCallback) {
            const cb = this.onCompleteCallback;
            this.onCompleteCallback = null;
            cb();
        }
    }

    advance() {
        if (!this.active || !this.currentScene) return;

        const currentStep = this.currentScene.steps[this.stepIndex];
        // If still typing, finish typing immediately
        if (this.charIndex < currentStep.text.length) {
            this.charIndex = currentStep.text.length;
            return;
        }

        // Advance to next dialog step
        this.stepIndex++;
        this.charIndex = 0;
        this.typewriterTimer = 0;

        if (this.stepIndex >= this.currentScene.steps.length) {
            // Cutscene finished!
            this.skip();
        } else {
            window.audio.playLaser('normal');
        }
    }

    update() {
        if (!this.active) return;

        this.animTimer++;
        // Smooth letterbox transition
        this.letterboxHeight += (this.targetLetterbox - this.letterboxHeight) * 0.15;

        // Typewriter effect
        const currentStep = this.currentScene.steps[this.stepIndex];
        if (currentStep && this.charIndex < currentStep.text.length) {
            this.typewriterTimer++;
            if (this.typewriterTimer % 2 === 0) {
                this.charIndex++;
            }
        }
    }

    draw(ctx) {
        if (!this.active || !this.currentScene) return;

        const w = this.game.width;
        const h = this.game.height;

        ctx.save();

        // 1. Draw Cinematic Visual Background Illustration
        this.drawSceneVisuals(ctx, w, h);

        // 2. Letterbox Black Bars (Top & Bottom Cinema Scope)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, this.letterboxHeight);
        ctx.fillRect(0, h - this.letterboxHeight, w, this.letterboxHeight);

        // Letterbox Neon Accent Lines
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, this.letterboxHeight);
        ctx.lineTo(w, this.letterboxHeight);
        ctx.moveTo(0, h - this.letterboxHeight);
        ctx.lineTo(w, h - this.letterboxHeight);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 3. Dialogue Box (Cyberpunk Glassmorphism Container)
        const boxY = h - 215;
        const boxH = 135;
        const boxW = w - 60;
        const boxX = 30;

        // Box Backdrop
        ctx.fillStyle = 'rgba(8, 12, 30, 0.92)';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        const currentStep = this.currentScene.steps[this.stepIndex];
        const themeColor = currentStep ? currentStep.color : '#00f0ff';

        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 10;
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.shadowBlur = 0;

        // 4. Hologram Avatar Frame (Left Side)
        const avatarSize = 80;
        const avatarX = boxX + 16;
        const avatarY = boxY + (boxH - avatarSize) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(avatarX, avatarY, avatarSize, avatarSize);

        // Draw Holographic Avatar Inside
        this.drawAvatar(ctx, currentStep.avatar, avatarX, avatarY, avatarSize, themeColor);

        // Hologram Scanlines
        ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
        for (let y = avatarY; y < avatarY + avatarSize; y += 4) {
            ctx.fillRect(avatarX, y, avatarSize, 1.5);
        }

        // 5. Speaker Name & Subtitle
        const textX = avatarX + avatarSize + 18;
        ctx.font = 'bold 15px Orbitron, sans-serif';
        ctx.fillStyle = themeColor;
        ctx.textAlign = 'left';
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 6;
        ctx.fillText(currentStep.speaker, textX, boxY + 26);
        ctx.shadowBlur = 0;

        ctx.font = '10px Orbitron, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(currentStep.title, textX, boxY + 40);

        // 6. Typewritten Text
        const displayedText = currentStep.text.substring(0, this.charIndex);
        ctx.font = '14px "Rajdhani", sans-serif';
        ctx.fillStyle = '#ffffff';
        this.wrapText(ctx, displayedText, textX, boxY + 65, boxW - (avatarSize + 45), 20);

        // Blinking Cursor
        if (this.charIndex < currentStep.text.length || Math.floor(this.animTimer / 15) % 2 === 0) {
            ctx.fillStyle = themeColor;
            ctx.fillText(" ▌", textX + ctx.measureText(displayedText.split('\n').pop() || "").width, boxY + 65);
        }

        // 7. Interactive Prompt (Bottom Right of Box)
        ctx.font = '11px Orbitron, sans-serif';
        ctx.fillStyle = (Math.floor(this.animTimer / 20) % 2 === 0) ? '#ffea00' : 'rgba(255, 234, 0, 0.4)';
        ctx.textAlign = 'right';
        ctx.fillText("KLIK / SPACE UNTUK LANJUT ➔", boxX + boxW - 14, boxY + boxH - 12);

        // 8. Top Skip Button Overlay
        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'right';
        ctx.fillText("⏩ [TAP / KLIK SKIP CUTSCENE]", w - 25, 38);

        ctx.restore();
    }

    drawAvatar(ctx, avatarType, x, y, size, color) {
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);

        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;

        if (avatarType === 'HUMAN_COMMANDER') {
            // High-Tech Officer Helmet with visor
            ctx.beginPath();
            ctx.arc(0, -5, 22, 0, Math.PI * 2);
            ctx.fill();

            // Glowing Visor
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(0, -6, 16, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.ellipse(0, -6, 12, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Collar Armor
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(-20, 20);
            ctx.lineTo(0, 10);
            ctx.lineTo(20, 20);
            ctx.lineTo(24, 32);
            ctx.lineTo(-24, 32);
            ctx.closePath();
            ctx.fill();
        } else if (avatarType === 'AI_CORE') {
            // Rotating Cyber AI Eye
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fill();

            // Crosshair ticks
            const tick = (this.animTimer * 0.05);
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(Math.cos(tick) * 24, Math.sin(tick) * 24);
            ctx.lineTo(Math.cos(tick) * 14, Math.sin(tick) * 14);
            ctx.stroke();
        } else if (avatarType === 'MANTIS_BOSS') {
            // Menacing Mecha Mantis Face
            ctx.beginPath();
            ctx.moveTo(0, 18);
            ctx.lineTo(18, -12);
            ctx.lineTo(-18, -12);
            ctx.closePath();
            ctx.fill();

            // Twin Red Eyes
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(-8, -4, 4, 0, Math.PI * 2);
            ctx.arc(8, -4, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (avatarType === 'VOID_BOSS') {
            // Void Carrier Core with tractor vortex
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ff00aa';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (avatarType === 'OMEGA_BOSS') {
            // Polyhedron Matrix
            ctx.rotate(this.animTimer * 0.03);
            ctx.strokeRect(-16, -16, 32, 32);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = '#ffe600';
            ctx.fillRect(-10, -10, 20, 20);
        } else {
            // Warning Icon
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("⚠️", 0, 0);
        }

        ctx.restore();
    }

    drawSceneVisuals(ctx, w, h) {
        const bgType = this.currentScene.bgType;
        const t = this.animTimer;

        if (bgType === 'WARP_DOCK') {
            // Orbital catapult dock with hero ship engine spooling up
            ctx.save();
            ctx.translate(w / 2, h * 0.38);

            // Docking gate rings
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 3;
            for (let i = 1; i <= 3; i++) {
                const sz = (i * 90 + t * 2) % 270;
                ctx.strokeRect(-sz, -sz * 0.6, sz * 2, sz * 1.2);
            }

            // Hero Ship launching forward
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 20;
            this.game.player.drawShip(ctx, 0, 0);

            // Giant engine flame burst
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.moveTo(-10, 20);
            ctx.lineTo(0, 70 + Math.sin(t * 0.3) * 15);
            ctx.lineTo(10, 20);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } 
        else if (bgType === 'BOSS_1_REVEAL') {
            // Iron Mantis de-cloaking with glowing red eyes and sparks
            ctx.save();
            ctx.translate(w / 2, h * 0.35);
            ctx.shadowColor = '#ff5500';
            ctx.shadowBlur = 25;

            // Mantis Silhouette
            ctx.fillStyle = '#ff5500';
            ctx.beginPath();
            ctx.moveTo(0, -40);
            ctx.lineTo(50, -10);
            ctx.lineTo(70, 30);
            ctx.lineTo(0, 60);
            ctx.lineTo(-70, 30);
            ctx.lineTo(-50, -10);
            ctx.closePath();
            ctx.fill();

            // Twin pincers
            const pincerAng = Math.sin(t * 0.1) * 0.3;
            ctx.save();
            ctx.translate(-60, 10);
            ctx.rotate(-pincerAng);
            ctx.fillRect(-30, 0, 25, 45);
            ctx.restore();

            ctx.save();
            ctx.translate(60, 10);
            ctx.rotate(pincerAng);
            ctx.fillRect(5, 0, 25, 45);
            ctx.restore();
            ctx.restore();
        }
        else if (bgType === 'HYPERDRIVE') {
            // Warp streak stars
            ctx.save();
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2.5;
            for (let i = 0; i < 40; i++) {
                const ang = (i / 40) * Math.PI * 2;
                const len = 80 + (t * 6 + i * 15) % 300;
                ctx.beginPath();
                ctx.moveTo(w / 2 + Math.cos(ang) * (len * 0.2), h * 0.38 + Math.sin(ang) * (len * 0.2));
                ctx.lineTo(w / 2 + Math.cos(ang) * len, h * 0.38 + Math.sin(ang) * len);
                ctx.stroke();
            }
            this.game.player.drawShip(ctx, w / 2, h * 0.38);
            ctx.restore();
        }
        else if (bgType === 'BOSS_2_REVEAL') {
            // Void Dreadnought purple carrier
            ctx.save();
            ctx.translate(w / 2, h * 0.35);
            ctx.shadowColor = '#b000ff';
            ctx.shadowBlur = 30;

            ctx.fillStyle = '#b000ff';
            ctx.beginPath();
            ctx.moveTo(0, -50);
            ctx.lineTo(80, -20);
            ctx.lineTo(100, 35);
            ctx.lineTo(0, 50);
            ctx.lineTo(-100, 35);
            ctx.lineTo(-80, -20);
            ctx.closePath();
            ctx.fill();

            // Rotating shield orbs
            const orbAng = t * 0.04;
            for (let i = 0; i < 4; i++) {
                const oa = orbAng + i * (Math.PI / 2);
                ctx.fillStyle = '#00f0ff';
                ctx.beginPath();
                ctx.arc(Math.cos(oa) * 95, Math.sin(oa) * 70, 10, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        else if (bgType === 'SINGULARITY_APPROACH' || bgType === 'BOSS_3_REVEAL') {
            // Singularity Event Horizon Vortex
            ctx.save();
            ctx.translate(w / 2, h * 0.35);
            ctx.shadowColor = '#ffe600';
            ctx.shadowBlur = 35;

            // Rotating Cyber Polyhedron Rings
            ctx.save();
            ctx.rotate(t * 0.03);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 3;
            ctx.strokeRect(-60, -60, 120, 120);
            ctx.restore();

            ctx.save();
            ctx.rotate(-t * 0.05);
            ctx.strokeStyle = '#ff0077';
            ctx.lineWidth = 3;
            ctx.strokeRect(-45, -45, 90, 90);
            ctx.restore();

            ctx.fillStyle = '#ffe600';
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        else if (bgType === 'VICTORY_SUPERNOVA') {
            // Cosmic Supernova Fireworks
            ctx.save();
            ctx.translate(w / 2, h * 0.35);
            const radius = (t * 3) % 250;
            const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#00f0ff');
            grad.addColorStop(0.7, '#ff00aa');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            this.game.player.drawShip(ctx, 0, 0);
            ctx.restore();
        }
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let curY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, curY);
                line = words[n] + ' ';
                curY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, curY);
    }
}
