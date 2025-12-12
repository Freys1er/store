// assets/js/cart.js
const cart = (() => {
    let cartItems = [];

    const loadCartFromStorage = () => {
        const storedCart = localStorage.getItem('freysterCart');
        cartItems = storedCart ? JSON.parse(storedCart) : [];
    };

    const saveCartToStorage = () => {
        localStorage.setItem('freysterCart', JSON.stringify(cartItems));
    };

    const updateCartCount = () => {
        loadCartFromStorage();
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            countElement.textContent = cartItems.length;
        }
    };

    const flashCartButton = () => {
        const cartButton = document.getElementById('cart-button');
        if (cartButton) {
            cartButton.classList.add('cart-flash');
            setTimeout(() => {
                cartButton.classList.remove('cart-flash');
            }, 500); // Animation duration
        }
    };

    const addToCart = (pid) => {
        loadCartFromStorage();
        const product = getProductById(pid);
        if (!product) return;

        // THE KEY CHANGE: Check if item already exists
        const existingItem = cartItems.find(item => item.pid === pid);

        if (existingItem) {
            // If item is already in cart, just give feedback
            console.log("Item already in kit.");
            flashCartButton();
            return; // Stop the function here
        }

        // If it doesn't exist, add it to the array
        cartItems.push(product);
        saveCartToStorage();
        updateCartCount();
        flashCartButton();
    };
    
    const init = () => {
        updateCartCount();
        const cartButton = document.getElementById('cart-button');
        if (cartButton) {
            cartButton.addEventListener('click', () => {
                // Clicking the main Field Kit button always goes to the deployment page
                const path = window.location.pathname.includes('/products/') ? '../deployment.html' : 'deployment.html';
                window.location.href = path;
            });
        }
    };

    return { init, addToCart };
})();

document.addEventListener('DOMContentLoaded', cart.init);