import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { Landmark, GraduationCap, PackageCheck, ShieldCheck, Edit2 } from 'lucide-react';
import { StaggerContainer, StaggerItem, ScrollReveal } from './common/ScrollReveal';

interface StatsSectionProps {
  onOpenEditStatistik: () => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ onOpenEditStatistik }) => {
  const { adminSession } = useFoundation();

  const stats = [
    {
      icon: <Landmark className="w-8 h-8 text-emerald-700" />,
      numKey: 'stat_1_num' as const,
      labelKey: 'stat_1_label' as const,
      badgeColor: 'bg-emerald-50 border-emerald-100',
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-amber-600" />,
      numKey: 'stat_2_num' as const,
      labelKey: 'stat_2_label' as const,
      badgeColor: 'bg-amber-50 border-amber-100',
    },
    {
      icon: <PackageCheck className="w-8 h-8 text-teal-600" />,
      numKey: 'stat_3_num' as const,
      labelKey: 'stat_3_label' as const,
      badgeColor: 'bg-teal-50 border-teal-100',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      numKey: 'stat_4_num' as const,
      labelKey: 'stat_4_label' as const,
      badgeColor: 'bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="-mt-8 sm:-mt-12 relative z-30 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {adminSession && (
          <ScrollReveal direction="fade" className="flex justify-end mb-3">
            <button
              onClick={onOpenEditStatistik}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold shadow transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit 4 Angka Statistik</span>
            </button>
          </ScrollReveal>
        )}

        <StaggerContainer
          staggerDelay={0.12}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {stats.map((s, idx) => (
            <StaggerItem key={idx} direction="up" distance={30}>
              <div className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
                <div
                  className={`w-14 h-14 mx-auto mb-3.5 rounded-2xl flex items-center justify-center border ${s.badgeColor} group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm`}
                >
                  {s.icon}
                </div>
                <EditableText
                  contentKey={s.numKey}
                  as="div"
                  className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight leading-none mb-1.5 group-hover:text-emerald-700 transition-colors"
                />
                <EditableText
                  contentKey={s.labelKey}
                  as="div"
                  className="text-xs sm:text-sm font-semibold text-slate-500 leading-snug"
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};
