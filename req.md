# Basketball Championship 2025 - Bracket & Schedule

Proyek ini adalah halaman rekapitulasi jadwal dan bagan *bracket* turnamen basket tingkat SMA dan SMP (Putra & Putri). Halaman ini dirancang untuk menampilkan jadwal pertandingan yang kompleks secara bersih, interaktif, dan responsif.

## 🚀 Fitur Utama

- **Bagan Kompetisi (Bracket)**: Menampilkan struktur Single Elimination dari babak *Round of 16* (Perdelapan Final) hingga *Grand Final* dan Perebutan Juara 3.
- **Jadwal Pertandingan (Schedule)**: Tabel jadwal interaktif per hari yang didistribusikan secara adil antara tingkatan SMP dan SMA.
- **Navigasi Kategori (Tabs)**: Navigasi kategori *sticky* (menempel di atas) untuk memudahkan perpindahan *view* antarkategori.
- **Desain Modern**: Tema *dark-mode* dengan gaya *glassmorphism*, aksen *neon*, dan tipografi tebal bernuansa *sporty*.
- **100% Statis & Siap Pakai**: Tanpa *backend*, tanpa proses *build* rumit, dan bisa diakses dengan membukanya langsung via browser.

---

## 🛠 Aturan & Logika Turnamen

Proyek ini mendistribusikan perlombaan dengan aturan khusus yang telah ditetapkan sebagai berikut:

### 1. Peserta & Kategori
Merangkum **64 Tim** secara total yang dibagi ke dalam 4 kategori divisi:
- **SMA Putra**: 16 Tim
- **SMA Putri**: 16 Tim
- **SMP Putra**: 16 Tim
- **SMP Putri**: 16 Tim

### 2. Aturan Hari Pertandingan (SMA vs SMP)
Turnamen berjalan selama **14 Hari** berturut-turut dengan pemisahan hari bermain:
- **Tingkat SMA** bermain pada hari **Ganjil** (Hari 1, 3, 5, 7, 9, 11).
- **Tingkat SMP** bermain pada hari **Genap** (Hari 2, 4, 6, 8, 10, 12).
- **Hari Gabungan** (Hari 13 & 14) untuk laga puncak Juara 3 dan Final seluruh kategori.

### 3. Distribusi Jadwal (Total Maksimal 6 Match/Hari)
* **Babak 16 Besar (Hari 1 - 6)**: 
  * Hari 1 & 2: 5 Match (3 Laga Putra + 2 Laga Putri)
  * Hari 3 & 4: 5 Match (2 Laga Putra + 3 Laga Putri)
  * Hari 5 & 6: 6 Match (3 Laga Putra + 3 Laga Putri)
* **Babak Quarter Final (Hari 7 - 10)**:
  * 4 Match per Hari (2 Laga Putra + 2 Laga Putri ditiap tingkatannya)
* **Babak Semi Final (Hari 11 - 12)**:
  * 4 Match per Hari (Full Semi Final Putra & Putri)
* **Laga Puncak Juara 3 & Final (Hari 13 - 14)**:
  * Hari 13: 4 Match (Full Perebutan Juara 3 SMP & SMA, Putra & Putri)
  * Hari 14: 4 Match (Full Grand Final SMP & SMA, Putra & Putri)

---

## 💻 Tech Stack

- **HTML5**: Struktur utama dokumen.
- **Tailwind CSS (via CDN)**: Menggunakan versi CDN (`https://cdn.tailwindcss.com`) agar file siap dikirim dan diakses di *device* mana saja (PC, Mac, Handphone) tanpa perlu instalasi Node.js atau proses *compiling* lanjutan.
- **Vanilla JavaScript**: (Terdapat dalam file terpisah `generate.js` yang digunakan sebagai generator awal HTML-nya. File HTML akhir sepenuhnya bersih dari *runtime* logika ini).
- **Google Fonts**: Menggunakan *Bebas Neue*, *Orbitron*, dan *Rajdhani*.

---

## 📖 Cara Menggunakan (User Guide)

Kamu tidak memerlukan *server* ataupun dependensi tambahan!

1. **Penggunaan Langsung**:
   Buka file `index.html` menggunakan *web browser* pilihan Anda (Chrome, Safari, Edge, Firefox). Kamu bisa langsung klik 2x (dobel klik) pada file tersebut.
   
2. **Berbagi / Mendistribusikan**:
   Kamu bebas membagikan file tunggal `index.html` ini ke perangkat mana pun (Laptop rekan kerja, dipindahkan ke HP), selagi perangkat tersebut tersambung ke koneksi internet saat membukanya (untuk meload Tailwind *styling* dan Font-nya).

3. **Modifikasi Data**:
   Seluruh data tim (Team 1, Team 2, dsb) dapat disunting dan digenerate ulang sewaktu-waktu jika diperlukan menggunakan skrip `generate.js` dengan mengubah *object map*-nya, atau di-*edit* secara manual dari HTML tag.

---
*Generated & maintained by Assistant (Rafif's Workspace).*