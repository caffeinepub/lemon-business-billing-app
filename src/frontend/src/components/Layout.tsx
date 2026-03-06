import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import type { Language } from "@/i18n/translations";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Clock, Globe, RefreshCw, WifiOff } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const LANGUAGE_OPTIONS: { value: Language; label: string; native: string }[] = [
  { value: "en", label: "English", native: "English" },
  { value: "hi", label: "Hindi", native: "हिन्दी" },
  { value: "mr", label: "Marathi", native: "मराठी" },
  { value: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isRoot = currentPath === "/" || currentPath === "";
  const { language, setLanguage, t } = useLanguage();
  const { isOnline, syncStatus, pendingCount, syncPending } = useOfflineSync();

  return (
    <div className="min-h-screen flex flex-col bg-lemon-bg">
      {/* Offline / Sync Status Banner */}
      {(!isOnline || pendingCount > 0 || syncStatus === "syncing") && (
        <div
          className={`print:hidden sticky top-0 z-[60] px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
            !isOnline
              ? "bg-amber-500 text-white"
              : syncStatus === "syncing"
                ? "bg-lemon-green-dark text-white"
                : syncStatus === "error"
                  ? "bg-destructive text-white"
                  : "bg-lemon-green/80 text-lemon-dark"
          }`}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>You're offline — changes will sync when connected</span>
              {pendingCount > 0 && (
                <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                  {pendingCount} pending
                </span>
              )}
            </>
          ) : syncStatus === "syncing" ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" />
              <span>Syncing offline changes…</span>
            </>
          ) : syncStatus === "error" ? (
            <>
              <span>Some changes failed to sync.</span>
              <button
                type="button"
                onClick={() => syncPending()}
                className="underline underline-offset-2 hover:no-underline"
              >
                Retry
              </button>
            </>
          ) : pendingCount > 0 ? (
            <>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {pendingCount} change{pendingCount !== 1 ? "s" : ""} pending
                sync
              </span>
              <button
                type="button"
                onClick={() => syncPending()}
                className="underline underline-offset-2 hover:no-underline"
              >
                Sync now
              </button>
            </>
          ) : null}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-lemon-yellow shadow-md print:hidden">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {!isRoot && (
            <Button
              variant="ghost"
              size="icon"
              className="text-lemon-dark hover:bg-lemon-yellow-dark shrink-0"
              onClick={() => navigate({ to: "/" })}
              aria-label={t("back")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            <img
              src="/assets/generated/lemon-logo.dim_128x128.png"
              alt="Lemon Business"
              className="w-9 h-9 rounded-full object-cover border-2 border-lemon-dark/20 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lemon-dark font-extrabold text-lg leading-tight tracking-tight truncate">
                {t("appTitle")}
              </h1>
              <p className="text-lemon-dark/60 text-xs font-medium">
                {t("appSubtitle")}
              </p>
            </div>
          </button>

          {/* Language Picker */}
          <div className="shrink-0">
            <Select
              value={language}
              onValueChange={(val) => setLanguage(val as Language)}
            >
              <SelectTrigger className="h-8 w-auto gap-1 border-lemon-dark/20 bg-white/60 hover:bg-white/80 text-lemon-dark text-xs font-semibold px-2 focus:ring-lemon-green">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <SelectValue>
                  {LANGUAGE_OPTIONS.find((o) => o.value === language)?.native ??
                    "EN"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-sm"
                  >
                    <span className="font-medium">{opt.native}</span>
                    {opt.value !== "en" && (
                      <span className="ml-1.5 text-muted-foreground text-xs">
                        ({opt.label})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {children}
      </main>

      {/* Footer */}
      <footer className="print:hidden bg-lemon-yellow/30 border-t border-lemon-yellow mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-3 text-center text-xs text-lemon-dark/50">
          © {new Date().getFullYear()} {t("appTitle")} &nbsp;·&nbsp;{" "}
          {t("footerBuiltWith")} <span className="text-red-400">♥</span>{" "}
          {t("footerUsing")}{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined"
                ? window.location.hostname
                : "lemon-business-app",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-lemon-green hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
