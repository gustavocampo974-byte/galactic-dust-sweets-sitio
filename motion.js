/* Play Motion (JS): activa la biblioteca solo si el navegador lo soporta y el visitante no pidió menos movimiento.
   Atributos: data-reveal="up|down|left|right|scale|fade|mask", data-stagger (en un contenedor: escalona a sus hijos),
   data-split (titular palabra por palabra), data-parallax="0.15", data-count="250" (solo cifras reales),
   data-shrink (cabecera), .pm-progress (barra de lectura), .pm-marquee > .pm-track (se duplica sola). */
(function () {
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var off = html.getAttribute("data-motion") === "ninguna" || /[?&]pm=static\b/.test(location.search);  // ?pm=static: capturas
  if (!("IntersectionObserver" in window) || reduce || off) return;
  html.classList.add("pm-js");

  d.querySelectorAll("[data-stagger]").forEach(function (box) {
    var step = parseFloat(box.getAttribute("data-stagger")) || 0.08;
    Array.prototype.forEach.call(box.children, function (c, i) {
      if (!c.hasAttribute("data-reveal")) c.setAttribute("data-reveal", "up");
      c.style.setProperty("--pm-delay", (i * step).toFixed(2) + "s");
    });
  });
  d.querySelectorAll("[data-split]").forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(d.createTextNode(w)); return; }
            var s = d.createElement("span"); s.className = "pm-w"; s.style.setProperty("--pm-i", i++); s.textContent = w;
            frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("pm-in");
      if (e.target.hasAttribute("data-count")) count(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  var watched = d.querySelectorAll("[data-reveal],[data-split],[data-count]");
  watched.forEach(function (el) { io.observe(el); });

  // respaldo: si el observador no llega a dispararse (algunos navegadores o modos sin pantalla), revela lo que está a la vista
  function sweep() {
    var h = innerHeight;
    watched.forEach(function (el) {
      if (el.classList.contains("pm-in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < h * 0.95 && r.bottom > 0) {
        el.classList.add("pm-in");
        if (el.hasAttribute("data-count")) count(el);
      }
    });
  }
  addEventListener("load", sweep);
  setTimeout(sweep, 1200);

  function count(el) {
    var to = parseFloat(el.getAttribute("data-count")), dec = (String(to).split(".")[1] || "").length, t0 = null;
    if (isNaN(to)) return;
    function f(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  d.querySelectorAll(".pm-marquee > .pm-track").forEach(function (t) { t.innerHTML += t.innerHTML; });

  var par = d.querySelectorAll("[data-parallax]"), prog = d.querySelector(".pm-progress"), ticking = false;
  function onScroll() {
    var y = window.scrollY, h = innerHeight;
    html.classList.toggle("pm-scrolled", y > 40);
    par.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) return;
      var k = parseFloat(el.getAttribute("data-parallax")) || 0.15;
      el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - h / 2) * -k).toFixed(1) + "px,0)";
    });
    sweep();
    if (prog) {
      var max = d.documentElement.scrollHeight - h;
      prog.style.setProperty("--pm-p", max > 0 ? (y / max).toFixed(4) : 0);
    }
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
