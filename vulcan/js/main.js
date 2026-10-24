/* =========================================================
   Vulcan Industrial Co. — Shared JS
   Mobile nav, cart (localStorage), drawer, toast
   ========================================================= */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () { links.classList.toggle("open"); });
  }

  /* ---- Cart state ---- */
  var KEY = "vulcan_cart";
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(cart) {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
  }
  var cart = read();

  /* ---- SVG snippets ---- */
  var boxIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/></svg>';
  var checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>';

  /* ---- Money ---- */
  function money(n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  /* ---- Cart operations ---- */
  function add(item) {
    var found = cart.filter(function (c) { return c.id === item.id; })[0];
    if (found) { found.qty += 1; }
    else { cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 }); }
    write(cart); render(); toast(item.name + " added to cart");
  }
  function changeQty(id, delta) {
    var it = cart.filter(function (c) { return c.id === id; })[0];
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) { cart = cart.filter(function (c) { return c.id !== id; }); }
    write(cart); render();
  }
  function remove(id) {
    cart = cart.filter(function (c) { return c.id !== id; });
    write(cart); render();
  }

  /* ---- Render ---- */
  function count() { return cart.reduce(function (s, c) { return s + c.qty; }, 0); }
  function subtotal() { return cart.reduce(function (s, c) { return s + c.price * c.qty; }, 0); }

  function render() {
    // badge
    var badges = document.querySelectorAll(".cart-count");
    var n = count();
    badges.forEach(function (b) { b.textContent = n; b.style.display = n ? "grid" : "none"; });

    // drawer body
    var body = document.querySelector("#cartBody");
    if (!body) return;

    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty">' + boxIcon +
        '<p>Your cart is empty.</p><p style="font-size:.88rem;margin-top:6px">Browse the shop to add equipment.</p></div>';
    } else {
      body.innerHTML = cart.map(function (c) {
        return '' +
          '<div class="cart-item">' +
            '<div class="ci-thumb">' + boxIcon + '</div>' +
            '<div>' +
              '<h4>' + c.name + '</h4>' +
              '<div class="ci-price">' + money(c.price) + ' each</div>' +
              '<div class="qty">' +
                '<button data-dec="' + c.id + '" aria-label="decrease">&minus;</button>' +
                '<span>' + c.qty + '</span>' +
                '<button data-inc="' + c.id + '" aria-label="increase">+</button>' +
              '</div>' +
            '</div>' +
            '<div class="ci-right">' +
              '<div class="ci-total">' + money(c.price * c.qty) + '</div>' +
              '<button class="ci-remove" data-rm="' + c.id + '">Remove</button>' +
            '</div>' +
          '</div>';
      }).join("");
    }

    // totals
    var sub = subtotal();
    var ship = cart.length ? (sub > 500 ? 0 : 39.99) : 0;
    var subEl = document.querySelector("#sumSub");
    var shipEl = document.querySelector("#sumShip");
    var totEl = document.querySelector("#sumTotal");
    if (subEl) subEl.textContent = money(sub);
    if (shipEl) shipEl.textContent = ship === 0 ? (cart.length ? "FREE" : money(0)) : money(ship);
    if (totEl) totEl.textContent = money(sub + ship);

    var checkout = document.querySelector("#checkoutBtn");
    if (checkout) checkout.style.opacity = cart.length ? "1" : ".5";
  }

  /* ---- Drawer open/close ---- */
  function openDrawer() {
    var d = document.querySelector("#cartDrawer"), o = document.querySelector("#drawerOverlay");
    if (d) d.classList.add("open");
    if (o) o.classList.add("open");
  }
  function closeDrawer() {
    var d = document.querySelector("#cartDrawer"), o = document.querySelector("#drawerOverlay");
    if (d) d.classList.remove("open");
    if (o) o.classList.remove("open");
  }

  /* ---- Toast ---- */
  var toastTimer;
  function toast(msg) {
    var t = document.querySelector("#toast");
    if (!t) return;
    t.innerHTML = checkIcon + "<span>" + msg + "</span>";
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  /* ---- Event delegation ---- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-add], [data-inc], [data-dec], [data-rm], [data-open-cart], [data-close-cart]");
    if (!el) return;

    if (el.hasAttribute("data-add")) {
      e.preventDefault();
      add({
        id: el.getAttribute("data-id"),
        name: el.getAttribute("data-name"),
        price: parseFloat(el.getAttribute("data-price"))
      });
    } else if (el.hasAttribute("data-inc")) { changeQty(el.getAttribute("data-inc"), 1); }
    else if (el.hasAttribute("data-dec")) { changeQty(el.getAttribute("data-dec"), -1); }
    else if (el.hasAttribute("data-rm")) { remove(el.getAttribute("data-rm")); }
    else if (el.hasAttribute("data-open-cart")) { e.preventDefault(); openDrawer(); }
    else if (el.hasAttribute("data-close-cart")) { closeDrawer(); }
  });

  /* ---- Checkout (demo) ---- */
  document.addEventListener("click", function (e) {
    if (e.target.closest("#checkoutBtn")) {
      if (!cart.length) return;
      toast("Demo checkout — order placed!");
      cart = []; write(cart); render();
      setTimeout(closeDrawer, 900);
    }
  });

  /* ---- Contact / newsletter forms (demo) ---- */
  document.addEventListener("submit", function (e) {
    if (e.target.matches("[data-demo-form]")) {
      e.preventDefault();
      toast("Thanks! We'll be in touch shortly.");
      e.target.reset();
    }
  });

  render();
})();
