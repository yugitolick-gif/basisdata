import { NormalizationStage } from '../types/database';

export const NORMALIZATION_STAGES: NormalizationStage[] = [
  {
    stage: 'UNF',
    title: 'Bentuk Tidak Ternormalisasi (0NF / UNF)',
    ruleTitle: 'Karakteristik Dokumen Asal',
    ruleDescription: 'Tabel memuat data mentah dari formulir/laporan kartu rencana studi. Terdapat kelompok berulang (repeating groups) dan satu sel memuat banyak nilai sekaligus (multi-valued data).',
    anomaliesDetected: [
      'Anomali Redundansi: Data mahasiswa (nama, prodi) tertulis berulang-ulang untuk setiap mata kuliah yang diambil.',
      'Anomali Penyisipan (Insert): Tidak bisa mencatat mata kuliah baru jika belum ada mahasiswa yang mengambilnya.',
      'Anomali Pembaruan (Update): Jika nama mahasiswa berubah, beberapa baris harus diubah manual. Jika terlewat satu baris, data inkonsisten.',
      'Anomali Penghapusan (Delete): Jika mahasiswa membatalkan pengambilan suatu mata kuliah, seluruh informasi mahasiswa tersebut berisiko hilang.'
    ],
    tables: [
      {
        name: 'tabel_mentah_krs (UNF)',
        description: 'Tabel unnormalized dengan sel bernilai ganda (Repeating Groups)',
        columns: [
          { name: 'NIM' },
          { name: 'Nama_Mhs' },
          { name: 'Kode_Prodi' },
          { name: 'Nama_Prodi' },
          { name: 'Daftar_MataKuliah (Array/Repeating Group)' },
          { name: 'Dosen_Wali' }
        ],
        rows: [
          {
            NIM: '210101',
            Nama_Mhs: 'Andi Pratama',
            Kode_Prodi: 'IF',
            Nama_Prodi: 'Teknik Informatika',
            'Daftar_MataKuliah (Array/Repeating Group)': '[IF201: Basis Data (A), IF202: Algoritma (B+)]',
            Dosen_Wali: 'Dr. Hendri Kusuma'
          },
          {
            NIM: '220101',
            Nama_Mhs: 'Candra Wijaya',
            Kode_Prodi: 'SI',
            Nama_Prodi: 'Sistem Informasi',
            'Daftar_MataKuliah (Array/Repeating Group)': '[IF201: Basis Data (B), SI301: Analisis Sistem (A)]',
            Dosen_Wali: 'Dr. Agus Priyono'
          }
        ]
      }
    ],
    dependencies: [
      {
        determinant: ['NIM'],
        dependent: ['Nama_Mhs', 'Kode_Prodi', 'Nama_Prodi', 'Dosen_Wali'],
        type: 'Partial',
        description: 'NIM menentukan identitas mahasiswa dan program studinya.'
      }
    ],
    summaryNote: 'Tabel belum memenuhi syarat relasional karena melanggar keatomikan data.'
  },
  {
    stage: '1NF',
    title: 'Bentuk Normal Pertama (1NF)',
    ruleTitle: 'Syarat: Nilai Atomik & Tanpa Repeating Groups',
    ruleDescription: 'Setiap atribut hanya boleh memuat satu nilai tunggal (atomic value). Kelompok berulang dipecah sehingga setiap kombinasi mata kuliah menjadi baris tersendiri. Kunci Utama komposit dibentuk: (NIM + Kode_MK).',
    anomaliesDetected: [
      'Masih ada Ketergantungan Parsial (Partial Dependency): Nama_Mhs, Nama_Prodi, dan Dosen_Wali hanya bergantung pada NIM saja, bukan bergantung pada gabungan (NIM + Kode_MK).',
      'Masih ada redundansi data nama mahasiswa dan nama prodi yang terulang di setiap baris mata kuliah.'
    ],
    tables: [
      {
        name: 'tabel_krs_1nf',
        description: 'Setiap sel bernilai tunggal. Primary Key komposit: (NIM, Kode_MK)',
        columns: [
          { name: 'NIM', isPk: true },
          { name: 'Kode_MK', isPk: true },
          { name: 'Nama_Mhs' },
          { name: 'Kode_Prodi' },
          { name: 'Nama_Prodi' },
          { name: 'Nama_MK' },
          { name: 'SKS' },
          { name: 'Nilai_Huruf' }
        ],
        rows: [
          { NIM: '210101', Kode_MK: 'IF201', Nama_Mhs: 'Andi Pratama', Kode_Prodi: 'IF', Nama_Prodi: 'Teknik Informatika', Nama_MK: 'Basis Data', SKS: 3, Nilai_Huruf: 'A' },
          { NIM: '210101', Kode_MK: 'IF202', Nama_Mhs: 'Andi Pratama', Kode_Prodi: 'IF', Nama_Prodi: 'Teknik Informatika', Nama_MK: 'Algoritma', SKS: 4, Nilai_Huruf: 'B+' },
          { NIM: '220101', Kode_MK: 'IF201', Nama_Mhs: 'Candra Wijaya', Kode_Prodi: 'SI', Nama_Prodi: 'Sistem Informasi', Nama_MK: 'Basis Data', SKS: 3, Nilai_Huruf: 'B' },
          { NIM: '220101', Kode_MK: 'SI301', Nama_Mhs: 'Candra Wijaya', Kode_Prodi: 'SI', Nama_Prodi: 'Sistem Informasi', Nama_MK: 'Analisis Sistem', SKS: 3, Nilai_Huruf: 'A' }
        ]
      }
    ],
    dependencies: [
      {
        determinant: ['NIM'],
        dependent: ['Nama_Mhs', 'Kode_Prodi', 'Nama_Prodi'],
        type: 'Partial',
        description: 'Ketergantungan Parsial: Atribut ini hanya bergantung pada sebagian PK (NIM), bukan seluruh PK komposit.'
      },
      {
        determinant: ['Kode_MK'],
        dependent: ['Nama_MK', 'SKS'],
        type: 'Partial',
        description: 'Ketergantungan Parsial: Nama_MK dan SKS hanya bergantung pada Kode_MK saja.'
      },
      {
        determinant: ['NIM', 'Kode_MK'],
        dependent: ['Nilai_Huruf'],
        type: 'Full',
        description: 'Ketergantungan Penuh: Nilai_Huruf memerlukan kombinasi mahasiswa spesifik dan mata kuliah spesifik.'
      }
    ],
    summaryNote: 'Telah memenuhi 1NF karena semua data bersifat atomik, namun belum memenuhi 2NF karena adanya Ketergantungan Parsial.'
  },
  {
    stage: '2NF',
    title: 'Bentuk Normal Kedua (2NF)',
    ruleTitle: 'Syarat: Memenuhi 1NF + Hilangkan Ketergantungan Parsial',
    ruleDescription: 'Atribut non-kunci harus bergantung sepenuhnya (Full Functional Dependency) pada Primary Key. Atribut yang hanya bergantung parsial dipisahkan ke dalam tabel entitas masing-masing (Mahasiswa, Mata_Kuliah, dan Nilai_KRS).',
    anomaliesDetected: [
      'Masih ada Ketergantungan Transitif (Transitive Dependency) pada tabel Mahasiswa: NIM -> Kode_Prodi dan Kode_Prodi -> Nama_Prodi. Nama_Prodi bergantung pada atribut non-kunci Kode_Prodi.'
    ],
    tables: [
      {
        name: 'mahasiswa_2nf',
        description: 'Entitas Mahasiswa (PK: NIM)',
        columns: [
          { name: 'NIM', isPk: true },
          { name: 'Nama_Mhs' },
          { name: 'Kode_Prodi' },
          { name: 'Nama_Prodi' }
        ],
        rows: [
          { NIM: '210101', Nama_Mhs: 'Andi Pratama', Kode_Prodi: 'IF', Nama_Prodi: 'Teknik Informatika' },
          { NIM: '220101', Nama_Mhs: 'Candra Wijaya', Kode_Prodi: 'SI', Nama_Prodi: 'Sistem Informasi' }
        ]
      },
      {
        name: 'mata_kuliah_2nf',
        description: 'Entitas Mata Kuliah (PK: Kode_MK)',
        columns: [
          { name: 'Kode_MK', isPk: true },
          { name: 'Nama_MK' },
          { name: 'SKS' }
        ],
        rows: [
          { Kode_MK: 'IF201', Nama_MK: 'Basis Data', SKS: 3 },
          { Kode_MK: 'IF202', Nama_MK: 'Algoritma', SKS: 4 },
          { Kode_MK: 'SI301', Nama_MK: 'Analisis Sistem', SKS: 3 }
        ]
      },
      {
        name: 'krs_nilai_2nf',
        description: 'Tabel Relasi / Nilai (PK Komposit: NIM + Kode_MK)',
        columns: [
          { name: 'NIM', isPk: true, isFk: true },
          { name: 'Kode_MK', isPk: true, isFk: true },
          { name: 'Nilai_Huruf' }
        ],
        rows: [
          { NIM: '210101', Kode_MK: 'IF201', Nilai_Huruf: 'A' },
          { NIM: '210101', Kode_MK: 'IF202', Nilai_Huruf: 'B+' },
          { NIM: '220101', Kode_MK: 'IF201', Nilai_Huruf: 'B' },
          { NIM: '220101', Kode_MK: 'SI301', Nilai_Huruf: 'A' }
        ]
      }
    ],
    dependencies: [
      {
        determinant: ['Kode_Prodi'],
        dependent: ['Nama_Prodi'],
        type: 'Transitive',
        description: 'Ketergantungan Transitif: NIM -> Kode_Prodi -> Nama_Prodi.'
      }
    ],
    summaryNote: 'Ketergantungan parsial telah hilang. Namun pada tabel mahasiswa terdapat ketergantungan transitif antar sesama atribut non-kunci.'
  },
  {
    stage: '3NF',
    title: 'Bentuk Normal Ketiga (3NF)',
    ruleTitle: 'Syarat: Memenuhi 2NF + Hilangkan Ketergantungan Transitif',
    ruleDescription: 'Tidak boleh ada atribut non-kunci yang menentukan atribut non-kunci lainnya (Non-key determinant). Tabel Mahasiswa dipecah: atribut program studi dibuatkan tabel tersendiri (`prodi`), dan tabel `mahasiswa` hanya menyimpan foreign key `Kode_Prodi`.',
    anomaliesDetected: [
      'Bebas dari seluruh anomali! Tidak ada anomali Insert, Update, maupun Delete.'
    ],
    tables: [
      {
        name: 'prodi (3NF)',
        description: 'Master Program Studi (PK: Kode_Prodi)',
        columns: [
          { name: 'Kode_Prodi', isPk: true },
          { name: 'Nama_Prodi' }
        ],
        rows: [
          { Kode_Prodi: 'IF', Nama_Prodi: 'Teknik Informatika' },
          { Kode_Prodi: 'SI', Nama_Prodi: 'Sistem Informasi' }
        ]
      },
      {
        name: 'mahasiswa (3NF)',
        description: 'Data Mahasiswa Bersih (PK: NIM, FK: Kode_Prodi)',
        columns: [
          { name: 'NIM', isPk: true },
          { name: 'Nama_Mhs' },
          { name: 'Kode_Prodi', isFk: true }
        ],
        rows: [
          { NIM: '210101', Nama_Mhs: 'Andi Pratama', Kode_Prodi: 'IF' },
          { NIM: '220101', Nama_Mhs: 'Candra Wijaya', Kode_Prodi: 'SI' }
        ]
      },
      {
        name: 'mata_kuliah (3NF)',
        description: 'Master Mata Kuliah (PK: Kode_MK)',
        columns: [
          { name: 'Kode_MK', isPk: true },
          { name: 'Nama_MK' },
          { name: 'SKS' }
        ],
        rows: [
          { Kode_MK: 'IF201', Nama_MK: 'Basis Data', SKS: 3 },
          { Kode_MK: 'IF202', Nama_MK: 'Algoritma', SKS: 4 },
          { Kode_MK: 'SI301', Nama_MK: 'Analisis Sistem', SKS: 3 }
        ]
      },
      {
        name: 'krs_nilai (3NF)',
        description: 'Tabel Transaksi KRS & Nilai (PK: NIM + Kode_MK)',
        columns: [
          { name: 'NIM', isPk: true, isFk: true },
          { name: 'Kode_MK', isPk: true, isFk: true },
          { name: 'Nilai_Huruf' }
        ],
        rows: [
          { NIM: '210101', Kode_MK: 'IF201', Nilai_Huruf: 'A' },
          { NIM: '210101', Kode_MK: 'IF202', Nilai_Huruf: 'B+' },
          { NIM: '220101', Kode_MK: 'IF201', Nilai_Huruf: 'B' },
          { NIM: '220101', Kode_MK: 'SI301', Nilai_Huruf: 'A' }
        ]
      }
    ],
    dependencies: [
      {
        determinant: ['Kode_Prodi'],
        dependent: ['Nama_Prodi'],
        type: 'Full',
        description: 'Ketergantungan Fungsional Penuh pada tabel prodi.'
      },
      {
        determinant: ['NIM'],
        dependent: ['Nama_Mhs', 'Kode_Prodi'],
        type: 'Full',
        description: 'Ketergantungan Fungsional Penuh pada tabel mahasiswa.'
      }
    ],
    summaryNote: 'Skema basis data telah berada dalam 3NF: efisien, tanpa duplikasi data, dan integritas terjaga penuh.'
  }
];
