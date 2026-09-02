# Fill the Seat — Dokumen QA

Booth game Talentlytica untuk memperkenalkan Kelola Apps. Dokumen ini berisi flow aplikasi, requirement, dan skenario test case untuk QA.

| Item | Nilai |
|---|---|
| URL production | https://succession-game-five.vercel.app |
| Branch | `revamp/light-mode-lead-capture` |
| Stack | React 18 + Vite + TypeScript + Tailwind + framer-motion, Vercel Functions, Supabase |
| Target device utama | HP (portrait). Tablet full-width. Desktop dibatasi 430px di tengah. |
| Versi dokumen | 2 September 2026 |

---

## 1. Flow Aplikasi

### 1.1 Diagram fase

```
intro → leadCapture → exploring → result → kelolaReveal → finished
                 │
                 └─ (No. HP sudah pernah main) ─→ result (skor lama) → kelolaReveal → finished
                                                  └─ (skor lama tidak ada) → kelolaReveal → finished
```

Tidak ada tombol "main lagi". Untuk sesi baru, refresh halaman (state di-reset, session ID baru dibuat).

### 1.2 Detail tiap layar

**A. Intro**
- Animasi mini org chart. Urutan: chart muncul → satu orang resign → node jadi "VACANT" merah → headline "Sales Manager kamu baru saja resign." → CTA "Mulai Susun Organisasi".
- CTA hanya bisa ditekan setelah animasi selesai (±2,4 detik).

**B. Lead Capture (Data Anda)**
- Field: Nama (wajib), Perusahaan (opsional), No. HP (wajib).
- Tombol "Mulai Game →". Saat menunggu API, label berubah "Mengecek…" dan tombol disable.
- Sistem memanggil `/api/check-email` (nama endpoint lama, isi body `{ phone }`).
  - Nomor belum ada → masuk game.
  - Nomor sudah ada + skor ditemukan → langsung ke layar Result dengan skor lama, tidak main lagi.
  - Nomor sudah ada tanpa skor → langsung ke Kelola Reveal.
  - API gagal / offline → masuk game seperti biasa (fail-open).

**C. Exploring (gameplay)**
- Org chart perusahaan. Sales Manager kosong (kursi merah "Vacant").
- Walkthrough 6 langkah muncul otomatis di awal: canvas, kursi vacant, kandidat internal, talenta eksternal, tiga aspek kompetensi, kalender. Ada tombol "Lewati" dan "Lanjut →".
- Kandidat internal: drag orang dari org chart ke kursi kosong. Memindahkan orang internal membuat kursi lamanya kosong (cascade), harus diisi juga.
- Kandidat eksternal: panel "Talenta Eksternal" di bawah, drag ke kursi kosong. Tidak menimbulkan kursi kosong baru.
- Tap kandidat → panel bawah masuk mode "Perbandingan" (bar kandidat vs garis standar). Tap teks "Apa itu LEAD · DRIVE · INFL? →" membuka bottom sheet penjelasan tiga aspek, bisa ditutup.
- Kalender "HARI": bertambah 1 setiap 30 detik waktu nyata. Semakin lama kursi kosong, skor kecepatan turun.
- Tombol "Review Organisasi →" aktif hanya saat semua kursi terisi. Menekan tombol ini langsung menghitung skor dan pindah ke Result.

**D. Result**
- Urutan animasi: ring skor total → statistik (Org Fit %, Hiring Speed %) → persona → kartu kandidat terpilih → CTA "Lihat Plot Twist".
- Sesi baru disimpan ke Supabase (`sessions` + `scores`) lewat `/api/save-session`. Sesi replay (dari dedup) tidak disimpan ulang.

**E. Kelola Reveal (carousel "spill Kelola")**
- 5 beat: (0) "Anda baru saja menggunakan Kelola Apps" → (1) Visibility Map → (2) Talent Decision Platform → (3) iProfile (GIF animasi) → (4) CTA "Lanjut ke kanan lihat Kelola langsung".
- Navigasi: tap layar / swipe atas / scroll bawah = maju. Swipe bawah / scroll atas = mundur. Tombol "Skip →" langsung ke beat CTA. Progress dots di bawah.
- Beat CTA: tombol "← Kembali" di kiri atas, swipe bawah juga kembali ke beat 3. Ada tiga langkah dengan ikon SVG (bukan emoji), kontak telepon dan email, tombol "Lanjut ke Demo Kelola".

