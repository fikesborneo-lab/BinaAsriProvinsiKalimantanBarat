import { KontenWeb, BeritaItem, ProgramItem, GaleriItem, PengurusItem, BankAccount, PesanItem } from '../types';

export interface FullBackupData {
  kontenWeb: KontenWeb;
  berita: BeritaItem[];
  program: ProgramItem[];
  galeri: GaleriItem[];
  pengurus: PengurusItem[];
  banks: BankAccount[];
  pesan: PesanItem[];
}

/**
 * Upload JSON backup directly to Google Drive
 */
export async function backupToGoogleDrive(
  accessToken: string,
  backupData: FullBackupData
): Promise<{ success: boolean; fileId?: string; fileName?: string; webViewLink?: string; message: string }> {
  try {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const fileName = `Backup_Yayasan_Bina_Asri_${dateStr}.json`;
    const jsonString = JSON.stringify(backupData, null, 2);

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description: 'Cadangan database resmi Yayasan Bina Asri Kalimantan Barat',
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonString +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Gagal mengunggah berkas ke Google Drive');
    }

    return {
      success: true,
      fileId: data.id,
      fileName: data.name,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
      message: 'Berkas cadangan berhasil disimpan di Google Drive Anda!',
    };
  } catch (err: any) {
    console.error('Google Drive backup error:', err);
    return {
      success: false,
      message: err.message || 'Gagal mencadangkan ke Google Drive',
    };
  }
}

/**
 * Create a new Google Spreadsheet and export all tables to individual sheets
 */
export async function exportToGoogleSheets(
  accessToken: string,
  data: FullBackupData
): Promise<{ success: boolean; spreadsheetId?: string; spreadsheetUrl?: string; message: string }> {
  try {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const title = `Database Yayasan Bina Asri Kalbar (${today})`;

    // 1. Create Spreadsheet with predefined sheets
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [
          { properties: { title: 'Berita' } },
          { properties: { title: 'Program' } },
          { properties: { title: 'Pengurus' } },
          { properties: { title: 'Rekening' } },
          { properties: { title: 'Galeri' } },
          { properties: { title: 'Pesan_Masuk' } },
          { properties: { title: 'Konten_Web' } },
        ],
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      throw new Error(createData.error?.message || 'Gagal membuat Google Spreadsheet baru');
    }

    const spreadsheetId = createData.spreadsheetId;
    const spreadsheetUrl = createData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // 2. Prepare tabular data for each sheet
    // Tab 1: Berita
    const beritaRows = [
      ['ID', 'Judul Berita', 'Tanggal', 'Kategori', 'Ringkasan', 'Konten', 'Link Gambar'],
      ...data.berita.map((b) => [b.id, b.judul, b.tanggal, b.kategori, b.ringkasan, b.konten, b.gambar]),
    ];

    // Tab 2: Program
    const programRows = [
      ['ID', 'Nama Program', 'Deskripsi', 'Target', 'Progress (%)'],
      ...data.program.map((p) => [p.id, p.nama, p.deskripsi, p.target, p.progress]),
    ];

    // Tab 3: Pengurus
    const pengurusRows = [
      ['ID', 'Nama Lengkap & Gelar', 'Jabatan', 'Cabang Daerah', 'Kontak / HP', 'Link Foto'],
      ...data.pengurus.map((pg) => [pg.id, pg.nama, pg.jabatan, pg.cabang, pg.kontak || '-', pg.foto]),
    ];

    // Tab 4: Rekening
    const rekeningRows = [
      ['ID', 'Nama Bank', 'Kategori/Badge', 'Nomor Rekening', 'Atas Nama'],
      ...data.banks.map((bk) => [bk.id, bk.bank, bk.badge, bk.norek, bk.an]),
    ];

    // Tab 5: Galeri
    const galeriRows = [
      ['ID', 'Judul / Keterangan Foto', 'Link Gambar'],
      ...data.galeri.map((g) => [g.id, g.judul, g.gambar]),
    ];

    // Tab 6: Pesan_Masuk
    const pesanRows = [
      ['Timestamp', 'Nama Pengirim', 'Email', 'No. Telepon / WhatsApp', 'Perihal', 'Isi Pesan'],
      ...data.pesan.map((ps) => [ps.timestamp, ps.nama, ps.email, ps.telepon, ps.subjek, ps.pesan]),
    ];

    // Tab 7: Konten_Web
    const kontenRows = [
      ['Kunci Pengaturan (Key)', 'Nilai Konten (Value)'],
      ...Object.entries(data.kontenWeb).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')]),
    ];

    // 3. Batch Update Values
    const valueRanges = [
      { range: 'Berita!A1', values: beritaRows },
      { range: 'Program!A1', values: programRows },
      { range: 'Pengurus!A1', values: pengurusRows },
      { range: 'Rekening!A1', values: rekeningRows },
      { range: 'Galeri!A1', values: galeriRows },
      { range: 'Pesan_Masuk!A1', values: pesanRows },
      { range: 'Konten_Web!A1', values: kontenRows },
    ];

    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: valueRanges,
        }),
      }
    );

    const updateData = await updateRes.json();
    if (!updateRes.ok) {
      throw new Error(updateData.error?.message || 'Gagal mengisi data ke Google Spreadsheet');
    }

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      message: 'Seluruh data Yayasan berhasil diekspor ke Google Sheets!',
    };
  } catch (err: any) {
    console.error('Google Sheets export error:', err);
    return {
      success: false,
      message: err.message || 'Gagal mengekspor data ke Google Sheets',
    };
  }
}
