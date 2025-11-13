const cart = (() => {
    // --- CONFIGURATION ---
    const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbw_dahrSDSmcbJCFtoVkXoea9vq9T58IPZUD8JmLOkcngelRn8xB8nelhhRj9OqeyIHeQ/exec';
    let cartItems = [];

    // --- DOM ELEMENTS ---
    let cartIcon, cartCount, cartSidebar, closeCartBtn, overlay, cartContent, paypalContainer;

    const loadCartFromStorage = () => {
        const storedCart = localStorage.getItem('freysterCart');
        cartItems = storedCart ? JSON.parse(storedCart) : [];
    };

    const saveCartToStorage = () => {
        localStorage.setItem('freysterCart', JSON.stringify(cartItems));
    };

    const addToCart = (product) => {
        if (!cartItems.find(item => item.pid === product.pid)) {
            // Since we handle one product at a time, clear the cart first.
            cartItems = [product]; 
            saveCartToStorage();
            updateCartUI();
            openCart();
        } else {
            alert(`${product.name} is already in your cart.`);
            openCart();
        }
    };

    const removeFromCart = (pid) => {
        cartItems = cartItems.filter(item => item.pid !== pid);
        saveCartToStorage();
        updateCartUI();
    };

    const updateCartUI = () => {
        if (!cartCount || !cartContent || !paypalContainer) return;

        cartCount.textContent = cartItems.length;
        cartCount.classList.toggle('visible', cartItems.length > 0);

        if (cartItems.length === 0) {
            cartContent.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
            paypalContainer.style.display = 'none';
        } else {
            cartContent.innerHTML = '';
            cartItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details"><p>${item.name}</p><p>$${item.price}</p></div>
                    <button class="cart-item-remove-btn" data-pid="${item.pid}">&times;</button>
                `;
                cartContent.appendChild(itemElement);
            });
            renderPayPalButton(cartItems[0].pid); 
            paypalContainer.style.display = 'block';
        }
    };

    const openCart = () => {
        cartSidebar.classList.add('open');
        overlay.classList.add('visible');
    };

    const closeCart = () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('visible');
    };

    const renderPayPalButton = (productId) => {
        paypalContainer.innerHTML = '';
        paypal.Buttons({
            createOrder: (data, actions) => {
                // This function now calls your backend to create a PayPal order.
                // Shipping details are NOT collected on the frontend.
                return new Promise((resolve, reject) => {
                    const callbackName = 'createOrderCallback' + Date.now();
                    window[callbackName] = (order) => {
                        delete window[callbackName];
                        document.body.removeChild(document.getElementById(callbackName));
                        order.error ? reject(order.error) : resolve(order.id);
                    };
                    const script = document.createElement('script');
                    script.id = callbackName;
                    script.src = `${gasWebAppUrl}?action=create-paypal-order&pid=${productId}&callback=${callbackName}`;
                    document.body.appendChild(script);
                });
            },
            onApprove: (data, actions) => {
                // This function calls your backend to capture the order.
                // Shipping details are retrieved by your backend from the PayPal order details.
                return new Promise((resolve, reject) => {
                    const callbackName = 'captureOrderCallback' + Date.now();
                    window[callbackName] = (details) => {
                        delete window[callbackName];
                        document.body.removeChild(document.getElementById(callbackName));
                        if (details.error) {
                            alert('There was an error processing your payment.');
                            reject(details.error);
                        } else {
                            alert('Transaction complete! Thank you, ' + details.payer.name.given_name + '.');
                            cartItems = [];
                            saveCartToStorage();
                            updateCartUI();
                            closeCart();
                            resolve();
                        }
                    };
                    const script = document.createElement('script');
                    script.id = callbackName;
                    // No need to send shipping details from the frontend anymore.
                    script.src = `${gasWebAppUrl}?action=capture-paypal-order&orderID=${data.orderID}&callback=${callbackName}`;
                    document.body.appendChild(script);
                });
            }
        }).render('#paypal-button-container');
    };

    const init = () => {
        const cartContainer = document.getElementById('cart-container');
        // Use a relative path that works from both root and /products/ directory
        fetch(window.location.pathname.includes('/products/') ? '../cart/cart.html' : './cart/cart.html')
            .then(res => res.text())
            .then(html => {
                if(cartContainer) cartContainer.innerHTML = html;
                
                // Assign elements after they are loaded
                cartIcon = document.getElementById('cart-icon');
                cartCount = document.getElementById('cart-count');
                cartSidebar = document.getElementById('cart-sidebar');
                closeCartBtn = document.getElementById('close-cart-btn');
                overlay = document.getElementById('overlay');
                cartContent = document.getElementById('cart-content');
                paypalContainer = document.getElementById('paypal-button-container');

                // Setup listeners
                if (cartIcon) cartIcon.addEventListener('click', openCart);
                if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
                if (overlay) overlay.addEventListener('click', closeCart);
                if (cartContent) {
                    cartContent.addEventListener('click', (e) => {
                        if (e.target.classList.contains('cart-item-remove-btn')) {
                            removeFromCart(e.target.dataset.pid);
                        }
                    });
                }

                // Initial state
                loadCartFromStorage();
                updateCartUI();
            }).catch(err => console.error("Failed to load cart HTML:", err));
    };

    return { init, addToCart };
})();