**F. Finished**
- Layar terima kasih: "Terima kasih sudah main! Yuk ngobrol langsung sama tim Talentlytica di booth." Layar akhir, tidak ada aksi.

### 1.3 Perhitungan skor

| Komponen | Rumus |
|---|---|
| Org Fit | Rata-rata kecocokan penempatan (0–100), dihitung dari asesmen kandidat vs standar posisi |
| Hiring Speed | 100 jika rata-rata hari kosong ≤ 3, 0 jika ≥ 30, linear di antaranya |
| Total | 70% Org Fit + 30% Hiring Speed, dibulatkan |
| Persona | Org Fit ≥ 75 dan Speed ≥ 70 → TALENT STRATEGIST. Fit tinggi saja → QUALITY ARCHITECT. Speed tinggi saja → RAPID RECRUITER. Keduanya rendah → TALENT EXPLORER |

---

## 2. Requirement

### 2.1 Functional

| ID | Requirement |
|---|---|
| FR-01 | Intro menampilkan animasi resign lalu CTA. CTA tidak bisa ditekan sebelum animasi selesai. |
| FR-02 | Lead capture wajib Nama dan No. HP. Perusahaan opsional. |
| FR-03 | Input No. HP terdiri dari dua bagian: dropdown kode negara (default `+62` Indonesia) dan field nomor lokal. Validasi: setelah karakter non-digit dan leading `0` dibuang, panjang 6–13 digit. Nomor disimpan dalam format E.164 (contoh `+6281234567890`). |
| FR-04 | Pesan error: "Nama dan nomor HP harus diisi." dan "Nomor HP tidak valid." Field yang kosong diberi border merah. |
| FR-05 | Satu No. HP hanya bisa main sekali. Nomor yang sudah ada langsung diarahkan ke skor lama, bukan ditolak. |
| FR-06 | Jika API cek nomor gagal, game tetap bisa dimainkan. |
| FR-07 | Walkthrough 6 langkah tampil otomatis, bisa dilewati, highlight mengikuti elemen target. Langkah aspek meng-highlight bar dan teks "Apa itu LEAD · DRIVE · INFL? →" sekaligus. |
| FR-08 | Kandidat internal dan eksternal bisa di-drag ke kursi kosong. Drop di luar kursi tidak mengubah apa pun. |
| FR-09 | Memindahkan orang internal membuka kursi baru yang harus diisi sebelum review. |
| FR-10 | Hari bertambah setiap 30 detik dan memengaruhi Hiring Speed. |
| FR-11 | "Review Organisasi →" disable sampai semua kursi terisi, dengan teks "N posisi belum terisi". |
| FR-12 | Bottom sheet penjelasan aspek dapat dibuka dari mode profil dan mode perbandingan, ditutup lewat tombol × atau tap area gelap. |
| FR-13 | Result menampilkan total, Org Fit, Hiring Speed, persona, dan kandidat yang menempati Sales Manager. |
| FR-14 | Sesi baru tersimpan di Supabase satu kali. Refresh di layar Result tidak boleh membuat duplikat (session ID unik). |
| FR-15 | Kelola Reveal dapat maju/mundur dengan tap, swipe, scroll, dan Skip. Dari beat CTA bisa kembali ke carousel. |
| FR-16 | Semua CTA memakai style yang sama: gradient biru–indigo dengan shimmer. |
| FR-17 | Halaman CTA tidak memakai emoji, hanya ikon SVG. |

### 2.2 Non-functional

