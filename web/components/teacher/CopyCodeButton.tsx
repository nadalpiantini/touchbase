"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

