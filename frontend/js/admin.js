/* ============================================
   admin.js – Admin Dashboard Logic
   Location:  js/admin.js
   Depends on: js/data.js (loaded before this in HTML)
   Data Structure: Queue (FIFO) for Order Processing
   ============================================ */

"use strict";



/* ────────────────────────────────────────────
   QUEUE CLASS (FIFO)
   enqueue(order)  → add to back
   dequeue()       → remove from front  ← FIFO
   peek()          → see front without removing
   isEmpty()       → boolean check
   size()          → count
   toArray()       → read-only snapshot
──────────────────────────────────────────── */
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    peek() {
        return this.isEmpty() ? null : this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    toArray() {
        return [...this.items];
    }
}

/* ────────────────────────────────────────────
   STATE
──────────────────────────────────────────── */
const orderQueue    = new Queue();
let processedOrders = [];

/* ────────────────────────────────────────────
   PRODUCTS – uses localStorage
   Falls back to data.js mock data if empty
   edit: deleted for implementation with backend API
──────────────────────────────────────────── */

/* ────────────────────────────────────────────
   PRODUCTS - fetch from backend API
──────────────────────────────────────────── */

let adminProducts = []; // will hold products fetched from backend

function getProducts() {
    return adminProducts;
}

/* ────────────────────────────────────────────
   ADD PRODUCT
──────────────────────────────────────────── */
/* Holds the base64 string of the chosen image */
let selectedImageBase64 = "";

function previewImage(event) {
    const files          = event.target.files;
    const clearBtn       = document.getElementById("clear-preview-btn");
    const previewContainer = document.getElementById("image-preview-container");
    const uploadText     = document.getElementById("file-upload-text");
    
    //clear previous previews so the don't stack infinitely
    previewContainer.innerHTML = ""; // Clear previous previews

    //if user cancels file selection
    if (!files || files.length === 0) {
        clearImagePreview();
        return;
    }

    //show the container and clear button if there are files
    
    clearBtn.style.display = "inline-block";
    previewContainer.style.display = "flex";
    //update the label text
    uploadText.textContent = files.length > 1 ? `${files.length} images selected` : files[0].name;
    
    //loop through selected files and create boxs for each preview
    Array.from(files).forEach(file => {
        const box = document.createElement("div");
        box.className = "preview-box";
        //create the image element
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file); // instant preview without reading file into memory as base64
        img.alt = "Preview";

        //put image in box and box in container
        box.appendChild(img);
        previewContainer.appendChild(box);
    });
}

function clearImagePreview() {
    // Clear the file input
    document.getElementById("prod-image").value          = "";

    
    const previewContainer = document.getElementById("image-preview-container");
    previewContainer.innerHTML = ""; // Clear all previews
    previewContainer.style.display = "none";

    document.getElementById("clear-preview-btn").style.display = "none";
    document.getElementById("file-upload-text").textContent = "Click to choose an image from your PC";
}

async function addProduct(event) {
    event.preventDefault();

    const name     = document.getElementById("prod-name").value.trim();
    const price    = document.getElementById("prod-price").value;
    const stock    = document.getElementById("prod-stock").value;
    const category = document.getElementById("prod-category").value;
    const description = document.getElementById("prod-description").value;
    const imageFiles = document.getElementById("prod-image").files;

    if (!name || isNaN(price) || isNaN(stock) || !category) {
        showToast("Please fill in all required fields.", "error");
        return;
    }

    const formData = new FormData();
    formData.append('title', name);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', category);
    formData.append('description', description);
    
    if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]); // Append each file to the form data with the same field name 'images' for multiple file upload support
        }
    }

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {'authorization': `Bearer ${localStorage.getItem('authToken')}`},
            body: formData
        });
        if (response.ok) {
            document.getElementById("product-form").reset();
            clearImagePreview();
            showToast(`"${name}" added successfully!`);
            init(); // Refresh product list
        } else {
            showToast("Failed to add product. Admin access required.", "error");
        }
    } catch (error) {
        showToast("An error occurred while adding the product.", "error");
    }
}

/* ────────────────────────────────────────────
   DELETE PRODUCT
──────────────────────────────────────────── */
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders() // Reuse auth headers function from api.js
        });

        if (response.ok) {
            showToast("Product removed successfully.");
            init(); // Refresh product list and stats
        } else {
            showToast("Failed to delete product. Admin access required.", "error");
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        showToast("An error occurred while deleting the product.", "error");
    }    
}

/* ────────────────────────────────────────────
   RENDER PRODUCT LIST
──────────────────────────────────────────── */
function renderProducts() {
    const container = document.getElementById("product-list");
    const searchVal = document.getElementById("search-products").value.toLowerCase();
    let products    = getProducts();

    if (searchVal) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(searchVal) ||
            p.category.toLowerCase().includes(searchVal)
        );
    }

    if (products.length === 0) {
        container.innerHTML = `<p class="empty-msg">No products found.</p>`;
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-item">
            ${p.images && p.images.length > 0
                ? `<img src="http://localhost:5000/uploads/${p.images[0]}" class="product-img" alt="${p.name}"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                   <div class="product-img-placeholder" style="display:none;"><i class="fa-solid fa-image"></i></div>`
                : `<div class="product-img-placeholder"><i class="fa-solid fa-box"></i></div>`
            }
            <div class="product-details">
                <div class="product-name">${p.title}</div>
                <div class="product-meta">${p.category}</div>
            </div>
            <span class="stock-badge ${p.stock <= 5 ? "stock-low" : "stock-ok"}">
                ${p.stock} ${p.stock <= 5 ? "⚠" : "in stock"}
            </span>
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <button class="btn-delete" onclick="deleteProduct('${p._id}')" title="Delete product">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join("");
}

