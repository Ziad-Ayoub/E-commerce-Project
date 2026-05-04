

// Gallery Functionality: Circular-doubly-linked-list Image Slider
class ImageNode {
    constructor(thumbnailElement) {
        this.thumb = thumbnailElement
        this.src = thumbnailElement.src;
        this.next = null;
        this.prev = null;
    }
}

class CircularDoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
    }

    addNode(thumbnailElement) {
        const newNode = new ImageNode(thumbnailElement);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.current = newNode;

            newNode.next = newNode;
            newNode.prev = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            newNode.next = this.head;
            this.head.prev = newNode;
            this.tail = newNode;
        }
    }
    goToNext() {
        if (this.current) {
            this.current = this.current.next;
            return this.current;      // may need to remove .src
        }
    }
    goToPrev() {
        if (this.current) {
            this.current = this.current.prev;
            return this.current;     // may need to remove .src
        }
    }
}

//dynamic page initialization
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); // Default to product 1 if no ID provided

    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const product = await response.json();

        //populate text data
        document.getElementById('product-title').innerText = product.title;

        const reviewsContainer = document.getElementById('reviews-list');
        if (reviewsContainer) {
            if (product.reviews && product.reviews.length > 0) {
                reviewsContainer.innerHTML = product.reviews.map(review => {
                    const stars = '<i class="fa-solid fa-star gold"></i>'.repeat(review.rating);
                    
                    return `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="review-user"><i class="fa-solid fa-user-circle"></i> ${review.name || "Anonymous Customer"}</span>
                                <div class="stars-row">${stars}</div>
                            </div>
                            <p class="review-text">${review.comment}</p>
                        </div>
                    `;
                }).join('');
            } else {
                reviewsContainer.innerHTML = '<p> No reviews yet. Be the first to review!</P>'
            }
        }
        //wire up the buttons for the global click listener
        const cartBtn = document.querySelector('.product-actions .btn-gold');
        if (cartBtn) {
            cartBtn.classList.add('add-to-cart');
            cartBtn.dataset.id = product._id;
        }
        
        const wishBtn = document.getElementById('wishlist-trigger');
        if (wishBtn) {
            wishBtn.classList.add('add-to-wishlist');
            wishBtn.dataset.id = product._id;
        }

        if (window.syncWishlistUI) window.syncWishlistUI()

        document.getElementById('product-price').innerText = `$${product.price}`;
        document.getElementById('product-description').innerText = product.description;

        //populate stars dynamically
        const fullStars = Math.floor(product.rating) || 0; // Default to 0 if rating is undefined
        const formattedRating =(product.rating || 0).toFixed(1);
        const starHTML = '<i class="fa-solid fa-star"></i>'.repeat(fullStars) +
        `<span>(${formattedRating}/5 Customer Rating)</span>`;
        document.getElementById('product-rating').innerHTML = starHTML;

        //populate image slider & initialize circular list
        const mainImg = document.getElementById('current-img');
        const thumbnailContainer = document.getElementById('thumbnail-container');
        const imageslider = new CircularDoublyLinkedList();

        //set first image as main
        mainImg.src = `http://localhost:5000/uploads/${product.images[0]}`;

        //build the gallery
        product.images.forEach((imgSrc, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = `http://localhost:5000/uploads/${imgSrc}`;
        imgElement.className = index === 0 ? 'thumb active' : 'thumb';

        thumbnailContainer.appendChild(imgElement);
        imageslider.addNode(imgElement);

        // Thumbnail click event
        imgElement.addEventListener('click', function() {
            let tempNode = imageslider.head;
            do {
                if (tempNode.thumb === this) {
                    imageslider.current = tempNode; // Set current to clicked thumbnail
                    updateGalleryUI(imageslider.current);
                    break;
                }
                tempNode = tempNode.next;
            } while (tempNode !== imageslider.head);
        });
    });

    //slider UI update function
    function updateGalleryUI(activeNode) {
        if (!activeNode) return;
        mainImg.src = activeNode.src;
        mainImg.style.opacity = 0.5; // fade effect
        setTimeout(() => {mainImg.style.opacity = 1;}, 300); // reset opacity after fade

        const allThumbs = document.querySelectorAll('.thumb');
        allThumbs.forEach(t => t.classList.remove('active'));
        activeNode.thumb.classList.add('active');
    }

    //slider button events
    document.getElementById('next-btn').addEventListener('click', () => {
        updateGalleryUI(imageslider.goToNext());
    });
    document.getElementById('prev-btn').addEventListener('click', () => {
        updateGalleryUI(imageslider.goToPrev());
    });
    
    } catch (error) {
        console.error('Error fetching product details:', error);
        alert('Failed to load product details. Please try again later.');
    }
});


// Review Form Logic
const reviewForm = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-display-list');

reviewForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get values from input
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const rating = document.getElementById('user-rating').value;
    const comment = document.getElementById('user-comment').value;
    const stars = "⭐".repeat(rating);

    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId, rating, comment })
        });
        if (response.ok) {
            alert('Review submitted successfully!');
            window.location.reload(); // Reload to show new review
        } else {
            alert('Failed to submit review. Please log in and try again.');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('An error occurred while submitting your review. Please try again later.');
    }

});