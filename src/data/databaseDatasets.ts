import { DatasetInfo } from '../types/database';

export const DATASETS: Record<string, DatasetInfo> = {
  universitas: {
    key: 'universitas',
    title: 'Sistem Informasi Akademik Kampus',
    subtitle: 'Skema Relasional Kampus & Perkuliahan',
    description: 'Skema akademik lengkap berisi data jurusan, dosen, mahasiswa, mata kuliah, KRS, dan transkrip nilai perkuliahan.',
    tables: {
      jurusan: {
        name: 'jurusan',
        displayName: 'Jurusan / Prodi',
        description: 'Daftar program studi dan fakultas pengampu',
        columns: [
          { name: 'id_jurusan', type: 'VARCHAR(5)', isPk: true, description: 'Kode unik jurusan' },
          { name: 'nama_jurusan', type: 'VARCHAR(50)', nullable: false, description: 'Nama program studi' },
          { name: 'fakultas', type: 'VARCHAR(50)', nullable: false, description: 'Fakultas naungan' },
          { name: 'ketua_jurusan', type: 'VARCHAR(60)', nullable: false, description: 'Nama ketua program studi' }
        ],
        sampleData: [
          { id_jurusan: 'IF', nama_jurusan: 'Teknik Informatika', fakultas: 'Ilmu Komputer', ketua_jurusan: 'Dr. Ir. Budi Santoso, M.Kom.' },
          { id_jurusan: 'SI', nama_jurusan: 'Sistem Informasi', fakultas: 'Ilmu Komputer', ketua_jurusan: 'Dr. Siti Rahma, M.T.' },
          { id_jurusan: 'TE', nama_jurusan: 'Teknik Elektro', fakultas: 'Teknik', ketua_jurusan: 'Prof. Ahmad Fauzi, Ph.D.' },
          { id_jurusan: 'MN', nama_jurusan: 'Manajemen Bisnis', fakultas: 'Ekonomi & Bisnis', ketua_jurusan: 'Dr. Hendra Wijaya, M.M.' }
        ],
        ddlSql: `CREATE TABLE jurusan (
  id_jurusan VARCHAR(5) PRIMARY KEY,
  nama_jurusan VARCHAR(50) NOT NULL,
  fakultas VARCHAR(50) NOT NULL,
  ketua_jurusan VARCHAR(60) NOT NULL
);`
      },
      dosen: {
        name: 'dosen',
        displayName: 'Dosen Pengajar',
        description: 'Informasi tenaga pengajar akademis',
        columns: [
          { name: 'nip', type: 'VARCHAR(10)', isPk: true, description: 'Nomor Induk Pegawai' },
          { name: 'nama_dosen', type: 'VARCHAR(60)', nullable: false, description: 'Nama lengkap beserta gelar' },
          { name: 'email', type: 'VARCHAR(50)', nullable: false, description: 'Email institusi' },
          { name: 'id_jurusan', type: 'VARCHAR(5)', isFk: true, fkTarget: 'jurusan.id_jurusan', description: 'Jurusan homebase dosen' }
        ],
        sampleData: [
          { nip: 'D001', nama_dosen: 'Dr. Hendri Kusuma, M.Kom.', email: 'hendri@kampus.ac.id', id_jurusan: 'IF' },
          { nip: 'D002', nama_dosen: 'Dra. Rina Marlina, M.Cs.', email: 'rina@kampus.ac.id', id_jurusan: 'IF' },
          { nip: 'D003', nama_dosen: 'Dr. Agus Priyono, M.T.', email: 'agus@kampus.ac.id', id_jurusan: 'SI' },
          { nip: 'D004', nama_dosen: 'Dewi Sartika, S.T., M.Sc.', email: 'dewi@kampus.ac.id', id_jurusan: 'TE' },
          { nip: 'D005', nama_dosen: 'Bambang Irawan, S.E., M.M.', email: 'bambang@kampus.ac.id', id_jurusan: 'MN' },
          { nip: 'D006', nama_dosen: 'Farida Nur, M.Kom.', email: 'farida@kampus.ac.id', id_jurusan: 'IF' }
        ],
        ddlSql: `CREATE TABLE dosen (
  nip VARCHAR(10) PRIMARY KEY,
  nama_dosen VARCHAR(60) NOT NULL,
  email VARCHAR(50) NOT NULL,
  id_jurusan VARCHAR(5) NOT NULL,
  FOREIGN KEY (id_jurusan) REFERENCES jurusan(id_jurusan)
);`
      },
      mahasiswa: {
        name: 'mahasiswa',
        displayName: 'Mahasiswa',
        description: 'Data biodata mahasiswa aktif',
        columns: [
          { name: 'nim', type: 'VARCHAR(10)', isPk: true, description: 'Nomor Induk Mahasiswa' },
          { name: 'nama_mahasiswa', type: 'VARCHAR(60)', nullable: false, description: 'Nama lengkap mahasiswa' },
          { name: 'jenis_kelamin', type: 'CHAR(1)', nullable: false, description: 'L = Laki-laki, P = Perempuan' },
          { name: 'angkatan', type: 'INT', nullable: false, description: 'Tahun angkatan masuk' },
          { name: 'ipk', type: 'DECIMAL(3,2)', nullable: false, description: 'Indeks Prestasi Kumulatif' },
          { name: 'id_jurusan', type: 'VARCHAR(5)', isFk: true, fkTarget: 'jurusan.id_jurusan', description: 'Jurusan yang diambil' }
        ],
        sampleData: [
          { nim: '210101', nama_mahasiswa: 'Andi Pratama', jenis_kelamin: 'L', angkatan: 2021, ipk: 3.75, id_jurusan: 'IF' },
          { nim: '210102', nama_mahasiswa: 'Bunga Citra', jenis_kelamin: 'P', angkatan: 2021, ipk: 3.82, id_jurusan: 'IF' },
          { nim: '220101', nama_mahasiswa: 'Candra Wijaya', jenis_kelamin: 'L', angkatan: 2022, ipk: 3.20, id_jurusan: 'SI' },
          { nim: '220102', nama_mahasiswa: 'Dina Anugerah', jenis_kelamin: 'P', angkatan: 2022, ipk: 3.65, id_jurusan: 'SI' },
          { nim: '230101', nama_mahasiswa: 'Eko Saputra', jenis_kelamin: 'L', angkatan: 2023, ipk: 2.95, id_jurusan: 'TE' },
          { nim: '230102', nama_mahasiswa: 'Fani Oktavia', jenis_kelamin: 'P', angkatan: 2023, ipk: 3.50, id_jurusan: 'MN' },
          { nim: '230103', nama_mahasiswa: 'Gilang Ramadhan', jenis_kelamin: 'L', angkatan: 2023, ipk: 3.40, id_jurusan: 'IF' },
          { nim: '240101', nama_mahasiswa: 'Hana Safitri', jenis_kelamin: 'P', angkatan: 2024, ipk: 3.90, id_jurusan: 'SI' }
        ],
        ddlSql: `CREATE TABLE mahasiswa (
  nim VARCHAR(10) PRIMARY KEY,
  nama_mahasiswa VARCHAR(60) NOT NULL,
  jenis_kelamin CHAR(1) NOT NULL,
  angkatan INT NOT NULL,
  ipk DECIMAL(3,2) NOT NULL,
  id_jurusan VARCHAR(5) NOT NULL,
  FOREIGN KEY (id_jurusan) REFERENCES jurusan(id_jurusan)
);`
      },
      mata_kuliah: {
        name: 'mata_kuliah',
        displayName: 'Mata Kuliah',
        description: 'Daftar mata kuliah kurikulum',
        columns: [
          { name: 'kode_mk', type: 'VARCHAR(10)', isPk: true, description: 'Kode mata kuliah' },
          { name: 'nama_mk', type: 'VARCHAR(60)', nullable: false, description: 'Nama mata kuliah' },
          { name: 'sks', type: 'INT', nullable: false, description: 'Bobot Satuan Kredit Semester' },
          { name: 'semester', type: 'INT', nullable: false, description: 'Semester rekomendasi' },
          { name: 'nip_pengampu', type: 'VARCHAR(10)', isFk: true, fkTarget: 'dosen.nip', description: 'Dosen koordinator mata kuliah' }
        ],
        sampleData: [
          { kode_mk: 'IF201', nama_mk: 'Basis Data', sks: 3, semester: 3, nip_pengampu: 'D001' },
          { kode_mk: 'IF202', nama_mk: 'Struktur Data & Algoritma', sks: 4, semester: 3, nip_pengampu: 'D002' },
          { kode_mk: 'SI301', nama_mk: 'Analisis & Perancangan Sistem', sks: 3, semester: 4, nip_pengampu: 'D003' },
          { kode_mk: 'IF401', nama_mk: 'Pemrograman Web Lanjut', sks: 3, semester: 5, nip_pengampu: 'D006' },
          { kode_mk: 'TE101', nama_mk: 'Rangkaian Listrik Dasar', sks: 3, semester: 2, nip_pengampu: 'D004' },
          { kode_mk: 'MN201', nama_mk: 'Manajemen Pemasaran Digital', sks: 2, semester: 3, nip_pengampu: 'D005' }
        ],
        ddlSql: `CREATE TABLE mata_kuliah (
  kode_mk VARCHAR(10) PRIMARY KEY,
  nama_mk VARCHAR(60) NOT NULL,
  sks INT NOT NULL,
  semester INT NOT NULL,
  nip_pengampu VARCHAR(10) NOT NULL,
  FOREIGN KEY (nip_pengampu) REFERENCES dosen(nip)
);`
      },
      krs: {
        name: 'krs',
        displayName: 'Kartu Rencana Studi (KRS)',
        description: 'Relasi pengambilan mata kuliah oleh mahasiswa (Relasi M-to-N)',
        columns: [
          { name: 'id_krs', type: 'INT', isPk: true, description: 'ID entri KRS' },
          { name: 'nim', type: 'VARCHAR(10)', isFk: true, fkTarget: 'mahasiswa.nim', description: 'NIM mahasiswa' },
          { name: 'kode_mk', type: 'VARCHAR(10)', isFk: true, fkTarget: 'mata_kuliah.kode_mk', description: 'Kode mata kuliah yang diambil' },
          { name: 'tahun_ajaran', type: 'VARCHAR(9)', nullable: false, description: 'Contoh: 2023/2024' },
          { name: 'semester_ambil', type: 'VARCHAR(6)', nullable: false, description: 'Ganjil / Genap' }
        ],
        sampleData: [
          { id_krs: 1, nim: '210101', kode_mk: 'IF201', tahun_ajaran: '2023/2024', semester_ambil: 'Ganjil' },
          { id_krs: 2, nim: '210101', kode_mk: 'IF202', tahun_ajaran: '2023/2024', semester_ambil: 'Ganjil' },
          { id_krs: 3, nim: '210102', kode_mk: 'IF201', tahun_ajaran: '2023/2024', semester_ambil: 'Ganjil' },
          { id_krs: 4, nim: '210102', kode_mk: 'IF401', tahun_ajaran: '2023/2024', semester_ambil: 'Ganjil' },
          { id_krs: 5, nim: '220101', kode_mk: 'IF201', tahun_ajaran: '2023/2024', semester_ambil: 'Ganjil' },
          { id_krs: 6, nim: '220101', kode_mk: 'SI301', tahun_ajaran: '2023/2024', semester_ambil: 'Ganjil' },
          { id_krs: 7, nim: '220102', kode_mk: 'SI301', tahun_ajaran: '2023/2024', semester_ambil: 'Ganjil' },
          { id_krs: 8, nim: '230103', kode_mk: 'IF201', tahun_ajaran: '2023/2024', semester_ambil: 'Ganjil' }
        ],
        ddlSql: `CREATE TABLE krs (
  id_krs INT PRIMARY KEY,
  nim VARCHAR(10) NOT NULL,
  kode_mk VARCHAR(10) NOT NULL,
  tahun_ajaran VARCHAR(9) NOT NULL,
  semester_ambil VARCHAR(6) NOT NULL,
  FOREIGN KEY (nim) REFERENCES mahasiswa(nim),
  FOREIGN KEY (kode_mk) REFERENCES mata_kuliah(kode_mk)
);`
      },
      nilai: {
        name: 'nilai',
        displayName: 'Transkrip Nilai',
        description: 'Nilai ujian dan evaluasi per entri KRS',
        columns: [
          { name: 'id_nilai', type: 'INT', isPk: true, description: 'ID nilai' },
          { name: 'id_krs', type: 'INT', isFk: true, fkTarget: 'krs.id_krs', description: 'ID referensi KRS' },
          { name: 'nilai_tugas', type: 'DECIMAL(5,2)', nullable: false, description: 'Bobot tugas 20%' },
          { name: 'nilai_uts', type: 'DECIMAL(5,2)', nullable: false, description: 'Bobot UTS 35%' },
          { name: 'nilai_uas', type: 'DECIMAL(5,2)', nullable: false, description: 'Bobot UAS 45%' },
          { name: 'nilai_akhir', type: 'DECIMAL(5,2)', nullable: false, description: 'Rata-rata tertimbang' },
          { name: 'grade', type: 'VARCHAR(2)', nullable: false, description: 'A, B+, B, C+, C, D, E' }
        ],
        sampleData: [
          { id_nilai: 1, id_krs: 1, nilai_tugas: 88, nilai_uts: 85, nilai_uas: 90, nilai_akhir: 87.85, grade: 'A' },
          { id_nilai: 2, id_krs: 2, nilai_tugas: 80, nilai_uts: 75, nilai_uas: 82, nilai_akhir: 79.15, grade: 'B+' },
          { id_nilai: 3, id_krs: 3, nilai_tugas: 95, nilai_uts: 90, nilai_uas: 92, nilai_akhir: 91.90, grade: 'A' },
          { id_nilai: 4, id_krs: 4, nilai_tugas: 85, nilai_uts: 80, nilai_uas: 85, nilai_akhir: 83.25, grade: 'A' },
          { id_nilai: 5, id_krs: 5, nilai_tugas: 70, nilai_uts: 68, nilai_uas: 72, nilai_akhir: 70.20, grade: 'B' },
          { id_nilai: 6, id_krs: 6, nilai_tugas: 75, nilai_uts: 72, nilai_uas: 78, nilai_akhir: 75.30, grade: 'B+' },
          { id_nilai: 7, id_krs: 7, nilai_tugas: 90, nilai_uts: 88, nilai_uas: 86, nilai_akhir: 87.50, grade: 'A' },
          { id_nilai: 8, id_krs: 8, nilai_tugas: 78, nilai_uts: 70, nilai_uas: 75, nilai_akhir: 73.85, grade: 'B' }
        ],
        ddlSql: `CREATE TABLE nilai (
  id_nilai INT PRIMARY KEY,
  id_krs INT NOT NULL,
  nilai_tugas DECIMAL(5,2) NOT NULL,
  nilai_uts DECIMAL(5,2) NOT NULL,
  nilai_uas DECIMAL(5,2) NOT NULL,
  nilai_akhir DECIMAL(5,2) NOT NULL,
  grade VARCHAR(2) NOT NULL,
  FOREIGN KEY (id_krs) REFERENCES krs(id_krs)
);`
      }
    }
  },
  ecommerce: {
    key: 'ecommerce',
    title: 'E-Commerce Marketplace',
    subtitle: 'Skema Transaksi Retail & Penjualan Produk',
    description: 'Skema toko online yang mencakup katalog kategori, produk, data pelanggan, transaksi pesanan, dan rincian belanja.',
    tables: {
      kategori: {
        name: 'kategori',
        displayName: 'Kategori Produk',
        description: 'Kelompok barang dagangan',
        columns: [
          { name: 'id_kategori', type: 'INT', isPk: true, description: 'ID kategori' },
          { name: 'nama_kategori', type: 'VARCHAR(40)', nullable: false, description: 'Nama kategori' },
          { name: 'deskripsi', type: 'VARCHAR(100)', nullable: true, description: 'Deskripsi kategori' }
        ],
        sampleData: [
          { id_kategori: 1, nama_kategori: 'Elektronik & Gadget', deskripsi: 'Peralatan komputasi dan telepon pintar' },
          { id_kategori: 2, nama_kategori: 'Buku & Edukasi', deskripsi: 'Buku teks akademik, novel, dan tutorial' },
          { id_kategori: 3, nama_kategori: 'Pakaian & Fashion', deskripsi: 'Pakaian pria, wanita, dan aksesoris' },
          { id_kategori: 4, nama_kategori: 'Peralatan Rumah', deskripsi: 'Perkakas dapur dan furnitur minimalis' }
        ],
        ddlSql: `CREATE TABLE kategori (
  id_kategori INT PRIMARY KEY,
  nama_kategori VARCHAR(40) NOT NULL,
  deskripsi VARCHAR(100)
);`
      },
      pelanggan: {
        name: 'pelanggan',
        displayName: 'Pelanggan / Member',
        description: 'Biodata akun pembeli',
        columns: [
          { name: 'id_pelanggan', type: 'VARCHAR(6)', isPk: true, description: 'Kode pembeli' },
          { name: 'nama_pelanggan', type: 'VARCHAR(50)', nullable: false, description: 'Nama pembeli' },
          { name: 'email', type: 'VARCHAR(50)', nullable: false, description: 'Email akun' },
          { name: 'kota', type: 'VARCHAR(30)', nullable: false, description: 'Kota domisili' },
          { name: 'tgl_daftar', type: 'VARCHAR(10)', nullable: false, description: 'Tanggal bergabung' }
        ],
        sampleData: [
          { id_pelanggan: 'CUST01', nama_pelanggan: 'Rian Hidayat', email: 'rian@gmail.com', kota: 'Jakarta', tgl_daftar: '2023-01-15' },
          { id_pelanggan: 'CUST02', nama_pelanggan: 'Sari Indah', email: 'sari@yahoo.com', kota: 'Bandung', tgl_daftar: '2023-02-20' },
          { id_pelanggan: 'CUST03', nama_pelanggan: 'Bayu Wicaksono', email: 'bayu@gmail.com', kota: 'Surabaya', tgl_daftar: '2023-03-10' },
          { id_pelanggan: 'CUST04', nama_pelanggan: 'Nadia Putri', email: 'nadia@outlook.com', kota: 'Yogyakarta', tgl_daftar: '2023-04-05' },
          { id_pelanggan: 'CUST05', nama_pelanggan: 'Tegar Pratama', email: 'tegar@gmail.com', kota: 'Bandung', tgl_daftar: '2023-05-18' }
        ],
        ddlSql: `CREATE TABLE pelanggan (
  id_pelanggan VARCHAR(6) PRIMARY KEY,
  nama_pelanggan VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL,
  kota VARCHAR(30) NOT NULL,
  tgl_daftar VARCHAR(10) NOT NULL
);`
      },
      produk: {
        name: 'produk',
        displayName: 'Katalog Produk',
        description: 'Barang yang dijual beserta harga dan stok',
        columns: [
          { name: 'id_produk', type: 'VARCHAR(6)', isPk: true, description: 'Kode SKU produk' },
          { name: 'nama_produk', type: 'VARCHAR(60)', nullable: false, description: 'Nama barang' },
          { name: 'id_kategori', type: 'INT', isFk: true, fkTarget: 'kategori.id_kategori', description: 'ID kategori' },
          { name: 'harga', type: 'INT', nullable: false, description: 'Harga satuan dlm rupiah' },
          { name: 'stok', type: 'INT', nullable: false, description: 'Sisa stok gudang' }
        ],
        sampleData: [
          { id_produk: 'PRD001', nama_produk: 'Mouse Wireless Ergonomic', id_kategori: 1, harga: 250000, stok: 45 },
          { id_produk: 'PRD002', nama_produk: 'Keyboard Mechanical RGB', id_kategori: 1, harga: 650000, stok: 20 },
          { id_produk: 'PRD003', nama_produk: 'Buku Konsep Basis Data Relasional', id_kategori: 2, harga: 120000, stok: 80 },
          { id_produk: 'PRD004', nama_produk: 'Buku Mahir SQL & Analisis Data', id_kategori: 2, harga: 145000, stok: 35 },
          { id_produk: 'PRD005', nama_produk: 'Kaos Katun Combed 30s Hitam', id_kategori: 3, harga: 85000, stok: 150 },
          { id_produk: 'PRD006', nama_produk: 'Jaket Hoodie Fleece Tebal', id_kategori: 3, harga: 220000, stok: 12 },
          { id_produk: 'PRD007', nama_produk: 'Lampu Meja LED Fleksibel', id_kategori: 4, harga: 95000, stok: 60 }
        ],
        ddlSql: `CREATE TABLE produk (
  id_produk VARCHAR(6) PRIMARY KEY,
  nama_produk VARCHAR(60) NOT NULL,
  id_kategori INT NOT NULL,
  harga INT NOT NULL,
  stok INT NOT NULL,
  FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
);`
      },
      pesanan: {
        name: 'pesanan',
        displayName: 'Header Pesanan',
        description: 'Data transaksi order masuk',
        columns: [
          { name: 'id_pesanan', type: 'VARCHAR(8)', isPk: true, description: 'Nomor nota pesanan' },
          { name: 'id_pelanggan', type: 'VARCHAR(6)', isFk: true, fkTarget: 'pelanggan.id_pelanggan', description: 'ID pembeli' },
          { name: 'tanggal_pesanan', type: 'VARCHAR(10)', nullable: false, description: 'Tanggal checkout' },
          { name: 'total_biaya', type: 'INT', nullable: false, description: 'Total nilai transaksi' },
          { name: 'status', type: 'VARCHAR(20)', nullable: false, description: 'Selesai / Diproses / Dibatalkan' }
        ],
        sampleData: [
          { id_pesanan: 'ORD-101', id_pelanggan: 'CUST01', tanggal_pesanan: '2024-03-01', total_biaya: 900000, status: 'Selesai' },
          { id_pesanan: 'ORD-102', id_pelanggan: 'CUST02', tanggal_pesanan: '2024-03-02', total_biaya: 265000, status: 'Selesai' },
          { id_pesanan: 'ORD-103', id_pelanggan: 'CUST01', tanggal_pesanan: '2024-03-05', total_biaya: 170000, status: 'Selesai' },
          { id_pesanan: 'ORD-104', id_pelanggan: 'CUST03', tanggal_pesanan: '2024-03-07', total_biaya: 650000, status: 'Diproses' },
          { id_pesanan: 'ORD-105', id_pelanggan: 'CUST04', tanggal_pesanan: '2024-03-09', total_biaya: 120000, status: 'Selesai' },
          { id_pesanan: 'ORD-106', id_pelanggan: 'CUST05', tanggal_pesanan: '2024-03-11', total_biaya: 250000, status: 'Dibatalkan' }
        ],
        ddlSql: `CREATE TABLE pesanan (
  id_pesanan VARCHAR(8) PRIMARY KEY,
  id_pelanggan VARCHAR(6) NOT NULL,
  tanggal_pesanan VARCHAR(10) NOT NULL,
  total_biaya INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan)
);`
      },
      detail_pesanan: {
        name: 'detail_pesanan',
        displayName: 'Rincian Item Pesanan',
        description: 'Barang-barang per invoice',
        columns: [
          { name: 'id_detail', type: 'INT', isPk: true, description: 'ID baris rincian' },
          { name: 'id_pesanan', type: 'VARCHAR(8)', isFk: true, fkTarget: 'pesanan.id_pesanan', description: 'Nomor invoice' },
          { name: 'id_produk', type: 'VARCHAR(6)', isFk: true, fkTarget: 'produk.id_produk', description: 'Kode barang' },
          { name: 'jumlah', type: 'INT', nullable: false, description: 'Banyak unit yang dibeli' },
          { name: 'subtotal', type: 'INT', nullable: false, description: 'Jumlah dikali harga satuan' }
        ],
        sampleData: [
          { id_detail: 1, id_pesanan: 'ORD-101', id_produk: 'PRD001', jumlah: 1, subtotal: 250000 },
          { id_detail: 2, id_pesanan: 'ORD-101', id_produk: 'PRD002', jumlah: 1, subtotal: 650000 },
          { id_detail: 3, id_pesanan: 'ORD-102', id_produk: 'PRD003', jumlah: 1, subtotal: 120000 },
          { id_detail: 4, id_pesanan: 'ORD-102', id_produk: 'PRD004', jumlah: 1, subtotal: 145000 },
          { id_detail: 5, id_pesanan: 'ORD-103', id_produk: 'PRD005', jumlah: 2, subtotal: 170000 },
          { id_detail: 6, id_pesanan: 'ORD-104', id_produk: 'PRD002', jumlah: 1, subtotal: 650000 },
          { id_detail: 7, id_pesanan: 'ORD-105', id_produk: 'PRD003', jumlah: 1, subtotal: 120000 }
        ],
        ddlSql: `CREATE TABLE detail_pesanan (
  id_detail INT PRIMARY KEY,
  id_pesanan VARCHAR(8) NOT NULL,
  id_produk VARCHAR(6) NOT NULL,
  jumlah INT NOT NULL,
  subtotal INT NOT NULL,
  FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan),
  FOREIGN KEY (id_produk) REFERENCES produk(id_produk)
);`
      }
    }
  },
  rumahsakit: {
    key: 'rumahsakit',
    title: 'Sistem Informasi Rumah Sakit',
    subtitle: 'Skema Rekam Medis & Pasien',
    description: 'Skema medis klinik dan rumah sakit untuk dokter spesialis, biodata pasien, diagnosa rekam medis, dan resep farmasi.',
    tables: {
      dokter: {
        name: 'dokter',
        displayName: 'Dokter Spesialis',
        description: 'Tenaga medis dokter praktek',
        columns: [
          { name: 'id_dokter', type: 'VARCHAR(5)', isPk: true, description: 'ID dokter' },
          { name: 'nama_dokter', type: 'VARCHAR(50)', nullable: false, description: 'Nama dokter dan spesialis' },
          { name: 'spesialisasi', type: 'VARCHAR(40)', nullable: false, description: 'Bidang spesialis' },
          { name: 'ruangan', type: 'VARCHAR(10)', nullable: false, description: 'Ruang praktek poliklinik' },
          { name: 'tarif_konsul', type: 'INT', nullable: false, description: 'Tarif konsultasi dalam rupiah' }
        ],
        sampleData: [
          { id_dokter: 'DOC01', nama_dokter: 'dr. Satria Wibawa, Sp.PD', spesialisasi: 'Penyakit Dalam', ruangan: 'Poli 101', tarif_konsul: 250000 },
          { id_dokter: 'DOC02', nama_dokter: 'dr. Anita Larasati, Sp.A', spesialisasi: 'Anak', ruangan: 'Poli 102', tarif_konsul: 220000 },
          { id_dokter: 'DOC03', nama_dokter: 'dr. Rudi Hartono, Sp.JP', spesialisasi: 'Jantung & Pembuluh', ruangan: 'Poli 201', tarif_konsul: 350000 },
          { id_dokter: 'DOC04', nama_dokter: 'dr. Maya Kartika, Sp.M', spesialisasi: 'Mata', ruangan: 'Poli 203', tarif_konsul: 200000 }
        ],
        ddlSql: `CREATE TABLE dokter (
  id_dokter VARCHAR(5) PRIMARY KEY,
  nama_dokter VARCHAR(50) NOT NULL,
  spesialisasi VARCHAR(40) NOT NULL,
  ruangan VARCHAR(10) NOT NULL,
  tarif_konsul INT NOT NULL
);`
      },
      pasien: {
        name: 'pasien',
        displayName: 'Pasien Terdaftar',
        description: 'Data identitas pasien rumah sakit',
        columns: [
          { name: 'id_pasien', type: 'VARCHAR(6)', isPk: true, description: 'No Rekam Medis (RM)' },
          { name: 'nama_pasien', type: 'VARCHAR(50)', nullable: false, description: 'Nama lengkap' },
          { name: 'jenis_kelamin', type: 'CHAR(1)', nullable: false, description: 'L / P' },
          { name: 'usia', type: 'INT', nullable: false, description: 'Usia saat ini' },
          { name: 'gol_darah', type: 'VARCHAR(3)', nullable: false, description: 'A, B, AB, O' },
          { name: 'kota', type: 'VARCHAR(30)', nullable: false, description: 'Kota tinggal' }
        ],
        sampleData: [
          { id_pasien: 'PAS001', nama_pasien: 'Surya Kencana', jenis_kelamin: 'L', usia: 45, gol_darah: 'O', kota: 'Bandung' },
          { id_pasien: 'PAS002', nama_pasien: 'Ratna Dewi', jenis_kelamin: 'P', usia: 28, gol_darah: 'A', kota: 'Bandung' },
          { id_pasien: 'PAS003', nama_pasien: 'Bambang Sudiro', jenis_kelamin: 'L', usia: 60, gol_darah: 'B', kota: 'Cimahi' },
          { id_pasien: 'PAS004', nama_pasien: 'Keisha Aurelia', jenis_kelamin: 'P', usia: 7, gol_darah: 'AB', kota: 'Sumedang' },
          { id_pasien: 'PAS005', nama_pasien: 'Yusuf Firdaus', jenis_kelamin: 'L', usia: 34, gol_darah: 'O', kota: 'Bandung' }
        ],
        ddlSql: `CREATE TABLE pasien (
  id_pasien VARCHAR(6) PRIMARY KEY,
  nama_pasien VARCHAR(50) NOT NULL,
  jenis_kelamin CHAR(1) NOT NULL,
  usia INT NOT NULL,
  gol_darah VARCHAR(3) NOT NULL,
  kota VARCHAR(30) NOT NULL
);`
      },
      rekam_medis: {
        name: 'rekam_medis',
        displayName: 'Riwayat Rekam Medis',
        description: 'Pemeriksaan dokter dan diagnosa klinis',
        columns: [
          { name: 'id_rekam', type: 'INT', isPk: true, description: 'ID rekam medis' },
          { name: 'id_pasien', type: 'VARCHAR(6)', isFk: true, fkTarget: 'pasien.id_pasien', description: 'ID pasien' },
          { name: 'id_dokter', type: 'VARCHAR(5)', isFk: true, fkTarget: 'dokter.id_dokter', description: 'ID dokter pemeriksa' },
          { name: 'tgl_periksa', type: 'VARCHAR(10)', nullable: false, description: 'Tanggal kunjungan' },
          { name: 'diagnosa', type: 'VARCHAR(60)', nullable: false, description: 'Hasil pemeriksaan diagnosa' },
          { name: 'keluhan', type: 'VARCHAR(100)', nullable: false, description: 'Gejala yang dirasakan' }
        ],
        sampleData: [
          { id_rekam: 1, id_pasien: 'PAS001', id_dokter: 'DOC01', tgl_periksa: '2024-02-10', diagnosa: 'Gastritis Kronis', keluhan: 'Nyeri ulu hati dan mual berkepanjangan' },
          { id_rekam: 2, id_pasien: 'PAS002', id_dokter: 'DOC04', tgl_periksa: '2024-02-12', diagnosa: 'Miopia Sedang', keluhan: 'Penglihatan kabur saat melihat jauh' },
          { id_rekam: 3, id_pasien: 'PAS003', id_dokter: 'DOC03', tgl_periksa: '2024-02-15', diagnosa: 'Hipertensi Stage 1', keluhan: 'Pusing berdenyut dan leher tegang' },
          { id_rekam: 4, id_pasien: 'PAS004', id_dokter: 'DOC02', tgl_periksa: '2024-02-18', diagnosa: 'ISPA Ringan', keluhan: 'Batuk pilek dan demam 2 hari' },
          { id_rekam: 5, id_pasien: 'PAS005', id_dokter: 'DOC01', tgl_periksa: '2024-02-20', diagnosa: 'Dispepsia Fungsional', keluhan: 'Perut kembung setelah makan' }
        ],
        ddlSql: `CREATE TABLE rekam_medis (
  id_rekam INT PRIMARY KEY,
  id_pasien VARCHAR(6) NOT NULL,
  id_dokter VARCHAR(5) NOT NULL,
  tgl_periksa VARCHAR(10) NOT NULL,
  diagnosa VARCHAR(60) NOT NULL,
  keluhan VARCHAR(100) NOT NULL,
  FOREIGN KEY (id_pasien) REFERENCES pasien(id_pasien),
  FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter)
);`
      }
    }
  }
};
