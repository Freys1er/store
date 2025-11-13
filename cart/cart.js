const cart = (() => {
    // --- CONFIGURATION ---
    const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbw_dahrSDSmcbJCFtoVkXoea9vq9T58IPZUD8JmLOkcngelRn8xB8nelhhRj9OqeyIHeQ/exec';
    let cartItems = [];

    // --- DOM ELEMENTS ---
    let cartIcon, cartCount, cartSidebar, closeCartBtn, overlay, cartContent, paypalContainer, shippingFormContainer;

    const loadCartFromStorage = () => {
        const storedCart = localStorage.getItem('freysterCart');
        cartItems = storedCart ? JSON.parse(storedCart) : [];
    };

    const saveCartToStorage = () => {
        localStorage.setItem('freysterCart', JSON.stringify(cartItems));
    };

    const addToCart = (product) => {
        if (!cartItems.find(item => item.pid === product.pid)) {
            cartItems.push(product);
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
        cartCount.textContent = cartItems.length;
        cartCount.classList.toggle('visible', cartItems.length > 0);

        if (cartItems.length === 0) {
            cartContent.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
            shippingFormContainer.innerHTML = '';
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
            renderShippingForm();
            renderPayPalButton(cartItems[0].pid); // Assuming one item at a time for now
            paypalContainer.style.display = 'block';
        }
    };
    
    const renderShippingForm = () => {
        shippingFormContainer.innerHTML = `
            <h3>Shipping Details</h3>
            <form id="shipping-form">
                <input type="text" name="customerName" placeholder="Full Name" required>
                <input type="email" name="customerEmail" placeholder="Email Address" required>
                <input type="text" name="address" placeholder="Street Address" required>
                <input type="text" name="city" placeholder="City" required>
                <input type="text" name="province" placeholder="State / Province" required>
                <input type="text" name="zip" placeholder="ZIP / Postal Code" required>
                <select name="countryCode" required><option value="">Select Country</option><option value="US">United States</option><option value="CA">Canada</option></select>
                <input type="tel" name="customerPhone" placeholder="Phone Number (Optional)">
            </form>
        `;
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
                const shippingForm = document.getElementById('shipping-form');
                if (!shippingForm || !shippingForm.checkValidity()) {
                    alert("Please fill out all required shipping details.");
                    return actions.reject();
                }
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
                const shippingForm = document.getElementById('shipping-form');
                const shippingDetails = Object.fromEntries(new FormData(shippingForm).entries());
                return new Promise((resolve, reject) => {
                    const callbackName = 'captureOrderCallback' + Date.now();
                    window[callbackName] = (details) => {
                        delete window[callbackName];
                        document.body.removeChild(document.getElementById(callbackName));
                        if (details.error) {
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
                    const shippingParam = encodeURIComponent(JSON.stringify(shippingDetails));
                    script.src = `${gasWebAppUrl}?action=capture-paypal-order&orderID=${data.orderID}&shipping=${shippingParam}&callback=${callbackName}`;
                    document.body.appendChild(script);
                });
            }
        }).render('#paypal-button-container');
    };

    const init = () => {
        const cartContainer = document.getElementById('cart-container');
        fetch('/cart/cart.html')
            .then(res => res.text())
            .then(html => {
                cartContainer.innerHTML = html;
                // Assign elements after they are loaded
                cartIcon = document.getElementById('cart-icon');
                cartCount = document.getElementById('cart-count');
                cartSidebar = document.getElementById('cart-sidebar');
                closeCartBtn = document.getElementById('close-cart-btn');
                overlay = document.getElementById('overlay');
                cartContent = document.getElementById('cart-content');
                paypalContainer = document.getElementById('paypal-button-container');
                shippingFormContainer = document.getElementById('shipping-form-container');

                // Setup listeners
                cartIcon.addEventListener('click', openCart);
                closeCartBtn.addEventListener('click', closeCart);
                overlay.addEventListener('click', closeCart);
                cartContent.addEventListener('click', (e) => {
                    if (e.target.classList.contains('cart-item-remove-btn')) {
                        removeFromCart(e.target.dataset.pid);
                    }
                });

                // Initial state
                loadCartFromStorage();
                updateCartUI();
            });
    };

    return { init, addToCart };
})();