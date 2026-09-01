(()=>{
  const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
  let products={
    Chair:[["Chair 1.png","Arden Lounge Chair","399"],["Chair 2.png","Milo Accent Chair","299"],["Chair 3.png","Evelyn Armchair","519"],["Chair 4.png","Nyantuy Chair","479"]],Beds:[["Bed 1.png","Novi Sofa Beds","869"],["Bed 2.png","Liora Sofa Beds","699"],["Bed 3.png","Velora Sofa Beds","949"],["Bed 4.png","Arden Sofa Beds","769"]],Sofa:[["Sofa 1.png","Velum Sofa","592"],["Sofa 2.png","Aurelia Sofa","499"],["Sofa 3.png","Monroe Sofa","519"],["Sofa 4.png","Elara Sofa","821"]],Lamp:[["Lamp 1.png","Astrid Floor Lamp","392"],["Lamp 2.png","Lunara table Lamp","299"],["Lamp 3.png","Elio Pendant Lamp","148"],["Lamp 4.png","Vera Arc Lamp","229"]]
  };
  const reviewData=[["Review Bg 1.png","Review 1.png","Bang Upin","“ELVORA delivered exactly that. Elegant design and excellent quality.”"],["Review Bg 2.png","Review 2.png","Amelia Collins","“I was looking for something modern yet timeless.”"],["Review Bg 3.png","Review 3.png","Oliver Bennett","“Absolutely loved the quality and finish. The sofa looks stunning and fits perfectly into our living room.”"],["Review Bg 4.png","Review 4.png","Lucas Anderson","“From the design to delivery, everything was perfect.”"],["Review Bg 5.png","Review 5.png","Ethan Carter","“The dining table is exceptional. The finish feels premium, and the entire experience was seamless.”"],["Review Bg 6.png","Review 6.png","Sophie Laurent","“Beautiful design, excellent craftsmanship, and incredibly comfortable.”"]];
  const heroImages=["BG 1.png","BG 2.png","BG 3.png"];
  let heroIndex=0;
  function setHero(i,animate=true){
    heroIndex=i;
    const h=$(".hero-bg");
    if(animate){
      h.classList.remove("is-changing");
      void h.offsetWidth;
      h.classList.add("is-changing");
    }
    h.style.backgroundImage=`url("assets/${heroImages[i]}")`;
    $$(".swatch").forEach(b=>b.classList.toggle("active",+b.dataset.heroIndex===i));
    $(".hero-progress span").style.width=`${(i+1)/3*100}%`;
    setTimeout(()=>h.classList.remove("is-changing"),680);
  }
  setHero(0,false);
  $$(".swatch").forEach(b=>b.onclick=()=>setHero(+b.dataset.heroIndex));
  setInterval(()=>setHero((heroIndex+1)%3),7000);
  const header=$("#siteHeader"),navLinks=$$(".nav-link:not(.nav-parent)"),sections=$$("main section[id]");
  function navUpdate(){
    header.classList.toggle("scrolled",scrollY>24);
    let cur="home";
    sections.forEach(s=>{
      if(scrollY>=s.offsetTop-150)cur=s.id
    });
    navLinks.forEach(a=>{
      const href=a.getAttribute("href");
      let active=href===`#${cur}`;
      if(cur==="shop" && href==="#shop") active=true;
      a.classList.toggle("active",active);
    });
  }
  addEventListener("scroll",navUpdate,{
    passive:true
  });
  navUpdate();
  const menu=$(".menu-toggle"),nav=$("#navLinks");
  menu.onclick=()=>{
    const open=nav.classList.toggle("open");
    menu.setAttribute("aria-expanded",open);
    document.body.classList.toggle("menu-open",open)
  };
  navLinks.forEach(a=>a.onclick=()=>{
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded","false");
    document.body.classList.remove("menu-open")
  });
  let category="Chair";
  const grid=$("#productGrid");
  function render(){
    grid.innerHTML=products[category].map(([img,name,price,id,description,stock])=>`<article class="product-card" data-name="${name}">
      <button class="product-image product-open" type="button" aria-label="View ${name}"><img src="${String(img).startsWith("http") ? img : `assets/${img}`}" alt="${name}" loading="lazy"></button>
      <div class="product-info"><div class="product-type">${category}</div><h3 class="product-name">${name}</h3>
      <div class="stars" aria-label="5 out of 5 stars">★★★★★</div>
      <div class="product-bottom"><span class="price">₹ ${price}</span><button class="add-btn" type="button" data-name="${name}" aria-label="Add ${name} to bag" ${Number(stock)===0?"disabled":""}>${Number(stock)===0?"Sold Out":"+"}</button></div></div>
    </article>`).join("");
    $$(".add-btn",grid).forEach(b=>b.onclick=e=>{e.stopPropagation();add(b.dataset.name)});
    $$(".product-open",grid).forEach(b=>b.onclick=()=>openProduct(b.closest(".product-card").dataset.name));
  }
  $$(".tab").forEach(t=>t.onclick=()=>{
    category=t.dataset.category;
    $$(".tab").forEach(x=>{
      const a=x===t;
      x.classList.toggle("active",a);
      x.setAttribute("aria-selected",a)
    });
    render()
  });
  render();
  const order=["Chair","Beds","Sofa","Lamp"];
  function changeCat(dir){
    let i=order.indexOf(category);
    i=(i+dir+4)%4;
    $(`.tab[data-category="${order[i]}"]`).click()
  }
  $(".product-next").onclick=()=>changeCat(1);
  $(".product-prev").onclick=()=>changeCat(-1);
  $("#viewAll").onclick=()=>showToast(`Showing all ${category.toLowerCase()} pieces`);
  const getAllProducts=()=>Object.entries(products).flatMap(([cat,arr])=>arr.map(([img,name,price,id,description,stock])=>({category:cat,image:img,name,price:Number(price),id,description:description||"",stock:Number(stock ?? 999)})));
  let cart=JSON.parse(localStorage.getItem("elvora-cart")||"[]");

  function saveCart(){localStorage.setItem("elvora-cart",JSON.stringify(cart));updateCart()}
  function cartCount(){return cart.reduce((sum,item)=>sum+item.qty,0)}
  function add(name){
    const product=getAllProducts().find(p=>p.name===name);
    if(!product)return;
    if(Number(product.stock)===0)return showToast("This item is currently out of stock");
    const existing=cart.find(p=>p.name===name);
    if(existing && existing.qty < Number(product.stock)) existing.qty++; else cart.push({...product,qty:1});
    saveCart(); openCart(); showToast(`${name} added to your bag`)
  }
  function changeQty(name,delta){
    const item=cart.find(p=>p.name===name); if(!item)return;
    item.qty+=delta; if(item.qty<=0)cart=cart.filter(p=>p.name!==name); saveCart()
  }
  function removeItem(name){cart=cart.filter(p=>p.name!==name);saveCart()}
  function updateCart(){
    const count=cartCount(); $(".bag-count").textContent=count;
    const items=$("#cartItems"),empty=$("#cartEmpty"),footer=$("#cartFooter");
    empty.style.display=count?"none":"block"; footer.style.display=count?"block":"none";
    items.innerHTML=cart.map(item=>`<div class="cart-item">
      <img src="${String(item.image).startsWith("http") ? item.image : `assets/${item.image}`}" alt="${item.name}">
      <div class="cart-item-info"><strong>${item.name}</strong><span>$ ${item.price}</span>
        <div class="qty"><button type="button" data-cart-action="minus" data-name="${item.name}">−</button><b>${item.qty}</b><button type="button" data-cart-action="plus" data-name="${item.name}">+</button><button class="remove-item" type="button" data-cart-action="remove" data-name="${item.name}">Remove</button></div>
      </div></div>`).join("");
    $$(".cart-item button",items).forEach(btn=>btn.onclick=()=>{
      const n=btn.dataset.name,a=btn.dataset.cartAction;
      if(a==="plus")changeQty(n,1); else if(a==="minus")changeQty(n,-1); else removeItem(n)
    });
    $("#cartTotal").textContent=`₹ ${cart.reduce((sum,item)=>sum+item.price*item.qty,0).toFixed(2)}`
  }
  function openCart(){$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");document.body.classList.add("modal-open")}
  function closeCart(){$("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
  $(".bag-btn").onclick=openCart; $$("[data-close-cart]").forEach(x=>x.onclick=closeCart);

  let modalProduct=null;
  function openProduct(name){
    modalProduct=getAllProducts().find(p=>p.name===name); if(!modalProduct)return;
    $("#modalProductImage").src=String(modalProduct.image).startsWith("http") ? modalProduct.image : `assets/${modalProduct.image}`; $("#modalProductImage").alt=modalProduct.name;
    $("#modalProductCategory").textContent=modalProduct.category; $("#modalProductName").textContent=modalProduct.name;
    $("#modalProductPrice").textContent=`$ ${modalProduct.price}`;
    $("#modalProductDescription").textContent=modalProduct.description || `A refined ${modalProduct.category.toLowerCase()} piece designed for modern interiors, combining lasting comfort, thoughtful proportions and an elegant Elvora finish.`;
    $("#productModal").classList.add("open");$("#productModal").setAttribute("aria-hidden","false");document.body.classList.add("modal-open")
  }
  function closeProduct(){$("#productModal").classList.remove("open");$("#productModal").setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
  $$("[data-close-modal]").forEach(x=>x.onclick=closeProduct);
  $("#modalAddBtn").onclick=()=>{if(modalProduct){add(modalProduct.name);closeProduct()}};
  $("#checkoutBtn").onclick=()=>showToast("Checkout will be connected next");
  addEventListener("keydown",e=>{if(e.key==="Escape"){closeProduct();closeCart()}});
  updateCart();

  $("#searchForm").onsubmit=e=>{
    e.preventDefault();
    const q=$("#searchInput").value.trim().toLowerCase();
    if(!q){
      $("#shop").scrollIntoView({
        behavior:"smooth"
      });
      return
    }
    const found=Object.entries(products).flatMap(([cat,arr])=>arr.map(x=>({
      cat,name:x[1].toLowerCase()
    }))).find(x=>x.name.includes(q)||x.cat.toLowerCase().includes(q));
    if(found){
      $(`.tab[data-category="${found.cat}"]`).click();
      $("#shop").scrollIntoView({
        behavior:"smooth"
      });
      showToast(`Showing ${found.cat.toLowerCase()} collection`)
    }
    else showToast("Try chair, sofa, beds or lamp")
  };
  const track=$("#reviewsTrack"),dots=$("#reviewDots");
  track.innerHTML=reviewData.map(([bg,av,n,q])=>`<article class="review-card" style="background-image:url('assets/${bg}')"><div class="review-panel"><img class="review-avatar" src="assets/${av}" alt="${n}" loading="lazy"><h3>${n}</h3><p>${q}</p><div class="review-stars">★★★★☆</div></div></article>`).join("");
  let ri=0,timer;
  function perView(){
    return innerWidth<=760?1:innerWidth<=1000?2:3
  }
  function maxI(){
    return Math.max(0,reviewData.length-perView())
  }
  function updateReviews(){
    ri=Math.min(ri,maxI());
    const card=$(".review-card");
    if(!card)return;
    const move=card.getBoundingClientRect().width+34;
    track.style.transform=`translateX(-${ri*move}px)`;
    dots.innerHTML=Array.from({
      length:maxI()+1
    },(_,i)=>`<button class="review-dot ${i===ri?"active":""}" aria-label="Go to review ${i+1}" data-i="${i}"></button>`).join("");
    $$(".review-dot").forEach(d=>d.onclick=()=>{
      ri=+d.dataset.i;
      updateReviews();
      restart()
    })
  }
  function next(){
    ri=ri>=maxI()?0:ri+1;
    updateReviews()
  }
  function prev(){
    ri=ri<=0?maxI():ri-1;
    updateReviews()
  }
  $(".review-next").onclick=()=>{
    next();
    restart()
  };
  $(".review-prev").onclick=()=>{
    prev();
    restart()
  };
  function start(){
    timer=setInterval(next,5200)
  }
  function restart(){
    clearInterval(timer);
    start()
  }
  addEventListener("resize",updateReviews);
  updateReviews();
  start();
  let touch=0;
  track.addEventListener("touchstart",e=>touch=e.touches[0].clientX,{
    passive:true
  });
  track.addEventListener("touchend",e=>{
    const dx=e.changedTouches[0].clientX-touch;
    if(Math.abs(dx)>45){
      dx<0?next():prev();
      restart()
    }
  });
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("visible");
      obs.unobserve(e.target)
    }
  }),{
    threshold:.12
  });
  $$(".reveal").forEach(x=>obs.observe(x));
  $$(".collection-card").forEach(card=>card.onclick=()=>{
    const cat=card.dataset.collection;
    const tab=$(`.tab[data-category="${cat}"]`);
    if(tab) tab.click();
    $("#shop").scrollIntoView({
      behavior:"smooth"
    });
  });
  $$("[data-nav-category]").forEach(link=>link.onclick=()=>{
    const cat=link.dataset.navCategory;
    const tab=$(`.tab[data-category="${cat}"]`);
    if(tab) tab.click();
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded","false");
    document.body.classList.remove("menu-open");
  });
  const furnitureParent=$(".nav-parent");
  if(furnitureParent){
    furnitureParent.addEventListener("click",e=>{
      if(innerWidth<=760){
        e.preventDefault();
        furnitureParent.parentElement.classList.toggle("open");
      }
    });
  }
  function showToast(t){
    const x=$("#toast");
    x.textContent=t;
    x.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t=setTimeout(()=>x.classList.remove("show"),2300)
  }

  // Complete storefront layer: accounts, checkout, orders and local admin.
  const STORAGE={products:'elvora-products',users:'elvora-users',user:'elvora-user',orders:'elvora-orders'};
  const seedProducts=JSON.parse(JSON.stringify(products));
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE.products)||'null');
    if(saved && typeof saved==='object') products={...products,...saved};
  }catch(e){}
  const refreshProductList=()=>{ const active=category; render(); category=active; };
  function openApp(id){const el=$('#'+id); if(!el)return; el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');}
  function closeApp(id){const el=$('#'+id); if(!el)return;el.classList.remove('open');el.setAttribute('aria-hidden','true'); if(!$('.app-modal.open')&&!$('.product-modal.open')&&!$('.cart-drawer.open'))document.body.classList.remove('modal-open');}
  $$('[data-close-app]').forEach(x=>x.onclick=()=>closeApp(x.dataset.closeApp));
  $('.account-btn').onclick=()=>{updateAccountUI();openApp('accountModal')};
  $$('.account-tab').forEach(tab=>tab.onclick=()=>{ $$('.account-tab').forEach(t=>t.classList.toggle('active',t===tab)); $$('.account-view').forEach(v=>v.classList.toggle('hidden',v.dataset.accountView!==tab.dataset.accountTab)); $('#accountUser').classList.add('hidden'); });
  function users(){try{return JSON.parse(localStorage.getItem(STORAGE.users)||'[]')}catch(e){return []}}
  function currentUser(){try{return JSON.parse(localStorage.getItem(STORAGE.user)||'null')}catch(e){return null}}
  function setUser(u){localStorage.setItem(STORAGE.user,JSON.stringify(u));updateAccountUI()}
  function updateAccountUI(){const u=currentUser(); const login=$('[data-account-view="login"]'),signup=$('[data-account-view="signup"]'),user=$('#accountUser'); if(u){login.classList.add('hidden');signup.classList.add('hidden');user.classList.remove('hidden');$('#accountUserName').textContent=u.name;$('#accountUserEmail').textContent=u.email}else{login.classList.remove('hidden');signup.classList.add('hidden');user.classList.add('hidden');$$('.account-tab').forEach((t,i)=>t.classList.toggle('active',i===0));}}
  $('#loginForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget),email=f.get('email').toLowerCase(),pass=f.get('password'),u=users().find(x=>x.email===email&&x.password===pass);if(!u)return showToast('Invalid email or password');setUser({name:u.name,email:u.email});showToast('Welcome back to ELVORA')};
  $('#demoLogin').onclick=()=>{setUser({name:'Demo Customer',email:'demo@elvora.store'});showToast('Demo account signed in')};
  $('#signupForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget),u={name:f.get('name').trim(),email:f.get('email').toLowerCase().trim(),password:f.get('password')};const list=users();if(list.some(x=>x.email===u.email))return showToast('Account already exists');list.push(u);localStorage.setItem(STORAGE.users,JSON.stringify(list));setUser({name:u.name,email:u.email});showToast('Account created successfully')};
  $('#logoutBtn').onclick=()=>{localStorage.removeItem(STORAGE.user);updateAccountUI();showToast('Signed out')};
  function orders(){try{return JSON.parse(localStorage.getItem(STORAGE.orders)||'[]')}catch(e){return []}}
  function renderOrders(){const u=currentUser(),list=$('#ordersList');if(!u){list.innerHTML='<p class="empty-state">Sign in to view your orders.</p>';return}const mine=orders().filter(o=>o.email===u.email);list.innerHTML=mine.length?mine.slice().reverse().map(o=>`<article class="order-card"><div><strong>${o.id}</strong><span>${new Date(o.date).toLocaleString()}</span></div><p>${o.items.map(i=>`${i.name} × ${i.qty}`).join(', ')}</p><b>${o.total}</b><small>${o.payment==='online'?'Online payment':'Cash on Delivery'} · ${o.status}</small></article>`).join(''):'<p class="empty-state">No orders yet.</p>';}
  $('#ordersBtn').onclick=()=>{closeApp('accountModal');renderOrders();openApp('ordersModal')};
  function renderCheckout(){const box=$('#checkoutItems');box.innerHTML=cart.map(i=>`<div><span>${i.name} × ${i.qty}</span><b>₹ ${(i.price*i.qty).toFixed(2)}</b></div>`).join('');$('#checkoutTotal').textContent=`₹ ${cart.reduce((a,i)=>a+i.price*i.qty,0).toFixed(2)}`;const u=currentUser();if(u){$('#checkoutForm [name="name"]').value=u.name;$('#checkoutForm [name="email"]').value=u.email}}
  $('#checkoutBtn').onclick=()=>{if(!cart.length)return showToast('Your bag is empty');closeCart();renderCheckout();openApp('checkoutModal')};
  $('#checkoutForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);const id='ELV-'+Date.now().toString().slice(-8);const total=cart.reduce((a,i)=>a+i.price*i.qty,0);const order={id,date:new Date().toISOString(),name:f.get('name'),email:f.get('email').toLowerCase(),phone:f.get('phone'),address:f.get('address'),payment:f.get('payment'),items:cart.map(i=>({...i})),total:`₹ ${total.toFixed(2)}`,status:'Order placed'};const all=orders();all.push(order);localStorage.setItem(STORAGE.orders,JSON.stringify(all));if(!currentUser()){setUser({name:order.name,email:order.email})}cart=[];saveCart();closeApp('checkoutModal');showToast(`Order ${id} placed successfully`);renderOrders()};
  function saveProducts(){localStorage.setItem(STORAGE.products,JSON.stringify(products))}
  function renderAdmin(){const wrap=$('#adminProducts');wrap.innerHTML=Object.entries(products).flatMap(([cat,arr])=>arr.map((p,i)=>`<div class="admin-row"><span>${p[1]} <small>${cat} · $${p[2]}</small></span><button type="button" data-admin-remove="${cat}|${i}">Delete</button></div>`)).join('');$$('[data-admin-remove]').forEach(b=>b.onclick=()=>{const [cat,i]=b.dataset.adminRemove.split('|');products[cat].splice(+i,1);saveProducts();renderAdmin();refreshProductList();showToast('Product removed')})}
  $('#adminForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget),cat=f.get('category');products[cat].push([f.get('image'),f.get('name').trim(),f.get('price')]);saveProducts();e.currentTarget.reset();renderAdmin();refreshProductList();showToast('Product added')};
  $('#adminTrigger').onclick=()=>{renderAdmin();openApp('adminModal')};
  updateAccountUI();
})();
(() => {
  const hero = document.querySelector(".hero");
  const bg = document.querySelector(".hero-bg");
  if (!hero || !bg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, -rect.top / Math.max(hero.offsetHeight,1)));
      bg.style.setProperty("--hero-scroll-y", `${progress * 18}px`);
      bg.style.transform = `scale(1.045) translate3d(0, ${progress * 18}px, 0)`;
      ticking = false;
    });
  }, {
    passive:true
  });
})();
