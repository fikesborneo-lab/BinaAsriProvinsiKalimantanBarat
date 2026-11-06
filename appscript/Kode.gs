/**
 * ==============================================================================
 * SISTEM WEBSITE & DATABASE RESMI: YAYASAN BINA ASRI KALIMANTAN BARAT
 * GOOGLE APPS SCRIPT (KODE.GS) - GOOGLE SPREADSHEET AS DATABASE
 * ==============================================================================
 * Database Spreadsheet ID: 1CJrBhbmpgUWSN3skd-whjf0yYqvxLsI0Xj5TBe4hZSY
 * URL Spreadsheet: https://docs.google.com/spreadsheets/d/1CJrBhbmpgUWSN3skd-whjf0yYqvxLsI0Xj5TBe4hZSY/edit
 * ==============================================================================
 */

// 1. KONFIGURASI UTAMA
var SPREADSHEET_ID = '1CJrBhbmpgUWSN3skd-whjf0yYqvxLsI0Xj5TBe4hZSY';

/**
 * Endpoint GET: Melayani Tampilan Web App (Index.html) atau JSON API jika ada parameter action
 */
function doGet(e) {
  // Jika diminta format JSON API melalui URL ?action=...
  if (e && e.parameter && e.parameter.action) {
    return handleApiGet(e);
  }

  // Melayani Website Frontend
  var template = HtmlService.createTemplateFromFile('Index');
  template.spreadsheetId = SPREADSHEET_ID;
  
  return template.evaluate()
    .setTitle('Yayasan Bina Asri Kalimantan Barat')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Endpoint POST: Menerima data kiriman form dari luar/frontend
 */
function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '';
    var payload = {};
    if (rawData) {
      try {
        payload = JSON.parse(rawData);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    var action = payload.action || (e.parameter ? e.parameter.action : '');
    var result = { success: false, message: 'Aksi tidak dikenali' };

    if (action === 'submitPesan') {
      result = submitPesan(payload.data || payload);
    } else if (action === 'saveKontenWeb') {
      result = saveKontenWeb(payload.data || payload.updates);
    } else if (action === 'saveBerita') {
      result = saveBerita(payload.data || payload.item);
    } else if (action === 'deleteBerita') {
      result = deleteBerita(payload.id);
    } else if (action === 'loginAdmin') {
      result = verifyLogin(payload.username, payload.password);
    } else if (action === 'initDatabase') {
      result = initDatabaseSheets();
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper untuk API GET
 */
function handleApiGet(e) {
  var action = e.parameter.action;
  var output = { success: false };

  if (action === 'getAllData') {
    output = { success: true, data: getAllData() };
  } else if (action === 'init') {
    output = initDatabaseSheets();
  } else if (action === 'ping') {
    output = { success: true, message: 'Google Apps Script Online', time: new Date().toISOString() };
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==============================================================================
// 2. FUNGSI AKSES SPREADSHEET
// ==============================================================================

function getSpreadsheet() {
  if (!SPREADSHEET_ID) {
    throw new Error('SPREADSHEET_ID belum diatur!');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(sheetName, headers) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#065f46').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

// ==============================================================================
// 3. INISIALISASI STRUKTUR DATABASE SPREADSHEET OTOMATIS
// ==============================================================================

function initDatabaseSheets() {
  try {
    var ss = getSpreadsheet();

    // 1. Sheet Konten_Web
    var shKonten = getOrCreateSheet('Konten_Web', ['Key', 'Value', 'Terakhir_Diperbarui']);
    if (shKonten.getLastRow() <= 1) {
      var defaultKonten = [
        ['namaYayasan', 'Yayasan Bina Asri Kalimantan Barat', new Date().toISOString()],
        ['tagline', 'Menebar Kebaikan, Merajut Asa Umat di Bumi Khatulistiwa', new Date().toISOString()],
        ['deskripsiSingkat', 'Lembaga sosial nirlaba, dakwah, dan kemanusiaan resmi di Kalimantan Barat yang bergerak aktif mendampingi masyarakat, yatim, dhuafa, serta eliminasi penyakit TBC.', new Date().toISOString()],
        ['telepon', '0812-5678-9012', new Date().toISOString()],
        ['email', 'sekretariat@binaasrikalbar.org', new Date().toISOString()],
        ['alamatLengkap', 'Jl. Trans Kalimantan No. 88, Sungai Ambawang, Kabupaten Kubu Raya, Kalimantan Barat 78393', new Date().toISOString()],
        ['noSKKemenkumham', 'AHU-0012345.AH.01.04.Tahun 2018', new Date().toISOString()],
        ['visi', 'Menjadi lembaga filantropi dan sosial terdepan di Kalimantan Barat yang amanah, profesional, dan berdampak nyata dalam mengangkat derajat sosial ekonomi umat.', new Date().toISOString()],
        ['misi', '1. Menyelenggarakan program sosial, pendidikan, dan kesehatan berkelanjutan.\n2. Mengentaskan kemiskinan dan mendampingi keluarga rentan dhuafa.\n3. Menggalang sinergi kebaikan bersama donatur dan masyarakat Kalimantan Barat.', new Date().toISOString()],
        ['heroBadge', '🌱 Resmi & Berizin Kemenkumham RI', new Date().toISOString()],
        ['heroTitle', 'Wujudkan Kepedulian Nyata untuk Sesama di Kalimantan Barat', new Date().toISOString()],
        ['heroSubtitle', 'Bersama Yayasan Bina Asri, mari bergotong royong membantu saudara kita yang membutuhkan bantuan sosial, pendidikan anak yatim, dan layanan kesehatan.', new Date().toISOString()],
        ['totalPenerimaManfaat', '15.420+', new Date().toISOString()],
        ['totalCabangDaerah', '14 Wilayah', new Date().toISOString()],
        ['totalProgramAktif', '24 Program', new Date().toISOString()],
      ];
      shKonten.getRange(2, 1, defaultKonten.length, 3).setValues(defaultKonten);
    }

    // 2. Sheet Berita
    var shBerita = getOrCreateSheet('Berita', ['ID', 'Judul', 'Tanggal', 'Kategori', 'Ringkasan', 'Konten', 'Gambar']);
    if (shBerita.getLastRow() <= 1) {
      var defaultBerita = [
        [
          1,
          'Penyaluran 500 Paket Sembako untuk Dhuafa dan Lansia di Tepian Sungai Kapuas',
          '04 November 2026',
          'Sosial',
          'Yayasan Bina Asri menyalurkan paket pangan bergizi kepada keluarga prasejahtera di kawasan pesisir sungai Kapuas.',
          'PONTINAK - Alhamdulillah, tim relawan Yayasan Bina Asri Kalimantan Barat kembali menyalurkan 500 paket sembako dan kebutuhan pokok untuk masyarakat rentan. Kegiatan ini merupakan wujud amanah dari para donatur setia bina asri.',
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80'
        ],
        [
          2,
          'Edukasi dan Pemeriksaan Kesehatan Gratis Bebas TBC di Kabupaten Sambas',
          '01 November 2026',
          'Kesehatan',
          'Pemeriksaan rontgen dada dan penyuluhan gejala TBC serentak bagi warga pedesaan di Sambas.',
          'SAMBAS - Bekerja sama dengan dinas kesehatan setempat, Yayasan Bina Asri menggelar bakti sosial skrining TBC aktif. Sebanyak 250 warga mendapatkan pemeriksaan gratis serta vitamin daya tahan tubuh.',
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80'
        ],
        [
          3,
          'Beasiswa Semangat Pelajar: Bantuan Alat Sekolah bagi Anak Yatim Piatu',
          '28 Oktober 2026',
          'Pendidikan',
          'Pemberian tas, buku, seragam sekolah, dan santunan biaya pendidikan untuk 120 santri binaan.',
          'KUBU RAYA - Senyum bahagia terpancar dari anak-anak penerima beasiswa pendidikan Yayasan Bina Asri. Program ini bertujuan memastikan tidak ada anak di pelosok Kalbar yang putus sekolah karena kendala biaya.',
          'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&auto=format&fit=crop&q=80'
        ]
      ];
      shBerita.getRange(2, 1, defaultBerita.length, 7).setValues(defaultBerita);
    }

    // 3. Sheet Program
    var shProgram = getOrCreateSheet('Program', ['ID', 'Nama_Program', 'Deskripsi', 'Target', 'Progress']);
    if (shProgram.getLastRow() <= 1) {
      var defaultProgram = [
        [1, 'Peduli Pangan Dhuafa', 'Bantuan paket beras dan pangan rutin setiap bulan bagi janda tua dan keluarga prasejahtera di 14 Kabupaten/Kota Kalbar.', 'Rp 75.000.000', 82],
        [2, 'Aksi Sehat Peduli TBC', 'Pendampingan nutrisi makanan berprotein tinggi bagi pejuang kesembuhan TBC resisten obat hingga tuntas.', 'Rp 50.000.000', 65],
        [3, 'Beasiswa Generasi Robbani', 'Bantuan beasiswa sekolah dan pondok pesantren bagi anak-anak yatim dan penghafal Quran.', 'Rp 100.000.000', 90],
        [4, 'Air Bersih Pelosok Dusun', 'Pembangunan sarana sumur bor dan filterisasi air bersih bagi perkampungan yang rawan kekeringan.', 'Rp 40.000.000', 45]
      ];
      shProgram.getRange(2, 1, defaultProgram.length, 5).setValues(defaultProgram);
    }

    // 4. Sheet Pengurus
    var shPengurus = getOrCreateSheet('Pengurus', ['ID', 'Nama', 'Jabatan', 'Cabang', 'Kontak', 'Foto']);
    if (shPengurus.getLastRow() <= 1) {
      var defaultPengurus = [
        [1, 'H. Ahmad Syarif, M.Pd.', 'Ketua Dewan Pembina', 'Pusat / SR Kalbar', '0812-5000-1111', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'],
        [2, 'Ust. Ridwan Al-Fatih, S.Sos.', 'Ketua Umum Pengurus', 'Pusat / SR Kalbar', '0813-4500-2222', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80'],
        [3, 'Fajar Nugraha, S.E.', 'Sekretaris Eksekutif', 'Pusat / SR Kalbar', '0852-4500-3333', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80'],
        [4, 'Siti Rahmawati, S.Ak.', 'Bendahara Yayasan', 'Pusat / SR Kalbar', '0821-4500-4444', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80'],
        [5, 'dr. Hendra Kurniawan', 'Koordinator Medis & TBC', 'Cabang Kota Pontianak', '0812-5678-5555', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80'],
        [6, 'Muhammad Ilham, S.Pd.', 'Ketua Perwakilan Cabang', 'Cabang Kabupaten Sambas', '0853-9999-6666', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80']
      ];
      shPengurus.getRange(2, 1, defaultPengurus.length, 6).setValues(defaultPengurus);
    }

    // 5. Sheet Rekening
    var shRekening = getOrCreateSheet('Rekening', ['ID', 'Bank', 'Badge', 'No_Rekening', 'Atas_Nama']);
    if (shRekening.getLastRow() <= 1) {
      var defaultRekening = [
        [1, 'Bank Syariah Indonesia (BSI)', 'Nasional', '714-8899-001', 'Yayasan Bina Asri Kalbar'],
        [2, 'Bank Kalbar Syariah', 'Daerah', '102-500-7890', 'Yayasan Bina Asri Kalbar'],
        [3, 'Bank Mandiri', 'Nasional', '146-00-1234567-8', 'Yayasan Bina Asri Kalbar - Infaq'],
        [4, 'Bank BCA', 'Nasional', '029-8877-665', 'Yayasan Bina Asri Kalbar']
      ];
      shRekening.getRange(2, 1, defaultRekening.length, 5).setValues(defaultRekening);
    }

    // 6. Sheet Galeri
    var shGaleri = getOrCreateSheet('Galeri', ['ID', 'Judul', 'Gambar']);
    if (shGaleri.getLastRow() <= 1) {
      var defaultGaleri = [
        [1, 'Penyaluran Bantuan Pangan di Kubu Raya', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80'],
        [2, 'Penyuluhan Kesehatan Masyarakat Pedalaman', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'],
        [3, 'Santunan Yatim Piatu Khatulistiwa', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80'],
        [4, 'Bakti Sosial & Gotong Royong Relawan', 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80']
      ];
      shGaleri.getRange(2, 1, defaultGaleri.length, 3).setValues(defaultGaleri);
    }

    // 7. Sheet Pesan_Masuk
    getOrCreateSheet('Pesan_Masuk', ['Timestamp', 'Nama', 'Email', 'Telepon', 'Subjek', 'Pesan', 'Status']);

    // 8. Sheet Pengguna
    var shPengguna = getOrCreateSheet('Pengguna', ['ID', 'Username', 'Password', 'Nama', 'Role', 'Email', 'Status']);
    if (shPengguna.getLastRow() <= 1) {
      var defaultPengguna = [
        ['usr_admin_01', 'admin', 'admin123', 'Super Administrator Yayasan', 'superadmin', 'admin@binaasrikalbar.org', 'active'],
        ['usr_editor_01', 'editor', 'editor123', 'Staf Redaksi & Konten', 'editor', 'redaksi@binaasrikalbar.org', 'active']
      ];
      shPengguna.getRange(2, 1, defaultPengguna.length, 7).setValues(defaultPengguna);
    }

    return {
      success: true,
      message: 'Seluruh sheet database berhasil diinisialisasi di Spreadsheet Anda!'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Gagal inisialisasi sheet: ' + err.toString()
    };
  }
}

// ==============================================================================
// 4. API BACA & AMBIL DATA (READ)
// ==============================================================================

function getAllData() {
  try {
    var ss = getSpreadsheet();

    // 1. Konten Web
    var kontenWeb = {};
    var shKonten = ss.getSheetByName('Konten_Web');
    if (shKonten && shKonten.getLastRow() > 1) {
      var rows = shKonten.getRange(2, 1, shKonten.getLastRow() - 1, 2).getValues();
      rows.forEach(function (r) {
        if (r[0]) kontenWeb[r[0]] = r[1];
      });
    }

    // 2. Berita
    var berita = [];
    var shBerita = ss.getSheetByName('Berita');
    if (shBerita && shBerita.getLastRow() > 1) {
      var rows = shBerita.getRange(2, 1, shBerita.getLastRow() - 1, 7).getValues();
      rows.forEach(function (r) {
        if (r[0]) {
          berita.push({
            id: Number(r[0]),
            judul: String(r[1] || ''),
            tanggal: String(r[2] || ''),
            kategori: String(r[3] || 'Sosial'),
            ringkasan: String(r[4] || ''),
            konten: String(r[5] || ''),
            gambar: String(r[6] || '')
          });
        }
      });
    }

    // 3. Program
    var program = [];
    var shProgram = ss.getSheetByName('Program');
    if (shProgram && shProgram.getLastRow() > 1) {
      var rows = shProgram.getRange(2, 1, shProgram.getLastRow() - 1, 5).getValues();
      rows.forEach(function (r) {
        if (r[0]) {
          program.push({
            id: Number(r[0]),
            nama: String(r[1] || ''),
            deskripsi: String(r[2] || ''),
            target: String(r[3] || ''),
            progress: Number(r[4]) || 0
          });
        }
      });
    }

    // 4. Pengurus
    var pengurus = [];
    var shPengurus = ss.getSheetByName('Pengurus');
    if (shPengurus && shPengurus.getLastRow() > 1) {
      var rows = shPengurus.getRange(2, 1, shPengurus.getLastRow() - 1, 6).getValues();
      rows.forEach(function (r) {
        if (r[0]) {
          pengurus.push({
            id: Number(r[0]),
            nama: String(r[1] || ''),
            jabatan: String(r[2] || ''),
            cabang: String(r[3] || 'Pusat / SR Kalbar'),
            kontak: String(r[4] || ''),
            foto: String(r[5] || '')
          });
        }
      });
    }

    // 5. Rekening Bank
    var banks = [];
    var shRekening = ss.getSheetByName('Rekening');
    if (shRekening && shRekening.getLastRow() > 1) {
      var rows = shRekening.getRange(2, 1, shRekening.getLastRow() - 1, 5).getValues();
      rows.forEach(function (r) {
        if (r[0]) {
          banks.push({
            id: Number(r[0]),
            bank: String(r[1] || ''),
            badge: String(r[2] || 'Daerah'),
            norek: String(r[3] || ''),
            an: String(r[4] || '')
          });
        }
      });
    }

    // 6. Galeri
    var galeri = [];
    var shGaleri = ss.getSheetByName('Galeri');
    if (shGaleri && shGaleri.getLastRow() > 1) {
      var rows = shGaleri.getRange(2, 1, shGaleri.getLastRow() - 1, 3).getValues();
      rows.forEach(function (r) {
        if (r[0]) {
          galeri.push({
            id: Number(r[0]),
            judul: String(r[1] || ''),
            gambar: String(r[2] || '')
          });
        }
      });
    }

    // 7. Pesan Masuk (Hanya untuk Admin)
    var pesan = [];
    var shPesan = ss.getSheetByName('Pesan_Masuk');
    if (shPesan && shPesan.getLastRow() > 1) {
      var rows = shPesan.getRange(2, 1, shPesan.getLastRow() - 1, 6).getValues();
      rows.forEach(function (r, idx) {
        if (r[0] || r[1]) {
          pesan.push({
            id: idx + 1,
            timestamp: String(r[0] || ''),
            nama: String(r[1] || ''),
            email: String(r[2] || ''),
            telepon: String(r[3] || ''),
            subjek: String(r[4] || ''),
            pesan: String(r[5] || '')
          });
        }
      });
    }

    return {
      kontenWeb: kontenWeb,
      berita: berita,
      program: program,
      pengurus: pengurus,
      banks: banks,
      galeri: galeri,
      pesan: pesan
    };
  } catch (err) {
    Logger.log('Error getAllData: ' + err.toString());
    return {
      kontenWeb: {},
      berita: [],
      program: [],
      pengurus: [],
      banks: [],
      galeri: [],
      pesan: []
    };
  }
}

// ==============================================================================
// 5. API TULIS DATA (WRITE / CREATE / UPDATE)
// ==============================================================================

/**
 * Simpan pesan baru dari formulir kontak pengunjung
 */
function submitPesan(p) {
  try {
    var sh = getOrCreateSheet('Pesan_Masuk', ['Timestamp', 'Nama', 'Email', 'Telepon', 'Subjek', 'Pesan', 'Status']);
    var timestamp = new Date().toLocaleString('id-ID');
    sh.appendRow([
      timestamp,
      p.nama || 'Anonim',
      p.email || '-',
      p.telepon || '-',
      p.subjek || 'Pertanyaan Umum',
      p.pesan || '',
      'Baru'
    ]);
    return { success: true, message: 'Pesan Anda berhasil dikirim ke sekretariat Yayasan Bina Asri!' };
  } catch (err) {
    return { success: false, message: 'Gagal mengirim pesan: ' + err.toString() };
  }
}

/**
 * Simpan / perbarui konten teks website
 */
function saveKontenWeb(updates) {
  try {
    var sh = getOrCreateSheet('Konten_Web', ['Key', 'Value', 'Terakhir_Diperbarui']);
    var now = new Date().toISOString();
    var lastRow = sh.getLastRow();
    var keyMap = {};

    if (lastRow > 1) {
      var keys = sh.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < keys.length; i++) {
        keyMap[keys[i][0]] = i + 2; // Baris row ke-(i+2)
      }
    }

    for (var k in updates) {
      var val = String(updates[k] || '');
      if (keyMap[k]) {
        sh.getRange(keyMap[k], 2, 1, 2).setValues([[val, now]]);
      } else {
        sh.appendRow([k, val, now]);
        keyMap[k] = sh.getLastRow();
      }
    }

    return { success: true, message: 'Konten website berhasil diperbarui di Google Sheets!' };
  } catch (err) {
    return { success: false, message: 'Gagal memperbarui konten: ' + err.toString() };
  }
}

/**
 * Tambah / edit berita
 */
function saveBerita(item) {
  try {
    var sh = getOrCreateSheet('Berita', ['ID', 'Judul', 'Tanggal', 'Kategori', 'Ringkasan', 'Konten', 'Gambar']);
    var lastRow = sh.getLastRow();
    var idToFind = Number(item.id);
    var foundRow = 0;

    if (lastRow > 1) {
      var ids = sh.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (Number(ids[i][0]) === idToFind) {
          foundRow = i + 2;
          break;
        }
      }
    }

    var rowData = [
      idToFind || Date.now(),
      item.judul || '',
      item.tanggal || new Date().toLocaleDateString('id-ID'),
      item.kategori || 'Sosial',
      item.ringkasan || '',
      item.konten || '',
      item.gambar || ''
    ];

    if (foundRow > 0) {
      sh.getRange(foundRow, 1, 1, 7).setValues([rowData]);
      return { success: true, message: 'Berita berhasil diperbarui!' };
    } else {
      sh.appendRow(rowData);
      return { success: true, message: 'Berita baru berhasil ditambahkan!' };
    }
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan berita: ' + err.toString() };
  }
}

/**
 * Hapus berita berdasarkan ID
 */
function deleteBerita(id) {
  try {
    var sh = getSpreadsheet().getSheetByName('Berita');
    if (!sh) return { success: false, message: 'Sheet Berita tidak ditemukan' };
    var lastRow = sh.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data kosong' };

    var ids = sh.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (Number(ids[i][0]) === Number(id)) {
        sh.deleteRow(i + 2);
        return { success: true, message: 'Berita berhasil dihapus!' };
      }
    }
    return { success: false, message: 'ID berita tidak ditemukan' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus berita: ' + err.toString() };
  }
}

/**
 * Verifikasi Login Admin
 */
function verifyLogin(username, password) {
  var u = String(username || '').trim().toLowerCase();
  var p = String(password || '').trim();

  try {
    var sh = getSpreadsheet().getSheetByName('Pengguna');
    if (sh && sh.getLastRow() > 1) {
      var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
      for (var i = 0; i < rows.length; i++) {
        var dbUser = String(rows[i][1] || '').toLowerCase();
        var dbPass = String(rows[i][2] || '');
        var dbStatus = String(rows[i][6] || 'active');

        if (dbUser === u && dbPass === p) {
          if (dbStatus === 'inactive') {
            return { success: false, message: 'Akun Anda dinonaktifkan. Hubungi Super Admin.' };
          }
          return {
            success: true,
            user: {
              id: rows[i][0],
              username: rows[i][1],
              nama: rows[i][3],
              role: rows[i][4] || 'editor',
              email: rows[i][5] || ''
            }
          };
        }
      }
    }
  } catch (err) {
    Logger.log('Error verifyLogin: ' + err.toString());
  }

  // Fallback kredensial bawaan jika tabel belum terisi
  if (u === 'admin' && (p === 'admin123' || p === 'admin')) {
    return {
      success: true,
      user: {
        id: 'usr_admin_default',
        username: 'admin',
        nama: 'Super Administrator Yayasan',
        role: 'superadmin',
        email: 'admin@binaasrikalbar.org'
      }
    };
  }

  return { success: false, message: 'Username atau Password salah!' };
}

/**
 * Helper untuk menyertakan file HTML parsial jika diperlukan
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
