# Supabase Database Schema - Yadika Cup

Dokumentasi ini menjelaskan struktur tabel dan relasi data yang digunakan dalam sistem turnamen Basket Yadika Cup.

## Tabel Utama

### 1. `registrations`

Menyimpan data pendaftaran tim basket dari berbagai sekolah.

- **Purpose**: Pintu masuk awal data sebelum pengundian (Draw).
- **Kolom Penting**:
  - `school_name`: Nama sekolah (Key utama untuk identifikasi tim).
  - `level`: Jenjang (SMA / SMP).
  - `gender`: Kategori (Putra / Putri).
  - `status`: Status verifikasi (Verified / Pending / Rejected).
  - `category`: Kombinasi level-gender (misal: `sma-putra`).

### 2. `draw_results`

Menyimpan hasil pengundian (Shuffle) tim untuk babak 16 Besar.

- **Purpose**: Menentukan siapa lawan siapa di babak awal.
- **Kolom Penting**:
  - `category`: Kategori lomba.
  - `match_index`: Indeks pertandingan (0-7 untuk 8 match per kategori).
  - `team1` & `team2`: Nama tim yang dipasangkan hasil dari pengundian.

### 3. `matches` (Physical Schedule)

Menyimpan jadwal pertandingan resmi selama 13 hari turnamen.

- **Purpose**: Sumber data utama untuk halaman Jadwal dan Live Scores.
- **Kolom Penting**:
  - `day`: Hari turnamen (1-13).
  - `round`: Babak (16 Besar, 8 Besar, Semi Final, Final).
  - `match_number`: Urutan pertandingan dalam babak tersebut.
  - `team1` & `team2`: Nama tim (atau "TBD" untuk babak lanjutan).
  - `team1_from` & `team2_from`: Dependency pemenang (misal: `M01` atau `QF1`).
  - `status`: Status pertandingan (`Not Play Yet` / `Complete`).

### 4. `match_scores`

Menyimpan skor real-time untuk setiap pertandingan yang terdaftar di sistem.

- **Purpose**: Pencatatan poin untuk menentukan pemenang dan update klasemen/bracket.
- **Kolom Penting**:
  - `match_key`: Identifier unik (format: `HARI-ID-KATEGORI`, misal: `7-QF1-sma-putra`).
  - `score1` & `score2`: Skor poin untuk Tim 1 dan Tim 2.

---

## Alur Relasi Data (Data Flow)

1.  **Step 1**: Tim yang sudah `Verified` di tabel **registrations** akan diacak masuk ke **draw_results**.
2.  **Step 2**: Saat halaman jadwal dibuka pertama kali, sistem akan membaca **draw_results** untuk membuat 60 baris data permanen di tabel **matches**.
3.  **Step 3**: Admin memasukkan skor, data tersimpan di **match_scores**.
4.  **Step 4**: Tabel **matches** menggunakan skor dari **match_scores** untuk secara otomatis mengganti tim "TBD" di babak berikutnya dengan nama tim pemenang asli.

## Catatan Teknis

- **Tabel `matches`** bersifat statis (sekali di-generate akan tetap di sana) untuk menjamin persistensi jadwal.
- **Pemenang** tidak disimpan secara hardcoded di tabel `matches` babak lanjutan, melainkan dihitung secara dinamis (On-the-fly) berdasarkan skor terakhir agar selalu akurat jika ada perubahan skor sepihak.
