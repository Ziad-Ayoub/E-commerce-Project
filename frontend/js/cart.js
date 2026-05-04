let cartData = [];
let deletedItemsStack = [];


async function renderCart() {
    const tableBody = document.getElementById('cart-table-body');
    const totalPriceElement = document.getElementById('total-price');
    const undoBtn = document.getElementById('undo-btn');
    
    if (!tableBody) return; 

    tableBody.innerHTML = ""; // Clear existing rows
    try {
        const res = await fetch(`${API_URL}/cart`, {headers: getAuthHeaders()});
        const cartResponse = await res.json();
        cartData = cartResponse; //store cart items in a global variable for easy access

        let total = 0;

        cartData.forEach((item, index) => {
            //if a product was deleted by admin, skip so the page doesn't crash
            if (!item.product) return;

            total += (item.product.price * item.quantity);
            tableBody.innerHTML += `
                <tr>
                    <td>${item.product.title} (x${item.quantity})</td>
                    <td>${item.product.price * item.quantity} EGP</td>
                    <td><button onclick="deleteItem(${index})">Remove</button></td>
                </tr>
            `;
            
        });

        if (totalPriceElement) totalPriceElement.innerText = total;
        if (undoBtn) undoBtn.style.display = deletedItemsStack.length > 0 ? "inline-block" : "none";
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="3">Please Log in to view your cart.</td></tr>';
    }
}

async function deleteItem(index) {
    const removedItem = cartData.splice(index, 1)[0];
    if (!removedItem) return;

    try {
        const response = await fetch(`${API_URL}/cart/${removedItem.product._id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            deletedItemsStack.push(removedItem);
            renderCart();
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}


async function undoDelete() {
    if (deletedItemsStack.length === 0) return;
    let lastItem = deletedItemsStack.pop();
    
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId: lastItem.product._id })
        });
        if (response.ok) {
            renderCart();
        }else {
            console.error('Failed to restore item');
            deletedItemsStack.push(lastItem); // Push it back if restore failed
        }
    } catch (error) {
        console.error('Error restoring item:', error);
    }
}

async function checkout() {
    // 1. Guardrail: Prevent guest checkout crash
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert("Please log in or register to checkout.");
        window.location.href = "profile.html";
        return;
    }

    if (!cartData || cartData.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        // 2. Tell the backend to process the cart (No body needed anymore!)
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            alert('Order placed successfully! Thank you for your purchase.');
            // 3. The backend already emptied the cart, just re-render the UI
            renderCart();
        } else {
            const errData = await response.json();
            alert(`Checkout failed: ${errData.message}`);
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout. Please try again.');
    }
}

renderCart();