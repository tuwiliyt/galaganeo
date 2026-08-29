# ⚡ NEO-GALAGA 2D (Modern Classic Space Shooter)

**Neo-Galaga 2D** adalah game arcade space shooter modern terinspirasi dari game legendaris Galaga (1981), dibangun dengan visual 2D modern neon glow, musik synthwave prosedural (Web Audio API), kontrol mouse yang presisi, 10 gelombang formasi unik per level, 3 boss tangguh dengan pola serangan unik, serta 7 cutscene sinematik berdialog.

---

## 🎮 Fitur Utama

- **Kontrol Mouse Halus (*Smooth Lerp*)**: Kapal mengikuti kursor secara presisi dengan animasi miring (*roll tilt*).
- **Sistem 3 Nyawa (*3 Lives*) & Continue**: Respawn otomatis dengan perisai kebal saat HP habis, serta opsi Continue di stage berjalan.
- **10 Gelombang (*Waves*) Progresif per Stage**:
  - *Wave 1 - 9*: Formasi geometris bervariasi (V-Formation, Twin Columns, Arrowhead, Diamond, Crescent Pincer, Phalanx, Chaos Vortex).
  - *Wave 10*: Pertarungan Boss klimaks!
- **Model & Kemampuan NPC Unik**:
  - *Plasma Sniper*: Garis bidik laser merah sebelum menembakkan railgun.
  - *Minelayer*: Menyebarkan ranjau luar angkasa yang meledak menjadi serpihan.
  - *Tractor Commander*: Sinar penarik magnetik untuk menangkap kapal.
  - *Stealth Phantom*: Kamuflase tembus pandang (*Cloaking*).
  - *Bio-Splitter*: Membelah diri menjadi 2 mini-drone saat hancur.
  - *Cyber Sentinel*: Membawa perisai pelindung berputar.
  - *Warp Hunter*: Berteleportasi geser ke samping saat diserang.
- **3 Boss Unik**:
  - **Level 1: Iron Mantis** (Mecha-Insect Dread Cruiser)
  - **Level 2: Void Dreadnought** (Carrier Mothership dengan 4 Kristal Perisai)
  - **Level 3: Omega Core Matrix** (Cybernetic Godhead dengan Danmaku Spiral)
- **7 Cutscene Sinematik**:
  - Dilengkapi efek *Letterbox*, dialog mesin tik, avatar hologram, dan tombol Skip.
- **Audio Sintesis Prosedural (Web Audio API)**:
  - BGM Synthwave adaptif dan SFX retro lengkap tanpa ketergantungan file eksternal.

---

## 🕹️ Skema Kontrol

| Kontrol | Aksi |
| :--- | :--- |
| **Mouse Move** | Menggerakkan kapal mengikuti kursor |
| **Klik Kiri** | Menembak (tersedia toggle Auto-Fire) |
| **Klik Kanan / Space / B** | EMP Bomb (Membersihkan peluru musuh & damage area) |
| **Klik / Space** | Lanjut dialog Cutscene |
| **Tombol Skip / ESC / S** | Lewati Cutscene |

---

## 🚀 Cara Menjalankan Secara Lokal

1. Clone repositori:
```bash
git clone https://github.com/tuwiliyt/galaganeo.git
cd galaganeo
```

2. Buka `index.html` langsung di browser Anda, atau jalankan web server lokal:
```bash
python3 -m http.server 8080
```
Buka `http://localhost:8080` pada browser.
