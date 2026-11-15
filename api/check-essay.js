// Vercel Serverless Function: POST /api/check-essay
// Açar yalnız serverdə, process.env.GEMINI_API_KEY-də saxlanılır.

const MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const CRITERIA = `
MEYARLAR (rəsmi qiymətləndirmə cədvəli):

A – Tapşırığın yerinə yetirilməsi (0, 0.5, 1)
1: paraqraf seçilmiş xarici dildə və mövzuya/suala uyğun yazılıb; həcmi minimum 100 söz; abzasda aydın əsas fikir (topic sentence), onu dəstəkləyən fikirlər və yekun fikir var; tərkib hissələri arasındakı əlaqə tam gözlənilib, mətn axıcıdır.
0.5: paraqraf seçilmiş xarici dildədir və mövzuya əsasən uyğundur; həcmi 70 sözdən azdır (minimum 70 söz); struktur elementləri qismən mövcuddur (tərkib hissələrindən biri yazılmayıb); tərkib hissələri arasındakı əlaqə qismən gözlənilib; və ya mətnin çoxu şablon cümlələrdən ibarətdir, lakin mövzuya aid az da olsa şagirdin öz fikri var.
0: paraqraf xarici dildə yazılsa da anlaşılan deyil və/və ya ifadə olunan fikirlər mövzunun adına uyğun deyil; həcmi 70 sözdən azdır; tərkib hissələri yoxdur; tamamilə paraqraf şablon/əzbər cümlələrdən ibarətdir və ya şərt olduğu kimi köçürülüb.

B – Mövzunun əhatə edilməsi və məntiqi ardıcıllıq (0, 1, 2)
2: mövzu üzrə ən azı iki aydın fikir/arqument təqdim olunub; fikirlər sadə nümunələr və ümumi izahlarla əsaslandırılıb; ən azı iki fərqli birləşdirici vasitənin köməyi ilə cümlələr arasında əlaqə yaradılıb; şagirdin öz fikri üçün ən azı iki, əks tərəf üçün ən azı bir arqument verilib; fikirlər arasında məntiqi rabitə var.
1: fikirlər arasında ardıcıllıq var, ancaq məhdud sayda birləşdirici vasitələrdən istifadə edilib; mövzu ilə bağlı fikirləri əsaslandırarkən kənaraçıxmalar var və ya istinad zamanı məntiqi əlaqə pozulmuşdur; hər iki tərəfin adı çəkilir, lakin əks tərəf eyni fikrin tərsi kimi təkrarlanır; tərəflərdən biri heç bir əsaslandırma olmadan qeyd olunub; öz fikrinin tərəfi mövzuya uyğundur, amma əks tərəf mövzudan uzaqlaşır.
0: 1 balın tələblərinə cavab vermədikdə.

C – Qrammatik qaydalara əməl olunma (0, 0.5, 1)
1: müxtəlif qrammatik forma və sintaktik strukturlardan (sadə və mürəkkəb cümlələr) düzgün və yerində istifadə olunub; ən azı 2 düzgün mürəkkəb cümlə var, səhvlərin sayı 0-5-dir.
0.5: yazı işi əsasən sadə cümlələrdən ibarətdir; qısa, şablon və ya yarımçıq cümlələr qurur; və ya səhvlərin sayı 6-7-dir; və ya səhvlərin sayı 7-dən çoxdur, lakin esse hələ də cümlələrdən qurulub (söz yığını deyil).
0: cümlə qurmaqda çətinlik çəkir, yazı söz yığınından ibarətdir; qalan hissəsi cümlələrdən qurulmuş essedə 1-2 anlaşılmayan cümlə heç vaxt 0 bal vermir.

D – Söz ehtiyatının müxtəlifliyi və işlədilməsi (0, 0.5, 1)
1: mövzuya uyğun zəngin söz ehtiyatı var və həmişə yerində işlədir; müxtəlif leksik vahidlərdən istifadə edir və leksik təkrara yol vermir (parafraz edir, sinonimlərini yazır, söz birləşmələrini istifadə edir); leksik səhvlərin sayı 0-5-dir.
0.5: mövzuya uyğun kifayət qədər söz ehtiyatı var, bəzən tapşırığı yerinə yetirməyə mane olur; bəzən leksik təkrara yol verir; və ya leksik səhvlərin sayı 6-7-dir; və ya leksik səhvlərin sayı 7-dən çoxdur, lakin fikir yenə də başa düşülür.
0: mövzuya uyğun söz ehtiyatı bəsitdir/yoxdur, yersiz təkrarlara yol verir; 0.5 balın tələblərinə cavab vermədikdə; qalan hissəsində fikir başa düşülən essedə 1-2 yanlış söz seçimi heç vaxt 0 bal vermir.

QEYDLƏR:
Qeyd 1: a) Yerinə yetirilməmiş, yazı müəllifini tanıtmaq məqsədilə abituriyentin özü və/və ya yaxınları, müəllimləri barədə məlumat yazılmış və ya təqdim olunan mövzulardan biri əvəzinə, hər hansı digər mövzuda və seçilmiş xarici dil əvəzinə digər dildə yazılmış, həmçinin oxunulması mümkün olmayan yazı işləri "0" balla qiymətləndirilir. b) Hər hansı işarə vurulmuş, sadə qələmlə (karandaş) yazılmış və üstündən diyircəkli qələmlə yazılmış işlər qiymətləndirilir.
Qeyd 2: A bəndi "0" balla qiymətləndirilirsə, B bəndi üzrə qiymətləndirmə aparılmır və yekun qiymət kimi "0" bal yazılır. B bəndi "0" balla qiymətləndirilirsə, C və D bəndləri üzrə qiymətləndirmə aparılmır.
Qeyd 3: Hər alt meyar üzrə bütün şərtlər ödənilərsə, həmin bənd üzrə maksimum bal verilir. Şərtlərin çoxu və ya əsas hissəsi ödənilirsə müvafiq bal yazılır.
Qeyd 4: Eyni dil qaydalarına aid təkrarlanan səhvlər 1 (bir) səhv hesab olunur.
`;

