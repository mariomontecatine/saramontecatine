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

  /* Marca de progresión mejorada: sin esto, el escenario de pasos fijado
     de "Cómo trabajo" se queda en su versión base accesible (sin pin ni
     animación), tanto sin JS como con "menos movimiento" activado. */
  html.classList.add("js-activo");
  if (menosMovimiento) html.classList.add("motion-reducido");

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

  var escenarioPasos = document.getElementById("escenario-pasos");
  var escenarioPin = escenarioPasos
    ? escenarioPasos.querySelector(".escenario-pin")
    : null;
  var pasosPin = escenarioPasos
    ? Array.prototype.slice.call(escenarioPasos.querySelectorAll(".paso-pin"))
    : [];
  var indicadoresPaso = escenarioPasos
    ? Array.prototype.slice.call(
        escenarioPasos.querySelectorAll(".pasos-indicador span"),
      )
    : [];

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

    /* Si veníamos de un asentado, mandan las manos del usuario. */
    if (enAjuste) {
      cancelarAjuste();
      objetivo = actual = window.scrollY;
    }

    var delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 18; /* líneas */
    else if (e.deltaMode === 2) delta *= window.innerHeight; /* páginas */

    objetivo = limitar(objetivo + delta, 0, limite());
    arrancar();
    programarAjuste();
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
    if (enAjuste) {
      cancelarAjuste();
      objetivo = actual = window.scrollY;
    }
    objetivo = limitar(objetivo + salto, 0, limite());
    arrancar();
    programarAjuste();
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
        programarAjuste();
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
      enAjuste = false;
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
      else {
        animando = false;
        enAjuste = false;
      }
    })(t0);
  }

  /* Si el scroll se mueve por fuera (barra, táctil, buscar en página),
     nos ponemos a la par para no dar tirones al volver a la rueda. */
  window.addEventListener(
    "scroll",
    function () {
      if (!animando) {
        actual = objetivo = window.scrollY;
        /* Desplazamiento ajeno al motor (táctil, barra, rueda del sistema):
           también merece asentarse al parar. */
        programarAjuste();
      }
      pedirPintado();
    },
    { passive: true },
  );

  /* Un dedo en la pantalla manda sobre cualquier asentado en curso. */
  window.addEventListener(
    "touchstart",
    function () {
      cancelarAjuste();
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
        cancelarAjuste();

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
     Escenario de pasos fijado ("Cómo trabajo")
     La sección tiene más altura de la que ocupa en pantalla (ver CSS,
     .escenario-pasos), y su interior queda fijo (position: sticky)
     mientras se recorre esa altura extra. Repartimos ese recorrido en
     tres tramos iguales, uno por paso, y animamos la entrada/salida
     por CSS según qué paso esté activo.
     --------------------------------------------------------- */

  /* Fronteras entre pasos, en tanto por uno del recorrido. La última deja
     una cola corta: el 03 se lee y enseguida se suelta la sección, en vez
     de quedarse fijada un tramo largo sin que pase nada. */
  var CORTES = [0.36, 0.72];

  /* Margen muerto alrededor de cada frontera. Sin él basta un temblor del
     ratón justo en el límite para saltar de paso, o para ir y volver. */
  var HISTERESIS = 0.04;

  /* Centro de la meseta de cada paso: es donde se imanta el scroll. */
  var ANCLAS = (function () {
    var bordes = [0].concat(CORTES, [1]);
    var centros = [];
    for (var i = 0; i < bordes.length - 1; i++) {
      centros.push((bordes[i] + bordes[i + 1]) / 2);
    }
    return centros;
  })();

  var indicePaso = 0;

  function recorridoEscenario() {
    return escenarioPasos.offsetHeight - window.innerHeight;
  }

  function progresoEscenario() {
    return limitar(
      -escenarioPasos.getBoundingClientRect().top / recorridoEscenario(),
      0,
      1,
    );
  }

  /* ¿Está el escenario fijado ahora mismo? En móvil apaisado, con "menos
     movimiento" o sin soporte, el CSS lo deja como lista corrida y aquí
     no debemos tocar nada. */
  function escenarioFijado() {
    if (!escenarioPin || menosMovimiento) return false;
    if (getComputedStyle(escenarioPin).position !== "sticky") return false;
    var r = escenarioPasos.getBoundingClientRect();
    return r.top <= 0 && r.bottom >= window.innerHeight;
  }

  function actualizarPasos() {
    if (!escenarioPasos || !pasosPin.length || menosMovimiento) return;
    if (recorridoEscenario() <= 0) return;

    var progreso = progresoEscenario();
    var ultimo = pasosPin.length - 1;

    /* Avanzamos o retrocedemos desde el paso actual, no desde cero: así el
       margen muerto se aplica al sentido en el que se está moviendo. */
    while (
      indicePaso < ultimo &&
      progreso > CORTES[indicePaso] + HISTERESIS
    ) {
      indicePaso++;
    }
    while (indicePaso > 0 && progreso < CORTES[indicePaso - 1] - HISTERESIS) {
      indicePaso--;
    }

    pasosPin.forEach(function (el, i) {
      el.classList.toggle("activo", i === indicePaso);
      el.classList.toggle("salido", i < indicePaso);
      el.setAttribute("aria-hidden", i === indicePaso ? "false" : "true");
    });
    indicadoresPaso.forEach(function (el, i) {
      el.classList.toggle("activo", i === indicePaso);
    });
  }

  /* ---------------------------------------------------------
     Imantado de los pasos
     Al dejar de desplazarse dentro del escenario, el scroll se asienta en
     el centro de la meseta del paso más cercano. Así un movimiento corto
     vuelve al sitio (el paso se queda quieto e invita a leerlo) y solo uno
     decidido pasa al siguiente, que a su vez queda centrado.
     --------------------------------------------------------- */

  var TIEMPO_REPOSO = 200; /* ms parado antes de asentar */
  var relojAjuste = null;
  var enAjuste = false;

  function cancelarAjuste() {
    clearTimeout(relojAjuste);
    if (enAjuste) {
      animId++; /* corta la animación en curso */
      animando = false;
      enAjuste = false;
    }
  }

  function programarAjuste() {
    if (menosMovimiento || !escenarioPasos || !pasosPin.length) return;
    clearTimeout(relojAjuste);
    relojAjuste = setTimeout(asentarEnPaso, TIEMPO_REPOSO);
  }

  function asentarEnPaso() {
    if (menuAbierto || animando || !escenarioFijado()) return;

    var recorrido = recorridoEscenario();
    if (recorrido <= 0) return;

    var inicio = escenarioPasos.getBoundingClientRect().top + window.scrollY;
    var progreso = progresoEscenario();

    /* Ni al entrar ni al salir tiramos del usuario: solo se imanta entre
       el primer ancla y la última, para no impedir seguir leyendo. */
    if (progreso < ANCLAS[0] || progreso > ANCLAS[ANCLAS.length - 1]) return;

    var destino = inicio + ANCLAS[indicePaso] * recorrido;
    if (Math.abs(destino - window.scrollY) < 6) return;

    enAjuste = true;
    irA(destino, 620);
  }

  /* ---------------------------------------------------------
     Fondo en vídeo de la sección 3
     --------------------------------------------------------- */

  var videoFondo = document.getElementById("video-fondo");

  if (videoFondo) {
    if (menosMovimiento) {
      /* El CSS ya lo oculta; lo paramos para no gastar datos ni batería. */
      videoFondo.autoplay = false;
      videoFondo.removeAttribute("autoplay");
      videoFondo.pause();
    } else {
      /* Safari en iOS solo deja arrancar solo si el vídeo está silenciado, y
         no le basta el atributo del HTML: hay que dejarlo dicho también por
         código, antes de pedir la reproducción. */
      videoFondo.muted = true;
      videoFondo.defaultMuted = true;

      var pidiendo = false;

      function intentarVideo() {
        if (pidiendo || !videoFondo.paused) return;
        pidiendo = true;
        var p = videoFondo.play();
        if (p && typeof p.then === "function") {
          p.then(
            function () {
              pidiendo = false;
            },
            function () {
              pidiendo = false;
            },
          );
        } else {
          pidiendo = false;
        }
      }

      intentarVideo();

      /* Un solo intento no basta en iOS: puede rechazarlo porque aún no tiene
         metadatos, porque la pestaña está en segundo plano o porque el móvil
         está en modo de bajo consumo, que veta la reproducción automática
         hasta que la persona toca la pantalla. Así que reintentamos en cada
         una de esas ocasiones. Si nunca llega a arrancar, queda el primer
         fotograma como imagen fija y la sección no se ve vacía. */
      videoFondo.addEventListener("loadeddata", intentarVideo);
      videoFondo.addEventListener("canplay", intentarVideo);

      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) intentarVideo();
      });

      var gestos = ["touchstart", "pointerdown", "click", "keydown"];
      gestos.forEach(function (ev) {
        window.addEventListener(ev, intentarVideo, { passive: true });
      });
      videoFondo.addEventListener("playing", function () {
        /* Ya está en marcha: dejamos de escuchar gestos. */
        gestos.forEach(function (ev) {
          window.removeEventListener(ev, intentarVideo);
        });
      });

      /* Fuera de la sección no pinta nada corriendo: se para para ahorrar
         batería y datos, y se retoma al volver a entrar. */
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          function (entradas) {
            entradas.forEach(function (en) {
              if (en.isIntersecting) intentarVideo();
              else videoFondo.pause();
            });
          },
          { rootMargin: "300px 0px" },
        ).observe(videoFondo);
      }
    }
  }

  /* ---------------------------------------------------------
     Parallax y cabecera flotante
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

      actualizarPasos();
    }

    if (marca) {
      marca.classList.toggle(
        "visible",
        window.scrollY > window.innerHeight * 0.45,
      );
    }
  }

  pintar();
})();
