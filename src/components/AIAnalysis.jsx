"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ImagePlus,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

// Django API URL — .env.local ичинде NEXT_PUBLIC_DJANGO_API_URL
const API_URL =
  process.env.NEXT_PUBLIC_DJANGO_API_URL ?? "http://localhost:8000/api/analyze/";

/**
 * AIAnalysis — «AI Конспект Анализ» компоненти
 * Текст/сүрөттү Django бэкендге жөнөтөт, жооп Telegram чатына келет.
 */
export default function AIAnalysis() {
  const [isMounted, setIsMounted] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);

    // Telegram Mini App — chat_id алуу
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      try {
        tg.ready();
        tg.expand();

        const userId = tg.initDataUnsafe?.user?.id;
        if (userId) {
          setChatId(String(userId));
        }
      } catch (telegramError) {
        console.error("Telegram SDK ката:", telegramError);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
    setStatus("idle");
  };

  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setAnalysis("");
    setStatus("idle");

    if (!text.trim() && !imageFile) {
      setError("Текстти киргизиңиз же сүрөт жүктөңүз.");
      return;
    }

    if (!chatId) {
      setError(
        "chat_id табылган жок. Колдонмону Telegram ичинде ачыңыз жана ботту /start кылыңыз.",
      );
      return;
    }

    setStatus("loading");

    try {
      const formData = new FormData();

      if (text.trim()) {
        formData.append("text", text.trim());
      }

      if (imageFile) {
        formData.append("file", imageFile);
      }

      formData.append("chat_id", chatId);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Белгисиз ката");
      }

      setAnalysis(data.analysis ?? "");
      setStatus("success");
    } catch (submitError) {
      setStatus("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Талдоо ийгиликсиз аяктады.",
      );
    }
  };

  // Гидратация катасын алдын алуу — иконкалар монтирленгенден кийин
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <div className="mx-auto max-w-lg px-5 pb-8 pt-10">
          <div className="mb-8 h-8 w-32 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="space-y-4">
            <div className="h-36 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
            <div className="h-24 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-h-dvh overflow-hidden">
      <div
        className="ambient-orb -top-24 -left-20 h-72 w-72 bg-blue-600/30"
        aria-hidden="true"
      />
      <div
        className="ambient-orb top-1/2 -right-16 h-64 w-64 bg-purple-600/25"
        aria-hidden="true"
      />

      <main className="relative z-10 mx-auto max-w-lg px-5 pb-8 pt-6 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Артка
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="glow-blue flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-400" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white/95">
                AI Конспект Анализ
              </h1>
              <p className="mt-0.5 text-sm text-white/40">
                Тезис Telegram чатыңызга жөнөтүлөт
              </p>
            </div>
          </div>
        </header>

        {/* Статус: ийгиликтүү жөнөтүү */}
        {status === "success" && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 backdrop-blur-md">
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-emerald-400"
              strokeWidth={1.75}
            />
            <p className="text-sm font-medium text-emerald-300">
              Успешно отправлено — жооп Telegram чатыңызга келди!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Текст талаасы */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4 backdrop-blur-md">
            <label
              htmlFor="lecture-text"
              className="mb-2 block text-sm font-medium text-white/60"
            >
              Лекциянын тексти
            </label>
            <textarea
              id="lecture-text"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setStatus("idle");
              }}
              placeholder="Конспектти бул жерге чаптаңыз..."
              rows={6}
              disabled={status === "loading"}
              className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-sm leading-relaxed text-white/90 placeholder:text-white/25 outline-none transition-colors focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-50"
            />
          </div>

          {/* Сүрөт жүктөө */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4 backdrop-blur-md">
            <p className="mb-3 text-sm font-medium text-white/60">
              Сүрөт жүктөө
            </p>

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-white/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Конспекттин алдын ала көрүнүшү"
                  className="max-h-56 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  disabled={status === "loading"}
                  className="absolute right-2 top-2 rounded-lg border border-white/10 bg-black/60 p-1.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 disabled:opacity-50"
                  aria-label="Сүрөттү өчүрүү"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={status === "loading"}
                className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-8 text-white/40 transition-colors hover:border-purple-500/30 hover:bg-white/[0.04] hover:text-white/60 disabled:opacity-50"
              >
                <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
                <span className="text-sm">Сүрөт тандаңыз (JPEG, PNG)</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="feature-card flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/80 to-violet-600/80 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all hover:from-purple-500/90 hover:to-violet-500/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                Идет загрузка...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                Талдоо жасоо
              </>
            )}
          </button>
        </form>

        {/* Жоопту экранда да көрсөтүү (кошумча) */}
        {analysis && (
          <section className="mt-8 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-5 backdrop-blur-md">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-purple-300/80">
              Тезисный анализ
            </h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">
              {analysis}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