const BASE_PROMPT = `Bu esseni qiymətləndir. Əgər şəkil gəlibsə əvvəlcə mətni tam və dəqiq çıxar (əl yazısı ola bilər), əgər mətn gəlibsə həmin mətni qiymətləndir. Sonra aşağıda verilən A, B, C, D meyarları ilə qiymətləndir. Qeyd 2 qaydasını mütləq tətbiq et: A=0-dırsa, B-ni qiymətləndirmə, yekun bal 0 olsun. Cavabı yalnız təmiz JSON qaytar, başqa mətn yazma: {text, scores: {A, B, C, D}, feedback: {A, B, C, D}, errors: [], total}
Əlavə: text sahəsinə esse mətni (şəkildən çıxardığın və ya gələn mətn) yazılsın. feedback və errors Azərbaycan dilində olsun. scores və total ədəd olsun. errors massivində tapılan qrammatik/leksik səhvləri qısa yaz (düzgün variantı ilə). Qeyd 4-ə əsasən təkrarlanan eyni səhvi bir dəfə yaz. B=0 olarsa C və D-ni 0 yaz, yekun bal = A olsun.
${CRITERIA}`;

const MULTI_NOTE = `Bu şəkillər bir essenin ardıcıl səhifələridir. Hamısını sıra ilə oxu, birləşdirib tam mətni çıxar, sonra qiymətləndir. Esse bütövlükdə bir dəfə qiymətləndirilir: səhifə-səhifə ayrı bal vermə, text sahəsinə birləşdirilmiş tam mətn yaz.`;
const MAX_IMAGES = 10;
const MAX_TOTAL_B64 = 4_300_000; // Vercel sorğu limiti ~4.5MB

