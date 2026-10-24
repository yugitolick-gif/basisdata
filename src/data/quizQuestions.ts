import { QuizQuestion } from '../types/database';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-01',
    category: 'Konsep Dasar & Relasional',
    question: 'Atribut atau gabungan atribut terkecil (minimal) yang secara unik mengidentifikasi setiap baris (tupel) dalam suatu tabel relasional disebut sebagai:',
    options: [
      'Super Key',
      'Candidate Key',
      'Foreign Key',
      'Secondary Key'
    ],
    correctAnswer: 1,
    explanation: 'Candidate Key adalah Super Key yang minimal (tidak memiliki atribut berlebih) yang mampu mengidentifikasi setiap tupel secara unik. Dari kumpulan candidate key inilah salah satunya dipilih menjadi Primary Key.',
    keyTakeaway: 'Semua Candidate Key adalah Super Key, tetapi tidak semua Super Key adalah Candidate Key.'
  },
  {
    id: 'q-02',
    category: 'Konsep Dasar & Relasional',
    question: 'Dalam pemodelan Entity-Relationship Diagram (ERD), relasi Many-to-Many (N:M) antara dua entitas (misalnya Mahasiswa dan Mata Kuliah) ketika ditransformasikan ke skema relasional memerlukan:',
    options: [
      'Menambahkan Foreign Key pada salah satu tabel',
      'Membuat tabel penghubung baru (Junction / Associative Table) dengan Foreign Key ke kedua entitas',
      'Menggabungkan kedua entitas menjadi satu tabel raksasa',
      'Menghapus salah satu entitas agar menjadi 1:N'
    ],
    correctAnswer: 1,
    explanation: 'Hubungan Many-to-Many tidak dapat direpresentasikan secara langsung hanya dengan menambahkan kolom FK pada tabel yang ada. Diperlukan tabel asosiasi baru (misalnya tabel KRS) yang memuat Foreign Key dari kedua tabel induk.',
    keyTakeaway: 'Relasi N:M selalu dipecah menjadi dua relasi 1:N melalui tabel perantara (bridge/junction table).'
  },
  {
    id: 'q-03',
    category: 'SQL DDL & Constraint',
    question: 'Perintah SQL manakah yang tergolong dalam Data Definition Language (DDL)?',
    options: [
      'SELECT, INSERT, UPDATE, DELETE',
      'CREATE, ALTER, DROP, TRUNCATE',
      'GRANT, REVOKE',
      'COMMIT, ROLLBACK, SAVEPOINT'
    ],
    correctAnswer: 1,
    explanation: 'DDL (Data Definition Language) digunakan untuk mendefinisikan dan memodifikasi struktur skema basis data, seperti `CREATE`, `ALTER`, `DROP`, dan `TRUNCATE`. Pilihan A adalah DML, pilihan C adalah DCL, dan pilihan D adalah TCL.',
    keyTakeaway: 'DDL mengatur struktur/wadah data, sedangkan DML memanipulasi isi datanya.'
  },
  {
    id: 'q-04',
    category: 'SQL DDL & Constraint',
    question: 'Jika suatu Foreign Key didefinisikan dengan aturan `ON DELETE CASCADE`, apa yang terjadi saat baris pada tabel induk (parent table) dihapus?',
    options: [
      'Penghapusan ditolak oleh sistem basis data jika masih ada data terkait',
      'Seluruh baris anak (child rows) yang merujuk ke data induk tersebut otomatis ikut terhapus',
      'Kolom Foreign Key pada baris anak otomatis diubah menjadi NULL',
      'Data induk terhapus tetapi data anak tetap utuh tanpa hubungan'
    ],
    correctAnswer: 1,
    explanation: '`ON DELETE CASCADE` secara otomatis menghapus rekaman di tabel anak (child table) apabila baris referensinya di tabel induk dihapus, menjaga integritas referensial.',
    keyTakeaway: 'CASCADE = penghapusan berantai; RESTRICT/NO ACTION = cegah penghapusan bila masih ada relasi aktif.'
  },
  {
    id: 'q-05',
    category: 'SQL DML & JOIN',
    question: 'Manakah urutan eksekusi logis (Logical Query Processing) yang benar pada sistem manajemen basis data SQL?',
    options: [
      'SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY',
      'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT',
      'FROM -> SELECT -> WHERE -> HAVING -> GROUP BY -> ORDER BY',
      'WHERE -> FROM -> SELECT -> GROUP BY -> ORDER BY -> LIMIT'
    ],
    correctAnswer: 1,
    explanation: 'Meski klausa `SELECT` ditulis di baris pertama pada sintaks, RDBMS memproses kueri dimulai dari `FROM` (mengambil tabel target), lalu `WHERE` (filter baris), `GROUP BY` (pengelompokan), `HAVING` (filter agregat), `SELECT` (proyeksi kolom), `ORDER BY` (pengurutan), dan terakhir `LIMIT`.',
    keyTakeaway: 'Klausa WHERE tidak bisa menggunakan alias dari SELECT karena WHERE dieksekusi lebih dulu daripada SELECT!'
  },
  {
    id: 'q-06',
    category: 'SQL DML & JOIN',
    question: 'Perhatikan kueri berikut:\nSELECT * FROM pelanggan LEFT JOIN pesanan ON pelanggan.id = pesanan.id_pelanggan;\nApa yang dihasilkan oleh LEFT JOIN tersebut?',
    codeSnippet: 'SELECT * FROM pelanggan \nLEFT JOIN pesanan \nON pelanggan.id = pesanan.id_pelanggan;',
    options: [
      'Hanya pelanggan yang pernah melakukan pemesanan',
      'Hanya pesanan yang memiliki data pelanggan',
      'Semua pelanggan, baik yang sudah pernah memesan maupun yang belum pernah memesan (kolom pesanan bernilai NULL)',
      'Semua data pesanan digabung tanpa mempedulikan kecocokan ID'
    ],
    correctAnswer: 2,
    explanation: '`LEFT JOIN` mengembalikan semua baris dari tabel kiri (`pelanggan`), ditambah baris yang cocok dari tabel kanan (`pesanan`). Jika pelanggan belum memiliki pesanan, kolom dari tabel kanan akan bernilai `NULL`.',
    keyTakeaway: 'LEFT JOIN mempertahankan semua rekaman tabel kiri meskipun tidak ada padanannya di tabel kanan.'
  },
  {
    id: 'q-07',
    category: 'Agregasi & Subquery',
    question: 'Mengapa kueri berikut ini akan menghasilkan error sintaks pada RDBMS standar?\nSELECT jurusan, AVG(ipk) FROM mahasiswa WHERE AVG(ipk) > 3.0 GROUP BY jurusan;',
    codeSnippet: 'SELECT jurusan, AVG(ipk) \nFROM mahasiswa \nWHERE AVG(ipk) > 3.0 \nGROUP BY jurusan;',
    options: [
      'Kolom jurusan tidak boleh digabungkan dengan fungsi AVG',
      'Fungsi agregat (seperti AVG) tidak diizinkan di dalam klausa WHERE, seharusnya menggunakan HAVING',
      'Klausa GROUP BY harus ditulis sebelum klausa WHERE',
      'Nilai desimal 3.0 harus diapit tanda kutip satu'
    ],
    correctAnswer: 1,
    explanation: 'Klausa `WHERE` mengevaluasi baris data satu demi satu sebelum pengelompokan terjadi, sehingga fungsi agregat belum dapat dihitung pada tahap `WHERE`. Untuk menyaring hasil agregasi grup, gunakan `HAVING AVG(ipk) > 3.0`.',
    keyTakeaway: 'Gunakan WHERE untuk memfilter baris individual, gunakan HAVING untuk memfilter hasil agregat kelompok.'
  },
  {
    id: 'q-08',
    category: 'Agregasi & Subquery',
    question: 'Apa perbedaan mendasar antara fungsi `COUNT(*)` dan `COUNT(nama_kolom)`?',
    options: [
      'COUNT(*) jauh lebih lambat daripada COUNT(kolom)',
      'COUNT(*) menghitung seluruh baris termasuk yang bernilai NULL, sedangkan COUNT(kolom) mengabaikan baris yang kolomnya bernilai NULL',
      'COUNT(kolom) menghitung seluruh baris termasuk NULL, sedangkan COUNT(*) mengabaikan NULL',
      'Tidak ada perbedaan, keduanya menghasilkan nilai yang persis sama'
    ],
    correctAnswer: 1,
    explanation: '`COUNT(*)` menghitung total jumlah baris fisik yang dikembalikan kueri. Sedangkan `COUNT(nama_kolom)` hanya menghitung baris yang kolom tersebut tidak bernilai `NULL`.',
    keyTakeaway: 'Hati-hati: jika kolom berisi nilai NULL, COUNT(kolom) < COUNT(*).'
  },
  {
    id: 'q-09',
    category: 'Normalisasi & ACID',
    question: 'Suatu relasi dikatakan memenuhi Bentuk Normal Pertama (1NF) jika dan hanya jika:',
    options: [
      'Semua atribut non-kunci bergantung secara fungsional penuh pada Primary Key',
      'Setiap atribut hanya memiliki nilai tunggal (atomik) dan tidak ada perulangan grup (repeating groups)',
      'Tidak ada ketergantungan transitif antar atribut non-kunci',
      'Setiap penentu (determinant) adalah Candidate Key'
    ],
    correctAnswer: 1,
    explanation: 'Syarat utama 1NF (First Normal Form) adalah sifat keatomikan (atomic): setiap kolom hanya boleh memuat satu nilai tunggal per baris, serta tidak boleh ada multi-valued attributes atau repeating groups.',
    keyTakeaway: '1NF = Nilai Atomik, Tidak ada atribut bernilai ganda dalam satu sel tabel.'
  },
  {
    id: 'q-10',
    category: 'Normalisasi & ACID',
    question: 'Ketergantungan di mana atribut non-kunci bergantung hanya pada sebagian dari Composite Primary Key (kunci komposit gabungan) disebut:',
    options: [
      'Ketergantungan Fungsional Penuh (Full Functional Dependency)',
      'Ketergantungan Parsial (Partial Dependency)',
      'Ketergantungan Transitif (Transitive Dependency)',
      'Ketergantungan Multivalued'
    ],
    correctAnswer: 1,
    explanation: 'Ketergantungan Parsial terjadi ketika atribut non-prime bergantung pada subset (sebagian) dari composite key. Menghilangkan ketergantungan parsial adalah langkah mutlak untuk mencapai 2NF (Bentuk Normal Kedua).',
    keyTakeaway: '2NF = Memenuhi 1NF + Menghilangkan Ketergantungan Parsial.'
  },
  {
    id: 'q-11',
    category: 'Normalisasi & ACID',
    question: 'Perhatikan relasi dengan skema: Mahasiswa(NIM, Nama, Kode_Jurusan, Nama_Jurusan).\nJika NIM -> Kode_Jurusan dan Kode_Jurusan -> Nama_Jurusan, anomali ini melanggar bentuk normal apa?',
    options: [
      'Bentuk Normal Pertama (1NF)',
      'Bentuk Normal Kedua (2NF)',
      'Bentuk Normal Ketiga (3NF) karena adanya Ketergantungan Transitif',
      'Boyce-Codd Normal Form (BCNF)'
    ],
    correctAnswer: 2,
    explanation: 'Relasi tersebut melanggar 3NF karena atribut non-kunci `Nama_Jurusan` bergantung pada atribut non-kunci lainnya (`Kode_Jurusan`). Ini disebut Ketergantungan Transitif (A -> B dan B -> C, maka A -> C). Solusinya adalah memecah tabel menjadi tabel `Jurusan(Kode_Jurusan, Nama_Jurusan)`.',
    keyTakeaway: '3NF = Memenuhi 2NF + Menghilangkan Ketergantungan Transitif (Non-key menentukan Non-key).'
  },
  {
    id: 'q-12',
    category: 'Normalisasi & ACID',
    question: 'Dalam konsep transaksi basis data, sifat ACID yang menjamin bahwa seluruh operasi dalam transaksi berhasil sepenuhnya atau dibatalkan sama sekali (All or Nothing) adalah:',
    options: [
      'Atomicity',
      'Consistency',
      'Isolation',
      'Durability'
    ],
    correctAnswer: 0,
    explanation: 'Atomicity (Keatoman) memastikan bahwa rangkaian instruksi transaksi diperlakukan sebagai unit tunggal yang tidak terpisahkan. Jika satu langkah gagal (misal server mati saat transfer bank), seluruh perubahan di-rollback kembali ke keadaan awal.',
    keyTakeaway: 'ACID: Atomicity (semua atau tidak sama sekali), Consistency (validitas aturan), Isolation (keamanan transaksi simultan), Durability (daya tahan tersimpan permanen).'
  },
  {
    id: 'q-13',
    category: 'SQL DML & JOIN',
    question: 'Manakah klausa yang digunakan untuk menghilangkan duplikasi baris hasil kueri SELECT?',
    options: [
      'SELECT UNIQUE ...',
      'SELECT DISTINCT ...',
      'SELECT NO_DUPLICATE ...',
      'SELECT FILTER ...'
    ],
    correctAnswer: 1,
    explanation: 'Klausa `SELECT DISTINCT` menyaring baris hasil kueri sehingga hanya menampilkan baris-baris yang unik (tidak ada duplikasi nilai pada kombinasi kolom yang dipilih).',
    keyTakeaway: 'Gunakan DISTINCT saat ingin melihat variasi nilai unik dalam kumpulan baris data.'
  },
  {
    id: 'q-14',
    category: 'SQL DDL & Constraint',
    question: 'Apa perbedaan utama antara perintah `DROP TABLE` dan `TRUNCATE TABLE`?',
    options: [
      'DROP TABLE hanya menghapus data, sedangkan TRUNCATE TABLE menghapus struktur tabel dan datanya',
      'DROP TABLE menghapus data beserta definisi struktur tabel dari katalog basis data, sedangkan TRUNCATE TABLE mengosongkan seluruh baris isi tabel namun mempertahankan struktur tabel',
      'Keduanya sama persis, TRUNCATE hanya alias dari DROP',
      'TRUNCATE memerlukan klausa WHERE, sedangkan DROP tidak'
    ],
    correctAnswer: 1,
    explanation: '`DROP TABLE` menghapus tabel secara total (struktur skema dan datanya lenyap). Sedangkan `TRUNCATE TABLE` mengosongkan semua baris data dengan sangat cepat tetapi membiarkan struktur tabel tetap ada untuk dapat diisi kembali.',
    keyTakeaway: 'DROP = hapus wadah + isi; TRUNCATE = buang isi, pertahankan wadah kosong.'
  },
  {
    id: 'q-15',
    category: 'Agregasi & Subquery',
    question: 'Subquery yang dieksekusi berulang kali untuk setiap baris dari kueri utama (outer query) karena merujuk pada nilai kolom kueri luar disebut:',
    options: [
      'Scalar Subquery',
      'Correlated Subquery',
      'Inline View',
      'Common Table Expression (CTE)'
    ],
    correctAnswer: 1,
    explanation: 'Correlated Subquery (Kueri Bersarang Berkorelasi) bergantung pada data outer query di setiap iterasi barisnya, berbeda dengan un-correlated subquery yang hanya perlu dieksekusi satu kali sebelum outer query.',
    keyTakeaway: 'Correlated subquery merujuk alias tabel dari kueri pembungkus di luarnya.'
  }
];
