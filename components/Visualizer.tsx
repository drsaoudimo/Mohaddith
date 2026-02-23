import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { AnalysisResult } from '../types';

interface VisualizerProps {
  data: AnalysisResult;
}

export const Visualizer: React.FC<VisualizerProps> = ({ data }) => {
  // Traditional Hadith Science Mappings
  const radarData = [
    { subject: 'عدالة الرواة', A: data.isnadScore * 100, fullMark: 100 },
    { subject: 'ضبط الصدر', A: data.isnadScore * 90, fullMark: 100 }, 
    { subject: 'سلامة المتن', A: data.matnScore * 100, fullMark: 100 },
    { subject: 'موافقة القرآن', A: data.quranicConsistency * 100, fullMark: 100 },
    { subject: 'انتفاء الشذوذ', A: (1 - (data.quranicConsistency < 0.5 ? 1 : 0)) * 100, fullMark: 100 },
  ];

  const barData = [
    { name: 'احتمالية الصحة', value: data.confidenceScore },
    { name: 'نسبة النكارة', value: (1 - data.quranicConsistency) * 100 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full my-8 text-slate-800">
      {/* Radar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-center font-bold text-emerald-800 mb-4 font-serif text-lg">شروط القبول الخمسة</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontFamily: 'Noto Kufi Arabic', fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="درجة التحقق"
                dataKey="A"
                stroke="#059669"
                strokeWidth={3}
                fill="#10b981"
                fillOpacity={0.4}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'الدرجة']} 
                contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', textAlign: 'right', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                itemStyle={{color: '#059669', fontFamily: 'serif'}}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-slate-500 mt-2 font-serif">
          مؤشرات الصحة والحسن حسب المنهج العلمي
        </p>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-center font-bold text-emerald-800 mb-4 font-serif text-lg">ميزان القبول والرد</h3>
        <div className="h-64 w-full flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontFamily: 'Noto Kufi Arabic', fontSize: 11, fill: '#334155', fontWeight: 'bold'}} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', direction: 'rtl', textAlign: 'right' }} 
                    itemStyle={{color: '#334155', fontFamily: 'serif'}}
                    formatter={(value: number) => [`${value}%`, 'النسبة']} 
                />
                <Bar dataKey="value" barSize={25} radius={[4, 0, 0, 4]}>
                    {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? (entry.value > 50 ? '#059669' : '#e11d48') : '#64748b'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-slate-500 mt-2 font-serif">
            مقارنة بين عوامل الثبوت وعوامل العلل
        </p>
      </div>
    </div>
  );
};