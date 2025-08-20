'use client';

import { Suspense } from 'react';
import AuthPageContent from './AuthPageContent';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Chargement...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
