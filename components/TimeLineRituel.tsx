'use client';

import { UserPlus, BookOpen, Link2 } from 'lucide-react';

export default function TimeLineRituel() {
  return (
    <section className="py-4 sm:py-8 w-full flex justify-center mb-3">
      <div className="flex flex-row items-center justify-center gap-2 sm:gap-6 md:gap-12 w-full max-w-xs sm:max-w-lg">
        {/* Étape 1 */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <UserPlus className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#2563EB] mb-1 sm:mb-2" />
          <div className="font-bold text-xs sm:text-sm text-center mb-1">Un<br /> compte<br /> créé</div>
        </div>
        {/* Étape 2 */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <BookOpen className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#7C3AED] mb-1 sm:mb-2" />
          <div className="font-bold text-xs sm:text-sm text-center mb-1">Des<br /> souvenirs <br />déposés</div>
        </div>
        {/* Étape 3 */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <Link2 className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#F2994A] mb-1 sm:mb-2" />
          <div className="font-bold text-xs sm:text-sm text-center mb-1">Une<br /> génération <br />reliée</div>
        </div>
      </div>
    </section>
  );
}
