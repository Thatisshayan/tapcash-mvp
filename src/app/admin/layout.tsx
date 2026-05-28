'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/'); return; }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data().isAdmin === true) { setIsAdmin(true); }
        else { router.push('/'); }
      } catch { router.push('/'); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#060606]">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return null;
  return <>{children}</>;
}
