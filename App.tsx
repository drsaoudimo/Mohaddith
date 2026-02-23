import React, { useState, useEffect, useRef } from 'react';
import { analyzeHadith } from './services/geminiService';
import { AnalysisResult, Verdict } from './types';
import { Visualizer } from './components/Visualizer';

// Icons
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-3 text-gold-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.707 9.707 0 00-5.25.783V20.25a9.71 9.71 0 005.25-.783c2.053-.787 4.047-.787 5.25 0v-14.934z" />
    <path d="M12.75 4.533c1.203-.787 3.197-.787 5.25 0a9.71 9.71 0 015.25.783V20.25a9.71 9.71 0 01-5.25-.783 9.71 9.71 0 00-5.25.783V4.533z" />
  </svg>
);

const QuillIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const KatexEquation = ({ tex }: { tex: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).katex) {
      try {
        (window as any).katex.render(tex, containerRef.current, {
          throwOnError: false,
          displayMode: true,
          output: 'html', 
        });
      } catch (e) {
        console.warn("Katex render error", e);
      }
    }
  }, [tex]);

  return <div ref={containerRef} dir="ltr" className="my-4 overflow-x-auto overflow-y-hidden text-center flex justify-center text-emerald-900" />;
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const data = await analyzeHadith(inputText);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ في عملية التحقق. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (v: Verdict) => {
    switch (v) {
      case Verdict.SAHIH: return 'text-emerald-800 bg-emerald-50 border-emerald-300 ring-4 ring-emerald-100';
      case Verdict.HASAN: return 'text-teal-700 bg-teal-50 border-teal-300';
      case Verdict.GHARIB: return 'text-amber-700 bg-amber-50 border-amber-300';
      case Verdict.MAWDU: return 'text-rose-800 bg-rose-50 border-rose-300 ring-4 ring-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-300';
    }
  };

  // Classical Formulas
  const standardFormula = '\\text{Validity} = (\\text{Isnad} \\times \\text{Matn}) - \\text{Shudhudh}';
  const quranFormula = '\\text{If } \\text{Matn} \\perp \\text{Quran} \\implies \\text{Hukm} = 0 (\\text{Mawdu})';

  return (
    <div className="min-h-screen font-serif bg-[#fdfbf7] text-slate-800 pb-20">
      
      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg border-b-4 border-gold-500 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <BookIcon />
            <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-wide text-gold-400 mr-2 drop-shadow-md">
              المدقق الحديثي
            </h1>
          </div>
          <span className="text-[10px] md:text-xs bg-emerald-800 px-3 py-1 rounded-full text-emerald-200 border border-emerald-700 font-sans">
            الإصدار العلمي المنهجي
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-8 max-w-4xl">
        
        {/* Intro Section */}
        <section className="text-center mb-10">
          <h2 className="text-3xl font-bold text-emerald-900 mb-4 font-serif leading-relaxed">
            منظومة التحقق من المتن والإسناد
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto leading-8 text-lg font-serif">
            منصة علمية تعتمد قواعد الجرح والتعديل ونقد المتن.
            تقوم الخوارزمية بفحص <span className="text-emerald-700 font-bold">اتصال السند</span>، و<span className="text-emerald-700 font-bold">عدالة الرواة</span>، ومقارنة المتن <span className="text-emerald-700 font-bold">بمحكم التنزيل</span> لكشف الشذوذ والنكارة.
          </p>
        </section>

        {/* Mathematical Reference Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold-500"></div>
            <h3 className="text-emerald-800 font-bold mb-4 font-serif text-xl border-b border-slate-100 pb-2 text-center">
                المعايير المنهجية للحكم
            </h3>
            <div className="flex flex-col items-center justify-center gap-4 text-slate-800">
                <div className="w-full overflow-x-auto bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <KatexEquation tex={standardFormula} />
                    <div className="border-t border-slate-200 my-2 w-1/2 mx-auto"></div>
                    <KatexEquation tex={quranFormula} />
                </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-4 font-sans">
                * شرط الصحة: سلامة السند وخلو المتن من العلة القادحة ومخالفة القرآن.
            </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-1 overflow-hidden border border-slate-200">
          <div className="bg-[#fcfcfc] p-6 rounded-t-xl">
            <label className="block text-emerald-900 font-bold mb-3 text-xl font-serif">أدخل نص الحديث للتخريج والحكم:</label>
            <textarea
              className="w-full h-40 p-4 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all resize-none text-slate-800 text-xl leading-loose font-serif placeholder:text-slate-400 shadow-inner"
              placeholder="اكتب نص الحديث هنا..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              dir="rtl"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || !inputText}
                className={`flex items-center px-8 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg border-b-4 
                  ${loading || !inputText ? 'bg-slate-400 border-slate-600 cursor-not-allowed' : 'bg-emerald-700 border-emerald-900 hover:bg-emerald-600'}
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-100 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الفحص...
                  </>
                ) : (
                  <>
                     الحكم على الحديث <QuillIcon />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-12 animate-fade-in-up transition-opacity duration-700">
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Verdict Card */}
              <div className={`col-span-1 md:col-span-1 p-6 rounded-2xl border-2 flex flex-col items-center justify-center shadow-md transition-all ${getVerdictColor(result.verdict)}`}>
                <span className="text-sm font-sans opacity-80 mb-2 text-slate-600">الحكم النهائي</span>
                <h2 className="text-4xl font-serif font-bold text-center">{result.verdict}</h2>
              </div>
              
              {/* Fidelity Metric */}
              <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden">
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-emerald-900 text-lg font-serif font-bold">نسبة الثبوت والصحة</span>
                   <span className="text-3xl font-mono text-emerald-700">{result.confidenceScore}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3 mb-6 border border-slate-200">
                   <div 
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${result.confidenceScore}%` }}
                   ></div>
                 </div>

                 <div className="flex justify-between items-end mb-2">
                   <span className="text-emerald-900 text-lg font-serif font-bold">الموافقة للمنهج القرآني</span>
                   <span className={`text-2xl font-mono ${result.quranicConsistency > 0.8 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {(result.quranicConsistency * 100).toFixed(0)}%
                   </span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200">
                   <div 
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${result.quranicConsistency > 0.8 ? 'bg-emerald-600' : 'bg-rose-500'}`}
                    style={{ width: `${result.quranicConsistency * 100}%` }}
                   ></div>
                 </div>
              </div>
            </div>

            {/* Formula Display */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 font-serif text-sm md:text-base text-emerald-900 overflow-x-auto shadow-inner mb-8 text-center">
              <p className="opacity-70 mb-2 font-sans text-xs text-emerald-700">الصياغة المنطقية:</p>
              <span dir="ltr" className="font-mono text-lg">{result.mathFormula}</span>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 gap-8">
              
              <div className="bg-white rounded-xl shadow-lg p-8 border-r-4 border-gold-500 relative">
                <h3 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center font-serif border-b border-slate-100 pb-3">
                  تقرير التخريج والعلل
                </h3>
                <p className="text-slate-700 leading-9 text-xl mb-6 font-serif text-justify">
                  {result.reasoning}
                </p>
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                  <h4 className="font-bold text-amber-800 mb-2 text-lg font-serif">نتيجة فحص المتن:</h4>
                  <p className="text-amber-900 text-lg font-serif">
                    {result.orthogonalityCheck}
                  </p>
                </div>
              </div>

              {/* Visualizer */}
              <Visualizer data={result} />

              {/* Narrator Chain */}
              {result.narratorChain && result.narratorChain.length > 0 && (
                 <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
                    <h3 className="text-xl font-bold text-emerald-900 mb-8 font-serif text-center">
                      سلسلة الرواة (الإسناد)
                    </h3>
                    <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-6">
                      {result.narratorChain.map((narrator, idx) => (
                        <React.Fragment key={idx}>
                          <div className="flex flex-col items-center group relative">
                            <div className="w-16 h-16 rounded-full bg-slate-50 text-emerald-800 flex items-center justify-center text-xl font-bold shadow-md border-2 border-emerald-100 group-hover:border-gold-400 group-hover:bg-gold-50 transition-all font-serif z-10">
                              {idx + 1}
                            </div>
                            <span className="text-lg text-slate-800 mt-3 font-serif font-bold text-center max-w-[140px] leading-tight">{narrator}</span>
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mt-1">راوٍ</span>
                          </div>
                          {idx < (result.narratorChain?.length || 0) - 1 && (
                            <div className="h-8 w-0.5 md:h-0.5 md:w-12 bg-slate-300 relative">
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400 text-xs bg-white px-1 font-serif">عن</span>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                 </div>
              )}

            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 text-center text-slate-500 text-sm py-8 border-t border-slate-200 font-serif">
        <p>© 2024 المحدث الذكي - جميع الحقوق محفوظة للمنهج العلمي.</p>
      </footer>
    </div>
  );
};

export default App;