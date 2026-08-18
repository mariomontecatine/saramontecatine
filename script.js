/* =========================================================
   Sara Montecatine · Psicología
   Menú lateral, desplazamiento lento, apariciones y parallax.
   Sin dependencias.
   ========================================================= */

(function () {
  "use strict";

  var menosMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var ratonFino = window.matchMedia("(pointer: fine)").matches;

  /* El desplazamiento lento solo con ratón y si no se ha pedido menos
     movimiento. En táctil el desplazamiento nativo ya es bueno y engancharlo
     suele salir peor. */
  var suaveActivo = ratonFino && !menosMovimiento;

  var html = document.documentElement;
  var btnMenu = document.getElementById("btn-menu");
  var menu = document.getElementById("menu");
  var velo = document.getElementById("velo");
  var marca = document.getElementById("marca");
  var enlacesMenu = Array.prototype.slice.call(
    menu.querySelectorAll("a[href^='#']"),
  );
  var secciones = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]"),
  );
  var conParallax = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax]"),
  );

  var menuAbierto = false;

  /* ---------------------------------------------------------
     Desplazamiento lento
     Movemos el scroll real de la ventana (no un transform), así que
     position: sticky y los anclajes siguen funcionando igual.
     --------------------------------------------------------- */

  var FACTOR = 0.075; /* cuanto más bajo, más lento y largo el frenado */
  var objetivo = window.scrollY;
  var actual = objetivo;
  var animando = false;
  var animId = 0;

  function limite() {
    return Math.max(
      0,
      html.scrollHeight - window.innerHeight,
    );
  }

  function limitar(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  if (suaveActivo) {
    /* Con scroll-behavior: smooth el scrollTo de cada fotograma se pelearía
       con el nuestro. Lo apagamos y lo hacemos a mano. */
    html.style.scrollBehavior = "auto";
    window.addEventListener("wheel", alRueda, { passive: false });
    window.addEventListener("keydown", alTeclado);
  }

  function alRueda(e) {
    if (menuAbierto) {
      e.preventDefault();
      return;
    }
    if (e.ctrlKey) return; /* zoom del navegador */

    e.preventDefault();

    var delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 18; /* líneas */
    else if (e.deltaMode === 2) delta *= window.innerHeight; /* páginas */

    objetivo = limitar(objetivo + delta, 0, limite());
    arrancar();
  }

  function alTeclado(e) {
    if (menuAbierto) return;

    var t = e.target;
    if (t && t !== document.body && t !== html) return; /* algo con foco */

    var alto = window.innerHeight;
    var salto = null;

    if (e.key === "ArrowDown") salto = 110;
    else if (e.key === "ArrowUp") salto = -110;
    else if (e.key === "PageDown" || e.key === " ") salto = alto * 0.85;
    else if (e.key === "PageUp") salto = -alto * 0.85;
    else if (e.key === "Home") salto = -limite();
    else if (e.key === "End") salto = limite();
    if (salto === null) return;

    e.preventDefault();
    objetivo = limitar(objetivo + salto, 0, limite());
    arrancar();
  }

  function arrancar() {
    if (animando) return;
    animando = true;
    animId++;
    var mio = animId;

    (function tic() {
      if (mio !== animId) return;

      var d = objetivo - actual;
      if (Math.abs(d) < 0.4) {
        actual = objetivo;
        window.scrollTo(0, actual);
        animando = false;
        pintar();
        return;
      }
      actual += d * FACTOR;
      window.scrollTo(0, actual);
      pintar();
      requestAnimationFrame(tic);
    })();
  }

  /* Ir a una sección con una curva suave y algo larga. */
  function irA(destino, duracion) {
    destino = limitar(destino, 0, limite());

    if (menosMovimiento) {
      window.scrollTo(0, destino);
      objetivo = actual = destino;
      return;
    }

    duracion = duracion || 1300;
    animId++;
    var mio = animId;
    animando = true;

    var inicio = window.scrollY;
    var dist = destino - inicio;
    var t0 = performance.now();

    (function paso(t) {
      if (mio !== animId) return;

      var p = Math.min((t - t0) / duracion, 1);
      /* easeInOutCubic: sale y entra despacio */
      var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      var y = inicio + dist * e;

      window.scrollTo(0, y);
      actual = objetivo = y;
      pintar();

      if (p < 1) requestAnimationFrame(paso);
      else animando = false;
    })(t0);
  }

  /* Si el scroll se mueve por fuera (barra, táctil, buscar en página),
     nos ponemos a la par para no dar tirones al volver a la rueda. */
  window.addEventListener(
    "scroll",
    function () {
      if (!animando) {
        actual = objetivo = window.scrollY;
      }
      pedirPintado();
    },
    { passive: true },
  );

  window.addEventListener("resize", function () {
    actual = objetivo = window.scrollY;
  });

  /* ---------------------------------------------------------
     Menú lateral
     --------------------------------------------------------- */

  function abrirMenu() {
    menuAbierto = true;
    menu.classList.add("abierto");
    velo.classList.add("abierto");
    html.classList.add("sin-scroll");
    btnMenu.setAttribute("aria-expanded", "true");
    btnMenu.setAttribute("aria-label", "Cerrar menú");
    if (enlacesMenu[0]) enlacesMenu[0].focus({ preventScroll: true });
  }

  function cerrarMenu(devolverFoco) {
    menuAbierto = false;
    menu.classList.remove("abierto");
    velo.classList.remove("abierto");
    html.classList.remove("sin-scroll");
    btnMenu.setAttribute("aria-expanded", "false");
    btnMenu.setAttribute("aria-label", "Abrir menú");
    if (devolverFoco) btnMenu.focus({ preventScroll: true });
  }

  btnMenu.addEventListener("click", function () {
    if (menuAbierto) cerrarMenu(true);
    else abrirMenu();
  });

  velo.addEventListener("click", function () {
    cerrarMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuAbierto) cerrarMenu(true);
  });

  /* Todos los anclajes de la página, dentro y fuera del menú. */
  Array.prototype.forEach.call(
    document.querySelectorAll("a[href^='#']"),
    function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id === "#") return;
        var destino = document.querySelector(id);
        if (!destino) return;

        e.preventDefault();
        if (menuAbierto) cerrarMenu(false);

        irA(destino.getBoundingClientRect().top + window.scrollY);
        history.replaceState(null, "", id);
      });
    },
  );

  /* ---------------------------------------------------------
     Apariciones al entrar en pantalla
     --------------------------------------------------------- */

  var aparecen = document.querySelectorAll(".reveal");

  if (menosMovimiento || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(aparecen, function (el) {
      el.classList.add("visible");
    });
  } else {
    var obsAparecer = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            obsAparecer.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    Array.prototype.forEach.call(aparecen, function (el) {
      obsAparecer.observe(el);
    });
  }

  /* ---------------------------------------------------------
     Sección activa en el menú
     --------------------------------------------------------- */

  if ("IntersectionObserver" in window) {
    var obsSeccion = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = "#" + en.target.id;
          enlacesMenu.forEach(function (a) {
            a.classList.toggle("activo", a.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    secciones.forEach(function (s) {
      obsSeccion.observe(s);
    });
  }

  /* ---------------------------------------------------------
     Parallax y marca fija
     --------------------------------------------------------- */

  var pintadoPedido = false;

  function pedirPintado() {
    if (pintadoPedido) return;
    pintadoPedido = true;
    requestAnimationFrame(function () {
      pintadoPedido = false;
      pintar();
    });
  }

  function pintar() {
    if (!menosMovimiento) {
      var alto = window.innerHeight;
      conParallax.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -alto || r.top > alto * 2) return; /* fuera de vista */
        var centro = (r.top + r.height / 2 - alto / 2) / alto; /* ~ -1 .. 1 */
        var f = parseFloat(el.getAttribute("data-parallax")) || 0;
        el.style.transform =
          "translate3d(0," + (centro * f * 300).toFixed(2) + "px,0)";
      });
    }

    if (marca) {
      marca.classList.toggle("visible", window.scrollY > window.innerHeight * 0.7);
    }
  }

  pintar();
})();
