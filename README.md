<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763e596a7e1f913d1ff5de15bcd" />
</div>

# المحدث الذكي — Smart Muhaddith

تطبيق ويب ذكي للتحقق من صحة الأحاديث النبوية بناءً على خوارزميات الذكاء الاصطناعي
والمرجعية القرآنية، معتمداً قواعد الجرح والتعديل ونقد المتن.

التطبيق مربّط بنموذج **Gemini 3 Flash Preview** (المزوّد الافتراضي)، مع إمكانية التبديل
اختيارياً إلى **Claude Sonnet** عبر زر المزوّد في الواجهة.

View your app in AI Studio: https://ai.studio/apps/ee40add7-aadb-4f4d-9403-4a3e9ba38f8f

## ربط نموذج الذكاء الاصطناعي

**المزوّد الافتراضي:** Gemini. لتمكين الاتصال:

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. احصل على مفتاح API من [Google AI Studio](https://aistudio.google.com/apikey)
3. عدّّل ملف `.env.local` واملأ المتغير `GEMINI_API_KEY` بمفتاحك:
   ```
   AI_PROVIDER=gemini
   GEMINI_API_KEY=أدخل_مفتاح_Gemini_here
   GEMINI_MODEL=gemini-3-flash-preview
   ```
4. Run the app:
   `npm run dev`

> **تبديل المزوّد:** استخدم **زر المزوّد** في شريط العنوان للتبديل بين
> **Gemini** و **Claude (Anthropic)**. الاختيار يُحفظ تلقائياً. للعمل مع Claude،
> ضع `ANTHROPIC_API_KEY` في `.env.local`.
