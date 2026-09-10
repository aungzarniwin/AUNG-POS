let cart = [];

function addToCart() {
    let name = document.getElementById("productName").value;
    let price = Number(document.getElementById("productPrice").value);
    let qty = Number(document.getElementById("productQty").value);

    if (name === "" || price <= 0 || qty <= 0) {
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
    let cartItems = document.getElementById("cartItems");
    let totalAmount = document.getElementById("totalAmount");

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>No products added yet.</p>";
        totalAmount.innerText = "0 Ks";
        return;
    }

    let html = "";

    cart.forEach(function(item, index) {
        let subtotal = item.price * item.qty;
        total += subtotal;

        html += `
            <div>
                <strong>${item.name}</strong>
                <p>${item.qty} × ${item.price.toLocaleString()} Ks</p>
                <strong>${subtotal.toLocaleString()} Ks</strong>
                <button onclick="removeItem(${index})">❌</button>
            </div>
            <hr>
        `;
    });

    cartItems.innerHTML = html;
    totalAmount.innerText = total.toLocaleString() + " Ks";
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

    cart.forEach(function(item) {
        total += item.price * item.qty;
    });

    alert("Sale Completed!\n\nTotal: " + total.toLocaleString() + " Ks");

    cart = [];
    displayCart();
}
