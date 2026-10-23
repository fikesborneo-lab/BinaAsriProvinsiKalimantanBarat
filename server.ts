import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import { GoogleGenAI } from '@google/genai';
import {
  seedDefaultsIfEmpty,
  getSiteContent,
  bulkUpdateSiteContent,
  getAllBerita,
  createBerita,
  updateBeritaItem,
  deleteBeritaItem,
  getAllPrograms,
  createProgram,
  updateProgramItem,
  deleteProgramItem,
  getAllGaleri,
  createGaleri,
  deleteGaleriItem,
  getAllPengurus,
  createPengurus,
  updatePengurusItem,
  deletePengurusItem,
  getAllBanks,
  createBank,
  updateBankItem,
  deleteBankItem,
  getAllPesan,
  createPesan,
  deletePesanItem,
  getAdminPassword,
  setAdminPassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  verifyUserLogin,
  changeUserPassword,
  resetAllDataToDefaults,
  syncLocalToSupabase,
  saveSupabaseCredentials,
} from './src/db/repository.ts';
import { testSupabaseConnection, getSupabaseConfig, sanitizeSupabaseUrl } from './src/lib/supabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(express.json({ limit: '25mb' }));

// CORS & Pre-flight Support for Vercel Serverless & Cross-Origin Calls
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Root API Health & Info
app.get(['/api', '/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'online',
    app: 'Yayasan Bina Asri Kalbar API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API 1: Bootstrap / Get all current database state
app.get(['/api/bootstrap', '/bootstrap'], async (_req, res) => {
  try {
    const [kontenWeb, beritaList, programsList, galeriList, pengurusList, banksList, pesanList] =
      await Promise.all([
        getSiteContent(),
        getAllBerita(),
        getAllPrograms(),
        getAllGaleri(),
        getAllPengurus(),
        getAllBanks(),
        getAllPesan(),
      ]);

    res.json({
      success: true,
      data: {
        kontenWeb,
        berita: beritaList,
        program: programsList,
        galeri: galeriList,
        pengurus: pengurusList,
        banks: banksList,
        pesan: pesanList,
      },
    });
  } catch (err: any) {
    console.error('Failed to bootstrap state from database:', err);
    res.status(500).json({ success: false, error: err.message || 'Database fetch failed' });
  }
});

// API 2: Site Content updates (inline editing & section forms)
app.post(['/api/site-content', '/site-content'], async (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid updates payload' });
    }
    await bulkUpdateSiteContent(updates);
    const updatedKonten = await getSiteContent();
    res.json({ success: true, kontenWeb: updatedKonten });
  } catch (err: any) {
    console.error('Failed to update site content:', err);
    res.status(500).json({ success: false, error: err.message || 'Update failed' });
  }
});

