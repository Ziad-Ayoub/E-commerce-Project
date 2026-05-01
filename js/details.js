

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
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1; // Default to product 1 if no ID provided
    const product = productsDB.find(p => p.id === productId);

    if (!product) {
        document.getElementById('product-title').innerText = "Product Not Found";
        return; // Exit if product not found
    }

    //populate text data
    document.getElementById('product-title').innerText = product.title;
    document.getElementById('product-price').innerText = `$${product.price}`;
    document.getElementById('product-description').innerText = product.description;

    //populate stars dynamically
    const fullStars = Math.floor(product.rating);
    const starHTML = '<i class="fa-solid fa-star"></i>'.repeat(fullStars) +
    `<span>(${product.rating}/5 Customer Rating)</span>`;
    document.getElementById('product-rating').innerHTML = starHTML;

    //populate image slider & initialize circular list
    const mainImg = document.getElementById('current-img');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    const imageslider = new CircularDoublyLinkedList();

    //set first image as main
    mainImg.src = product.images[0];

    //build the gallery
    product.images.forEach((imgSrc, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
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
});


// Wishlist Toggle
const wishlistBtn = document.getElementById('wishlist-trigger');
wishlistBtn.addEventListener('click', () => {
    const icon = wishlistBtn.querySelector('i');
    icon.classList.toggle('fa-regular');
    icon.classList.toggle('fa-solid');
    
    if (icon.classList.contains('fa-solid')) {
        console.log("Added to wishlist");
    }
});
// Review Form Logic
const reviewForm = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-display-list');

reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get values from input
    const rating = document.getElementById('user-rating').value;
    const comment = document.getElementById('user-comment').value;
    const stars = "⭐".repeat(rating);

    // Create new review HTML structure
    const newReview = document.createElement('div');
    newReview.classList.add('review-item');
    newReview.innerHTML = `
        <div class="review-header">
            <span class="review-user">You (Guest)</span>
            <span class="review-stars">${stars}</span>
        </div>
        <p class="review-text">${comment}</p>
    `;

    // Add to the top of the list
    reviewsList.prepend(newReview);

    // Clear the form
    reviewForm.reset();
    alert("Thank you for your review!");
});