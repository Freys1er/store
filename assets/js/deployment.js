// assets/js/deployment.js
document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentStep = 1;
    const cart = JSON.parse(localStorage.getItem('freysterCart')) || [];
    let operatorDetails = JSON.parse(localStorage.getItem('freysterOperatorDetails')) || {};

    // --- DOM ELEMENTS ---
    const steps = document.querySelectorAll('.deployment-step');
    const progressSteps = document.querySelectorAll('.progress-step');

    // --- FUNCTIONS ---
    const showStep = (stepNumber) => {
        steps.forEach(step => step.classList.remove('active'));
        const activeStep = document.getElementById(`step-${stepNumber}`);
        if (activeStep) activeStep.classList.add('active');
        
        updateProgressBar(stepNumber);

        if (stepNumber === 3) {
            populateFinalSummary();
        }
    };

    const updateProgressBar = (stepNumber) => {
        progressSteps.forEach((step, index) => {
            const stepIndex = index + 1;
            step.classList.remove('active', 'complete');
            if (stepIndex < stepNumber) {
                step.classList.add('complete');
            } else if (stepIndex === stepNumber) {
                step.classList.add('active');
            }
        });
    };

    const renderCart = () => {
        const listEl = document.getElementById('kit-item-list');
        const subtotalEl = document.getElementById('summary-subtotal');
        const totalEl = document.getElementById('summary-total');

        if (!listEl || cart.length === 0) {
            // If the user lands here with an empty cart, send them back.
            window.location.href = 'index.html';
            return;
        }

        listEl.innerHTML = ''; // Clear the list before rendering
        let subtotal = 0;

        // THE FIX IS HERE: Dynamically building the HTML for each cart item
        cart.forEach(item => {
            subtotal += parseFloat(item.price);
            const itemHTML = `
                <div class="kit-item" data-pid="${item.pid}">
                    <div class="kit-item-visual" style="background-color: #000;"></div>
                    <div class="kit-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price}</p>
                    </div>
                    <button class="kit-item-remove-btn" onclick="deployment.removeFromCart('${item.pid}')">&times;</button>
                </div>
            `;
            listEl.innerHTML += itemHTML;
        });

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        totalEl.textContent = `$${subtotal.toFixed(2)}`;
    };

    const removeFromCart = (pid) => {
        const newCart = cart.filter(item => item.pid !== pid);
        localStorage.setItem('freysterCart', JSON.stringify(newCart));
        // Force a page reload to re-render everything correctly
        window.location.reload();
    };

    const populateFinalSummary = () => {
        const detailsEl = document.getElementById('final-details');
        const kitEl = document.getElementById('final-kit');

        // Populate Operator Details
        detailsEl.innerHTML = `
            ${operatorDetails.name || ''}<br>
            ${operatorDetails.email || ''}<br>
            ${operatorDetails.address || ''}<br>
            ${operatorDetails.city || ''}, ${operatorDetails.zip || ''}<br>
            ${operatorDetails.country || ''}
        `;

        // Populate Kit Details
        kitEl.innerHTML = '';
        cart.forEach(item => {
            kitEl.innerHTML += `${item.name} - $${item.price}<br>`;
        });
    };

    const saveOperatorDetails = () => {
        document.querySelectorAll('#shipping-form input').forEach(input => {
            operatorDetails[input.id] = input.value;
        });
        localStorage.setItem('freysterOperatorDetails', JSON.stringify(operatorDetails));
    };

    const loadOperatorDetails = () => {
        document.querySelectorAll('#shipping-form input').forEach(input => {
            if (operatorDetails[input.id]) {
                input.value = operatorDetails[input.id];
            }
        });
    };
    
    // --- EVENT LISTENERS ---
    document.querySelectorAll('.next-btn, .back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentStep = parseInt(e.target.dataset.target);
            showStep(currentStep);
        });
    });

    document.getElementById('shipping-form').addEventListener('input', saveOperatorDetails);
    
    window.addEventListener('beforeunload', (e) => {
        // This provides a warning if the user tries to leave mid-checkout
        if (currentStep > 1) {
            e.preventDefault();
            e.returnValue = 'Your deployment details are not saved. Are you sure you want to exit?';
        }
    });

    // --- INITIALIZATION ---
    renderCart();
    loadOperatorDetails();
    showStep(currentStep);

    // Expose removeFromCart to the global scope so inline onclick can find it
    window.deployment = { removeFromCart };
});