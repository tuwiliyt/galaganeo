// Web Audio API Synthesizer for Neo-Galaga
// Procedural BGM & Sound FX (No external audio assets needed)

class AudioManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmVolume = 0.35;
        this.sfxVolume = 0.55;
        this.masterVolume = 0.8;
        
        this.isPlayingBGM = false;
        this.bgmTimer = null;
        this.currentStep = 0;
        this.bpm = 124;
        this.isBossMode = false;
        
        this.masterGain = null;
        this.bgmGain = null;
        this.sfxGain = null;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // --- SFX GENERATORS ---
    playLaser(type = 'normal') {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGain);

        if (type === 'spread') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'laser') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.linearRampToValueAtTime(400, now + 0.18);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
        } else {
            // standard
            osc.type = 'square';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    }

    playEnemyLaser() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playExplosion(size = 'medium') {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const dur = size === 'boss' ? 1.5 : (size === 'large' ? 0.6 : 0.25);
        
        const bufferSize = Math.floor(this.ctx.sampleRate * dur);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(size === 'boss' ? 300 : 800, now);
        filter.frequency.exponentialRampToValueAtTime(30, now + dur);

        const gain = this.ctx.createGain();
        const peakVol = size === 'boss' ? 0.9 : (size === 'large' ? 0.5 : 0.3);
        gain.gain.setValueAtTime(peakVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + dur);

        if (size === 'large' || size === 'boss') {
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(120, now);
            sub.frequency.exponentialRampToValueAtTime(25, now + dur);
            subGain.gain.setValueAtTime(0.6, now);
            subGain.gain.exponentialRampToValueAtTime(0.01, now + dur);
            sub.connect(subGain);
            subGain.connect(this.sfxGain);
            sub.start(now);
            sub.stop(now + dur);
        }
    }

    playHit() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    playPowerup() {
        if (!this.ctx || this.isMuted) return;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.15);
        });
    }

    playBomb() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.8);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.8);
        this.playExplosion('large');
    }

    playTractorBeam() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.2);
        osc.frequency.linearRampToValueAtTime(150, now + 0.4);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    playBossWarning() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const t = now + i * 0.4;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, t);
            osc.frequency.linearRampToValueAtTime(440, t + 0.3);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.35);
        }
    }

    // --- SYNTHWAVE BGM GENERATOR (Dynamic 32-step sequencer) ---
    startBGM() {
        if (this.isPlayingBGM) return;
        this.init();
        this.isPlayingBGM = true;
        this.currentStep = 0;
        this.scheduleNextStep();
    }

    stopBGM() {
        this.isPlayingBGM = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    setBossMode(isBoss) {
        this.isBossMode = isBoss;
        this.bpm = isBoss ? 144 : 124;
    }

    scheduleNextStep() {
        if (!this.isPlayingBGM || !this.ctx) return;
        const stepTime = (60 / this.bpm) / 4; // 16th note
        this.playSequencerStep(this.currentStep, this.ctx.currentTime);
        this.currentStep = (this.currentStep + 1) % 32;
        
        this.bgmTimer = setTimeout(() => {
            this.scheduleNextStep();
        }, stepTime * 1000);
    }

    playSequencerStep(step, time) {
        if (this.isMuted) return;

        // Bass scale notes (Am / F / C / G in normal, Em / C / D / B in boss)
        const normalBassProgression = [
            110, 110, 110, 110, 110, 110, 110, 110, // A2
            87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, // F2
            130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 130.81, // C3
            98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0 // G2
        ];
        
        const bossBassProgression = [
            82.41, 82.41, 164.81, 82.41, 82.41, 164.81, 82.41, 164.81, // E2/E3
            65.41, 65.41, 130.81, 65.41, 65.41, 130.81, 65.41, 130.81, // C2/C3
            73.42, 73.42, 146.83, 73.42, 73.42, 146.83, 73.42, 146.83, // D2/D3
            61.74, 61.74, 123.47, 61.74, 61.74, 123.47, 61.74, 123.47  // B1/B2
        ];

        const progression = this.isBossMode ? bossBassProgression : normalBassProgression;
        const bassFreq = progression[step];

        // 1. Synth Bass Note
        if (step % 2 === 0 || this.isBossMode) {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(bassFreq, time);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(this.isBossMode ? 1400 : 900, time);
            filter.frequency.exponentialRampToValueAtTime(180, time + 0.12);

            gain.gain.setValueAtTime(0.22, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);

            osc.start(time);
            osc.stop(time + 0.12);
        }

        // 2. Synth Arpeggio Lead
        const arpNotes = this.isBossMode
            ? [329.63, 392.00, 493.88, 587.33, 659.25, 587.33, 493.88, 392.00] // Em
            : [440.00, 523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25]; // Am
        
        if (step % 2 === 1) {
            const noteIdx = (step + Math.floor(step / 8) * 2) % arpNotes.length;
            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();
            leadOsc.type = 'square';
            leadOsc.frequency.setValueAtTime(arpNotes[noteIdx], time);

            leadGain.gain.setValueAtTime(0.08, time);
            leadGain.gain.exponentialRampToValueAtTime(0.005, time + 0.1);

            leadOsc.connect(leadGain);
            leadGain.connect(this.bgmGain);

            leadOsc.start(time);
            leadOsc.stop(time + 0.1);
        }

        // 3. Kick Drum (Steps 0, 4, 8, 12, 16, 20, 24, 28)
        if (step % 4 === 0) {
            const kickOsc = this.ctx.createOscillator();
            const kickGain = this.ctx.createGain();
            kickOsc.type = 'sine';
            kickOsc.frequency.setValueAtTime(150, time);
            kickOsc.frequency.exponentialRampToValueAtTime(30, time + 0.12);

            kickGain.gain.setValueAtTime(0.4, time);
            kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

            kickOsc.connect(kickGain);
            kickGain.connect(this.bgmGain);
            kickOsc.start(time);
            kickOsc.stop(time + 0.12);
        }

        // 4. Snare / Clap (Steps 4, 12, 20, 28)
        if (step % 8 === 4) {
            const noise = this.ctx.createBufferSource();
            const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.1), this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            noise.buffer = buffer;

            const snareFilter = this.ctx.createBiquadFilter();
            snareFilter.type = 'highpass';
            snareFilter.frequency.setValueAtTime(1000, time);

            const snareGain = this.ctx.createGain();
            snareGain.gain.setValueAtTime(0.18, time);
            snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

            noise.connect(snareFilter);
            snareFilter.connect(snareGain);
            snareGain.connect(this.bgmGain);
            noise.start(time);
            noise.stop(time + 0.1);
        }

        // 5. Hi-Hat (Every 2 steps)
        if (step % 2 === 0) {
            const hat = this.ctx.createBufferSource();
            const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            hat.buffer = buffer;

            const hatFilter = this.ctx.createBiquadFilter();
            hatFilter.type = 'highpass';
            hatFilter.frequency.setValueAtTime(7000, time);

            const hatGain = this.ctx.createGain();
            hatGain.gain.setValueAtTime(0.07, time);
            hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

            hat.connect(hatFilter);
            hatFilter.connect(hatGain);
            hatGain.connect(this.bgmGain);
            hat.start(time);
            hat.stop(time + 0.04);
        }
    }
}

window.audio = new AudioManager();
