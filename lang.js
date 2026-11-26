/* Mingxin language switch: EN / RU / AR with RTL handling */
(function () {
  "use strict";

  var I = window.MX_I18N || {};
  var TITLES = I.titles || {};
  var DESCS = I.descs || {};
  var LANGS = ["en", "ru", "ar"];
  var LABEL = { en: "EN", ru: "RU", ar: "AR" };

  var items = [];
  var origTitle = document.title;
  var descMeta = document.querySelector('meta[name="description"]');
  var origDesc = descMeta ? descMeta.getAttribute("content") : null;

  function norm(s) {
    return String(s).replace(/\s+/g, " ").trim();
  }

  function collect() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      var p = n.parentNode;
      if (!p) continue;
      if (p.nodeName === "SCRIPT" || p.nodeName === "STYLE") continue;
      var v = n.nodeValue || "";
      if (!v.trim()) continue;
      items.push({
        node: n,
        orig: v,
        key: norm(v),
        lead: v.match(/^\s*/)[0],
        trail: v.match(/\s*$/)[0]
      });
    }
  }

  function setLang(lang, persist) {
    if (LANGS.indexOf(lang) < 0) lang = "en";
    var dict = lang !== "en" ? I[lang] : null;

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var t = dict ? dict[it.key] : null;
      it.node.nodeValue = t ? it.lead + t + it.trail : it.orig;
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = TITLES[lang] || origTitle;
    if (descMeta) descMeta.setAttribute("content", DESCS[lang] || origDesc);

    var cur = document.getElementById("langCur");
    if (cur) cur.textContent = LABEL[lang];

    var btns = document.querySelectorAll("[data-lang]");
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute("aria-current", btns[j].getAttribute("data-lang") === lang ? "true" : "false");
    }

    if (persist) {
      try { localStorage.setItem("mx_lang", lang); } catch (e) {}
      try {
        var u = new URL(window.location.href);
        if (lang === "en") u.searchParams.delete("lang");
        else u.searchParams.set("lang", lang);
        window.history.replaceState(null, "", u.toString());
      } catch (e) {}
    }
  }

  function initialLang() {
    try {
      var q = new URL(window.location.href).searchParams.get("lang");
      if (q && LANGS.indexOf(q.toLowerCase()) >= 0) return q.toLowerCase();
    } catch (e) {}
    try {
      var s = localStorage.getItem("mx_lang");
      if (s && LANGS.indexOf(s) >= 0) return s;
    } catch (e) {}
    var n = (navigator.language || "en").toLowerCase();
    if (n.indexOf("ru") === 0) return "ru";
    if (n.indexOf("ar") === 0) return "ar";
    return "en";
  }

  function bind() {
    var btns = document.querySelectorAll("[data-lang]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function (e) {
        var lang = this.getAttribute("data-lang");
        setLang(lang, true);
        closeMenu();
        var m = document.getElementById("mmenu");
        if (m) {
          m.classList.remove("open");
          var b = document.getElementById("burger");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
    }

    var btn = document.getElementById("langBtn");
    var menu = document.getElementById("langMenu");
    if (btn && menu) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = menu.hasAttribute("hidden");
        if (open) menu.removeAttribute("hidden");
        else menu.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("click", function (e) {
        if (!menu.hasAttribute("hidden") && !menu.contains(e.target) && e.target !== btn) closeMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
    }
  }

  function closeMenu() {
    var menu = document.getElementById("langMenu");
    var btn = document.getElementById("langBtn");
    if (menu) menu.setAttribute("hidden", "");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  collect();
  bind();
  var start = initialLang();
  if (start !== "en") setLang(start, false);
  else setLang("en", false);
})();
