"use client";

import { lazy, Suspense } from "react";

const AIAssistant = lazy(() => import('./AIAssistant'));

export default function AIAssistantWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-4 text-gray-500">Loading AI Assistant...</div>}>
      <AIAssistant />
    </Suspense>
  );
}

