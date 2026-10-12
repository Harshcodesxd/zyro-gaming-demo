/**
 * script.js — Zyro Gaming Club
 * ─────────────────────────────────────────────────────────────────────────────
 * Vanilla JavaScript runtime controller.
 * Zero external libraries, zero build steps.
 * Handles:
 *  1. Three-theme system (Neon, Volt, Warm) + URL/localStorage + demo picker bar
 *  2. Reading ZyroConfig from offers.js (single source of truth)
 *  3. Dynamic rendering & auto-expiry for limited-time offer banner & chip
 *  4. Live Thursday tournament countdown in Asia/Kolkata (IST)
 *  5. Dynamic WhatsApp booking links with contextual message templates
 *  6. Sticky header transition after 60px of scroll
 *  7. Video lifecycle (pause off-screen, poster-only under Save-Data / reduced-motion)
 *  8. Map tap-to-activate (no touch scroll trap)
 *  9. Animated floating WhatsApp button with timed tooltip (session-scoped)
 * 10. IntersectionObserver scroll reveals with 80ms sibling stagger
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  /* ── Initialize on DOM ready ────────────────────────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

  function initApp() {
    var cfg = window.ZyroConfig || {};

    initThemeSystem(cfg);
    renderRatesAndCombos(cfg);
    renderOfferBannerAndChip(cfg);
    wireContactAndMap(cfg);
    wireTournament(cfg);
    initTournamentCountdown(cfg);
    initStickyHeader();
    initMobileNav();
    initVideoController();
    initMapTapBehavior();
    initFloatingWhatsApp(cfg);
    initScrollReveals();
    initSmoothScroll();
    initFooterYear();
  }

  /* ── 1. THEME SYSTEM ──────────────────────────────────────────────────────
     Themes: 'neon' (default), 'volt', 'warm'.
     Selected via: URL query (?theme=volt) -> localStorage -> 'neon'.
     Switching does not reload the page and causes no layout shift.
     Theme picker bar removed from DOM if cfg.showThemePicker is false.
     ────────────────────────────────────────────────────────────────────────── */

  function initThemeSystem(cfg) {
    var validThemes = ["neon", "volt", "warm"];
    var pickerBar   = document.getElementById("theme-picker-bar");

    // 1. Determine active theme
    var activeTheme = "neon";

    // If a theme is locked in config and picker is disabled
    if (cfg.showThemePicker === false && cfg.lockedTheme && validThemes.indexOf(cfg.lockedTheme) !== -1) {
      activeTheme = cfg.lockedTheme;
    } else {
      // Check URL search params (?theme=...)
      var urlParams = new URLSearchParams(window.location.search);
      var queryTheme = urlParams.get("theme");

      if (queryTheme && validThemes.indexOf(queryTheme.toLowerCase()) !== -1) {
        activeTheme = queryTheme.toLowerCase();
      } else {
        // Check localStorage
        try {
          var stored = localStorage.getItem("zyro_theme");
          if (stored && validThemes.indexOf(stored) !== -1) {
            activeTheme = stored;
          }
        } catch (e) {
          // localStorage inaccessible (private mode fallback)
        }
      }
    }

    // 2. Apply theme to <html>
    applyTheme(activeTheme);

    // 3. Handle Demo Theme Picker Bar
    if (cfg.showThemePicker === false) {
      if (pickerBar && pickerBar.parentNode) {
        pickerBar.parentNode.removeChild(pickerBar);
      }
    } else if (pickerBar) {
      var buttons = pickerBar.querySelectorAll(".theme-btn");
      updatePickerButtons(buttons, activeTheme);

      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var chosen = this.getAttribute("data-set-theme");
          if (chosen && validThemes.indexOf(chosen) !== -1) {
            applyTheme(chosen);
            updatePickerButtons(buttons, chosen);
            try {
              localStorage.setItem("zyro_theme", chosen);
            } catch (e) {}
          }
        });
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    // Update <meta name="theme-color">
    var metaTheme = document.getElementById("meta-theme-color");
    if (metaTheme) {
      var colors = { neon: "#07060f", volt: "#0a0b10", warm: "#0f0d0b" };
      metaTheme.setAttribute("content", colors[theme] || "#07060f");
    }
  }

  function updatePickerButtons(buttons, currentTheme) {
    buttons.forEach(function (btn) {
      var matches = btn.getAttribute("data-set-theme") === currentTheme;
      btn.classList.toggle("is-active", matches);
      btn.setAttribute("aria-pressed", matches ? "true" : "false");
    });
  }

  /* ── 2. WHATSAPP LINK GENERATOR ─────────────────────────────────────────── */

  function makeWaLink(number, message) {
    var cleanNum = String(number).replace(/[^0-9]/g, "");
    return "https://wa.me/" + cleanNum + "?text=" + encodeURIComponent(message);
  }

  /* ── 3. RATES & COMBOS RENDERING ────────────────────────────────────────── */

  function renderRatesAndCombos(cfg) {
    var ratesList = document.getElementById("rates-list");
    if (!ratesList || !cfg.regularRates) return;

    ratesList.innerHTML = "";

    // Regular rates
    cfg.regularRates.forEach(function (rate) {
      var li = document.createElement("li");
      li.className = "rate-row";
      var prefix = rate.prefix || "";
      li.innerHTML =
        '<div class="rate-info">' +
          '<span class="rate-title">' + escapeHtml(rate.label) + '</span>' +
          '<span class="rate-detail">' + escapeHtml(rate.unit || "per person") + '</span>' +
        '</div>' +
        '<span class="rate-price">' + prefix + '&#8377;' + rate.price + '</span>';
      ratesList.appendChild(li);
    });

    // Combo deals
    if (cfg.combos && cfg.combos.length > 0) {
      var waNumber = cfg.whatsapp || "918221939044";
      var squadMsg = (cfg.defaultMessages && cfg.defaultMessages.squad) ||
        "Hi! I'd like to book the Squad Combo at Zyro Gaming Club.";

      cfg.combos.forEach(function (combo) {
        var li = document.createElement("li");
        li.className = "rate-row";

        var actionHtml = "";
        if (combo.id === "squad") {
          actionHtml =
            '<div style="margin-top: 8px;">' +
              '<a href="' + makeWaLink(waNumber, squadMsg) + '" class="btn btn--outline btn--sm js-wa-squad" aria-label="Book Squad Combo on WhatsApp">' +
                'Book Squad of 4' +
              '</a>' +
            '</div>';
        }

        li.innerHTML =
          '<div class="rate-info">' +
            '<span class="rate-title">' + escapeHtml(combo.label) + '</span>' +
            '<span class="rate-detail">' + escapeHtml(combo.detail) + '</span>' +
            actionHtml +
          '</div>' +
          '<span class="rate-price rate-price--accent">&#8377;' + combo.price + '</span>';
        ratesList.appendChild(li);
      });
    }

    // Stat Chip 2: "From ₹70 / 30 min"
    var chipRates = document.querySelector(".js-chip-rates");
    if (chipRates && cfg.regularRates && cfg.regularRates[0]) {
      chipRates.textContent = "From \u20B9" + cfg.regularRates[0].price + " / " + cfg.regularRates[0].label;
    }
  }

  /* ── 4. LIMITED-TIME OFFER BANNER & CHIP (Auto-hiding outside date range) ── */

  function renderOfferBannerAndChip(cfg) {
    var banner = document.getElementById("offer-banner");
    var chip   = document.getElementById("hero-offer-chip");
    var offer  = cfg.limitedOffer;

    if (!offer || !offer.enabled) {
      if (banner) banner.hidden = true;
      if (chip) chip.hidden = true;
      return;
    }

    // Check promotional date validity
    var now   = new Date();
    var start = new Date(offer.startDate + "T00:00:00");
    var end   = new Date(offer.endDate   + "T23:59:59");

    if (now < start || now > end) {
      if (banner) banner.hidden = true;
      if (chip) chip.hidden = true;
      return;
    }

    // Valid offer: display both
    if (chip) {
      chip.textContent = offer.chipText || (offer.title + " active");
      chip.hidden = false;
    }

    if (banner) {
      banner.hidden = false;
      var titleEl = banner.querySelector(".offer-banner__title");
      if (titleEl) titleEl.textContent = offer.title;

      var pillsWrap = banner.querySelector(".offer-banner__pills");
      if (pillsWrap && offer.prices) {
        pillsWrap.innerHTML = "";
        offer.prices.forEach(function (p) {
          var item = document.createElement("div");
          item.className = "offer-pill";
          item.innerHTML =
            '<span class="offer-pill__label">' + escapeHtml(p.label) + '</span>' +
            '<span class="offer-pill__price">&#8377;' + p.price + '</span>';
          pillsWrap.appendChild(item);
        });
      }
    }
  }

  /* ── 5. CONTACT & MAP WIRING ────────────────────────────────────────────── */

  function wireContactAndMap(cfg) {
    var waNumber = cfg.whatsapp || "918221939044";
    var msgs     = cfg.defaultMessages || {};

    // Wire WhatsApp buttons
    var generalLink = makeWaLink(waNumber, msgs.general || "Hi! I'd like to book a slot at Zyro Gaming Club.");
    document.querySelectorAll(".js-wa-general").forEach(function (el) {
      el.href = generalLink;
    });

    // Wire Instagram
    if (cfg.instagram) {
      document.querySelectorAll(".js-instagram").forEach(function (el) {
        el.href = cfg.instagram;
      });
    }

    // Wire Phones
    if (cfg.phones && cfg.phones.length > 0) {
      var phone1 = document.querySelector(".js-phone-1");
      var phone2 = document.querySelector(".js-phone-2");
      if (phone1 && cfg.phones[0]) {
        phone1.href = "tel:" + cfg.phones[0];
      }
      if (phone2 && cfg.phones[1]) {
        phone2.href = "tel:" + cfg.phones[1];
      }
    }

    // Opening Hours (hidden if null or placeholder)
    var hoursRow = document.getElementById("visit-hours-row");
    var hoursVal = document.getElementById("visit-hours-val");
    if (hoursRow && hoursVal) {
      if (!cfg.openingHours || cfg.openingHours === "[OPENING HOURS]") {
        hoursRow.hidden = true;
      } else {
        hoursRow.hidden = false;
        hoursVal.textContent = cfg.openingHours;
      }
    }

    // Map links
    if (cfg.venue) {
      if (cfg.venue.mapEmbedUrl) {
        var iframe = document.querySelector(".map-iframe");
        if (iframe) iframe.src = cfg.venue.mapEmbedUrl;
      }
      if (cfg.venue.mapPlaceUrl) {
        var openBtn = document.querySelector(".js-map-open");
        if (openBtn) openBtn.href = cfg.venue.mapPlaceUrl;
      }
      if (cfg.venue.mapDirectionsUrl) {
        var dirBtn = document.querySelector(".js-map-directions");
        if (dirBtn) dirBtn.href = cfg.venue.mapDirectionsUrl;
      }
    }
  }

  /* ── 6. TOURNAMENT DETAILS & LIVE COUNTDOWN (Asia/Kolkata IST) ──────────── */

  function wireTournament(cfg) {
    var waNumber = cfg.whatsapp || "918221939044";
    var tournMsg = (cfg.defaultMessages && cfg.defaultMessages.tournament) ||
      "Hi! I want to register for the Thursday tournament at Zyro Gaming Club.";
    var regBtn = document.querySelector(".js-wa-tournament");
    if (regBtn) regBtn.href = makeWaLink(waNumber, tournMsg);

    var tournChip = document.querySelector(".js-chip-tournament");
    if (tournChip && cfg.tournament && cfg.tournament.chipText) {
      tournChip.textContent = cfg.tournament.chipText;
    }
  }

  function initTournamentCountdown(cfg) {
    var cdEl = document.getElementById("tournament-countdown");
    if (!cdEl) return;

    var targetHour = (cfg.tournament && cfg.tournament.hourIST) || 18; // 6:00 PM IST

    function update() {
      var now = new Date();
      // Convert to IST (UTC + 5:30)
      var utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      var istNow  = new Date(utcTime + (5.5 * 3600000));

      var currentDay = istNow.getDay(); // 0 = Sun, 4 = Thu
      var daysUntilThu = (4 - currentDay + 7) % 7;

      var target = new Date(istNow);
      target.setDate(istNow.getDate() + daysUntilThu);
      target.setHours(targetHour, 0, 0, 0);

      // If today is Thursday and past start time, target next Thursday
      if (daysUntilThu === 0 && istNow.getTime() >= target.getTime()) {
        target.setDate(target.getDate() + 7);
      }

      var diffMs = target.getTime() - istNow.getTime();
      if (diffMs < 0) diffMs = 0;

      var days  = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var mins  = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      var text = "";
      if (days > 0) {
        text = days + (days === 1 ? " day " : " days ") + hours + "h " + mins + "m";
      } else {
        text = hours + "h " + mins + "m";
      }

      cdEl.textContent = text;
    }

    update();
    setInterval(update, 60000); // Re-calculate every minute
  }

  /* ── 7. STICKY HEADER (Solid blurred bar after 60px of scroll) ──────────── */

  function initStickyHeader() {
    var header = document.getElementById("site-header");
    if (!header) return;

    var isScrolled = false;
    function onScroll() {
      if (window.scrollY > 60) {
        if (!isScrolled) {
          header.classList.add("is-scrolled");
          isScrolled = true;
        }
      } else {
        if (isScrolled) {
          header.classList.remove("is-scrolled");
          isScrolled = false;
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── 8. MOBILE NAVIGATION DRAWER ────────────────────────────────────────── */

  function initMobileNav() {
    var toggle  = document.getElementById("nav-toggle");
    var navMenu = document.getElementById("nav-menu");
    var overlay = document.getElementById("nav-overlay");
    if (!toggle || !navMenu) return;

    function openMenu() {
      navMenu.classList.add("is-open");
      navMenu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      if (overlay) overlay.hidden = false;
    }

    function closeMenu() {
      navMenu.classList.remove("is-open");
      navMenu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (overlay) overlay.hidden = true;
    }

    toggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.contains("is-open");
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    if (overlay) overlay.addEventListener("click", closeMenu);

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ── 9. VIDEO CONTROLLER (Mute/Unmute, Off-screen pause, Save-Data & Reduced-Motion) ─── */

  function initVideoController() {
    var heroVideo = document.getElementById("hero-video");
    var muteBtn   = document.getElementById("hero-mute-toggle");
    if (!heroVideo) return;

    // Wire Mute / Unmute Button
    if (muteBtn) {
      function syncMuteState() {
        var isMuted = heroVideo.muted;
        muteBtn.classList.toggle("is-unmuted", !isMuted);
        muteBtn.setAttribute("aria-pressed", (!isMuted).toString());
        muteBtn.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
        muteBtn.setAttribute("title", isMuted ? "Unmute video" : "Mute video");
        var labelEl = muteBtn.querySelector(".sound-label");
        if (labelEl) labelEl.textContent = isMuted ? "Unmute" : "Mute";
      }

      muteBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (heroVideo.muted) {
          heroVideo.muted = false;
          heroVideo.volume = 1.0;
          heroVideo.play().catch(function () {});
        } else {
          heroVideo.muted = true;
        }
        syncMuteState();
      });

      syncMuteState();
    }

    // Detect conditions requiring poster-only
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var isSaveData = conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");

    if (prefersReduced || isSaveData) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
      if (muteBtn) muteBtn.style.display = "none";
      // Keep poster displayed, do not load heavy video streams
      return;
    }

    // Pause video when scrolled out of viewport to save battery & GPU
    if ("IntersectionObserver" in window) {
      var videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            heroVideo.play().catch(function () {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.15 });

      videoObserver.observe(heroVideo);
    }
  }

  /* ── 10. MAP TAP-TO-ACTIVATE (Prevent Touch Scroll Trap) ─────────────────── */

  function initMapTapBehavior() {
    var wrapper = document.getElementById("map-wrapper");
    var prompt  = document.getElementById("map-prompt");
    if (!wrapper || !prompt) return;

    function activateMap() {
      wrapper.classList.add("is-active");
    }

    prompt.addEventListener("click", activateMap);
    prompt.addEventListener("touchend", activateMap);

    // Deactivate map on clicks outside
    document.addEventListener("click", function (e) {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove("is-active");
      }
    });
  }

  /* ── 11. FLOATING WHATSAPP BUTTON (Entrance, Pulse, Timed Tooltip) ──────── */

  function initFloatingWhatsApp(cfg) {
    var btn = document.querySelector(".floating-wa");
    if (!btn) return;

    var waNum = cfg.whatsapp || "918221939044";
    var msg   = (cfg.defaultMessages && cfg.defaultMessages.floating) ||
      "Hi, I want to book a slot at Zyro Gaming Club.";
    btn.href = makeWaLink(waNum, msg);

    // Entrance fade & scale after 1 second
    setTimeout(function () {
      btn.classList.add("is-ready");
    }, 1000);

    // Show tooltip after 4s for 5s, once per session (sessionStorage)
    try {
      if (!sessionStorage.getItem("zyro_wa_tooltip_shown")) {
        sessionStorage.setItem("zyro_wa_tooltip_shown", "1");
        setTimeout(function () {
          btn.classList.add("has-tooltip-visible");
          setTimeout(function () {
            btn.classList.remove("has-tooltip-visible");
          }, 5000);
        }, 4000);
      }
    } catch (e) {}
  }

  /* ── 12. SCROLL REVEALS (IntersectionObserver, 80ms Stagger) ────────────── */

  function initScrollReveals() {
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var revealElements = document.querySelectorAll("[data-reveal]");

    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealElements.forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var parent = el.parentElement;
          if (parent) {
            var siblings = Array.from(parent.children).filter(function (child) {
              return child.hasAttribute("data-reveal");
            });
            var idx = siblings.indexOf(el);
            if (idx > 0) {
              el.style.transitionDelay = (idx * 80) + "ms";
            }
          }
          el.classList.add("is-revealed");
          obs.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.1 });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── 13. SMOOTH SCROLL (Respects Reduced Motion) ─────────────────────────── */

  function initSmoothScroll() {
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start"
        });

        // Retain focus for accessibility
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ── 14. FOOTER YEAR ────────────────────────────────────────────────────── */

  function initFooterYear() {
    var yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ── Utilities ──────────────────────────────────────────────────────────── */

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

})();
