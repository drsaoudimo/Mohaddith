<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763e596a7e1f913d1ff5de15bcd" />
</div>

# المحدث الذكي — Smart Muhaddith

تطبيق ويب ذكي للتحقق من صحة الأحاديث النبوية بناءً على خوارزميات الذكاء الاصطناعي
(نموذج **Claude Sonnet** من Anthropic) والمرجعية القرآنية، معتمداً قواعد الجرح والتعديل ونقد المتن.

View your app in AI Studio: https://ai.studio/apps/ee40add7-aadb-4f4d-9403-4a3e9ba38f8f

## ربط نموذج الذكاء الاصطناعي

التطبيق متصل بنموذج **Claude Sonnet** عبر Anthropic Messages API. لتمكين الاتصال:

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. احصل على مفتاح API من [Anthropic Console](https://console.anthropic.com)
3. عدّّل ملف `.env.local` واملأ المتغير `ANTHROPIC_API_KEY` بمفتاحك:
   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=أدخل_مفتاح_Claude_here
   ANTHROPIC_MODEL=claude-sonnet-5-5
   ```
4. Run the app:
   `npm run dev`

> **ملاحظات:**
> - يمكنك تغيير النموذج عبر `ANTHROPIC_MODEL` (الافتراضي: `claude-sonnet-5-5`).
> - للتحويل إلى Gemini، ضع `AI_PROVIDER=gemini` وعيّن `GEMINI_API_KEY`.
