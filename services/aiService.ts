import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

/**
 * خدمة ربط التطبيق بنموذج ذكاء اصطناعي.
 *
 * المزوّد الافتراضي: Anthropic Claude Sonnet (claude-sonnet-5-5).
 * يمكن تغيير المزوّد والنموذج عبر متغيرات البيئة في .env.local:
 *
 *   AI_PROVIDER=anthropic | gemini
 *   ANTHROPIC_MODEL=claude-sonnet-5-5
 *   ANTHROPIC_API_KEY=...
 *   GEMINI_MODEL=gemini-3-flash-preview
 *   GEMINI_API_KEY=...
 */

const AI_PROVIDER = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

/** وصف بنية النتيجة المطلوبة، يُستخدم في prompt نموذج Claude (لا يدعم schema رسميًا). */
const resultSchemaDescription = `
{
  "verdict": "صحيح | حسن | غريب | موضوع / منكر",
  "confidenceScore": 0-100,
  "quranicConsistency": 0-1,
  "isnadScore": 0-1,
  "matnScore": 0-1,
  "reasoning": "شرح علمي بالعربية بمصطلحات أهل الحديث",
  "mathFormula": "صيغة منطقية للحكم",
  "narratorChain": ["اسم الراوي", ...],
  "narrators": [
    { "name": "...", "reliabilityScore": 0-100, "status": "...", "biographySnippet": "..." }
  ],
  "orthogonalityCheck": "نتيجة مقارنة المتن بالقرآن والسنة"
}
`;

const systemInstruction = `
  أنت "المدقق الحديثي الرقمي" (Digital Muhaddith).
  مهمتك: الحكم على الأحاديث باستخدام قواعد "علم الجرح والتعديل" و"نقد المتن"، مع الانتباه الشديد للتحريفات النصية.

  القواعد الحاكمة (Criteria):
  1. **اتصال السند وعدالة الرواة**: تحقق من السلسلة. قم بتخريج الرواة وتقييمهم بناءً على كتب الرجال (مثل تهذيب الكمال، تقريب التهذيب).
  2. **سلامة المتن (Textual Integrity)**: الخلو من الشذوذ والعلة القادحة.
  3. **الموافقة للكتاب (Quranic Alignment)**: ما خالف القرآن مخالفة صريحة فهو "منكر" أو "موضوع".
  4. **كشف التحريف (Distortion Detection)**: انتبه لأدوات النفي (ما، ليس، لا) التي قد تُدس على حديث مشهور لقلب معناه (مثلاً: "ما إنما الأعمال بالنيات"). هذا يعتبر "قلب للمتن" ويجعل الحديث **موضوعاً** فوراً.

  المخرجات المطلوبة:
  - استخدم مصطلحات أهل الحديث: (ثقة، صدوق، منكر، شاذ، علة قادحة، مخالفة الثقات، ركاكة اللفظ).
  - لا تستخدم مصطلحات فيزيائية (مثل تراكب كمومي أو انهيار دالة).
  - في خانة "reasoning"، اشرح الحكم بأسلوب علمي رصين.

  المعادلة المنطقية للحكم:
  Validity = Isnad_Integrity × Matn_Soundness × (1 - Contradiction)

  **أخرج الإجابة حصراً ككائن JSON مطابق تماماً للبنية التالية (بدون أي نص إضافي أو أكوام markdown):**
${resultSchemaDescription}
`;

/** استخراج كود JSON من نص الاستجابة (يتحمل الأقواس والجداول البرمجية). */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return candidate.slice(start, end + 1);
  }
  return candidate;
}

