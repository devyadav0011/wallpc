"use client";

interface AdSlotProps {
  format?: "banner" | "sidebar" | "native";
  className?: string;
}

export function AdSlot({ format = "banner", className = "" }: AdSlotProps) {
  return (
    <div
      className={`relative rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-850 bg-neutral-50/50 dark:bg-[#111116]/30 overflow-hidden flex flex-col items-center justify-center text-center p-4 transition-all ${
        format === "banner"
          ? "w-full max-w-5xl mx-auto min-h-[90px] my-8"
          : format === "sidebar"
          ? "w-full min-h-[250px]"
          : "w-full min-h-[120px]"
      } ${className}`}
      aria-label="Sponsorship Slot"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">
        Sponsored / Partner
      </span>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
        Looking for custom PC hardware &amp; OLED 4K displays? Support WallPC partners.
      </p>
    </div>
  );
}
