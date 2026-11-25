"use client";

let instance = null;
let locks = 0;

export const setLenis = (l) => {
  instance = l;
};
export const getLenis = () => instance;

/** Reference-counted scroll lock for drawers and modals. */
export function lockScroll() {
  locks += 1;
  instance?.stop();
  document.documentElement.style.overflow = "hidden";
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    instance?.start();
    document.documentElement.style.overflow = "";
  }
}