/* ────────────────────────────────────────────
   QUEUE – SIMULATE NEW ORDER (ENQUEUE)
   edit: deleted random order generation for implementation with backend API
──────────────────────────────────────────── */

/* ────────────────────────────────────────────
   QUEUE – PROCESS NEXT ORDER (DEQUEUE / FIFO)
──────────────────────────────────────────── */
async function processNextOrder() {
    if (orderQueue.isEmpty()) {
        showToast("Queue is empty! No orders to process.", "warn");
        return;
    }

    const order = orderQueue.peek();
   
    try {
        //tell backend to mark order as processed
        const response = await fetch(`${API_URL}/admin/orders/${order._id}/process`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            orderQueue.dequeue(); //remove from queue if backend confirms processing
            processedOrders.unshift(order); //add to front of processed log
            showToast(`Processed order #${order._id} for ${order.customer}.`);
            renderQueue();
            renderProcessedLog();
            updateStats();
        } else {
            showToast("Failed to process order. Admin access required.", "error");
        }
    } catch (error) {
        console.error("Error processing order:", error);
        showToast("An error occurred while processing the order.", "error");
    }
}

/* ────────────────────────────────────────────
   RENDER ORDER QUEUE
──────────────────────────────────────────── */
function renderQueue() {
    const container = document.getElementById("order-queue");
    const orders    = orderQueue.toArray();

    if (orders.length === 0) {
        container.innerHTML = `<p class="empty-msg">Queue is empty. Simulate orders above.</p>`;
        return;
    }

    container.innerHTML = orders.map((order, index) => `
        <div class="order-item ${index === 0 ? "order-first" : ""}">
            <div class="order-number">${index + 1}</div>
            <div class="order-details">
                <div class="order-id">${order._id} — ${order.customer}</div>
                <div class="order-meta">${order.qty}x items &nbsp;·&nbsp; ${order.item} &nbsp;·&nbsp; ${order.timestamp}</div>
            </div>
            <span class="order-total">$${order.total}</span>
        </div>
    `).join("");
}

/* ────────────────────────────────────────────
   RENDER PROCESSED LOG
──────────────────────────────────────────── */
function renderProcessedLog() {
    const container = document.getElementById("processed-log");

    if (processedOrders.length === 0) {
        container.innerHTML = `<p class="empty-msg">No orders processed yet.</p>`;
        return;
    }

    container.innerHTML = processedOrders.map(order => `
        <div class="log-item">
            <i class="fa-solid fa-circle-check"></i>
            <span><span class="log-id">${order._id}</span> — ${order.customer} ($${order.total})</span>
            <span class="log-time">${order.timestamp}</span>
        </div>
    `).join("");
}

/* ────────────────────────────────────────────
   CLEAR PROCESSED LOG
──────────────────────────────────────────── */
async function clearProcessedLog() {
    if (!confirm("Are you sure you to premenantly delete all processed orders?")) return;

    try {
        const response = await fetch(`${API_URL}/admin/orders/processed/clear`,{
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            processedOrders = [];
            renderProcessedLog();
            updateStats();
            showToast("Processed log cleared successfully.")
        } else {
            const errData = await response.json();
            showToast(`Backend Error: ${errData.message}`, "error")
        }
    } catch (error) {
        console.error("Error clearing log:", error);
        showToast("An error occurred while clearing the log.", "error");
    }
}

/* ────────────────────────────────────────────
   UPDATE STATS CARDS
──────────────────────────────────────────── */
function updateStats() {
    const products = getProducts();
    document.getElementById("stat-products").textContent  = products.length;
    document.getElementById("stat-queue").textContent     = orderQueue.size();
    document.getElementById("stat-processed").textContent = processedOrders.length;
    document.getElementById("stat-lowstock").textContent  = products.filter(p => p.stock <= 5).length;
}

/* ────────────────────────────────────────────
   TOAST NOTIFICATION
──────────────────────────────────────────── */
function showToast(message, type = "success") {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const icons = { success: "fa-circle-check", error: "fa-circle-xmark", warn: "fa-triangle-exclamation" };
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}" style="margin-right:8px;"></i>${message}`;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* ────────────────────────────────────────────
   INIT
──────────────────────────────────────────── */
async function init() {
    try {
        // Fetch products from backend API
        const productResponse = await fetch(`${API_URL}/products`);
        adminProducts = await productResponse.json();
        
        //fetch orders from backend API and enqueue them
        const ordersResponse = await fetch(`${API_URL}/admin/orders/pending`, {
            headers: getAuthHeaders()
        });

        if (!ordersResponse.ok) {
            const errData = await ordersResponse.json();
            showToast(`Backend Error: ${errData.message}`, "error");
            return;
        }

        const pendingOrders = await ordersResponse.json();

        //load real orders into queue
        //clear queue first in case of re-initialization
        while (!orderQueue.isEmpty()) orderQueue.dequeue();

        //then add fetched orders
        pendingOrders.forEach(order => orderQueue.enqueue(order));

        //fetch processed Orders for the log
        const processedRes = await fetch(`${API_URL}/admin/orders/processed`, {
            headers: getAuthHeaders()
        });

        if (processedRes.ok) {
            processedOrders =await processedRes.json();
        }
    } catch (error) {
        console.error("Error initializing admin dashboard:", error);
        showToast("Failed to load data. Please try again later.", "error");
    }

    renderProducts();
    renderQueue();
    renderProcessedLog();
    updateStats();
}

document.addEventListener("DOMContentLoaded", init);