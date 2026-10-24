/* =========================================================
   Ember & Oak — cart (localStorage), drawer, toast, nav
   ========================================================= */
(function () {
  "use strict";
  var t = document.querySelector(".nav-toggle"), l = document.querySelector(".nav-links");
  if (t && l) t.addEventListener("click", function () { l.classList.toggle("open"); });

  var KEY = "ember_cart";
  function read(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ return []; } }
  function write(c){ try { localStorage.setItem(KEY, JSON.stringify(c)); } catch(e){} }
  var cart = read();

  var plate = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>';
  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>';
  function money(n){ return "$" + n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }

  function add(item){
    var f = cart.filter(function(c){return c.id===item.id;})[0];
    if (f) f.qty += 1; else cart.push({id:item.id,name:item.name,price:item.price,qty:1});
    write(cart); render(); toast(item.name + " added");
  }
  function change(id,d){ var it=cart.filter(function(c){return c.id===id;})[0]; if(!it)return; it.qty+=d; if(it.qty<=0) cart=cart.filter(function(c){return c.id!==id;}); write(cart); render(); }
  function remove(id){ cart=cart.filter(function(c){return c.id!==id;}); write(cart); render(); }
  function count(){ return cart.reduce(function(s,c){return s+c.qty;},0); }
  function subtotal(){ return cart.reduce(function(s,c){return s+c.price*c.qty;},0); }

  function render(){
    var n = count();
    document.querySelectorAll(".cart-count").forEach(function(b){ b.textContent=n; b.style.display=n?"grid":"none"; });
    var body = document.querySelector("#cartBody");
    if (!body) return;
    if (!cart.length){
      body.innerHTML = '<div class="cart-empty">'+plate+'<p>Your order is empty.</p><p style="font-size:.88rem;margin-top:6px">Add something from the menu.</p></div>';
    } else {
      body.innerHTML = cart.map(function(c){
        return '<div class="cart-item"><div class="ci-thumb">'+plate+'</div><div><h4>'+c.name+'</h4>'+
          '<div class="ci-price">'+money(c.price)+' each</div>'+
          '<div class="qty"><button data-dec="'+c.id+'">&minus;</button><span>'+c.qty+'</span><button data-inc="'+c.id+'">+</button></div></div>'+
          '<div class="ci-right"><div class="ci-total">'+money(c.price*c.qty)+'</div><button class="ci-remove" data-rm="'+c.id+'">Remove</button></div></div>';
      }).join("");
    }
    var sub = subtotal();
    var del = cart.length ? (sub>40?0:4.99) : 0;
    var se=document.querySelector("#sumSub"), de=document.querySelector("#sumDel"), te=document.querySelector("#sumTotal");
    if(se) se.textContent=money(sub);
    if(de) de.textContent = del===0 ? (cart.length?"FREE":money(0)) : money(del);
    if(te) te.textContent=money(sub+del);
  }

  function open(){ var d=document.querySelector("#cartDrawer"),o=document.querySelector("#drawerOverlay"); if(d)d.classList.add("open"); if(o)o.classList.add("open"); }
  function close(){ var d=document.querySelector("#cartDrawer"),o=document.querySelector("#drawerOverlay"); if(d)d.classList.remove("open"); if(o)o.classList.remove("open"); }

  var timer;
  function toast(msg){ var el=document.querySelector("#toast"); if(!el)return; el.innerHTML=check+"<span>"+msg+"</span>"; el.classList.add("show"); clearTimeout(timer); timer=setTimeout(function(){el.classList.remove("show");},2200); }

  document.addEventListener("click", function(e){
    var el = e.target.closest("[data-add],[data-inc],[data-dec],[data-rm],[data-open-cart],[data-close-cart]");
    if(!el) return;
    if(el.hasAttribute("data-add")){ e.preventDefault(); add({id:el.getAttribute("data-id"),name:el.getAttribute("data-name"),price:parseFloat(el.getAttribute("data-price"))}); }
    else if(el.hasAttribute("data-inc")) change(el.getAttribute("data-inc"),1);
    else if(el.hasAttribute("data-dec")) change(el.getAttribute("data-dec"),-1);
    else if(el.hasAttribute("data-rm")) remove(el.getAttribute("data-rm"));
    else if(el.hasAttribute("data-open-cart")){ e.preventDefault(); open(); }
    else if(el.hasAttribute("data-close-cart")) close();
  });
  document.addEventListener("click", function(e){
    if(e.target.closest("#checkoutBtn")){ if(!cart.length)return; toast("Order placed — see you soon!"); cart=[]; write(cart); render(); setTimeout(close,900); }
  });
  document.addEventListener("submit", function(e){
    if(e.target.matches("[data-demo-form]")){ e.preventDefault(); toast(e.target.getAttribute("data-msg")||"Thanks! We'll confirm shortly."); e.target.reset(); }
  });

  render();
})();
