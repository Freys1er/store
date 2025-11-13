// The entire contents of your new script.js file
document.addEventListener('DOMContentLoaded', () => {
    // This is the most important line for integration.
    // It finds the 'cart' object, which was created by the cart/cart.js file,
    // and calls its 'init()' function. This tells the cart system to "wake up":
    // it loads the cart's HTML, attaches all the open/close listeners,
    // and updates the cart count from the browser's local storage.
    cart.init(); 

    // Find the container element in index.html where we want to display the product grid.
    const productListContainer = document.getElementById('product-list');
    
    // This is a safety check. It makes sure that:
    // 1. We are actually on the homepage (the 'product-list' element exists).
    // 2. The products/products.js file has successfully loaded and created the 'products' array.
    if (productListContainer && typeof products !== 'undefined') {
        
        // Loop through each product object in the 'products' array (from products/products.js).
        products.forEach(product => {
            // For each product, create an <a> tag that will link to its custom page.
            const productCard = document.createElement('a');
            productCard.href = product.pageUrl; // Get the page URL from the product object
            productCard.className = 'product-card-link';

            // Build the HTML for the product card using its data (image, name, price).
            productCard.innerHTML = `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-card-image">
                    <div class="product-card-info">
                        <p class="product-card-name">${product.name}</p>
                        <p class="product-card-price">$${product.price}</p>
                    </div>
                </div>
            `;
            
            // Add the newly created card to the homepage grid.
            productListContainer.appendChild(productCard);
        });
    }
});