| ID | Requirement |
|---|---|
| NFR-01 | Layout HP full-width, tablet full-width, desktop maksimal 430px di tengah. |
| NFR-02 | Font Geist dimuat dari Google Fonts, fallback ke system font jika gagal. |
| NFR-03 | Copy tidak boleh terpotong dengan tanda hubung yang aneh (contoh "mana-" di baris terpisah). |
| NFR-04 | Tidak ada scroll horizontal di seluruh layar. |
| NFR-05 | Drag terasa responsif di layar sentuh, tidak memicu scroll halaman atau zoom browser. |
| NFR-06 | Game tetap berjalan tanpa koneksi ke backend. Hanya penyimpanan skor dan dedup yang terpengaruh. |

### 2.3 Batasan keamanan konten (wajib dijaga)

Selama gameplay (layar Exploring) **tidak boleh** muncul:

| ID | Larangan |
|---|---|
| SEC-01 | Angka Organization Fitness atau dampaknya terhadap organisasi. |
| SEC-02 | Persentase match, role fit score, atau rekomendasi "kandidat terbaik". |
| SEC-03 | Indikator cocok/tidak cocok dalam bentuk apa pun, termasuk warna hijau, merah, atau oranye pada bar kandidat. Bar harus netral. |
| SEC-04 | Bubble kandidat aktif hanya boleh berwarna biru, cyan, biru muda, atau putih transparan. |
| SEC-05 | Copy walkthrough dan modal aspek tidak menyebut "iProfile Kelola" (reveal disimpan untuk layar Kelola Reveal). |

Skor dan persentase baru boleh muncul di layar Result.

---

## 3. Test Case

Format: **ID · Judul** — Prasyarat → Langkah → Hasil yang diharapkan. Prioritas: P0 blocker, P1 mayor, P2 minor.

### 3.1 Intro

| ID | P | Judul | Langkah | Hasil diharapkan |
|---|---|---|---|---|
| TC-INT-01 | P0 | Animasi intro berjalan | Buka URL di HP | Org chart muncul, satu node berubah jadi "VACANT" merah, headline dan CTA muncul berurutan dalam ±3 detik |
| TC-INT-02 | P1 | CTA terkunci saat animasi | Tap tombol CTA sebelum 2 detik | Tidak terjadi apa pun. Setelah animasi selesai, tap berpindah ke Lead Capture |
| TC-INT-03 | P2 | Copy tidak terpotong aneh | Buka di HP lebar 360px dan 390px | Kalimat "…dampaknya bisa ke mana-mana." tidak dipenggal dengan tanda hubung di tengah kata |
| TC-INT-04 | P2 | Background putih | Lihat seluruh layar intro | Background putih polos, tanpa gradient atau pola titik |

### 3.2 Lead Capture

| ID | P | Judul | Langkah | Hasil diharapkan |
|---|---|---|---|---|
| TC-LC-01 | P0 | Submit lengkap, nomor baru | Dropdown default `+62`, field diisi `812 3456 7890`, tap "Mulai Game →" | Label berubah "Mengecek…" sebentar, lalu masuk layar gameplay |
| TC-LC-02 | P0 | Nama kosong | Kosongkan Nama, isi No. HP, submit | Error "Nama dan nomor HP harus diisi.", border Nama merah, tetap di layar |
| TC-LC-03 | P0 | No. HP kosong | Isi Nama, kosongkan No. HP, submit | Error yang sama, border No. HP merah |
| TC-LC-04 | P1 | Nomor terlalu pendek | Field `81234` (5 digit setelah strip) | Error "Nomor HP tidak valid." |
| TC-LC-05 | P1 | Nomor terlalu panjang | Field 14 digit atau lebih | Error "Nomor HP tidak valid." |
| TC-LC-06 | P1 | Ganti kode negara | Pilih `+65` (Singapore) dari dropdown, isi nomor lokal, submit | Disimpan sebagai `+65XXXXXXXX`. Dedup juga mencari format ini |
| TC-LC-07 | P1 | Huruf di nomor | Field `8abc12345` | Digit yang tersisa dihitung setelah strip non-digit. Jika < 6, error |
| TC-LC-08 | P2 | Nomor dengan leading 0 | Field `081234567890` | Leading `0` dibuang otomatis, tersimpan sebagai `+6281234567890` |
| TC-LC-09 | P2 | Perusahaan opsional | Kosongkan Perusahaan, lainnya valid | Lolos, masuk game |
| TC-LC-10 | P2 | Error hilang saat mengetik | Munculkan error, lalu ketik di field mana pun | Pesan error hilang |
| TC-LC-11 | P2 | Keyboard numerik | Tap field No. HP di HP | Keyboard yang muncul bertipe angka/telepon |
| TC-LC-12 | P1 | Double tap tombol | Tap "Mulai Game →" dua kali cepat | Hanya satu request, tidak dobel masuk atau error |

