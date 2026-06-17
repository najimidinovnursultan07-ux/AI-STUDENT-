'use client';

import { useEffect, useState } from 'react';
import { Sparkles, FileText, Languages, HelpCircle } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Компонент клиентке толук жүктөлгөндө гана иштесин
    setIsMounted(true);

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }
      } catch (e) {
        console.error("Telegram SDK error:", e);
      }
    }
  }, []);

  // Эгер компонент браузерде толук жүктөлө элек болсо, 
  // Сервер менен Клиенттин HTML коддору дал келиши үчүн бош караңгы экран көрсөтүп турабыз
  if (!isMounted) {
    return <div className="min-h-screen bg-[#0B0F19]"></div>;
  }

  return (
    <main className="p-4 max-w-md mx-auto flex flex-col justify-between min-h-screen pb-8">
      {/* Жогорку бөлүк: Саламдашуу */}
      <div>
        <div className="flex items-center justify-between mt-4 mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Кош келдиң!</p>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Салам, {user ? user.first_name : 'Студент'} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">Бүгүн эмне үйрөнөсүң?</p>
          </div>
          <div className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Негизги Тизме (Функциялар) */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 px-1">AI Куралдар:</h2>

          {/* 1. AI Конспект */}
          <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-purple-500/30 p-4 rounded-2xl transition-all duration-300 backdrop-blur-md cursor-pointer shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">AI Конспект Анализ</h3>
                <p className="text-xs text-gray-400 mt-0.5">Текстти же сүрөттү жүктө, AI сага кыскача тезис жасап берет</p>
              </div>
            </div>
          </div>

          {/* 2. Тез Шпаргалка */}
          <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-pink-500/30 p-4 rounded-2xl transition-all duration-300 backdrop-blur-md cursor-pointer shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">Тез Шпаргалка & Тест</h3>
                <p className="text-xs text-gray-400 mt-0.5">Тема боюнча экзаменде келе турган суроолорду даярдоо</p>
              </div>
            </div>
          </div>

          {/* 3. Тил Котормочу */}
          <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-emerald-500/30 p-4 rounded-2xl transition-all duration-300 backdrop-blur-md cursor-pointer shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                <Languages className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">Контексттик Котормочу</h3>
                <p className="text-xs text-gray-400 mt-0.5">Кыргыз, орус, англис жана немис тилдерине мааниси менен которуу</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Төмөнкү логотип */}
      <div className="text-center mt-8">
        <p className="text-xs text-gray-600 font-medium">AI Student PRO • v1.0.0</p>
      </div>
    </main>
  );
}