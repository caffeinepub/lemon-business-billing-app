import { Button } from "@/components/ui/button";
import { Download, Plus, Share, X } from "lucide-react";
import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface InstallAppBannerProps {
  className?: string;
}

export default function InstallAppBanner({
  className = "",
}: InstallAppBannerProps) {
  const {
    canInstall,
    showBanner,
    showIOSInstructions,
    isInstalled,
    promptToInstall,
    dismiss,
  } = usePWAInstall();
  const [showIOSDialog, setShowIOSDialog] = useState(false);

  if (isInstalled || !showBanner) return null;

  return (
    <>
      <div
        className={`flex items-center gap-3 rounded-xl border border-lemon-yellow/40 bg-lemon-yellow/10 px-4 py-3 shadow-sm ${className}`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lemon-yellow/30">
          <Download className="h-5 w-5 text-lemon-dark" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-lemon-dark leading-tight">
            Install Lemon Billing
          </p>
          <p className="text-xs text-lemon-dark/70 leading-tight mt-0.5">
            {showIOSInstructions
              ? 'Tap Share → "Add to Home Screen" to install'
              : "Add to your home screen for quick access"}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {canInstall && (
            <Button
              size="sm"
              variant="default"
              className="h-8 px-3 text-xs bg-lemon-yellow text-lemon-dark hover:bg-lemon-yellow/80 font-semibold"
              onClick={promptToInstall}
            >
              Install
            </Button>
          )}
          {showIOSInstructions && !canInstall && (
            <Button
              size="sm"
              variant="default"
              className="h-8 px-3 text-xs bg-lemon-yellow text-lemon-dark hover:bg-lemon-yellow/80 font-semibold"
              onClick={() => setShowIOSDialog(true)}
            >
              How?
            </Button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="ml-1 rounded-full p-1 text-lemon-dark/50 hover:bg-lemon-dark/10 hover:text-lemon-dark transition-colors"
            aria-label="Dismiss install banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Dialog */}
      {showIOSDialog && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
          onClick={() => setShowIOSDialog(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowIOSDialog(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-lemon-dark mb-4">
              Install on iPhone / iPad
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lemon-yellow text-lemon-dark font-bold text-xs">
                  1
                </span>
                <span>
                  Tap the <Share className="inline h-4 w-4 text-blue-500" />{" "}
                  <strong>Share</strong> button at the bottom of Safari
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lemon-yellow text-lemon-dark font-bold text-xs">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>{" "}
                  <Plus className="inline h-4 w-4" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lemon-yellow text-lemon-dark font-bold text-xs">
                  3
                </span>
                <span>
                  Tap <strong>"Add"</strong> in the top-right corner
                </span>
              </li>
            </ol>
            <Button
              className="mt-5 w-full bg-lemon-yellow text-lemon-dark hover:bg-lemon-yellow/80 font-semibold"
              onClick={() => setShowIOSDialog(false)}
            >
              Got it!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
