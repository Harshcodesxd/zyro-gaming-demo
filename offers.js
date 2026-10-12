/**
 * offers.js — Zyro Gaming Club
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for dynamic offers, pricing, venue details, and demo settings.
 *
 * UNKNOWN FACTS RULE:
 * Anything unknown is a placeholder with value `null` and its UI is automatically hidden.
 * Do not invent facts.
 *
 * THEME PICKER:
 * Set `showThemePicker: false` when the client picks a final look.
 * Set `lockedTheme: 'neon' | 'volt' | 'warm'` to lock to that theme.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ZyroConfig = {
  // Demo Settings
  showThemePicker: true,     // Renders bottom-left look picker if true; removes from DOM if false
  lockedTheme: null,         // 'neon' | 'volt' | 'warm' | null. If set and showThemePicker is false, locks this theme

  // Regular Rates (per person)
  regularRates: [
    { label: "30 minutes", price: 70, unit: "per person" },
    { label: "1 hour", price: 130, unit: "per person" },
    { label: "Extra controller", price: 40, unit: "per person", prefix: "+" }
  ],

  // Combos
  combos: [
    {
      id: "squad",
      label: "Squad Combo",
      price: 539,
      detail: "4 players, 3 hours, 2 free chips packets"
    },
    {
      id: "duo",
      label: "Duo Offer",
      price: 290,
      detail: "2 players, 2 hours, 2 free chips packets"
    }
  ],

  // Loyalty Note
  rateNote: "Play 4 hours and get 50% off.",

  // Limited-Time Offer (Diwali offer: 8 Oct to 8 Nov)
  // Automatically hidden everywhere across the site after its endDate
  limitedOffer: {
    enabled: true,
    title: "Diwali offer",
    startDate: "2026-10-08",
    endDate: "2026-11-08",
    chipText: "Diwali offer till 8 Nov",
    prices: [
      { label: "30 min", price: 59 },
      { label: "1 hour", price: 99 },
      { label: "2 hours (2 players)", price: 219 }
    ]
  },

  // Tournament
  tournament: {
    day: "Thursday",
    frequencyText: "EVERY THURSDAY",
    games: ["Tekken 8", "FIFA 26"],
    fee: 99,
    heading: "Weekly tournament.",
    body: "Tekken 8 and FIFA 26. Entry ₹99. Bring a friend and take on the room.",
    chipText: "Tournament · Thursdays · ₹99 entry",
    hourIST: 18 // 6:00 PM IST on Thursdays
  },

  // Placeholders / Unconfirmed Venue Specs
  // UI for these is strictly hidden until real values exist
  openingHours: null,        // placeholder: null (e.g. "11:00 AM – 11:00 PM")
  stationCount: null,        // placeholder: null (e.g. 4)
  screenSize: null,          // placeholder: null (e.g. "55 inch 4K")

  // Venue Information
  venue: {
    name: "Zyro Gaming Club",
    address: "Bank Colony Main Road, near Vishal Copy Factory, Hansi, Haryana",
    city: "Hansi",
    state: "Haryana",
    country: "IN",
    pincode: "125033",
    // TODO: Confirm the pin is on Bank Colony Main Road once the client provides the exact place pin
    mapEmbedUrl: "https://www.google.com/maps?q=Zyro+gaming+hub,+Bank+Colony+Main+Road,+Hansi,+Haryana&z=17&output=embed",
    mapPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Zyro+gaming+hub,+Bank+Colony+Main+Road,+Hansi,+Haryana",
    mapDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Zyro+gaming+hub,+Bank+Colony+Main+Road,+Hansi,+Haryana"
  },

  // Contact
  phones: ["8221939044", "9518402728"],
  whatsapp: "918221939044",
  instagram: "https://www.instagram.com/zyrogamingclub",

  // WhatsApp Messages
  defaultMessages: {
    general: "Hi! I'd like to book a slot at Zyro Gaming Club.",
    squad: "Hi! I'd like to book the Squad Combo (4 players, 3 hours) at Zyro Gaming Club.",
    tournament: "Hi! I want to register for the Thursday tournament at Zyro Gaming Club.",
    floating: "Hi, I want to book a slot at Zyro Gaming Club."
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ZyroConfig;
} else {
  window.ZyroConfig = ZyroConfig;
}
