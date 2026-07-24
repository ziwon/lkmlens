/**
 * Page frame widths and horizontal padding from DESIGN.md 6.1. Kept in one
 * place so every route lines up on the same editorial grid instead of each
 * page inventing its own `max-w-*`.
 */

/** 20 / 28 / 40 / 48px at mobile, tablet, desktop, wide. */
export const framePadding = "px-5 sm:px-7 lg:px-10 xl:px-12";

/** Default application width (1280px). */
export const frame = `mx-auto w-full max-w-7xl ${framePadding}`;

/** Wide thread and data views (1440px). */
export const frameWide = `mx-auto w-full max-w-[1440px] ${framePadding}`;

/** Long-form editorial reading column (760px). */
export const frameRead = `mx-auto w-full max-w-3xl ${framePadding}`;

/** Compact reading column (640px). */
export const frameNarrow = `mx-auto w-full max-w-[640px] ${framePadding}`;
