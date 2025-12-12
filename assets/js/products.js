// assets/js/products.js

const products = [
    {
        pid: "CJSJ212415202BY", 
        sku: "CJSJ212415202BY",
        name: "15W M-Spec Charging Pad",
        price: "34.99", 
        pageUrl: "products/15w-charger.html",
        image: "https://placehold.co/400x400/101925/4ECDC4?text=M-SPEC+PAD" // Placeholder
    },
    {
        pid: "TI-KEY-ORG-001", 
        sku: "TI-KEY-ORG",
        name: "Titanium Key Organizer",
        price: "45.00", 
        pageUrl: "products/key-organizer.html",
        image: "https://placehold.co/400x400/101925/4ECDC4?text=TI+KEY" // Placeholder
    },
    {
        pid: "AR-CABLE-002", 
        sku: "AR-CABLE",
        name: "Mission-Ready Cable",
        price: "29.99", 
        pageUrl: "products/cable.html",
        image: "https://placehold.co/400x400/101925/4ECDC4?text=CABLE" // Placeholder
    }
];

// Helper to find product by ID
function getProductById(pid) {
    return products.find(p => p.pid === pid);
}