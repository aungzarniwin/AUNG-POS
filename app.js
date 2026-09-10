let cart = [];

function addToCart() {
  const name = document.getElementById("productName").value.trim();
  const price = Number(document.getElementById("productPrice").value);
  const qty = Number(document.getElementById("productQty").value);

  if (!name || price <= 0 || qty <= 0) {
    alert("Please enter product name, price and quantity.");
    return;
  }

  cart.push({
    name: name,
    price: price,
    qty: qty
  });

  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productQty").value = 1;

  displayCart();
}

function displayCart() {
  const cartItems = document.getElementById("cartItems");
  const totalAmount = document.getElementById("totalAmount");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>No products added yet.</p>";
    totalAmount.textContent = "0 Ks";
    return;
  }

  let total = 0;
  let html = "";

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    html += `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <p>${item.qty} × ${item.price.toLocaleString()} Ks</p>
        </div>

        <div>
          <strong>${subtotal.toLocaleString()} Ks</strong>
          <button onclick="removeItem(${index})">❌</button>
        </div>
      </div>
    `;
  });

  cartItems.innerHTML = html;
  totalAmount.textContent = total.toLocaleString() + " Ks";
}

function removeItem(index) {
  cart.splice(index, 1);
  displayCart();
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
  });

  alert(
    "✅ Sale Completed!\n\n" +
    "Total: " + total.toLocaleString() + " Ks"
  );

  cart = [];
  displayCart();
}
