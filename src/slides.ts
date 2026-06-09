import type { SlideData, BgType, FormatId, FontId, SurfaceId, AccentId, PurposeId } from "./lib/types";

export const SLIDES: SlideData[] = [
  {
    type: "hook",
    text: "Fired my $2,000\nvirtual assistant.\nReplaced with\n$27 of AI.",
    highlight: "$27",
    highlightStyle: "italic-box",
  },
  {
    type: "body",
    title: "1. MORNING BRIEFINGS",
    text: 'Set a cron in\nplain English.\n\n"Every 8am send\nAI news to Telegram."\n\nIt runs forever.',
    highlight: "runs forever",
  },
  {
    type: "body",
    title: "2. INBOX TRIAGE",
    text: 'Reads my email.\nDrafts replies.\nWaits for tap to send.\n\nNo more inbox dread.',
    highlight: "tap to send",
  },
  {
    type: "body",
    title: "3. RESEARCH AT NIGHT",
    text: 'Spawns 3 sub-agents.\nEach works alone.\n\nWake up to a brief.\nNot a to-do list.',
    highlight: "Wake up",
  },
  {
    type: "body",
    title: "4. SELF-IMPROVING",
    text: 'Writes its own\nplaybooks from work.\n\n40% faster\nevery week.\nCompounds forever.',
    highlight: "40% faster",
  },
  {
    type: "body",
    title: "5. TEXTS ME RESULTS",
    text: 'Telegram. Discord.\nSlack. WhatsApp.\nSignal. 27 platforms.\n\nApprove from phone.',
    highlight: "Approve from phone",
  },
  {
    type: "cta",
    text: "It is Hermes Agent.\nBy Nous Research.\n\nFree. Open source.\nRuns on $5 VPS.\n\nFollow for more ↓",
    highlight: "Hermes Agent",
    highlightStyle: "italic-box",
    handle: "@quad_star",
  },
];

export const DEFAULT_FONT: FontId = "minimal";
export const DEFAULT_SURFACE: SurfaceId = "pastel";
export const DEFAULT_ACCENT: AccentId = "violet";
export const DEFAULT_PURPOSE: PurposeId = "carousel";
export const DEFAULT_BG: BgType = "blobs";
export const DEFAULT_FORMAT: FormatId = "tiktok-9x16";
