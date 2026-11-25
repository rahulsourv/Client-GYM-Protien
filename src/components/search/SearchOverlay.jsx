"use client";

import { useCallback } from "react";
import Overlay from "@/components/ui/Overlay";
import { useShop } from "@/store/shop";
import SearchPanel from "./SearchPanel";

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useShop();
  const close = useCallback(() => setSearchOpen(false), [setSearchOpen]);
  return (
    <Overlay
      open={searchOpen}
      onClose={close}
      label="Search"
      side="top"
      className="absolute inset-x-0 top-0 h-[min(88vh,760px)] border-b border-line bg-obsidian"
    >
      <div className="shell mx-auto h-full max-w-[1400px] pt-8 md:pt-12">
        <SearchPanel onNavigate={close} onClose={close} />
      </div>
    </Overlay>
  );
}
