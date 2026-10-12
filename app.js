// State is the source of truth. Event handlers update state and call render().
// render() redraws the products, summary, and cart from that state.

// ----- products -----
const products = [
  { id: 101, name: "Teak Sofa", category: "living", price: 45000, inStock: true },
  { id: 102, name: "Oak Table", category: "dining", price: 12000, inStock: false },
  { id: 103, name: "Cane Chair", category: "living", price: 8500, inStock: true },
  { id: 104, name: "Brass Lamp", category: "decor", price: 3200, inStock: true },
  { id: 105, name: "Jute Rug", category: "decor", price: 6400, inStock: false },
  { id: 106, name: "Study Desk", category: "study", price: 27600, inStock: true },
  { id: 107, name: "Bookshelf", category: "study", price: 18750, inStock: true },
  { id: 108, name: "Cushion Set", category: "decor", price: 1800, inStock: true }
];

// ----- state -----
const state = {
  query: "",
  category: "all",
  sort: "default",
  cart: [],
  discount: 0
};

// ----- grab the elements once -----
const grid = document.querySelector("#grid");
const summary = document.querySelector("#summary");
const search = document.querySelector("#search");
const sortSelect = document.querySelector("#sort");
const chips = document.querySelector("#chips");
const cartList = document.querySelector("#cart-list");
const cartTotal = document.querySelector("#cart-total");
const cartCount = document.querySelector("#cart-count");
const couponForm = document.querySelector("#coupon-form");
const couponInput = document.querySelector("#coupon");
const couponMsg = document.querySelector("#coupon-msg");

// ----- make one product card -----
function cardHTML(p) {
  const disabled = p.inStock ? "" : "disabled";
  const buttonText = p.inStock ? "Add to cart" : "Out of stock";
  const inCart = state.cart.some(item => item.id === p.id);

  return `
    <li class="card ${inCart ? "in-cart" : ""}" data-id="${p.id}">
      <h3>${p.name}</h3>
      <p class="cat">${p.category}</p>
      <p class="price">₹${p.price}</p>
      <button class="add" ${disabled}>
        <span class="plus">+</span> ${buttonText}
      </button>
    </li>
  `;
}

// ----- draw product cards -----
function renderGrid(list) {
  if (list.length === 0) {
    grid.innerHTML = '<p class="empty">No products found.</p>';
    return;
  }

  grid.innerHTML = list.map(cardHTML).join("");
}

// ----- draw the summary -----
function renderSummary(list) {
  const inStock = list.filter(p => p.inStock).length;
  const total = list.reduce((sum, p) => sum + p.price, 0);

  summary.textContent =
    `${list.length} products · ${inStock} in stock · Total ₹${total}`;
}

// ----- draw the cart -----
function renderCart() {
  cartList.innerHTML = state.cart.map(item => {
    const product = products.find(p => p.id === item.id);

    return `
      <li data-id="${item.id}">
        <span>${product.name} × ${item.qty}</span>
        <button data-action="decrease" aria-label="Decrease ${product.name} quantity">−</button>
        <button data-action="increase" aria-label="Increase ${product.name} quantity">+</button>
        <button class="remove" data-action="remove" aria-label="Remove ${product.name} from cart">✕</button>
      </li>
    `;
  }).join("");

  const subtotal = state.cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + product.price * item.qty;
  }, 0);

  const quantity = state.cart.reduce((sum, item) => sum + item.qty, 0);

  cartTotal.textContent =
    `₹${Math.round(subtotal * (1 - state.discount))}`;
  cartCount.textContent = quantity;
}

// ----- choose products using the current state -----
function visibleProducts() {
  let list = products;

  if (state.category !== "all") {
    list = list.filter(p => p.category === state.category);
  }

  const query = state.query.toLowerCase();
  list = list.filter(p => p.name.toLowerCase().includes(query));

  if (state.sort === "low") {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (state.sort === "high") {
    list = [...list].sort((a, b) => b.price - a.price);
  }

  return list;
}

// ----- draw the whole page from state -----
function render() {
  const list = visibleProducts();

  renderGrid(list);
  renderSummary(list);
  renderCart();

  chips.querySelectorAll(".chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.cat === state.category);
  });
}

// ----- search -----
search.addEventListener("input", e => {
  state.query = e.target.value;
  render();
});

search.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    search.value = "";
    state.query = "";
    render();
  }
});

// ----- category chips -----
chips.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  state.category = chip.dataset.cat;
  render();
});

// ----- sort -----
sortSelect.addEventListener("change", e => {
  state.sort = e.target.value;
  render();
});

// ----- add products to cart -----
grid.addEventListener("click", e => {
  const button = e.target.closest(".add");
  if (!button) return;

  const id = Number(button.closest(".card").dataset.id);
  const cartItem = state.cart.find(item => item.id === id);

  if (cartItem) {
    cartItem.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }

  render();
});

// ----- change quantity or remove cart items -----
cartList.addEventListener("click", e => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.closest("li").dataset.id);
  const action = button.dataset.action;

  if (action === "remove") {
    state.cart = state.cart.filter(item => item.id !== id);
  } else {
    const item = state.cart.find(item => item.id === id);
    if (!item) return;

    item.qty += action === "increase" ? 1 : -1;

    if (item.qty <= 0) {
      state.cart = state.cart.filter(item => item.id !== id);
    }
  }

  render();
});

// ----- coupon form -----
couponForm.addEventListener("submit", e => {
  e.preventDefault();

  const code = couponInput.value.trim().toUpperCase();

  if (code === "HIT10") {
    state.discount = 0.1;
    couponMsg.textContent = "10% off applied";
  } else {
    state.discount = 0;
    couponMsg.textContent = "Invalid coupon";
  }

  render();
});

// ----- first render -----
render();