async function analyzeWithAnthropic(text: string): Promise<AnalysisResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      'المفتاح الخاص بنموذج Claude غير معرّف. يرجى إضافة ANTHROPIC_API_KEY إلى ملف .env.local ثم إعادة تشغيل التطبيق.'
    );
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 8192,
      system: systemInstruction,
      messages: [
        { role: 'user', content: `قم بالتحليل والتخريج والحكم على هذا النص: "${text}"` },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Anthropic API error', response.status, detail);
    throw new Error(
      `فشل الاتصال بنموذج Claude (${ANTHROPIC_MODEL}). يرجى التحقق من صلاحية المفتاح ومحاولتك لاحقاً. (الخطأ: ${response.status})`
    );
  }

  const data = await response.json();
  const jsonText =
    Array.isArray(data?.content) && data.content.length > 0
      ? data.content
          .filter((block: { type?: string }) => block?.type === 'text')
          .map((block: { text?: string }) => block.text || '')
          .join('')
      : '';

  if (!jsonText) {
    throw new Error("لم يتلقَّ التطبيق استجابة من نموذج Claude. يرجى المحاولة مرة أخرى.");
  }

  try {
    return JSON.parse(extractJson(jsonText)) as AnalysisResult;
  } catch (parseError) {
    console.error('Failed to parse Anthropic response', parseError);
    throw new Error("استجابة النموذج غير قابلة للتحليل. يرجى المحاولة مرة أخرى.");
  }
}

async function analyzeWithGemini(text: string): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'المفتاح الخاص بنموذج Gemini غير معرّف. يرجى إضافة GEMINI_API_KEY إلى ملف .env.local ثم إعادة تشغيل التطبيق.'
    );
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const analysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      verdict: {
        type: Type.STRING,
        enum: ['صحيح', 'حسن', 'غريب', 'موضوع / منكر'],
        description: "Final Hadith Ruling.",
      },
      confidenceScore: {
        type: Type.NUMBER,
        description: "Authenticity Probability (0-100). MUST be 0 if significant Matn contradiction is found.",
      },
      quranicConsistency: {
        type: Type.NUMBER,
        description: "Compatibility with Quran (0-1). 0 if Matn contradicts Quranic principles.",
      },
      isnadScore: {
        type: Type.NUMBER,
        description: "Chain Quality (Narrator Reliability & Continuity).",
      },
      matnScore: {
        type: Type.NUMBER,
        description: "Text Integrity. 0 if 'Ma' (negation) is inserted into a known affirmation.",
      },
      reasoning: {
        type: Type.STRING,
        description: "Scholarly explanation using 'Mustalah al-Hadith' terminology in Arabic.",
      },
      mathFormula: {
        type: Type.STRING,
        description: "Logical formula representing the ruling.",
      },
      narratorChain: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of Narrators (Sanad).",
      },
      narrators: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Narrator's full name" },
            reliabilityScore: { type: Type.NUMBER, description: "Reliability score (0-100)" },
            status: { type: Type.STRING, description: "Status (e.g., Thiqah, Saduq, Da'if, Majhul)" },
            biographySnippet: { type: Type.STRING, description: "Brief info from databases like Tahdhib al-Tahdhib" },
          },
          required: ["name", "reliabilityScore", "status", "biographySnippet"],
        },
        description: "Detailed analysis of each narrator in the chain.",
      },
      orthogonalityCheck: {
        type: Type.STRING,
        description: "Explanation of the Textual Comparison with Quran and Famous Sunnah.",
      },
    },
    required: ["verdict", "confidenceScore", "quranicConsistency", "isnadScore", "matnScore", "reasoning", "mathFormula", "orthogonalityCheck"],
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { role: 'user', parts: [{ text: `قم بالتحليل والتخريج والحكم على هذا النص: "${text}"` }] },
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1,
      },
    });

    const jsonText =
      response.text ??
      response.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('') ??
      '';

    if (!jsonText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error('Gemini API request failed', error);
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `فشل الاتصال بنموذج Gemini (${GEMINI_MODEL}). يرجى التحقق من صلاحية المفتاح ومحاولتك لاحقاً. (${detail})`
    );
  }
}

/**
 * تطلب من نموذج الذكاء الاصطناعي تحليل نص الحديث وإرجاع الحكم ضمن بنية بيانات منظمة.
 */
export const analyzeHadith = async (text: string): Promise<AnalysisResult> => {
  if (AI_PROVIDER === 'gemini') {
    return analyzeWithGemini(text);
  }
  return analyzeWithAnthropic(text);
};
