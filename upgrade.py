from pathlib import Path
p=Path('index.html'); s=p.read_text()
# Insert account button
s=s.replace('<button class="bag-btn" type="button" aria-label="Open shopping bag">', '<button class="account-btn" type="button" aria-label="Open account">\n<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 20c.8-3.2 3-4.8 6.5-4.8s5.7 1.6 6.5 4.8"></path></svg>\n</button>\n<button class="bag-btn" type="button" aria-label="Open shopping bag">')
# Replace checkout placeholder with richer controls
s=s.replace('<button type="button" id="checkoutBtn">Checkout</button>', '<button type="button" id="checkoutBtn">Secure Checkout</button>')
# Add modal suite before toast
needle='<div class="toast" id="toast" role="status" aria-live="polite"></div>'
addition=r'''
<div class="app-modal" id="accountModal" aria-hidden="true">
  <div class="app-backdrop" data-close-app="accountModal"></div>
  <div class="app-panel account-panel" role="dialog" aria-modal="true" aria-labelledby="accountTitle">
    <button class="app-close" type="button" data-close-app="accountModal">×</button>
    <div class="account-tabs"><button class="account-tab active" data-account-tab="login">Sign In</button><button class="account-tab" data-account-tab="signup">Create Account</button></div>
    <div class="account-view" data-account-view="login"><span class="mini-label">ELVORA ACCOUNT</span><h2 id="accountTitle">Welcome back</h2><p>Sign in to save your details and track orders.</p><form id="loginForm" class="app-form"><input name="email" type="email" placeholder="Email address" required><input name="password" type="password" placeholder="Password" minlength="6" required><button type="submit">Sign In</button></form><button class="text-button" id="demoLogin" type="button">Use demo account</button></div>
    <div class="account-view hidden" data-account-view="signup"><span class="mini-label">ELVORA ACCOUNT</span><h2>Create your account</h2><p>Save your cart, addresses and orders on this device.</p><form id="signupForm" class="app-form"><input name="name" placeholder="Full name" required><input name="email" type="email" placeholder="Email address" required><input name="password" type="password" placeholder="Password (6+ characters)" minlength="6" required><button type="submit">Create Account</button></form></div>
    <div class="account-user hidden" id="accountUser"><span class="mini-label">SIGNED IN</span><h2 id="accountUserName"></h2><p id="accountUserEmail"></p><button class="app-secondary" id="ordersBtn" type="button">My Orders</button><button class="app-secondary" id="logoutBtn" type="button">Sign Out</button></div>
  </div>
</div>
<div class="app-modal" id="checkoutModal" aria-hidden="true">
  <div class="app-backdrop" data-close-app="checkoutModal"></div>
  <div class="app-panel checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle">
    <button class="app-close" type="button" data-close-app="checkoutModal">×</button>
    <span class="mini-label">ELVORA CHECKOUT</span><h2 id="checkoutTitle">Complete your order</h2>
    <div class="checkout-layout"><form id="checkoutForm" class="app-form"><input name="name" placeholder="Full name" required><input name="email" type="email" placeholder="Email address" required><input name="phone" type="tel" placeholder="Phone number" required><textarea name="address" rows="3" placeholder="Delivery address" required></textarea><div class="checkout-methods"><label><input type="radio" name="payment" value="cod" checked> Cash on Delivery</label><label><input type="radio" name="payment" value="online"> Online payment (gateway-ready)</label></div><button type="submit">Place Order</button></form><div class="checkout-summary"><h3>Order summary</h3><div id="checkoutItems"></div><div class="summary-total"><span>Total</span><strong id="checkoutTotal">$ 0</strong></div></div></div>
  </div>
</div>
<div class="app-modal" id="ordersModal" aria-hidden="true">
  <div class="app-backdrop" data-close-app="ordersModal"></div>
  <div class="app-panel orders-panel" role="dialog" aria-modal="true" aria-labelledby="ordersTitle"><button class="app-close" type="button" data-close-app="ordersModal">×</button><span class="mini-label">ELVORA ACCOUNT</span><h2 id="ordersTitle">My Orders</h2><div id="ordersList"></div></div>
</div>
<div class="app-modal" id="adminModal" aria-hidden="true">
  <div class="app-backdrop" data-close-app="adminModal"></div>
  <div class="app-panel admin-panel" role="dialog" aria-modal="true" aria-labelledby="adminTitle"><button class="app-close" type="button" data-close-app="adminModal">×</button><span class="mini-label">LOCAL ADMIN</span><h2 id="adminTitle">Product Manager</h2><p class="admin-note">Demo admin panel for this static deployment. Changes are stored in this browser only.</p><form id="adminForm" class="app-form admin-form"><input name="name" placeholder="Product name" required><select name="category"><option>Chair</option><option>Beds</option><option>Sofa</option><option>Lamp</option></select><input name="price" type="number" min="1" step="1" placeholder="Price" required><select name="image" id="adminImage"><option value="Chair 1.png">Chair 1</option><option value="Chair 2.png">Chair 2</option><option value="Bed 1.png">Bed 1</option><option value="Sofa 1.png">Sofa 1</option><option value="Lamp 1.png">Lamp 1</option></select><button type="submit">Add Product</button></form><div id="adminProducts"></div></div>
</div>
<div class="admin-trigger" id="adminTrigger" title="Admin">A</div>
'''+needle
s=s.replace(needle,addition)
p.write_text(s)