### 3.3 Dedup No. HP (sekali main)

| ID | P | Judul | Prasyarat | Langkah | Hasil diharapkan |
|---|---|---|---|---|---|
| TC-DD-01 | P0 | Nomor sudah main, ada skor | Nomor X sudah menyelesaikan game sampai Result | Refresh, isi nama apa pun + nomor X, submit | Langsung tampil layar Result dengan skor lama (total, persona sama seperti sesi pertama), tidak masuk gameplay |
| TC-DD-02 | P0 | Lanjut dari skor lama | Lanjutan TC-DD-01 | Tap "Lihat Plot Twist" | Masuk Kelola Reveal normal sampai Finished |
| TC-DD-03 | P0 | Skor lama tidak dobel tersimpan | Lanjutan TC-DD-01 | Cek tabel `sessions` dan `scores` untuk nomor X | Tetap satu baris per tabel, tidak bertambah |
| TC-DD-04 | P1 | Nomor sama, format beda | Nomor X tersimpan sebagai `+6281234567890` | Isi `0812-3456-7890` (dengan dropdown `+62`) | Keduanya dinormalisasi ke E.164 yang sama → dianggap sama, langsung ke Result |
| TC-DD-05 | P1 | Nomor sama, spasi di ujung | Nomor X tersimpan | Isi ` 081234567890 ` dengan spasi di depan/belakang | Dianggap sama (trim), langsung ke Result |
| TC-DD-06 | P1 | Nomor ada tanpa skor | Baris di `sessions` tanpa pasangan di `scores` (buat manual di DB) | Submit nomor tersebut | Langsung ke Kelola Reveal beat 0, bukan layar blank |
| TC-DD-07 | P0 | Backend mati | Blokir request ke `/api/check-email` di DevTools atau matikan jaringan setelah halaman termuat | Submit nomor yang sudah ada | Game tetap masuk gameplay (fail-open), tidak ada layar blank atau error |
| TC-DD-08 | P0 | Tidak ada layar blank | Semua skenario dedup di atas | Amati layar setelah submit | Tidak pernah tampil layar putih kosong |

### 3.4 Gameplay (Exploring)