function buildPrompt(topic, pages = 0) {
  let p = BASE_PROMPT;
  if (pages > 1) p += `\n${MULTI_NOTE} Şəkillərin sayı: ${pages}.`;
  p += topic
    ? `\nEsse mövzusu/tapşırıq: "${topic}". A və B bəndlərini bu mövzuya görə qiymətləndir.`
    : `\nEsse mövzusu verilməyib; mövzunu esse mətnindən və başlıqdan müəyyən et.`;
  return p;
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VALUES = {
  A: [0, 0.5, 1],
  B: [0, 1, 2],
  C: [0, 0.5, 1],
  D: [0, 0.5, 1],
};

function setCors(req, res) {
  // İstəsəniz ALLOWED_ORIGIN env dəyişəni ilə yalnız öz domeninizə məhdudlaşdıra bilərsiniz.
  const origin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function fail(res, status, message) {
  return res.status(status).json({ error: message });
}

// Model bəzən ```json ... ``` ilə cavab verir; təmizləyib parse edirik.
function parseModelJson(raw) {
  let s = String(raw || "").trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(s);
  } catch (_) {
    const a = s.indexOf("{");
    const b = s.lastIndexOf("}");
    if (a !== -1 && b > a) return JSON.parse(s.slice(a, b + 1));
    throw new Error("JSON tapılmadı");
  }
}

function snap(key, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const opts = ALLOWED_VALUES[key];
  return opts.reduce((best, o) => (Math.abs(o - n) < Math.abs(best - n) ? o : best), opts[0]);
}

// Cavabı normallaşdır və A=0 qaydasını serverdə də təmin et.
function normalize(d) {
  const sc = d.scores || {};
  const fb = d.feedback || {};
  const scores = {
    A: snap("A", sc.A),
    B: snap("B", sc.B),
    C: snap("C", sc.C),
    D: snap("D", sc.D),
  };
  const feedback = {
    A: String(fb.A || ""),
    B: String(fb.B || ""),
    C: String(fb.C || ""),
    D: String(fb.D || ""),
  };
  let errors = Array.isArray(d.errors) ? d.errors : [];
  errors = errors
    .map((e) => (typeof e === "string" ? e : e && typeof e === "object" ? Object.values(e).join(" — ") : ""))
    .filter(Boolean);

  // Qeyd 2: A=0 -> B yoxdur, yekun 0. B=0 -> C və D qiymətləndirilmir.
  let total;
  if (scores.A === 0) {
    scores.B = 0; scores.C = 0; scores.D = 0;
    total = 0;
  } else if (scores.B === 0) {
    scores.C = 0; scores.D = 0;
    total = scores.A;
  } else {
    total = scores.A + scores.B + scores.C + scores.D;
  }
  return { text: String(d.text || ""), scores, feedback, errors, total };
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, 405, "Yalnız POST sorğusu qəbul olunur.");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fail(res, 500, "Serverdə GEMINI_API_KEY təyin edilməyib. Vercel Environment Variables bölməsinə əlavə edin.");
  }

  // Body
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return fail(res, 400, "Sorğunun gövdəsi düzgün JSON deyil."); }
  }
  let { image, images, mimeType, topic, text } = body || {};
  topic = typeof topic === "string" ? topic.trim().slice(0, 300).replace(/["\n\r]/g, " ") : "";

  // Ya mətn, ya şəkil(lər) qəbul olunur; mətn varsa o istifadə olunur.
  let parts;
  if (typeof text === "string" && text.trim()) {
    text = text.trim();
    if (text.length < 20) return fail(res, 400, "Mətn çox qısadır. Esseni tam yapışdırın.");
    if (text.length > 15000) return fail(res, 413, "Mətn çox uzundur (maksimum 15 000 simvol).");
    parts = [{ text: `${buildPrompt(topic)}\n\nESSE MƏTNİ:\n"""\n${text}\n"""` }];
  } else {
    // images: ["base64", ...] və ya [{data, mimeType}, ...]; köhnə "image" sahəsi də işləyir
    let list = Array.isArray(images) ? images : image ? [image] : [];
    if (!list.length) return fail(res, 400, "Nə şəkil, nə də mətn göndərilib.");
    if (list.length > MAX_IMAGES) return fail(res, 400, `Ən çox ${MAX_IMAGES} şəkil göndərmək olar.`);

    const imgParts = [];
    let total = 0;
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      let data = typeof item === "string" ? item : item && item.data;
      let mt = ((item && item.mimeType) || mimeType || "image/jpeg").toLowerCase();
      if (!data || typeof data !== "string") return fail(res, 400, `${i + 1}-ci şəkil oxunmadı.`);
      const m = data.match(/^data:(image\/[a-z+.-]+);base64,(.*)$/i); // data:image/jpeg;base64,... formatı
      if (m) { mt = m[1].toLowerCase(); data = m[2]; }
      if (!ALLOWED_MIME.includes(mt)) return fail(res, 400, "Yalnız JPG, PNG və ya WEBP şəkil qəbul olunur.");
      if (!/^[A-Za-z0-9+/=\s]+$/.test(data)) return fail(res, 400, `${i + 1}-ci şəkil base64 formatında deyil.`);
      total += data.length;
      imgParts.push({ inline_data: { mime_type: mt, data } });
    }
    if (total > MAX_TOTAL_B64) return fail(res, 413, "Şəkillərin ümumi ölçüsü çox böyükdür. Daha az və ya daha kiçik şəkil yükləyin.");
    parts = [{ text: buildPrompt(topic, imgParts.length) }, ...imgParts];
  }

  // Gemini sorğusu (45 san timeout)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  let geminiRes;
  try {
    geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey, // açar yalnız serverdən gedir
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") return fail(res, 504, "AI cavab vermədi (vaxt bitdi). Yenidən cəhd edin.");
    return fail(res, 502, "AI xidmətinə qoşulmaq mümkün olmadı.");
  }
  clearTimeout(timer);

  if (!geminiRes.ok) {
    let detail = "";
    try { detail = (await geminiRes.json())?.error?.message || ""; } catch {}
    console.error("Gemini error", geminiRes.status, detail); // açar log-lanmır
    if (geminiRes.status === 429) return fail(res, 429, "AI limiti dolub. Bir az sonra yenidən cəhd edin.");
    if (geminiRes.status === 400 || geminiRes.status === 403)
      return fail(res, 502, "AI sorğunu qəbul etmədi. API açarını və şəkli yoxlayın.");
    return fail(res, 502, "AI xidməti xəta qaytardı. Bir az sonra yenidən cəhd edin.");
  }

  let data;
  try { data = await geminiRes.json(); } catch { return fail(res, 502, "AI cavabı oxunmadı."); }

  const cand = data?.candidates?.[0];
  if (data?.promptFeedback?.blockReason || !cand) {
    return fail(res, 422, "AI bu şəkli emal edə bilmədi. Başqa şəkil yoxlayın.");
  }
  const raw = (cand.content?.parts || []).map((p) => p.text || "").join("");

  let parsed;
  try {
    parsed = parseModelJson(raw);
  } catch {
    return fail(res, 502, "AI cavabı düzgün formatda gəlmədi. Zəhmət olmasa yenidən cəhd edin.");
  }
  if (!parsed || typeof parsed !== "object" || !parsed.scores) {
    return fail(res, 502, "AI cavabında bal məlumatı yoxdur. Yenidən cəhd edin.");
  }

  return res.status(200).json(normalize(parsed));
}