p=Path('script.js'); s=p.read_text()
# Replace const products with localStorage merge structure by targeted first declaration
s=s.replace('const products={', 'let products={',1)
# Inject extra logic before final IIFE closing: locate before "})();\n(() => {"
marker='})();\n(() => {\n  const hero = document.querySelector(".hero");'
extra=r'''
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
  function renderCheckout(){const box=$('#checkoutItems');box.innerHTML=cart.map(i=>`<div><span>${i.name} × ${i.qty}</span><b>$ ${(i.price*i.qty).toFixed(2)}</b></div>`).join('');$('#checkoutTotal').textContent=`$ ${cart.reduce((a,i)=>a+i.price*i.qty,0).toFixed(2)}`;const u=currentUser();if(u){$('#checkoutForm [name="name"]').value=u.name;$('#checkoutForm [name="email"]').value=u.email}}
  $('#checkoutBtn').onclick=()=>{if(!cart.length)return showToast('Your bag is empty');closeCart();renderCheckout();openApp('checkoutModal')};
  $('#checkoutForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);const id='ELV-'+Date.now().toString().slice(-8);const total=cart.reduce((a,i)=>a+i.price*i.qty,0);const order={id,date:new Date().toISOString(),name:f.get('name'),email:f.get('email').toLowerCase(),phone:f.get('phone'),address:f.get('address'),payment:f.get('payment'),items:cart.map(i=>({...i})),total:`$ ${total.toFixed(2)}`,status:'Order placed'};const all=orders();all.push(order);localStorage.setItem(STORAGE.orders,JSON.stringify(all));if(!currentUser()){setUser({name:order.name,email:order.email})}cart=[];saveCart();closeApp('checkoutModal');showToast(`Order ${id} placed successfully`);renderOrders()};
  function saveProducts(){localStorage.setItem(STORAGE.products,JSON.stringify(products))}
  function renderAdmin(){const wrap=$('#adminProducts');wrap.innerHTML=Object.entries(products).flatMap(([cat,arr])=>arr.map((p,i)=>`<div class="admin-row"><span>${p[1]} <small>${cat} · $${p[2]}</small></span><button type="button" data-admin-remove="${cat}|${i}">Delete</button></div>`)).join('');$$('[data-admin-remove]').forEach(b=>b.onclick=()=>{const [cat,i]=b.dataset.adminRemove.split('|');products[cat].splice(+i,1);saveProducts();renderAdmin();refreshProductList();showToast('Product removed')})}
  $('#adminForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget),cat=f.get('category');products[cat].push([f.get('image'),f.get('name').trim(),f.get('price')]);saveProducts();e.currentTarget.reset();renderAdmin();refreshProductList();showToast('Product added')};
  $('#adminTrigger').onclick=()=>{renderAdmin();openApp('adminModal')};
  updateAccountUI();
'''
if marker in s:
    s=s.replace(marker,extra+marker)
else:
    raise SystemExit('marker not found')
p.write_text(s)