// API 3: Berita CRUD
app.get(['/api/berita', '/berita'], async (_req, res) => {
  try {
    const items = await getAllBerita();
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/berita', '/berita'], async (req, res) => {
  try {
    const item = await createBerita(req.body);
    const all = await getAllBerita();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(['/api/berita/:id', '/berita/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await updateBeritaItem({ ...req.body, id });
    const all = await getAllBerita();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/berita/:id', '/berita/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteBeritaItem(id);
    const all = await getAllBerita();
    res.json({ success: true, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 4: Programs CRUD
app.get(['/api/programs', '/programs'], async (_req, res) => {
  try {
    const items = await getAllPrograms();
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/programs', '/programs'], async (req, res) => {
  try {
    const item = await createProgram(req.body);
    const all = await getAllPrograms();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(['/api/programs/:id', '/programs/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await updateProgramItem({ ...req.body, id });
    const all = await getAllPrograms();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/programs/:id', '/programs/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProgramItem(id);
    const all = await getAllPrograms();
    res.json({ success: true, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 5: Galeri CRUD
app.get(['/api/galeri', '/galeri'], async (_req, res) => {
  try {
    const items = await getAllGaleri();
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/galeri', '/galeri'], async (req, res) => {
  try {
    const item = await createGaleri(req.body);
    const all = await getAllGaleri();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/galeri/:id', '/galeri/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteGaleriItem(id);
    const all = await getAllGaleri();
    res.json({ success: true, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 6: Pengurus CRUD
app.get(['/api/pengurus', '/pengurus'], async (_req, res) => {
  try {
    const items = await getAllPengurus();
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/pengurus', '/pengurus'], async (req, res) => {
  try {
    const item = await createPengurus(req.body);
    const all = await getAllPengurus();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(['/api/pengurus/:id', '/pengurus/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await updatePengurusItem({ ...req.body, id });
    const all = await getAllPengurus();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/pengurus/:id', '/pengurus/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deletePengurusItem(id);
    const all = await getAllPengurus();
    res.json({ success: true, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 7: Banks CRUD
app.get(['/api/banks', '/banks'], async (_req, res) => {
  try {
    const items = await getAllBanks();
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/banks', '/banks'], async (req, res) => {
  try {
    const item = await createBank(req.body);
    const all = await getAllBanks();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(['/api/banks/:id', '/banks/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await updateBankItem({ ...req.body, id });
    const all = await getAllBanks();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/banks/:id', '/banks/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteBankItem(id);
    const all = await getAllBanks();
    res.json({ success: true, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 8: Pesan CRUD
app.get(['/api/pesan', '/pesan'], async (_req, res) => {
  try {
    const items = await getAllPesan();
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/pesan', '/pesan'], async (req, res) => {
  try {
    const item = await createPesan(req.body);
    const all = await getAllPesan();
    res.json({ success: true, item, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/pesan/:id', '/pesan/:id'], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deletePesanItem(id);
    const all = await getAllPesan();
    res.json({ success: true, all });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 9: Admin Auth & User Management (RBAC)
app.post(['/api/admin/login', '/admin/login'], async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
    }
    const verified = await verifyUserLogin(username, password);
    if (verified) {
      return res.json({
        success: true,
        user: {
          id: verified.id,
          username: verified.username,
          nama: verified.nama,
          role: verified.role,
          email: verified.email,
        },
        token: `token_${Date.now()}_${verified.role}`,
        loginTime: new Date().toLocaleString('id-ID'),
      });
    }
    return res.status(401).json({ success: false, message: 'Username atau kata sandi salah!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login error' });
  }
});

// User CRUD
app.get(['/api/admin/users', '/admin/users'], async (_req, res) => {
  try {
    const users = await getAllUsers();
    // Return users list
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post(['/api/admin/users', '/admin/users'], async (req, res) => {
  try {
    const { username, password, nama, role, email, status } = req.body;
    if (!username || !password || !nama) {
      return res.status(400).json({ success: false, message: 'Nama, username, dan password wajib diisi!' });
    }
    const newUser = await createUser({
      username,
      password,
      nama,
      role: role === 'superadmin' ? 'superadmin' : 'editor',
      email: email || '',
      status: status || 'active',
    });
    const allUsers = await getAllUsers();
    res.json({ success: true, user: newUser, all: allUsers });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put(['/api/admin/users/:id', '/admin/users/:id'], async (req, res) => {
  try {
    const updated = await updateUser({
      ...req.body,
      id: req.params.id,
    });
    const allUsers = await getAllUsers();
    res.json({ success: true, user: updated, all: allUsers });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete(['/api/admin/users/:id', '/admin/users/:id'], async (req, res) => {
  try {
    await deleteUser(req.params.id);
    const allUsers = await getAllUsers();
    res.json({ success: true, all: allUsers });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post(['/api/admin/change-password', '/admin/change-password'], async (req, res) => {
  try {
    const { username, oldPass, newPass, isSuperAdmin } = req.body;
    if (!newPass || newPass.length < 5) {
      return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 5 karakter!' });
    }
    const targetUser = username || 'admin';
    const result = await changeUserPassword(targetUser, oldPass || '', newPass, Boolean(isSuperAdmin));
    if (result.success) {
      return res.json({ success: true, message: result.message });
    }
    return res.status(400).json({ success: false, message: result.message });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Gagal mengubah kata sandi' });
  }
});

// API 10: Reset & Import
app.post(['/api/admin/reset', '/admin/reset'], async (_req, res) => {
  try {
    await resetAllDataToDefaults();
    res.json({ success: true, message: 'Data berhasil direset ke standar database yayasan.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 11: Free AI News Generator (Gemini 3.8 Flash + Intelligent Fallback)
app.post(['/api/ai/generate-berita', '/ai/generate-berita'], async (req, res) => {
  try {
    const { topic, category = 'Sosial', cabang = 'Provinsi Kalimantan Barat', tone = 'Inspiratif & Resmi' } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Topik berita wajib diisi' });
    }

    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('id-ID', options);
    const rawDateStr = today.toISOString().split('T')[0];

    const defaultImages: Record<string, string> = {
      'Sosial': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80',
      'Pendidikan': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&auto=format&fit=crop&q=80',
      'Pemberdayaan': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&auto=format&fit=crop&q=80',
      'Kesehatan': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80',
      'Dakwah': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&auto=format&fit=crop&q=80',
      'Umum': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=80',
    };
    const selectedFallbackImage = defaultImages[category] || defaultImages['Sosial'];

    let generatedArticle = null;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI();
        const prompt = `Anda adalah redaktur jurnalis profesional Yayasan Bina Asri Provinsi Kalimantan Barat. Tuliskan naskah berita kegiatan yayasan yang kredibel, menyentuh, santun, dan islami berdasarkan parameter berikut:
- Topik Kegiatan: "${topic.trim()}"
- Kategori Program: "${category}"
- Lokasi / Cabang: "${cabang}"
- Nada Tulisan: "${tone}"
- Tanggal Berita: "${formattedDate}"

Berikan respon HANYA dalam format JSON murni (tanpa markdown blok tambahan) dengan skema:
{
  "judul": "Judul berita yang memikat, resmi, dan elegan (maksimal 16 kata)",
  "kategori": "${category}",
  "ringkasan": "Ringkasan padat 2 kalimat pembuka yang informatif untuk cuplikan berita",
  "konten": "Isi berita lengkap minimal 3 paragraf panjang berisi pembukaan (5W+1H kegiatan di ${cabang}), jalannya acara serta sambutan dari ketua cabang atau pengurus Yayasan Bina Asri, testimoni penerima manfaat, dan doa/ajakan kebaikan untuk masyarakat.",
  "gambar": "URL foto ilustrasi (gunakan URL unsplash bertema kegiatan sosial/islami)",
  "tags": ["tag1", "tag2", "tag3"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim();
        if (text) {
          try {
            const cleanJson = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.judul && parsed.konten) {
              generatedArticle = {
                judul: parsed.judul,
                kategori: parsed.kategori || category,
                ringkasan: parsed.ringkasan || (parsed.konten.substring(0, 140) + '...'),
                konten: parsed.konten,
                gambar: parsed.gambar && parsed.gambar.startsWith('http') ? parsed.gambar : selectedFallbackImage,
                rawTanggal: rawDateStr,
                tanggal: formattedDate,
                tags: Array.isArray(parsed.tags) ? parsed.tags : [category, cabang, 'Yayasan Bina Asri'],
              };
            }
          } catch (jsonErr) {
            console.warn('AI response was not valid JSON, using template fallback:', jsonErr);
          }
        }
      } catch (apiErr: any) {
        console.warn('Gemini generateContent notice (falling back gracefully):', apiErr.message);
      }
    }

    if (!generatedArticle) {
      const cleanTopic = topic.trim();
      const judulFallback = `${cleanTopic} - Yayasan Bina Asri ${cabang}`;
      const ringkasanFallback = `Yayasan Bina Asri Kalimantan Barat menggelar kegiatan "${cleanTopic}" di wilayah ${cabang} sebagai wujud kepedulian nyata dan pengabdian kepada umat.`;
      const kontenFallback = `KALIMANTAN BARAT – Yayasan Bina Asri Provinsi Kalimantan Barat kembali mempertegas komitmennya dalam menebar maslahat bagi masyarakat. Bertempat di wilayah ${cabang}, yayasan menyelenggarakan program "${cleanTopic}" yang dihadiri oleh jajaran pengurus, relawan, dan para penerima manfaat setempat.\n\nKetua Cabang Yayasan Bina Asri ${cabang} dalam sambutannya menyampaikan rasa syukur dan terima kasih mendalam kepada para muhsinin, donatur, dan masyarakat yang senantiasa menitipkan amanah kebaikan melalui yayasan. "Setiap butir kebaikan yang disalurkan hari ini adalah titipan doa dan harapan saudara-saudara kita. Semoga ikhtiar ini menjadi ladang pahala jariyah bagi kita semua," ungkapnya.\n\nKegiatan berlangsung dengan penuh kehangatan dan khidmat. Para penerima manfaat mengungkapkan rasa haru atas kehadiran Yayasan Bina Asri yang senantiasa hadir merangkul masyarakat di Kalimantan Barat, baik di bidang kesehatan, eliminasi TBC, maupun kemanusiaan.\n\nYayasan Bina Asri mengajak seluruh lapisan masyarakat untuk terus bersinergi, menyalurkan infaq, sedekah, dan donasi terbaik demi memperluas jangkauan manfaat program ke pelosok Kalimantan Barat.`;

      generatedArticle = {
        judul: judulFallback,
        kategori: category,
        ringkasan: ringkasanFallback,
        konten: kontenFallback,
        gambar: selectedFallbackImage,
        rawTanggal: rawDateStr,
        tanggal: formattedDate,
        tags: [category, cabang, 'Bina Asri'],
      };
    }

    res.json({ success: true, article: generatedArticle });
  } catch (err: any) {
    console.error('Error generating AI berita:', err);
    res.status(500).json({ success: false, error: err.message || 'Gagal menghasilkan berita' });
  }
});

// API 12: Supabase Status Endpoint
app.get(['/api/supabase/status', '/supabase/status'], async (_req, res) => {
  try {
    const config = getSupabaseConfig();
    const testResult = await testSupabaseConnection();
    res.json({
      success: true,
      isConfigured: config.isConfigured,
      url: config.url ? config.url.replace(/\.co.*/, '.co') : '',
      source: config.source,
      ...testResult,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 13: Save Supabase Credentials from Admin UI
app.post(['/api/supabase/config', '/supabase/config'], async (req, res) => {
  try {
    const { url, key } = req.body;
    if (!url || !key) {
      return res.status(400).json({ success: false, error: 'URL dan Key Supabase wajib diisi' });
    }
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = key.trim();
    await saveSupabaseCredentials(cleanUrl, cleanKey);
    const testResult = await testSupabaseConnection(cleanUrl, cleanKey);
    res.json({
      success: true,
      message: 'Kredensial Supabase berhasil disimpan di server!',
      testResult,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 14: Supabase Sync Endpoint
app.post(['/api/supabase/sync', '/supabase/sync'], async (_req, res) => {
  try {
    const syncResult = await syncLocalToSupabase();
    res.json(syncResult);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Main Server Startup Function
export async function startServer() {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Seed default data if database is empty on start
  try {
    await seedDefaultsIfEmpty();
  } catch (err) {
    console.warn('Initial database seed attempt note:', err);
  }

  // Serve Frontend
  if (!isProduction && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Foundation Server started at http://0.0.0.0:${PORT}`);
    });
  }
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
