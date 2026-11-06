(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&t(o)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();const h=[{id:"mango-frost-chips",name:"Mango Frost Chips",flavor:"Mango",subtitle:"Sun-ripened, rich honey notes",tag:"BEST SELLER",tagColor:"#B45309",cardBg:"#FFF0BE",pillColor:"#F59E0B",accentColor:"#D97706",price:149,weight:"35g (from 350g fresh fruit)",pouchImage:"assets/products/mango_clean_pouch.png",mockupImage:"assets/products/mango_mockup.jpg",flatPack:"assets/uploads/mango_pack.jpg",description:"100% pure Kerala Alphonso & local mangoes, harvested at peak sun sweetness and freeze-dried at sub-zero temperatures. Retains vibrant golden color, tropical sweetness, and an ethereal melt-in-mouth crunch with zero oil or sugar.",badges:["100% Natural","Gluten Free","Oil Free","Vegan","No Added Sugar","No Preservatives"],nutrition:{energy:"128 kcal",fruitEquivalent:"1 whole mango",protein:"1.2g",fat:"0.1g",carbs:"29g",sugars:"24g (Natural Fruit Fructose)"},ingredients:"100% Fresh Ripe Mango. Nothing else.",origin:"Palakkad & Malappuram, Kerala"},{id:"chikku-frost-chips",name:"Chikku Frost Chips",flavor:"Chikku (Sapodilla)",subtitle:"Caramel malt fudge sweetness",tag:"NEW",tagColor:"#047857",cardBg:"#D4EDE2",pillColor:"#10B981",accentColor:"#059669",price:139,weight:"40g (from 400g fresh fruit)",pouchImage:"assets/products/chikku_clean_pouch.png",mockupImage:"assets/products/chikku_mockup.jpg",flatPack:"assets/uploads/chikku_pack.jpg",description:"Velvety sapodilla (chikku) freeze-dried into airy honeycomb slices. Delivers warm notes of brown sugar, caramel malt, and roasted honey with a delicate crumbly crunch that dissolves into pure fruit puree on your palate.",badges:["100% Natural","Gluten Free","Oil Free","Vegan","No Added Sugar","No Preservatives"],nutrition:{energy:"136 kcal",fruitEquivalent:"3 whole chikkus",protein:"0.9g",fat:"0.2g",carbs:"31g",sugars:"26g (Natural Fruit Fructose)"},ingredients:"100% Fresh Kerala Chikku (Sapodilla). Nothing else.",origin:"Kasaragod & Kannur, Kerala"},{id:"jackfruit-frost-chips",name:"Jackfruit Frost Chips",flavor:"Jackfruit",subtitle:"Sweet, tropical golden petals",tag:"BEST SELLER",tagColor:"#B45309",cardBg:"#FED0C7",pillColor:"#EF4444",accentColor:"#DC2626",price:149,weight:"35g (from 350g fresh fruit)",pouchImage:"assets/products/jackfruit_clean_pouch.png",mockupImage:"assets/products/jackfruit_mockup.jpg",flatPack:"assets/uploads/jackfruit_pack.jpg",description:"The pride of Kerala—firm golden Varikka jackfruit pods freeze-dried into crisp, fragrant shards. Rich in potassium and fiber with an exotic aroma of pineapple and floral honey. Completely oil-free and non-sticky.",badges:["100% Natural","Gluten Free","Oil Free","Vegan","No Added Sugar","No Preservatives"],nutrition:{energy:"132 kcal",fruitEquivalent:"12 golden pods",protein:"1.8g",fat:"0.1g",carbs:"30g",sugars:"23g (Natural Fruit Fructose)"},ingredients:"100% Ripe Varikka Jackfruit. Nothing else.",origin:"Idukki & Wayanad, Kerala"},{id:"banana-frost-chips",name:"Banana Frost Chips",flavor:"Banana",subtitle:"Crisp natural crunch, pure Kerala",tag:"CLASSIC",tagColor:"#1D4ED8",cardBg:"#D0E5F7",pillColor:"#3B82F6",accentColor:"#2563EB",price:129,weight:"40g (from 400g fresh fruit)",pouchImage:"assets/products/banana_clean_pouch.png",mockupImage:"assets/products/banana_mockup.jpg",flatPack:"assets/uploads/banana_pack.jpg",description:"Golden Kerala Nendran & Robusta bananas sliced and sublimated into ultralight, cloud-crisp medallions. A wholesome revelation compared to traditional fried banana chips—zero palm oil, zero salt, 100% wholesome crunch.",badges:["100% Natural","Gluten Free","Oil Free","Vegan","No Added Sugar","No Preservatives"],nutrition:{energy:"142 kcal",fruitEquivalent:"2 full bananas",protein:"1.4g",fat:"0.2g",carbs:"33g",sugars:"22g (Natural Fruit Fructose)"},ingredients:"100% Fresh Kerala Bananas. Nothing else.",origin:"Thrissur & Kozhikode, Kerala"}];typeof window<"u"&&(window.PRODUCTS=h);class C{constructor(){this.storageKey="realbeber_cart_v1",this.freeShippingThreshold=499,this.items=this.loadCart(),this.initElements(),this.bindEvents(),this.render()}loadCart(){try{const e=localStorage.getItem(this.storageKey);return e?JSON.parse(e):[{productId:"mango-frost-chips",quantity:1}]}catch(e){return console.warn("Failed to parse cart storage:",e),[]}}saveCart(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items))}catch(e){console.warn("Failed to save cart to storage:",e)}}initElements(){this.cartDrawer=document.getElementById("cartDrawer"),this.cartBackdrop=document.getElementById("cartBackdrop"),this.cartCloseBtn=document.getElementById("cartCloseBtn"),this.cartTriggerBtns=document.querySelectorAll(".cart-trigger-btn"),this.cartItemsList=document.getElementById("cartItemsList"),this.cartCountBadges=document.querySelectorAll(".cart-count-badge"),this.cartSubtotalEl=document.getElementById("cartSubtotal"),this.cartTotalEl=document.getElementById("cartTotal"),this.shippingProgressEl=document.getElementById("shippingProgress"),this.shippingMessageEl=document.getElementById("shippingMessage"),this.cartEmptyState=document.getElementById("cartEmptyState"),this.cartFooter=document.getElementById("cartFooter"),this.checkoutBtn=document.getElementById("checkoutBtn")}bindEvents(){this.cartTriggerBtns.forEach(e=>{e.addEventListener("click",s=>{s.preventDefault(),this.openDrawer()})}),this.cartCloseBtn&&this.cartCloseBtn.addEventListener("click",()=>this.closeDrawer()),this.cartBackdrop&&this.cartBackdrop.addEventListener("click",()=>this.closeDrawer()),window.addEventListener("keydown",e=>{e.key==="Escape"&&this.closeDrawer()}),this.checkoutBtn&&this.checkoutBtn.addEventListener("click",()=>{this.items.length!==0&&(this.showToast("Order Prototype","Checkout completed for demo! Order placed successfully.","success"),this.items=[],this.saveCart(),this.render(),setTimeout(()=>this.closeDrawer(),1200))})}openDrawer(){this.cartDrawer&&this.cartDrawer.classList.add("active"),this.cartBackdrop&&this.cartBackdrop.classList.add("active"),document.body.style.overflow="hidden"}closeDrawer(){this.cartDrawer&&this.cartDrawer.classList.remove("active"),this.cartBackdrop&&this.cartBackdrop.classList.remove("active"),document.body.style.overflow=""}addItem(e,s=1){const t=this.items.find(a=>a.productId===e);t?t.quantity+=s:this.items.push({productId:e,quantity:s}),this.saveCart(),this.render();const i=h.find(a=>a.id===e);i&&this.showToast("Added to Crunch Bag",`${i.name} (x${s}) added.`,"cart")}updateQuantity(e,s){const t=this.items.find(i=>i.productId===e);if(t){if(t.quantity+=s,t.quantity<=0){this.removeItem(e);return}this.saveCart(),this.render()}}removeItem(e){const s=h.find(t=>t.id===e);this.items=this.items.filter(t=>t.productId!==e),this.saveCart(),this.render(),s&&this.showToast("Item Removed",`${s.name} removed from your bag.`,"info")}getTotalCount(){return this.items.reduce((e,s)=>e+s.quantity,0)}getSubtotal(){return this.items.reduce((e,s)=>{const t=h.find(i=>i.id===s.productId);return e+(t?t.price*s.quantity:0)},0)}render(){const e=this.getTotalCount(),s=this.getSubtotal();if(this.cartCountBadges.forEach(t=>{t.textContent=e,e>0?t.classList.add("has-items"):t.classList.remove("has-items")}),this.cartSubtotalEl&&(this.cartSubtotalEl.textContent=`₹${s}`),this.cartTotalEl&&(this.cartTotalEl.textContent=`₹${s}`),this.shippingProgressEl&&this.shippingMessageEl)if(s>=this.freeShippingThreshold)this.shippingProgressEl.style.width="100%",this.shippingMessageEl.innerHTML="🎉 You unlocked <strong>FREE Shipping</strong> across Kerala & India!";else{const t=this.freeShippingThreshold-s,i=Math.min(100,Math.round(s/this.freeShippingThreshold*100));this.shippingProgressEl.style.width=`${i}%`,this.shippingMessageEl.innerHTML=`Add <strong>₹${t}</strong> more for <strong>FREE shipping</strong>!`}if(this.cartItemsList){if(this.items.length===0){this.cartItemsList.innerHTML="",this.cartEmptyState&&(this.cartEmptyState.style.display="block"),this.cartFooter&&(this.cartFooter.style.display="none");return}this.cartEmptyState&&(this.cartEmptyState.style.display="none"),this.cartFooter&&(this.cartFooter.style.display="block"),this.cartItemsList.innerHTML=this.items.map(t=>{const i=h.find(o=>o.id===t.productId);if(!i)return"";const a=i.price*t.quantity;return`
        <div class="cart-item" data-product-id="${i.id}">
          <div class="cart-item-image" style="background-color: ${i.cardBg}">
            <img src="${i.pouchImage}" alt="${i.name}" loading="lazy">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-header">
              <h4 class="cart-item-title">${i.name}</h4>
              <button class="cart-item-remove-btn" onclick="window.cart.removeItem('${i.id}')" title="Remove item" aria-label="Remove item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p class="cart-item-meta">${i.weight}</p>
            <div class="cart-item-footer">
              <div class="quantity-control">
                <button class="qty-btn" onclick="window.cart.updateQuantity('${i.id}', -1)" aria-label="Decrease quantity">−</button>
                <span class="qty-value">${t.quantity}</span>
                <button class="qty-btn" onclick="window.cart.updateQuantity('${i.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
              <div class="cart-item-price">₹${a}</div>
            </div>
          </div>
        </div>
      `}).join("")}}showToast(e,s,t="info"){const i=document.getElementById("toastContainer");if(!i)return;const a=document.createElement("div");a.className=`toast-item toast-${t}`,a.innerHTML=`
      <div class="toast-indicator"></div>
      <div class="toast-content">
        <h5 class="toast-title">${e}</h5>
        <p class="toast-message">${s}</p>
      </div>
      <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `,i.appendChild(a),requestAnimationFrame(()=>a.classList.add("visible")),a.querySelector(".toast-close-btn").addEventListener("click",()=>{a.classList.remove("visible"),setTimeout(()=>a.remove(),300)}),setTimeout(()=>{a.parentElement&&(a.classList.remove("visible"),setTimeout(()=>a.remove(),300))},3500)}}typeof window<"u"&&(window.CartController=C);document.addEventListener("DOMContentLoaded",()=>{window.cart=new C,I(),$(),S(),T(),F(),V(),P(),Q()});function I(){const n=document.getElementById("productGrid");n&&(n.innerHTML=h.map(e=>`
    <article class="product-card" style="--card-bg: ${e.cardBg}; --accent-color: ${e.accentColor};" data-id="${e.id}">
      <div class="product-card-inner">
        <!-- Top row: Badge and Quick View Trigger -->
        <div class="product-card-top">
          <span class="product-badge" style="color: ${e.tagColor};">${e.tag}</span>
          <button class="quick-view-btn" onclick="openQuickView('${e.id}')" title="Quick view ${e.name}" aria-label="Quick view ${e.name}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <!-- Standing 3D Pouch Image -->
        <div class="product-card-image-wrap" onclick="openQuickView('${e.id}')" role="button" tabindex="0" aria-label="View ${e.name} details">
          <img src="${e.pouchImage}" alt="${e.name} 3D pouch" class="product-pouch-img" loading="lazy">
        </div>

        <!-- Product Details -->
        <div class="product-card-details">
          <h3 class="product-card-title">${e.name}</h3>
          <p class="product-card-desc">${e.subtitle}</p>

          <div class="product-card-bottom">
            <span class="product-card-price">₹${e.price}</span>
            <button class="add-to-cart-btn" onclick="window.cart.addItem('${e.id}', 1)" aria-label="Add ${e.name} to cart">
              <span>Add</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join(""))}function $(){const n=document.querySelectorAll(".hero-slide"),e=document.querySelectorAll(".hero-dot"),s=document.getElementById("currentHeroFlavor"),t=document.getElementById("heroVisualCol");if(!n.length)return;let i=0,a=null;const o=8e3;function g(l){var f,E,B;(f=n[i])==null||f.classList.remove("active"),(E=e[i])==null||E.classList.remove("active"),i=(l+n.length)%n.length;const d=n[i];if(d==null||d.classList.add("active"),(B=e[i])==null||B.classList.add("active"),s&&d){const L=d.getAttribute("data-flavor");L&&(s.textContent=L)}}function m(){g(i+1)}function p(){g(i-1)}function c(){u(),a=setInterval(m,o)}function u(){a&&(clearInterval(a),a=null)}e.forEach((l,d)=>{l.addEventListener("click",f=>{f.preventDefault(),g(d),c()})});let v=0,r=!1;t==null||t.addEventListener("touchstart",l=>{v=l.touches[0].clientX,u()},{passive:!0}),t==null||t.addEventListener("touchend",l=>{const d=l.changedTouches[0].clientX,f=v-d;f>40?m():f<-40&&p(),c()},{passive:!0}),t==null||t.addEventListener("mousedown",l=>{r=!0,v=l.clientX,u()}),window.addEventListener("mouseup",l=>{if(!r)return;r=!1;const d=v-l.clientX;d>45?m():d<-45&&p(),c()});let b=null;t==null||t.addEventListener("wheel",l=>{Math.abs(l.deltaX)>25&&(l.preventDefault(),b||(l.deltaX>25?m():p(),c(),b=setTimeout(()=>{b=null},500)))},{passive:!1}),t==null||t.addEventListener("mouseenter",u),t==null||t.addEventListener("mouseleave",c),c()}function S(){const n=document.getElementById("mobileMenuToggle"),e=document.getElementById("mobileNavDrawer"),s=document.getElementById("mobileNavClose"),t=document.getElementById("mobileNavBackdrop"),i=document.querySelectorAll(".mobile-nav-link");if(!n||!e)return;const a=()=>{e.classList.add("active"),t&&t.classList.add("active"),document.body.style.overflow="hidden"},o=()=>{e.classList.remove("active"),t&&t.classList.remove("active"),document.body.style.overflow=""};n.addEventListener("click",a),s&&s.addEventListener("click",o),t&&t.addEventListener("click",o),i.forEach(g=>{g.addEventListener("click",o)})}function T(){const n=document.querySelectorAll(".search-trigger-btn"),e=document.getElementById("searchModal"),s=document.getElementById("searchBackdrop"),t=document.getElementById("searchCloseBtn"),i=document.getElementById("searchInput"),a=document.getElementById("searchResults"),o=document.getElementById("searchClearBtn");if(!e||!i)return;const g=()=>{e.classList.add("active"),s&&s.classList.add("active"),document.body.style.overflow="hidden",setTimeout(()=>i.focus(),80),p(i.value.trim())},m=()=>{e.classList.remove("active"),s&&s.classList.remove("active"),document.body.style.overflow=""};n.forEach(c=>c.addEventListener("click",g)),t&&t.addEventListener("click",m),s&&s.addEventListener("click",m),window.addEventListener("keydown",c=>{c.key==="Escape"&&e.classList.contains("active")&&m()});const p=c=>{const u=c.toLowerCase(),v=h.filter(r=>r.name.toLowerCase().includes(u)||r.flavor.toLowerCase().includes(u)||r.subtitle.toLowerCase().includes(u)||r.description.toLowerCase().includes(u));if(v.length===0){a.innerHTML=`
        <div class="search-empty">
          <p>No products found matching "<strong>${q(c)}</strong>"</p>
          <span class="search-hint">Only our four confirmed 100% natural varieties: Mango, Chikku, Jackfruit & Banana.</span>
        </div>
      `;return}a.innerHTML=v.map(r=>`
      <div class="search-result-item" onclick="openQuickView('${r.id}'); document.getElementById('searchCloseBtn').click();">
        <div class="search-result-thumb" style="background-color: ${r.cardBg};">
          <img src="${r.pouchImage}" alt="${r.name}">
        </div>
        <div class="search-result-info">
          <h4 class="search-result-title">${r.name}</h4>
          <p class="search-result-desc">${r.subtitle}</p>
          <span class="search-result-badge">${r.origin}</span>
        </div>
        <div class="search-result-action">
          <span class="search-result-price">₹${r.price}</span>
          <button class="search-add-btn" onclick="event.stopPropagation(); window.cart.addItem('${r.id}', 1); document.getElementById('searchCloseBtn').click();">
            Add +
          </button>
        </div>
      </div>
    `).join("")};i.addEventListener("input",c=>{p(c.target.value.trim()),o&&(o.style.display=c.target.value?"flex":"none")}),o&&o.addEventListener("click",()=>{i.value="",o.style.display="none",p(""),i.focus()})}let k=null,y=1;function F(){const n=document.getElementById("quickViewModal"),e=document.getElementById("quickViewBackdrop"),s=document.getElementById("quickViewCloseBtn");s&&s.addEventListener("click",w),e&&e.addEventListener("click",w),window.addEventListener("keydown",t=>{t.key==="Escape"&&n&&n.classList.contains("active")&&w()})}function D(n){const e=h.find(a=>a.id===n);if(!e)return;k=e,y=1;const s=document.getElementById("quickViewModal"),t=document.getElementById("quickViewBackdrop"),i=document.getElementById("quickViewContent");!s||!i||(i.innerHTML=`
    <div class="quick-view-grid">
      <!-- Visual Column -->
      <div class="quick-view-visual" style="background-color: ${e.cardBg};">
        <div class="quick-view-badge" style="color: ${e.tagColor};">${e.tag}</div>
        <img src="${e.pouchImage}" alt="${e.name}" class="quick-view-pouch-img">
        <div class="quick-view-origin-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>From God's Own Country: ${e.origin}</span>
        </div>
      </div>

      <!-- Info Column -->
      <div class="quick-view-body">
        <div class="qv-header">
          <span class="qv-category">100% Freeze Dried Fruit</span>
          <h2 class="qv-title">${e.name}</h2>
          <p class="qv-subtitle">${e.subtitle}</p>
          <div class="qv-price-row">
            <span class="qv-price">₹${e.price}</span>
            <span class="qv-weight">${e.weight}</span>
          </div>
        </div>

        <p class="qv-description">${e.description}</p>

        <!-- Product Badges -->
        <div class="qv-badges">
          ${e.badges.map(a=>`<span class="qv-badge-pill">${a}</span>`).join("")}
        </div>

        <!-- Clean Ingredients -->
        <div class="qv-ingredients-box">
          <div class="qv-ing-label">INGREDIENT LIST (1 ONLY):</div>
          <div class="qv-ing-value">${e.ingredients}</div>
        </div>

        <!-- Nutrition Facts Grid -->
        <div class="qv-nutrition-grid">
          <div class="qv-nutr-item">
            <span class="qv-nutr-label">Fruit Ratio</span>
            <span class="qv-nutr-val">10:1 Fresh Fruit</span>
          </div>
          <div class="qv-nutr-item">
            <span class="qv-nutr-label">Calories</span>
            <span class="qv-nutr-val">${e.nutrition.energy}</span>
          </div>
          <div class="qv-nutr-item">
            <span class="qv-nutr-label">Added Sugar</span>
            <span class="qv-nutr-val">0g (Zero)</span>
          </div>
          <div class="qv-nutr-item">
            <span class="qv-nutr-label">Cooking Oil</span>
            <span class="qv-nutr-val">0g (Oil-Free)</span>
          </div>
        </div>

        <!-- Add to cart bar -->
        <div class="qv-cta-bar">
          <div class="quantity-control qv-qty-ctrl">
            <button class="qty-btn" onclick="updateQuickViewQty(-1)" aria-label="Decrease quantity">−</button>
            <span class="qty-value" id="qvQtyDisplay">1</span>
            <button class="qty-btn" onclick="updateQuickViewQty(1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="qv-add-btn" onclick="addQuickViewToCart()">
            Add to Bag • ₹<span id="qvTotalPrice">${e.price}</span>
          </button>
        </div>
      </div>
    </div>
  `,s.classList.add("active"),t&&t.classList.add("active"),document.body.style.overflow="hidden")}function M(n){if(!k)return;y=Math.max(1,y+n);const e=document.getElementById("qvQtyDisplay"),s=document.getElementById("qvTotalPrice");e&&(e.textContent=y),s&&(s.textContent=k.price*y)}function N(){k&&(window.cart.addItem(k.id,y),w(),window.cart.openDrawer())}function w(){const n=document.getElementById("quickViewModal"),e=document.getElementById("quickViewBackdrop");n&&n.classList.remove("active"),e&&e.classList.remove("active"),document.body.style.overflow="",k=null}function V(){const n=document.querySelectorAll(".faq-item");n.forEach(e=>{const s=e.querySelector(".faq-question-btn");s&&s.addEventListener("click",()=>{const t=e.classList.contains("active");n.forEach(i=>i.classList.remove("active")),t||e.classList.add("active")})})}function P(){document.querySelectorAll(".newsletter-form").forEach(e=>{e.addEventListener("submit",s=>{s.preventDefault();const t=e.querySelector('input[type="email"]');if(!t||!t.value.trim())return;const i=t.value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i)){window.cart.showToast("Invalid Email","Please provide a valid email address.","error");return}t.value="",window.cart.showToast("Subscribed!","Welcome to Realbeber & Co.! Check your inbox for 15% off.","success")})})}function Q(){const n=document.querySelector(".site-header");window.addEventListener("scroll",()=>{window.scrollY>40?n==null||n.classList.add("scrolled"):n==null||n.classList.remove("scrolled")},{passive:!0}),document.querySelectorAll('a[href^="#"]').forEach(e=>{e.addEventListener("click",function(s){const t=this.getAttribute("href");if(t==="#"||!t.startsWith("#"))return;const i=document.querySelector(t);i&&(s.preventDefault(),i.scrollIntoView({behavior:"smooth",block:"start"}))})})}function q(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}typeof window<"u"&&(window.openQuickView=D,window.closeQuickView=w,window.updateQuickViewQty=M,window.addQuickViewToCart=N,window.escapeHtml=q);