| ID | P | Judul | Langkah | Hasil diharapkan |
|---|---|---|---|---|
| TC-GP-01 | P0 | Walkthrough muncul | Masuk gameplay pertama kali | Overlay langkah 1/6 "Ini org chart perusahaanmu…" dengan spotlight pada canvas |
| TC-GP-02 | P1 | Urutan dan target highlight | Tap "Lanjut →" berulang | Urutan: canvas → kursi vacant → kartu kandidat internal → talenta eksternal → aspek → kalender. Counter 1/6 sampai 6/6 |
| TC-GP-03 | P1 | Highlight langkah aspek | Sampai langkah 5/6 | Spotlight mencakup tiga bar **dan** teks "Apa itu LEAD · DRIVE · INFL? →" di bawahnya. Copy tidak menyebut iProfile Kelola |
| TC-GP-04 | P1 | Lewati walkthrough | Tap "Lewati" di langkah mana pun | Overlay hilang, game bisa dimainkan |
| TC-GP-05 | P0 | Drag internal ke kursi | Drag Andi ke kursi Sales Manager | Andi menempati Sales Manager. Kursi Senior Account Executive menjadi kosong (cascade). Panel bawah menunjukkan jumlah posisi belum terisi bertambah/berkurang sesuai |
| TC-GP-06 | P0 | Drag eksternal ke kursi | Drag kandidat dari "Talenta Eksternal" ke kursi kosong | Kandidat menempati kursi, tidak ada kursi baru yang kosong, kandidat hilang dari panel eksternal |
| TC-GP-07 | P1 | Drop di luar kursi | Drag kandidat lalu lepas di area kosong canvas | Kandidat kembali ke posisi awal, tidak ada perubahan |
| TC-GP-08 | P1 | Tukar kandidat | Drag kandidat lain ke kursi yang sudah terisi | Kandidat lama keluar dari kursi (kembali ke asal atau pool), kandidat baru masuk |
| TC-GP-09 | P0 | Tombol review terkunci | Masih ada kursi kosong | "Review Organisasi →" abu-abu, tidak bisa ditekan, teks "N posisi belum terisi" |
| TC-GP-10 | P0 | Tombol review aktif | Semua kursi terisi | Tombol gradient biru, teks "Siap direview". Tap → masuk Result |
| TC-GP-11 | P1 | Mode perbandingan | Tap salah satu kandidat saat ada kursi aktif | Panel bawah berubah "Perbandingan": bar kandidat + garis "Standar", legend nama kandidat |
| TC-GP-12 | P1 | Modal aspek dari mode profil | Tanpa kandidat terpilih, tap "Apa itu LEAD · DRIVE · INFL? →" | Bottom sheet "3 Aspek Kompetensi" naik dari bawah dengan tiga kartu Leadership, Drive, Influencing. Tidak ada label "iProfile · Kelola" dan tidak ada footnote |
| TC-GP-13 | P1 | Modal aspek dari mode perbandingan | Pilih kandidat, tap teks yang sama di bawah bar perbandingan | Bottom sheet yang sama muncul |
| TC-GP-14 | P1 | Tutup modal | Tap × lalu buka lagi dan tap area gelap | Modal tertutup dengan animasi turun pada kedua cara |
| TC-GP-15 | P1 | Hari bertambah | Diamkan 30 detik dan 60 detik | Kalender menunjukkan HARI 2 lalu HARI 3 |
| TC-GP-16 | P0 | Tidak ada indikator fit selama gameplay | Periksa seluruh layar gameplay termasuk kartu kandidat, panel perbandingan, bubble | Tidak ada persentase match, skor fit, label "best", warna hijau/merah/oranye pada bar. Bar hanya biru/indigo/cyan. Bubble aktif hanya biru/cyan/putih transparan |
| TC-GP-17 | P2 | Canvas bisa digeser dan di-zoom | Drag area kosong canvas, pinch | Org chart bergeser dan berubah skala tanpa men-scroll halaman |
| TC-GP-18 | P2 | Tombol "?" | Tap ikon "?" di kanan atas | Walkthrough dimulai ulang dari langkah 1 |

### 3.5 Result

| ID | P | Judul | Langkah | Hasil diharapkan |
|---|---|---|---|---|
| TC-RS-01 | P0 | Skor tampil | Selesaikan game | Ring skor total menghitung naik, lalu Org Fit %, Hiring Speed %, persona, kartu kandidat Sales Manager, tombol "Lihat Plot Twist" |
| TC-RS-02 | P1 | Rumus total | Catat Org Fit dan Hiring Speed | Total = pembulatan(0,7 × Org Fit + 0,3 × Speed) |
| TC-RS-03 | P1 | Persona cepat & tepat | Isi semua kursi dalam < 30 detik dengan kandidat yang sesuai standar | Speed 100, persona TALENT STRATEGIST jika Org Fit ≥ 75 |
| TC-RS-04 | P1 | Persona lambat | Diamkan ≥ 3 menit sebelum mengisi kursi terakhir | Hiring Speed turun jelas. Persona QUALITY ARCHITECT atau TALENT EXPLORER tergantung Org Fit |
| TC-RS-05 | P0 | Skor tersimpan | Setelah Result tampil, cek Supabase | Satu baris di `sessions` (nama, perusahaan, `player_phone`, `final_pick_id`) dan satu baris di `scores` dengan `session_id` sama |
| TC-RS-06 | P1 | Kolom email kosong | Lihat baris `sessions` dan `leads` yang baru | `player_email` / `email` bernilai NULL, tidak menyebabkan error simpan |
| TC-RS-07 | P1 | Refresh di Result | Refresh halaman | Kembali ke Intro (state hilang). Tidak ada baris duplikat tercipta |
| TC-RS-08 | P2 | Style CTA | Lihat "Lihat Plot Twist" | Gradient biru–indigo dengan efek kilau, sama seperti CTA intro |

