/**
 * Wishlist Renderer - Custom Border Template
 * No filters, just the gold-bordered cards with 3 buttons.
 */
const wishlistList = document.getElementById('wishlist-list');

function renderWishlist() {
    if (!wishlistList) return;
    wishlistList.innerHTML = ''; 

    // إعداد الـ Grid لتوزيع المنتجات بشكل متساوي
    wishlistList.style.display = "grid";
    wishlistList.style.gridTemplateColumns = "repeat(auto-fill, minmax(280px, 1fr))";
    wishlistList.style.gap = "30px";
    wishlistList.style.padding = "40px 0";

    products.forEach(product => {
        const itemHTML = `
            <div class="product-card-template" style="border: 2px solid #e0c068; border-radius: 15px; padding: 20px; background: white; text-align: left; transition: 0.3s; position: relative;">
                
                <div style="border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden; margin-bottom: 15px; background: #fafafa;">
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 220px; object-fit: contain; padding: 10px;">
                </div>

                <span style="color: #bbb; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">Premium Collection</span>
                <h3 style="margin: 5px 0; font-size: 1.2rem; font-family: 'Playfair Display', serif; color: #333;">${product.name}</h3>
                <p style="color: #d4af37; font-weight: bold; font-size: 1.5rem; margin: 10px 0;">$${product.price}</p>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                    <button class="btn-action btn-details">
                        <i class="fa-solid fa-circle-info"></i> View Details
                    </button>
                    <button class="btn-action btn-gold">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-action btn-remove">
                        <i class="fa-solid fa-trash-can"></i> Remove from Wishlist
                    </button>
                </div>
            </div>
        `;
        wishlistList.insertAdjacentHTML('beforeend', itemHTML);
    });
}
renderWishlist();