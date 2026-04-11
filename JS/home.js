
const products = [
    {
        id: 1,
        name: "Premium Black Dress",
        price: "$120.00",
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "Gold Plated Necklace",
        price: "$85.00",
        imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Classic Leather Bag",
        price: "$150.00",
        imageUrl: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Elegant Heels",
        price: "$95.00",
        imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop"
    }
];


function renderNewArrivals() {
    const gridContainer = document.getElementById('new-arrivals-grid');
    
    
    gridContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" class="product-img">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">${product.price}</p>
            <button class="btn-cart">Add to Cart</button>
        `;
        
        gridContainer.appendChild(productCard);
    });
}


document.addEventListener('DOMContentLoaded', renderNewArrivals);