### 3.6 Kelola Reveal

| ID | P | Judul | Langkah | Hasil diharapkan |
|---|---|---|---|---|
| TC-KR-01 | P0 | Beat 0 tampil | Tap "Lihat Plot Twist" | Judul "Anda baru saja menggunakan Kelola Apps.", scroll hint animasi, dots 4 titik dengan titik pertama aktif |
| TC-KR-02 | P0 | Maju dengan tap | Tap layar tiga kali | Beat 1 Visibility Map → 2 Talent Decision Platform → 3 iProfile. Dots ikut berpindah |
| TC-KR-03 | P1 | Maju dengan swipe | Swipe ke atas | Beat maju satu langkah per swipe (ambang ±40px) |
| TC-KR-04 | P1 | Mundur dengan swipe | Swipe ke bawah dari beat 2 | Kembali ke beat 1 |
| TC-KR-05 | P1 | Wheel di desktop | Scroll mouse ke bawah / ke atas | Maju / mundur, dengan jeda ±0,6 detik antar langkah agar tidak melompat |
| TC-KR-06 | P1 | GIF iProfile | Sampai beat 3 | GIF `iprofile.gif` tampil beranimasi, lebar ±340px, tidak melebihi layar HP 360px (boleh di-crop rapi atau terpotong, catat sebagai temuan jika overflow horizontal) |
| TC-KR-07 | P1 | Skip | Tap "Skip →" di beat 0 | Langsung ke halaman CTA "Lanjut ke kanan lihat Kelola langsung" |
| TC-KR-08 | P0 | Halaman CTA lengkap | Sampai beat CTA | Badge "Next Stop", headline, panah animasi, tiga langkah dengan ikon SVG (panah, orang, kaca pembesar), kontak telepon dan email, tombol "Lanjut ke Demo Kelola" |
| TC-KR-09 | P1 | Tidak ada emoji di CTA | Periksa halaman CTA | Tidak ada karakter emoji, hanya ikon vektor |
| TC-KR-10 | P0 | Kembali dari CTA via tombol | Tap "← Kembali" | Kembali ke beat 3 (iProfile) |
| TC-KR-11 | P1 | Kembali dari CTA via swipe | Swipe ke bawah di halaman CTA | Kembali ke beat 3 |
| TC-KR-12 | P1 | Tap di CTA tidak maju | Tap area kosong halaman CTA | Tidak terjadi apa pun. Hanya tombol yang beraksi |
| TC-KR-13 | P0 | Selesai | Tap "Lanjut ke Demo Kelola" | Layar Finished "Terima kasih sudah main!" |
| TC-KR-14 | P2 | Background putih | Semua beat | Background putih, tanpa pola |

### 3.7 Responsif dan visual

| ID | P | Judul | Langkah | Hasil diharapkan |
|---|---|---|---|---|
| TC-UI-01 | P0 | HP kecil | Emulasi 360×740 | Semua layar full-width, tidak ada scroll horizontal, teks tidak terpotong |
| TC-UI-02 | P0 | HP besar | Emulasi 430×932 | Sama seperti di atas |
| TC-UI-03 | P1 | Tablet | Emulasi 768×1024 dan 820×1180 | Layout full-width memenuhi lebar tablet, bukan kartu di tengah |
| TC-UI-04 | P1 | Desktop | Lebar ≥ 1024px | Konten dibatasi 430px dan berada di tengah, background luar abu-abu muda |
| TC-UI-05 | P2 | Font | Inspect elemen body | Font-family terhitung "Geist". Jika Google Fonts diblokir, fallback ke system font tanpa layout rusak |
| TC-UI-06 | P1 | Konsistensi CTA | Bandingkan tombol utama di Intro, Lead Capture, Review, Result, Kelola Reveal | Gradient, radius, dan shimmer identik |
| TC-UI-07 | P1 | Safe area | iPhone dengan notch, mode portrait | Konten atas dan bawah tidak tertutup notch atau home indicator |
| TC-UI-08 | P1 | Rotasi | Putar ke landscape di HP | Aplikasi tidak crash. Catat tampilan sebagai temuan jika tidak layak pakai (booth dipakai portrait) |

