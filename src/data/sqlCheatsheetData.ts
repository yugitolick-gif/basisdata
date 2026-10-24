export interface CheatSheetItem {
  id: string;
  category: string;
  title: string;
  syntax: string;
  example: string;
  description: string;
  rules: string[];
}

export const SQL_CHEATSHEET_ITEMS: CheatSheetItem[] = [
  {
    id: 'cs-01',
    category: 'DDL (Data Definition)',
    title: 'CREATE TABLE (Membuat Tabel)',
    syntax: `CREATE TABLE nama_tabel (
  nama_kolom1 tipe_data [CONSTRAINT],
  nama_kolom2 tipe_data,
  PRIMARY KEY (nama_kolom1)
);`,
    example: `CREATE TABLE mahasiswa (
  nim VARCHAR(10) PRIMARY KEY,
  nama_mahasiswa VARCHAR(60) NOT NULL,
  ipk DECIMAL(3,2) DEFAULT 0.00
);`,
    description: 'Mendefinisikan skema tabel baru dalam basis data beserta tipe data dan batasan integritas tiap atribut.',
    rules: [
      'PRIMARY KEY menjamin setiap nilai unik dan tidak boleh NULL.',
      'NOT NULL mencegah data kosong pada atribut esensial.',
      'DEFAULT mengisi nilai otomatis jika saat INSERT kolom tidak disertakan.'
    ]
  },
  {
    id: 'cs-02',
    category: 'DDL (Data Definition)',
    title: 'FOREIGN KEY & Constraint Relasi',
    syntax: `FOREIGN KEY (kolom_fk) 
REFERENCES tabel_induk (kolom_pk)
[ON DELETE CASCADE | SET NULL | RESTRICT]
[ON UPDATE CASCADE | RESTRICT]`,
    example: `CREATE TABLE krs (
  id_krs INT PRIMARY KEY,
  nim VARCHAR(10) NOT NULL,
  FOREIGN KEY (nim) REFERENCES mahasiswa(nim)
    ON DELETE CASCADE
);`,
    description: 'Menjamin integritas referensial: kolom FK hanya boleh berisi nilai yang sudah terdaftar pada PK tabel induk.',
    rules: [
      'ON DELETE CASCADE: Menghapus baris anak jika baris induk dihapus.',
      'ON DELETE RESTRICT: Menolak penghapusan baris induk jika masih dirujuk.',
      'ON DELETE SET NULL: Mengubah nilai FK menjadi NULL jika induk dihapus.'
    ]
  },
  {
    id: 'cs-03',
    category: 'DML (Kueri & Filter)',
    title: 'SELECT & WHERE Dasar',
    syntax: `SELECT kolom1, kolom2, ...
FROM nama_tabel
WHERE kondisi_logika
ORDER BY kolom [ASC | DESC]
LIMIT n;`,
    example: `SELECT nim, nama_mahasiswa, ipk
FROM mahasiswa
WHERE ipk >= 3.50 AND angkatan = 2023
ORDER BY ipk DESC
LIMIT 5;`,
    description: 'Mengambil data dari satu tabel dengan filter perbandingan logika (AND, OR, NOT).',
    rules: [
      'Gunakan tanda kutip satu (\'...\') untuk data bertipe teks dan tanggal.',
      'Operator pembanding: =, !=, <>, <, >, <=, >=.',
      'LIMIT membatasi jumlah rekaman maksimal yang ditampilkan.'
    ]
  },
  {
    id: 'cs-04',
    category: 'DML (Kueri & Filter)',
    title: 'Operator LIKE, IN, & BETWEEN',
    syntax: `-- LIKE pencarian substring
WHERE kolom LIKE '%pola%'

-- IN himpunan nilai
WHERE kolom IN (nilai1, nilai2, ...)

-- BETWEEN rentang inklusif
WHERE kolom BETWEEN batas_bawah AND batas_atas`,
    example: `SELECT * FROM produk 
WHERE nama_produk LIKE '%Keyboard%'
  AND harga BETWEEN 200000 AND 1000000
  AND id_kategori IN (1, 2);`,
    description: 'Penyaringan data fleksibel untuk pencarian pola teks, rentang numerik, dan kumpulan nilai spesifik.',
    rules: [
      '% mewakili nol atau banyak karakter.',
      '_ (underscore) mewakili tepat satu karakter.',
      'BETWEEN bersifat inklusif (termasuk batas bawah dan batas atas).'
    ]
  },
  {
    id: 'cs-05',
    category: 'JOIN (Relasi Antar Tabel)',
    title: 'INNER JOIN (Irisan Dua Tabel)',
    syntax: `SELECT t1.kolom, t2.kolom
FROM tabel1 t1
INNER JOIN tabel2 t2 
  ON t1.kunci_relasi = t2.kunci_relasi;`,
    example: `SELECT m.nim, m.nama_mahasiswa, j.nama_jurusan
FROM mahasiswa m
INNER JOIN jurusan j 
  ON m.id_jurusan = j.id_jurusan;`,
    description: 'Hanya menampilkan baris yang memiliki pasangan cocok pada kedua tabel yang direlasikan.',
    rules: [
      'Gunakan alias tabel (misal m dan j) untuk mencegah ambiguitas nama kolom.',
      'Kondisi kecocokan ditulis setelah kata kunci ON.'
    ]
  },
  {
    id: 'cs-06',
    category: 'JOIN (Relasi Antar Tabel)',
    title: 'LEFT JOIN (Pertahankan Tabel Kiri)',
    syntax: `SELECT t1.kolom, t2.kolom
FROM tabel1 t1
LEFT JOIN tabel2 t2 
  ON t1.kunci_relasi = t2.kunci_relasi;`,
    example: `SELECT mk.kode_mk, mk.nama_mk, k.nim
FROM mata_kuliah mk
LEFT JOIN krs k 
  ON mk.kode_mk = k.kode_mk;`,
    description: 'Mengembalikan seluruh baris dari tabel kiri (tabel1). Jika tabel kanan tidak memiliki data yang cocok, kolom tabel kanan akan bernilai NULL.',
    rules: [
      'Cocok untuk mencari data yang belum berelasi (misal: WHERE t2.id IS NULL).',
      'RIGHT JOIN bekerja dengan prinsip berkebalikan (mempertahankan tabel kanan).'
    ]
  },
  {
    id: 'cs-07',
    category: 'Agregasi & Grouping',
    title: 'GROUP BY & HAVING',
    syntax: `SELECT kolom_kategori, 
       COUNT(*), 
       AVG(kolom_nilai), 
       SUM(kolom_nilai)
FROM nama_tabel
WHERE kondisi_baris
GROUP BY kolom_kategori
HAVING kondisi_agregasi;`,
    example: `SELECT id_jurusan, 
       COUNT(*) AS total_mhs, 
       AVG(ipk) AS rerata_ipk
FROM mahasiswa
GROUP BY id_jurusan
HAVING COUNT(*) >= 2;`,
    description: 'Mengelompokkan baris data dan menjalankan fungsi ringkasan per kelompok.',
    rules: [
      'WHERE mengevaluasi baris SEBELUM pengelompokan.',
      'HAVING menyaring kelompok SETELAH agregasi dihitung.',
      'Kolom non-agregat di SELECT wajib ditulis di GROUP BY.'
    ]
  },
  {
    id: 'cs-08',
    category: 'Subquery (Kueri Bersarang)',
    title: 'Subquery dengan WHERE IN & Scalar',
    syntax: `-- Scalar Subquery (1 nilai tunggal)
WHERE kolom > (SELECT AVG(kolom) FROM tabel)

-- Multi-row Subquery (kumpulan nilai)
WHERE kolom IN (SELECT kolom FROM tabel WHERE kondisi)`,
    example: `SELECT nama_mahasiswa, ipk 
FROM mahasiswa 
WHERE ipk > (SELECT AVG(ipk) FROM mahasiswa);`,
    description: 'Kueri di dalam kueri lain untuk menyelesaikan komputasi bertahap.',
    rules: [
      'Scalar subquery harus mengembalikan tepat satu baris dan satu kolom.',
      'Subquery selalu dievaluasi lebih dulu sebelum kueri utama menggunakannya.'
    ]
  },
  {
    id: 'cs-09',
    category: 'DML (Modifikasi Data)',
    title: 'INSERT, UPDATE, & DELETE',
    syntax: `-- Insert baris baru
INSERT INTO tabel (kolom1, kolom2) VALUES (val1, val2);

-- Update baris
UPDATE tabel SET kolom1 = val_baru WHERE kondisi;

-- Delete baris
DELETE FROM tabel WHERE kondisi;`,
    example: `UPDATE produk 
SET stok = stok + 10, harga = 260000 
WHERE id_produk = 'PRD001';`,
    description: 'Perintah modifikasi data fisik dalam tabel.',
    rules: [
      'SELALU periksa klausa WHERE pada UPDATE dan DELETE.',
      'Tanpa WHERE, perintah UPDATE/DELETE akan mengenai seluruh isi tabel!'
    ]
  }
];
