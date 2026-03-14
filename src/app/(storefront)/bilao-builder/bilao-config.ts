// Bilao size configurations — shared between server and client components
export const BILAO_SIZES = [
  { id: "small", name: "Small", pieces: 30 },
  { id: "medium", name: "Medium", pieces: 60 },
  { id: "large", name: "Large", pieces: 100 },
] as const;

export type BilaoSize = typeof BILAO_SIZES[number];

// Color assignments for piece visualization in the bilao tray
export const PIECE_COLORS = [
  { bg: "bg-brown-200", text: "text-brown-800" },
  { bg: "bg-amber-200", text: "text-amber-800" },
  { bg: "bg-emerald-200", text: "text-emerald-800" },
  { bg: "bg-rose-200", text: "text-rose-800" },
  { bg: "bg-sky-200", text: "text-sky-800" },
  { bg: "bg-violet-200", text: "text-violet-800" },
  { bg: "bg-orange-200", text: "text-orange-800" },
  { bg: "bg-teal-200", text: "text-teal-800" },
] as const;