### 3.8 Ketahanan dan backend

| ID | P | Judul | Langkah | Hasil diharapkan |
|---|---|---|---|---|
| TC-BE-01 | P0 | Offline total | Matikan jaringan setelah halaman termuat, mainkan sampai akhir | Semua layar berjalan. Skor tidak tersimpan, tidak ada error yang terlihat pengguna |
| TC-BE-02 | P1 | API cek nomor lambat | Throttle jaringan "Slow 3G", submit nomor | Tombol "Mengecek…" disable selama menunggu, lalu lanjut sesuai hasil |
| TC-BE-03 | P1 | API cek nomor 500 | Paksa `/api/check-email` mengembalikan 500 (DevTools override) | Game tetap masuk gameplay |
| TC-BE-04 | P1 | Save-session 500 | Paksa `/api/save-session` gagal | Result tetap tampil normal. Error hanya di console |
| TC-BE-05 | P2 | Method selain POST | `GET /api/check-email` dan `GET /api/save-session` | Respons 405 |
| TC-BE-06 | P2 | Body kosong | `POST /api/check-email` tanpa `phone` | Respons 400 `Missing phone` |
| TC-BE-07 | P1 | Konsistensi data | Bandingkan nilai di layar Result dengan baris `scores` | `total`, `overall_fit`, `hiring_speed`, `persona` sama persis |

---

## 4. Data uji

| Kebutuhan | Nilai contoh |
|---|---|
| Nomor baru (ganti setiap run) | Dropdown `+62`, field `812 0000 0001` / `812 0000 0002`, … |
| Nomor sudah main | Gunakan nomor dari run sebelumnya di device yang sama |
| Nomor tidak valid | Field `81234` (< 6 digit), field 14 digit lebih, `abcdefghij` |
| Format alternatif (harus dedup sama) | `0812-0000-0001` dan `812 0000 0001` dengan dropdown `+62` — keduanya → `+6281200000001` |
| Nomor negara lain | Dropdown `+65`, field `8123 4567` → tersimpan `+6581234567` |

Untuk memverifikasi DB, gunakan Supabase dashboard tabel `sessions`, `scores`, dan `leads`. Kolom kunci: `player_phone` (sessions), `phone` (leads).

---

## 5. Temuan yang sudah diketahui (tidak perlu dilaporkan ulang)

1. ~~Pencocokan nomor HP memakai string mentah~~ — **Resolved.** Semua nomor dinormalisasi ke E.164 (`+62…`) sebelum disimpan dan dicek. Format `08…`, `8…`, `+62…`, dengan spasi/strip, semuanya menghasilkan string yang sama.
2. Endpoint dedup masih bernama `/api/check-email` walau isinya nomor HP. Fungsional, hanya penamaan.
3. Kolom `player_email` dan `email` di DB masih ada, sengaja dibiarkan nullable sementara.
4. Tidak ada tombol "main lagi". Reset hanya lewat refresh.
5. Dev lokal tanpa env Supabase: `save-session` mengembalikan 404 di console. Tidak terjadi di production.
6. Nomor dari negara lain (bukan `+62`) disimpan apa adanya sesuai kode negara yang dipilih di dropdown. Dedup antar negara tidak dikecualikan — jika nomor `+6512345678` (SG) sudah main, nomor yang sama dengan dropdown SG akan terdedup dengan benar.

---

## 6. Kriteria lulus

- Semua P0 lulus tanpa pengecualian.
- P1 lulus, atau gagal dengan tiket yang disepakati sebelum booth.
- Seluruh test case SEC (TC-GP-16) wajib lulus. Kebocoran indikator fit selama gameplay dianggap blocker.
