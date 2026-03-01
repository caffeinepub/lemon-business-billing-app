import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lemon-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-lemon-yellow border-t-transparent rounded-full animate-spin" />
        <p className="text-lemon-dark font-nunito font-medium text-sm">Loading...</p>
      </div>
    </div>
  );
}
