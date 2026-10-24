/* Nimbus SaaS — mobile nav + demo form toast */
(function () {
  "use strict";
  var t = document.querySelector(".nav-toggle"), l = document.querySelector(".nav-links");
  if (t && l) t.addEventListener("click", function () { l.classList.toggle("open"); });

  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>';
  var timer;
  function toast(msg) {
    var el = document.querySelector("#toast");
    if (!el) return;
    el.innerHTML = check + "<span>" + msg + "</span>";
    el.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }
  document.addEventListener("submit", function (e) {
    if (e.target.matches("[data-demo-form]")) {
      e.preventDefault();
      toast(e.target.getAttribute("data-msg") || "Thanks! We'll be in touch.");
      e.target.reset();
    }
  });
})();
