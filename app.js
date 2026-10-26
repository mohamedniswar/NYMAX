/* NYMAX storefront demo interactions. Data is saved locally in this browser. */
(() => {
  const $ = id => document.getElementById(id);
  const defaultProducts = [
    {id:1,name:"Everyday Hair Clips",category:"Accessories",price:450,emoji:"🎀"},
    {id:2,name:"Glow Beauty Essentials",category:"Beauty",price:1250,emoji:"✨"},
    {id:3,name:"Thoughtful Gift Box",category:"Gifts",price:2150,emoji:"🎁"},
    {id:4,name:"Cute Home Accent",category:"Home",price:890,emoji:"🌼"},
    {id:5,name:"Mini Fashion Bag",category:"Accessories",price:1750,emoji:"👜"},
    {id:6,name:"Little Toy Surprise",category:"Gifts",price:990,emoji:"🧸"},
    {id:7,name:"Daily Beauty Pick",category:"Beauty",price:1450,emoji:"💄"},
    {id:8,name:"Creative Desk Set",category:"Home",price:1350,emoji:"🎨"}
  ];
  const read = (key, fallback) => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  let products = read("nymax_products", defaultProducts);
  let cart = read("nymax_cart", []);
  let wishes = read("nymax_wishes", []);
  let orders = read("nymax_orders", []);
  let activeCategory = "All";
  let searchTerm = "";
  const money = n => "LKR " + Number(n||0).toLocaleString("en-LK");
  const save = () => { localStorage.setItem("nymax_products",JSON.stringify(products)); localStorage.setItem("nymax_cart",JSON.stringify(cart)); localStorage.setItem("nymax_wishes",JSON.stringify(wishes)); localStorage.setItem("nymax_orders",JSON.stringify(orders)); };
  function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200);}
  function renderProducts(){
    const list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&p.name.toLowerCase().includes(searchTerm));
    $("resultCount").textContent = `${list.length} ITEMS`;
    $("products").innerHTML=list.length?list.map(p=>`<article class="productCard"><div class="productVisual"><span class="productEmoji">${escapeHTML(p.emoji||"✦")}</span></div><div class="productInfo"><div class="productCategory">${escapeHTML(p.category)}</div><div class="productName">${escapeHTML(p.name)}</div><div class="productBottom"><span class="productPrice">${money(p.price)}</span><div class="productActions"><button class="wishBtn" data-wish="${p.id}" aria-label="Add to wishlist">${wishes.includes(p.id)?"♥":"♡"}</button><button class="addBtn" data-add="${p.id}" aria-label="Add to bag">+</button></div></div></div></article>`).join(""):'<div class="emptyState">No products found. Try another search or category.</div>';
  }
  function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function renderCart(){
    $("cartCount").textContent=cart.reduce((n,x)=>n+x.qty,0);
    $("wishCount").textContent=wishes.length;
    $("drawerTitle").textContent="Your bag";
    const total=cart.reduce((n,x)=>n+x.price*x.qty,0);
    $("drawerBody").innerHTML=cart.length?cart.map(x=>`<div class="cartRow"><div>${escapeHTML(x.emoji)} <b>${escapeHTML(x.name)}</b><small>${money(x.price)} × ${x.qty}</small></div><div><strong>${money(x.price*x.qty)}</strong><br><button data-remove="${x.id}">Remove</button></div></div>`).join("")+`<div class="cartTotal"><span>Total</span><strong>${money(total)}</strong></div><button class="button checkoutBtn" id="checkoutBtn">PLACE DEMO ORDER</button><p style="color:#aaa;font-size:12px">Demo only: no payment is taken.</p>`:'<p style="color:#aaa;padding:25px 0">Your bag is empty. Add something you love.</p>';
  }
  function openDrawer(title){$("drawerTitle").textContent=title;$("shade").classList.add("open");$("drawer").classList.add("open");}
  function closePanels(){$("shade").classList.remove("open");$("drawer").classList.remove("open");$("admin").classList.remove("open");}
  function renderAdmin(){
    $("adminStats").innerHTML=`<div class="stat"><small>Products</small><strong>${products.length}</strong></div><div class="stat"><small>Orders</small><strong>${orders.length}</strong></div><div class="stat"><small>Order value</small><strong>${money(orders.reduce((s,o)=>s+o.total,0))}</strong></div>`;
    $("adminProducts").innerHTML=products.map(p=>`<div class="adminProductRow"><span>${escapeHTML(p.emoji)} ${escapeHTML(p.name)} <small style="color:#aaa">· ${money(p.price)}</small></span><button data-delete="${p.id}">DELETE</button></div>`).join("")||"<p>No products yet.</p>";
    $("adminOrders").innerHTML=orders.length?orders.slice().reverse().map(o=>`<div class="orderRow"><span>${escapeHTML(o.date)} · ${o.items} item(s)</span><strong>${money(o.total)}</strong></div>`).join(""):"<p style='color:#aaa'>No demo orders recorded.</p>";
  }
  document.addEventListener("click",e=>{
    const add=e.target.closest("[data-add]"); if(add){const p=products.find(x=>x.id===Number(add.dataset.add));const item=cart.find(x=>x.id===p.id);if(item)item.qty++;else cart.push({...p,qty:1});save();renderCart();toast("Added to your bag");return;}
    const wish=e.target.closest("[data-wish]");if(wish){const id=Number(wish.dataset.wish);wishes=wishes.includes(id)?wishes.filter(x=>x!==id):[...wishes,id];save();renderProducts();renderCart();toast("Wishlist updated");return;}
    const remove=e.target.closest("[data-remove]");if(remove){cart=cart.filter(x=>x.id!==Number(remove.dataset.remove));save();renderCart();return;}
    const del=e.target.closest("[data-delete]");if(del){products=products.filter(x=>x.id!==Number(del.dataset.delete));save();renderProducts();renderAdmin();toast("Product deleted");return;}
    if(e.target.id==="checkoutBtn"){if(!cart.length)return;orders.push({date:new Date().toLocaleString(),items:cart.reduce((n,x)=>n+x.qty,0),total:cart.reduce((n,x)=>n+x.price*x.qty,0)});cart=[];save();renderCart();renderAdmin();toast("Demo order saved on this device");return;}
  });
  document.querySelectorAll(".category").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.cat;document.querySelectorAll(".category").forEach(x=>x.classList.toggle("selected",x===b));renderProducts();}));
  $("searchForm").addEventListener("submit",e=>{e.preventDefault();searchTerm=$("search").value.trim().toLowerCase();renderProducts();$("shop").scrollIntoView({behavior:"smooth"});});
  $("search").addEventListener("input",()=>{searchTerm=$("search").value.trim().toLowerCase();renderProducts();});
  $("cartOpen").addEventListener("click",()=>{renderCart();openDrawer("Your bag");});
  $("wishOpen").addEventListener("click",()=>{const items=products.filter(p=>wishes.includes(p.id));$("drawerTitle").textContent="Your wishlist";$("drawerBody").innerHTML=items.length?items.map(p=>`<div class="cartRow"><div>${escapeHTML(p.emoji)} <b>${escapeHTML(p.name)}</b><small>${money(p.price)}</small></div><button data-add="${p.id}">Add +</button></div>`).join(""):"<p style='color:#aaa'>Your wishlist is empty.</p>";openDrawer("Your wishlist");});
  $("drawerClose").addEventListener("click",closePanels);$("shade").addEventListener("click",closePanels);
  $("adminOpen").addEventListener("click",()=>{$("admin").classList.add("open");renderAdmin();});
  $("adminClose").addEventListener("click",()=> $("admin").classList.remove("open"));
  $("menuBtn").addEventListener("click",()=>$("nav").classList.toggle("open"));
  $("nav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("nav").classList.remove("open")));
  $("productForm").addEventListener("submit",e=>{e.preventDefault();const name=$("pName").value.trim(),category=$("pCategory").value,price=Number($("pPrice").value),emoji=$("pEmoji").value.trim()||"✦";if(!name||price<=0)return;products.push({id:Date.now(),name,category,price,emoji});save();e.target.reset();$("pEmoji").value="✦";renderProducts();renderAdmin();toast("Product added");});
  $("newsletter").addEventListener("submit",e=>{e.preventDefault();$("newsletterMsg").textContent="Thank you! This demo form does not send emails.";e.target.reset();});
  $("year").textContent=new Date().getFullYear();
  renderProducts();renderCart();
})();