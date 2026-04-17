let cart = [...productsData];
let deletedItemsStack = [];


function renderCart() {
    const tableBody = document.getElementById('cart-table-body');
    const totalPriceElement = document.getElementById('total-price');
    const undoBtn = document.getElementById('undo-btn');
    
    if (!tableBody) return; 

    tableBody.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        tableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price} EGP</td>
                <td><button onclick="deleteItem(${index})">Remove</button></td>
            </tr>
        `;
    });

    if (totalPriceElement) totalPriceElement.innerText = total;
    if (undoBtn) undoBtn.style.display = deletedItemsStack.length > 0 ? "inline-block" : "none";
}

function deleteItem(index) {
    let removedItem = cart.splice(index, 1)[0];
    deletedItemsStack.push(removedItem);
    renderCart();
}


function undoDelete() {
    if (deletedItemsStack.length > 0) {
        let lastItem = deletedItemsStack.pop();
        cart.push(lastItem);
        renderCart();
    }

    renderCart();
}