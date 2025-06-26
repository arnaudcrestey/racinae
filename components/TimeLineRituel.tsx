'use client';

import { UserPlus, BookOpen, Link2 } from 'lucide-react';

export default function TimeLineRituel() {
  return (
    <section className="py-16 w-full flex flex-col items-center mb-12">
      
      <div style={{ display: 'flex', flexDirection: 'row', gap: '48px', justifyContent: 'center', width: '100%' }}>
        {/* Étape 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
          <UserPlus style={{ width: 56, height: 56, color: '#2563EB', marginBottom: 8 }} />
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Un compte créé</div>
          <div style={{ fontSize: 14, textAlign: 'center', color: '#444', fontStyle: 'italic' }}>
            
          </div>
        </div>
        {/* Étape 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
          <BookOpen style={{ width: 56, height: 56, color: '#7C3AED', marginBottom: 8 }} />
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Des souvenirs déposés</div>
          <div style={{ fontSize: 14, textAlign: 'center', color: '#444', fontStyle: 'italic' }}>
            
          </div>
        </div>
        {/* Étape 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
          <Link2 style={{ width: 56, height: 56, color: '#F2994A', marginBottom: 8 }} />
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Une génération reliée</div>
          <div style={{ fontSize: 14, textAlign: 'center', color: '#444', fontStyle: 'italic' }}>
            
          </div>
        </div>
      </div>
    </section>
  );
}


