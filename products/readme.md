## How to Add a New Product (3 Steps)

1.  **Create the Product Page:**
    *   In the `/products` folder, create a new HTML file for your product (e.g., `my-new-product.html`).
    *   You can duplicate an existing product page and modify its content (images, text, etc.).
    *   **Important:** Make sure it links to the main CSS and JS files with the correct relative paths (`../style.css`, `../cart/cart.js`, etc.).

2.  **Register the Product:**
    *   Open `/products/products.js`. This file contains an array of all products.
    *   Add a new JavaScript object to the `products` array with your new product's information. It must include:
        *   `pid`: The unique ID (must match the ID in your backend `secureProductList`).
        *   `sku`: The product's SKU from CJdropshipping.
        *   `name`: The product name.
        *   `price`: The selling price.
        *   `pageUrl`: The path to the new HTML file you created (e.g., `products/my-new-product.html`).
        *   `image`: The main image URL for the product.

3.  **Update the Backend:**
    *   Open your Google Apps Script (`Code.gs`).
    *   Add the new product's `pid`, `name`, `price`, and `sku` to the `secureProductList` object. This ensures the backend knows the correct price and SKU for fulfillment.
    *   **Redeploy your script** with a **"New version"**.

That's it! The homepage will automatically list your new product, and the new product page will be live.

## How to Remove a Product

1.  Open `/products/products.js`.
2.  Delete the JavaScript object for the product you want to remove from the `products` array.
3.  (Optional) Delete the product's HTML file from the `/products` folder.

The product will no longer appear on your homepage.