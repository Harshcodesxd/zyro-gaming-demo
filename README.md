# Zyro Gaming Club — Production Pitch Demo & Website

Production-ready single-page website for **Zyro Gaming Club**, a walk-in PS5 gaming lounge in Hansi, Haryana, India.

Built with plain HTML5, CSS3, and vanilla JavaScript only (no frameworks, no build step, no npm), optimized for static hosting on Netlify. Mobile-first architecture with lightweight footprint and offline-safe font stacks.

---

## 🎨 Three Selectable Looks (Theme System)

The demo includes three tailored looks built on CSS custom properties on `<html data-theme="neon|volt|warm">`:

1. **Neon (Default)**: Deep midnight purple/navy (`--bg: #07060f`), electric cyan (`#19f0ff`), neon magenta (`#ff3df2`), subtle glow effects on accent text/boxes, Chakra Petch 700 uppercase headings, DM Sans body.
2. **Volt**: Dark graphite/obsidian (`--bg: #0a0b10`), acid lime volt (`#c6ff3d`), clean icy cyan (`#5ac8fa`), glow OFF, Chakra Petch 700 uppercase headings, DM Sans body.
3. **Warm**: Dark warm espresso (`--bg: #0f0d0b`), warm amber (`#e8a24a`), soft cream (`#d6cbbb`), glow OFF, editorial Fraunces 600 serif headings in normal case, DM Sans body.

### How to Preview Themes
- **Via URL**: Visit `/?theme=neon`, `/?theme=volt`, or `/?theme=warm`.
- **Via Demo Picker**: Click the "Pick a look" floating bar in the bottom-left corner. Themes switch instantly without page reload or layout shift.
- **Via LocalStorage**: The chosen theme is automatically remembered across refreshes.

### How to Lock the Theme After Client Selection
Once the client chooses their favorite look:
1. Open `offers.js`.
2. Set `showThemePicker: false` (this completely removes the picker bar from the DOM).
3. Set `lockedTheme: 'neon'` (or `'volt'` or `'warm'`).
```javascript
// offers.js
showThemePicker: false,
lockedTheme: "neon", // or "volt" | "warm"
```

---

## ⚙️ How to Edit `offers.js` (Single Source of Truth)

All dynamic content, pricing, offers, and contact information live in `offers.js`. Never edit HTML or JavaScript for normal business updates.

### 1. Update Regular Rates & Combos
```javascript
regularRates: [
  { label: "30 minutes", price: 70, unit: "per person" },
  { label: "1 hour", price: 130, unit: "per person" },
  { label: "Extra controller", price: 40, unit: "per person", prefix: "+" }
],
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
rateNote: "Play 4 hours and get 50% off."
```

### 2. Update Limited-Time Promotional Offers (e.g., Diwali Offer)
```javascript
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
}
```
*Note: The offer banner and hero stat chip automatically hide from the page when `new Date() > endDate`.*

### 3. Add Opening Hours, Station Count, or Screen Size
These values are set to `null` by default so unconfirmed facts are hidden. When confirmed, simply add the values:
```javascript
openingHours: "11:00 AM – 11:00 PM, Daily", // Row automatically appears in Visit section
stationCount: "6 PS5 Stations",
screenSize: "55\" 4K HDR",
```

### 4. Update Phone Numbers & WhatsApp Messages
```javascript
phones: ["8221939044", "9518402728"],
whatsapp: "918221939044",
defaultMessages: {
  general: "Hi! I'd like to book a slot at Zyro Gaming Club.",
  squad: "Hi! I'd like to book the Squad Combo (4 players, 3 hours) at Zyro Gaming Club.",
  tournament: "Hi! I want to register for the Thursday tournament at Zyro Gaming Club.",
  floating: "Hi, I want to book a slot at Zyro Gaming Club."
}
```

---

## 🖼️ How to Replace Assets

All assets are located in the `/assets/` directory:
- `/assets/Images/`:
  - `hero-poster.webp` / `hero-poster.jpg` (Hero video poster frame)
  - `prices.webp` / `prices.jpg` (Printed rate list card)
  - `food-order-menu.webp` / `food-order-menu.jpg` (Zorko menu photo)
  - `shop-front.webp` (Exterior photo of the lounge)
  - `favicon.svg`, `favicon.png`, `apple-touch-icon.png` (Site icons)
