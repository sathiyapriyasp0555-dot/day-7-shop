# HomeCraft

A small furniture shop demo with product search, category filters, sorting, a cart, and a coupon.

## Run it

Open `index.html` with the VS Code Live Server extension.

## State to render

The state object stores changing values such as the search query, selected category, sort order, cart, and discount. Event listeners update that state and call `render()`. The render function recalculates the visible products and updates the product grid, summary, and cart.