import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Verdict, Narrator } from "../types";

const apiKey = process.env.API_KEY || '';

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ['صحيح', 'حسن', 'غريب', 'موضوع / منكر'],
      description: "Final Hadith Ruling."
    },
    confidenceScore: {
      type: Type.NUMBER,
      description: "Authenticity Probability (0-100). MUST be 0 if significant Matn contradiction is found."
    },
    quranicConsistency: {
      type: Type.NUMBER,
      description: "Compatibility with Quran (0-1). 0 if Matn contradicts Quranic principles."
    },
    isnadScore: {
      type: Type.NUMBER,
      description: "Chain Quality (Narrator Reliability & Continuity)."
    },
    matnScore: {
      type: Type.NUMBER,
      description: "Text Integrity. 0 if 'Ma' (negation) is inserted into a known affirmation."
    },
    reasoning: {
      type: Type.STRING,
      description: "Scholarly explanation using 'Mustalah al-Hadith' terminology (e.g., Thiqah, Dabt, Shadh, Munkar, Illah Qadihah) in Arabic."
    },
    mathFormula: {
      type: Type.STRING,
      description: "Logical formula representing the ruling."
    },
    narratorChain: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of Narrators (Sanad)."
    },
    narrators: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Narrator's full name" },
          reliabilityScore: { type: Type.NUMBER, description: "Reliability score (0-100)" },
          status: { type: Type.STRING, description: "Status (e.g., Thiqah, Saduq, Da'if, Majhul)" },
          biographySnippet: { type: Type.STRING, description: "Brief info from databases like Tahdhib al-Tahdhib" }
        },
        required: ["name", "reliabilityScore", "status", "biographySnippet"]
      },
      description: "Detailed analysis of each narrator in the chain."
    },
    orthogonalityCheck: {
      type: Type.STRING,
      description: "Explanation of the Textual Comparison with Quran and Famous Sunnah."
    }
  },
  required: ["verdict", "confidenceScore", "quranicConsistency", "isnadScore", "matnScore", "reasoning", "mathFormula", "orthogonalityCheck"]
};

export const analyzeHadith = async (text: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey });

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
    - في خانة "Reasoning"، اشرح الحكم بأسلوب علمي رصين.

    المعادلة المنطقية للحكم:
    $$ Validity = Isnad_{Integrity} \times Matn_{Soundness} \times (1 - Contradiction) $$
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: `قم بالتحليل والتخريج والحكم على هذا النص: "${text}"` }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, 
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const result = JSON.parse(jsonText) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Analysis failed", error);
    return {
      verdict: Verdict.GHARIB,
      confidenceScore: 0,
      quranicConsistency: 0,
      isnadScore: 0,
      matnScore: 0,
      reasoning: "تعذر الوصول إلى المصادر الرقمية. يرجى التحقق من الاتصال.",
      mathFormula: "Error = 1",
      narratorChain: [],
      narrators: [],
      orthogonalityCheck: "خطأ في المعالجة."
    };
  }
};