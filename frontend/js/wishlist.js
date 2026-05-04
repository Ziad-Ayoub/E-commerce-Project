/**
 * Wishlist Renderer - Custom Border Template
 * No filters, just the gold-bordered cards with 3 buttons.
 */
const wishlistList = document.getElementById('wishlist-list');

async function renderWishlist() {
    if (!wishlistList) return;
    wishlistList.innerHTML = ''; 

    try {
        const response = await fetch(`${API_URL}/wishlist`, {headers: getAuthHeaders()});
        const products = await response.json();
    
        // Wishlist grid styling
        wishlistList.style.display = "grid";
        wishlistList.style.gridTemplateColumns = "repeat(auto-fill, minmax(280px, 1fr))";
        wishlistList.style.gap = "30px";
        wishlistList.style.padding = "40px 0";

        products.forEach(product => {

            //if product was deleted by admin, it will skip it
            if (!product) return;

            const itemHTML = `
                <div class="product-card-template" style="border: 2px solid #e0c068; border-radius: 15px; padding: 20px; background: white; text-align: left; transition: 0.3s; position: relative;">
                
                    <div style="border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden; margin-bottom: 15px; background: #fafafa;">
                        <img src="http://localhost:5000/uploads/${product.images[0]}" alt="${product.title}" style="width: 100%; height: 220px; object-fit: contain; padding: 10px;">
                    </div>

                    <span style="color: #bbb; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">Premium Collection</span>
                    <h3 style="margin: 5px 0; font-size: 1.2rem; font-family: 'Playfair Display', serif; color: #333;">${product.title}</h3>
                    <p style="color: #d4af37; font-weight: bold; font-size: 1.5rem; margin: 10px 0;">$${product.price}</p>

                    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                        <button class="btn-action btn-details" onclick="window.location.href='details.html?id=${product._id}'">
                            <i class="fa-solid fa-circle-info"></i> View Details
                        </button>
                        <button class="btn-action btn-gold" onclick="addToCart('${product._id}')">
                            <i class="fa-solid fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn-action btn-remove" onclick="removeFromWishlist('${product._id}')">
                            <i class="fa-solid fa-trash-can"></i> Remove from Wishlist
                        </button>
                    </div>
                </div>
            `;
            wishlistList.insertAdjacentHTML('beforeend', itemHTML);
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        wishlistList.innerHTML = '<p style="color: red; text-align: center; grid-column: 1 / -1;">Failed to load wishlist. Please log in and try again.</p>';
    }
}
//Add an item directly to the cart
async function addToCart(productId) {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId })
        });
        if (response.ok) {
            alert('Product added to cart!');
        } else {
            const errData = await response.json();
            alert(`Failed to add to cart: ${errData.message}`);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('An error occurred. Please try again.');
    }
}

//Remove an item from the wishlist
async function removeFromWishlist(productId) {
    try {
        const response = await fetch(`${API_URL}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            // Remove the ID from the global cache so the stars update globally
            if (window.userWishlistIds) {
                window.userWishlistIds = window.userWishlistIds.filter(id => id !== productId);
            }
            // Re-render the page to instantly remove the card from the screen
            renderWishlist(); 
        } else {
            alert('Failed to remove from wishlist.');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
    }
}
renderWishlist();