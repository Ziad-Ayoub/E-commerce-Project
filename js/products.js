

let filteredProducts = [...productsDB];
let currentPage = 1;
const itemsPerPage = 6;

// Products Grid Render
function renderProducts(productsToShow = filteredProducts) {
    const grid = document.getElementById('productsGrid');

    //Calc. Pagination
    const totalPages = Math.ceil(productsToShow.length / itemsPerPage);
    //check if if filters reduce page count lower than below current page
    if (currentPage > totalPages && totalPages > 0) {currentPage = totalPages;} 
    else if (totalPages === 0) {currentPage = 1;}

    //seperate array to get current page's items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = productsToShow.slice(startIndex, endIndex);

    //render items
    grid.innerHTML = paginatedItems.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price.toLocaleString()}</div>

                <div class="product-actions">
                    <button class="action-btn add-to-cart" data-id="${product.id}">
                        <i class="fa-solid fa-cart-shopping"></i> Add to cart
                    </button>
                    <button class="action-btn add-to-wishlist" data-id="${product.id}" aria-label="Add to Wishlist">
                        <i class="fa-regular fa-star"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    //update text count
    document.getElementById('resultCount').textContent = productsToShow.length;
    document.getElementById('totalProducts').textContent = productsDB.length;

    //render btns
    renderPagination(totalPages, productsToShow)
}

//Pagination btns func.
function renderPagination(totalPages, productsToShow){
    const pagincationContainer = document.getElementById('pagination');
    if (!pagincationContainer) return;

    pagincationContainer.innerHTML = ` `;

    if (totalPages <= 1) return;

    //create "Prev" Btn
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
    prevBtn.classList.add('page-btn');
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if(currentPage > 1) {
            currentPage--;
            renderProducts(productsToShow);
        }
    });
    pagincationContainer.appendChild(prevBtn);

    //create page number btns
    for (let i = 1; i <= totalPages; i++){
        const pageBtn =document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('page-btn');

        if (i === currentPage) {pageBtn.classList.add('active');}

        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderProducts(productsToShow);
        });
        pagincationContainer.appendChild(pageBtn);
    }

    //create "Next" btn
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    nextBtn.classList.add('page-btn');
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if(currentPage < totalPages) {
            currentPage++;
            renderProducts(productsToShow);
        }
    });
    pagincationContainer.appendChild(nextBtn);
}

// Update the filter count badge
function updateFilterCount() {
    let count = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const minPrice = document.getElementById('minPrice')?.value;
    const maxPrice = document.getElementById('maxPrice')?.value;


    if (minPrice || maxPrice) count++;

    const countEle = document.getElementById ('filterCount');
    const applyBtn = document.getElementById ('applyFilters');

    if (countEle) {
        countEle.textContent = count;
        countEle.style.display = count > 0 ? 'flex' : 'none';
    }
    if (applyBtn) {
        applyBtn.disabled = false;
    }
}


// Apply all filters
function applyFilters() {
    let results = [...productsDB];

    // Category filters
    const selectedCategories= Array.from(document.querySelectorAll('input[data-filter="Category"]:checked')).map(cb => cb.dataset.value);

    if(selectedCategories.length > 0) {
        results = results.filter(product => selectedCategories.includes(product.category));
    }

    // Price range filters
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;    
    results = results.filter(product => product.price >= minPrice && product.price <= maxPrice);
    
    // Results output
    filteredProducts = results;
    currentPage = 1;
    renderProducts(results);
}


// Clear All Filters
function clearFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => { checkbox.checked =false; });

    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';

    const searchInput = document.getElementById('searchInput');
    const searchBar = document.getElementById('searchBar')
    if (searchInput) searchInput.value = '';
    if (searchBar) searchBar.classList.remove('active');

    updateFilterCount();
    applyFilters();
}
// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args){
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait)
    };
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderProducts();
    updateFilterCount();
    // Filter event listners
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilterCount)
    });
    document.getElementById('minPrice')?.addEventListener('input', debounce(updateFilterCount,200));
    document.getElementById('maxPrice')?.addEventListener('input', debounce(updateFilterCount,200));

    // Apply Filter btn
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);

    // Clear All button
    document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
});

// Search function
function performSearch(){
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    let results = filteredProducts;

    if(searchTerm) {
        results =results.filter(product => 
            product.title.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm)
        );
    }
    currentPage = 1;
    renderProducts(results);
}

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchButton');
const searchBar = document.getElementById('searchBar');
if (searchInput) {
    searchInput.addEventListener('keypress',(e) => {
        if (e.key === 'Enter') {performSearch()}
    }
    );
    searchInput.addEventListener('input', debounce(() => {
        if (searchBar) {
            searchBar.classList.toggle('active',searchInput.value.length > 0);
        }
    },100))
}
if (searchBtn) {searchBtn.addEventListener('click',performSearch)}
 
//makes clicking on product, leads to it's details page
document.addEventListener('click', (e) => {
    const cartBtn= e.target.closest('.add-to-cart');
    const wishlistbtn = e.target.closest('.add-to-wishlist');
    const productCard = e.target.closest('.product-card');
    
    //for clicking on "Add to cart" btn
    if (cartBtn) {
        const productId = cartBtn.dataset.id;
        console.log(`Added product ${productId} to cart`);
        // cart logic to be added here
        alert(`Product ${cartBtn.dataset.title} added to cart`)
    }

    //for clicking on "Add to Wishlist" btn
    else if (wishlistbtn){
        const productId = wishlistbtn.dataset.id;
        const icon = wishlistbtn.querySelector('i');

        wishlistbtn.classList.toggle('active');
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');

        console.log(`product ${productId} add to wishlist`)
        // wishlist logic to be added here
    }


    //for clicking on Card
    else if (productCard) {
        const productId = productCard.dataset.productId;
        if(productId) {
            window.location.href = `details.html?id=${productId}`;
        }
    }
});

// Export to other files
window.products =productsDB;
window.renderProducts = renderProducts;
window.applyFilters = applyFilters;