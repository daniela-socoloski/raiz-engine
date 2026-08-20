import type { CenaRaizDesktopApi } from './shared';

declare global {
  interface Window {
    cenaRaizDesktop: CenaRaizDesktopApi;
  }
}

export {};