- `/assets/Videos/`:
  - `hero-bg.mp4` & `hero-bg.webm` (Desktop hero video)
  - `hero-bg-mobile.mp4` (Mobile-optimized 720p hero video for `<source media="(max-width: 767px)">`)
  - `people-chilling.mp4` & `people-chilling.webm` (Tournament background atmosphere)

To replace an image:
1. Export as WebP (recommended quality: 80–85%).
2. Save with the exact file name in `/assets/Images/`.
3. Provide width and height attributes in HTML if dimensions change.

---

## 🎬 How to Re-encode Videos with FFmpeg

Videos feature clean audio tracks for users who choose to unmute. By default, videos autoplay muted (browser policy compliant) with an interactive **Mute / Unmute** toggle button on the hero panel.

### Encode Desktop Video (H.264 MP4, CRF 21, AAC Stereo, Faststart)
```bash
ffmpeg -i input_video.mp4 -c:v libx264 -crf 21 -preset fast -c:a aac -b:a 128k -movflags +faststart -y assets/Videos/hero-bg.mp4
```

### Encode WebM (VP9, Opus Audio)
```bash
ffmpeg -i input_video.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good -cpu-used 4 -c:a libopus -b:a 96k -y assets/Videos/hero-bg.webm
```

### Encode 720p Mobile Video (for screens under 768px)
```bash
ffmpeg -i input_video.mp4 -vf "scale=406:720" -c:v libx264 -crf 22 -preset fast -c:a aac -b:a 96k -movflags +faststart -y assets/Videos/hero-bg-mobile.mp4
```

### Extract a Crisp Poster Frame (WebP)
```bash
ffmpeg -ss 00:00:02 -i input_video.mp4 -vframes 1 -q:v 80 -y assets/Images/hero-poster.webp
```

---

## 🚀 How to Deploy to Netlify

This website requires zero build configuration and deploys directly to Netlify:

1. **Option A: Drag and Drop**
   - Log into [Netlify](https://app.netlify.com/).
   - Drag the folder `Zyro gaming hub #2` directly into the "Sites" drop area.
   - Netlify will assign a live URL instantly.

2. **Option B: Git Repository**
   - Push this directory to GitHub / GitLab.
   - In Netlify, click "Add new site" → "Import an existing project".
   - Select the repository.
   - Leave "Build command" empty and set "Publish directory" to `.` (root).
   - Click "Deploy".

3. **Pre-Launch Checklist (Before switching to custom domain)**
   - In `index.html`: Update canonical URL, `og:url`, and `og:image` from `https://zyrogamingtest.netlify.app/` to real domain.
   - In `index.html`: Change `<meta name="robots" content="noindex, nofollow" />` to `<meta name="robots" content="index, follow" />`.
   - In `robots.txt`: Remove `Disallow: /` and set `Allow: /`.

---

## ✅ Quality & Viewport Testing Checklist

### Viewports Tested:
- [x] **320px** — Ultra-compact mobile (no horizontal overflow, stacked hero video first)
- [x] **360px** — Standard Android mobile (Galaxy S8/A-series)
- [x] **390px** — Modern iPhone (iPhone 12/13/14/15)
- [x] **768px** — Tablet portrait (iPad Mini / 768px breakpoint transition)
- [x] **1024px** — Tablet landscape / Small laptop
- [x] **1280px** — Desktop standard
- [x] **1440px** — Desktop large
- [x] **1920px** — 1080p widescreen desktop (max container centered at 1240px)
- [x] **2560px** — 2K / 4K monitors (no scaling distortion or horizontal scroll)

### Unconfirmed Content Status (Safe Placeholders in `offers.js`):
- [ ] **Opening Hours**: Currently `null`. UI row in Visit section is safely hidden until confirmed.
- [ ] **PS5 Station Count**: Currently `null`. Safely omitted from public copy until confirmed.
- [ ] **Screen Size Specs**: Currently `null`. Safely omitted until confirmed.
- [ ] **Google Maps Exact Place Pin**: Default search embed is wired for Bank Colony Main Road; TODO comment in code to update URL once Google Business Profile pin is finalized.
