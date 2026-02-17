document.addEventListener("DOMContentLoaded", () => {
// CONSTANT VARIABLE
    const TOPPING_PRICE = 0.50;
    const CART_EXPIRY_MS = 24 * 3600000; 

// DRINK FILTERING LOGIC
    const filterButtons = document.querySelectorAll("#drinkFilters .filterBtn");
    const drinkGroups = document.querySelectorAll("section[data-type]");
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const filterValue = btn.dataset.filter;
            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            drinkGroups.forEach((group) => {
                const type = group.dataset.type;
                if (filterValue === "all" || filterValue === type) {
                    group.classList.remove("hidden-filter");
                }
                else {
                    group.classList.add("hidden-filter");
                }
            });
        });
    });

    // CART INITIALIZATION - DRINK BUILDER & CART SECTION LOGIC
    const selectedDetails = document.getElementById("selectedDrinkDetails");
    const addToCartBtn = document.getElementById("addToCartBtn");
    const cartList = document.getElementById("cartItems");
    const cartEmptyMsg = document.getElementById("cartEmptyMsg");
    const cartTotalEl = document.getElementById("cartTotal");
    
    let cartData = [];
    
    // VARIABLES
    let currentSelection = null;
    let currentBasePrice = 0;
    let currentSizePrice = 0;
    let currentSizeName = "Small";
    let currentSweetness = "0%";
    let currentToppings = [];
    
    const selectButtons = document.querySelectorAll(".teaDes .selectDrinkBtn");
    const sizeRows = document.querySelectorAll(".size-row");
    const sweetnessCards = document.querySelectorAll(".sweetness-card");
    const toppingItems = document.querySelectorAll(".topping-items");

    // HELPER: SAVE TO localStorage
    function saveCartToStorage () {
        try {
            localStorage.setItem('perScholasTeaCart', JSON.stringify(cartData));
            localStorage.setItem('perScholasTeaCartTimestamp', Date.now().toString());
        } catch (error) {
            console.error("Error saving cart to localStorage:", error);

            // Inform user that cart won't persist
            if (error.name === 'QuotaExceededError') {
                console.warn("LocalStorage is full. Cart will not be saved.");
            }
        }
    }

    // LOAD CART FROM localStorage
    try {
        const stored = localStorage.getItem('perScholasTeaCart');
        const timestamp = localStorage.getItem('perScholasTeaCartTimestamp');

        if (stored && timestamp) {
            const age = Date.now() - parseInt(timestamp); // AGE CALCULATED

            if (age > CART_EXPIRY_MS) {
                
                // EXPIRED: CLEAR CART
                console.log("Cart data expired, clearing...");
                localStorage.removeItem('perScholasTeaCart');
                localStorage.removeItem('perScholasTeaCartTimestamp');
                cartData = [];
            } else {

                // FRESH: LOAD CART
                const parsed = JSON.parse(stored);

                // VERIFIY PARSED DATA IS AN ARRAY
                if (Array.isArray(parsed)) {
                    cartData = parsed;
                } else {
                    console.warn("Invalid cart data structure, resetting");
                    cartData = [];
                }
            }
        }
    } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        // Clear Corrupted data from LocalStorage
        localStorage.removeItem('perScholasTeaCart');
        localStorage.removeItem('perScholasTeaCartTimestamp');
        cartData = [];
    }

// WHEN cartData changes UPDATE saveCartToStorage()
// addToCart Function
    function addToCart(item) {
        cartData.push(item);
        renderCart();
        saveCartToStorage(); 
    }


// HELPER: RENDER CART & SAVE TO STORAGE
    function renderCart() {
  // 1. Calculate everything first (NO DOM CHANGES)
        let runningTotal = 0;
        const hasItems = cartData.length > 0;

    // 2. CREATE DocumentFragment
        const fragment = document.createDocumentFragment();
        cartData.forEach((item, index) => {
            const li = document.createElement("li");
            const toppingsString = item.toppings.length > 0
                ? ` + ${item.toppings.join(", ")}`
                : "";
            li.textContent = `${index + 1}. ${item.name}, ${item.size}, ${item.sweetness}, ${toppingsString} - $${item.price.toFixed(2)}`;
            li.classList.add("cart-items");
    // 3. APPEND to FRAGMENT instead of cartList
            fragment.appendChild(li);
            runningTotal += item.price;
        });

    // 4. APPEND ALL FRAGMENTS to the DOM
        requestAnimationFrame(() => {
            cartList.innerHTML = "";
            cartList.appendChild(fragment);
            cartTotalEl.textContent = `Total: $${runningTotal.toFixed(2)}`;

            // VISIBILITY
            if (cartEmptyMsg) {
                cartEmptyMsg.style.display = hasItems ? "none" : "block";
            }
        });
    }

    renderCart();

// HELPER: RECALCULATE TOTAL PRICE
    function recalculateTotal() {
        if (!currentSelection) return;

        // Sum of individual topping price
        const toppingsCost = currentToppings.reduce((sum, topping) => sum + topping.price, 0);

        
        const rawTotal = currentBasePrice + currentSizePrice + toppingsCost;
         currentSelection.price = parseFloat(rawTotal.toFixed(2));
    }

    // HELPER: DRINK SELECTION RESET
    function resetSelection() {
        // CLEAR CURRENT SELECTION OBJECT
        currentSelection = null;

        // RESET TRACKING VARIABLES
        currentBasePrice = 0;
        currentSizePrice = 0;
        currentSizeName = "Small";
        currentSweetness = "0%";
        currentToppings = [];


        // CLEAR VISUAL SELECTION STATES
        document.querySelectorAll('.selectDrinkBtn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });

        document.querySelectorAll('.size-row.selected').forEach(row => {
            row.classList.remove('selected');
        });

        document.querySelectorAll('.sweetness-card.selected').forEach(card => {
            card.classList.remove('selected');
        });

        document.querySelectorAll('.selectToppingBtn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });

        // UPDATE DISPLAY
        updateDisplay();
    }

// DRINK SELECTION LISTENER
    selectButtons.forEach((btn) => {
        btn.addEventListener('click', function() {

            // REMVOE ACTIVE CLASS from ALL buttons
            selectButtons.forEach(b => {
                const parent = b.closest('.teaDes');
                if (parent) {
                    parent.classList.remove('selectedDrink');
                }
            });

            // HIGHLIGHT DRINK CARD
            const drinkCard = this.closest(".teaDes");
            drinkCard.classList.add("selectedDrink");

            // EXTRACT DRINK DATA
            const drinkName = this.dataset.name || "Unknown Drink";
            const basePrice = parseFloat(this.dataset.price) || 0; // "BASEPRICE"

            // RESET LOGIC TO DEFAULT
            currentBasePrice = basePrice;
            currentSizePrice = 0;
            currentSizeName = "Small";
            currentSweetness = "0%";
            currentToppings = [];

            // RESET BUTTON FOR NEW SELECTION
            addToCartBtn.textContent = "Add to Cart";
            addToCartBtn.classList.remove('cart-mode');
            isCartMode = false;

             // RESET VISUAL
            sizeRows.forEach(row => row.classList.remove("active"));
            sweetnessCards.forEach(card => card.classList.remove("active"));
            toppingItems.forEach(item => item.classList.remove("active"));

            // SET INITIAL SELECTION OBJECT
            currentSelection = { name: drinkName, price: currentBasePrice };

            // HELPER FUNCTION TO UPDATE DISPLAY TEXT
            updateDisplay();
            addToCartBtn.disabled = false;
            selectedDetails.style.display = "block";

            // SCROLL LOGIC TO DRINK SIZE AFTER SELECT CLICKED
            const sizeSection = document.getElementById("order-size");
            if (sizeSection) {
                sizeSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

// SIZE SELECTION LISTENER [OUTSIDE OF LOOP]
    sizeRows.forEach(row => {
        row.addEventListener("click", () => {
    // MAKE SELECTABLE ONLY AFTER A DRINK IS SELECTED
            if (!currentSelection) {
                alert("Please select a drink first!");
                return;
            }
    // VISUAL UPDATE
            sizeRows.forEach(r => r.classList.remove("active"));
            row.classList.add("active");
        // 1. GET PRICE
            currentSizePrice = parseFloat(row.dataset.price);
        // 2. GET SIZE NAME (first row)
            currentSizeName = row.children[0].textContent;
        // 3. UPDATE PRICE
            recalculateTotal();
            updateDisplay();
        // SCROLL LOGIC: SIZE TO SWEETNESS LEVEL
            const sweetnessSection = document.getElementById("order-sweetness");
            if (sweetnessSection) {
                sweetnessSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
// SWEETNESS SECTION LISTENER
    sweetnessCards.forEach(card => {
        card.addEventListener("click", () => {
            if (!currentSelection) {
                alert("Please select a drink first!");
                return;
            }            
    // VISUAL UPDATE
            sweetnessCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
    // UPDATE STATE
            currentSweetness = card.dataset.level;
            updateDisplay();
    // SCROLL LOGIC: SWEETNESS to TOPPING
            const toppingsSection = document.getElementById("toppings-section");
            if (toppingsSection) toppingsSection.scrollIntoView({ behavior: "smooth" });
        });
    });
// TOPPING LISTENER
    toppingItems.forEach(item => {
        item.addEventListener('click', function() {
            if (!currentSelection) {
                alert("Please select a drink first!");
                return;
            }

            // VISUAL UPDATE: TOGGLE ACTIVE CLASS
            item.classList.toggle("active");
            
            // GET TOPPING NAME FROM <h4> TAG
            const toppingName = item.querySelector("h4").textContent;

            // GET SPECIFIC PRICE OF THIS TOPPING
            const toppingPrice = parseFloat(item.dataset.price) || TOPPING_PRICE;

            // LOGIC - if ACTIVE ADD to array : REMOVE
            if (item.classList.contains("active")) {
                currentToppings.push({name: toppingName, price: toppingPrice });
            } else {
                currentToppings = currentToppings.filter(t => t.name !== toppingName);
            }
            
            recalculateTotal();
            updateDisplay();
        });
    });




// HELPER FUNCTION to UPDATE SELECTION SECTION
function updateDisplay() {
    if(currentSelection) {
        // CREATE STRING "(+$0.75)" or EMPTY if FREE
        const costTotal = currentSizePrice > 0
            ? `(+$${currentSizePrice.toFixed(2)})`
            : "";
        const toppingsText = currentToppings.length > 0
            ? currentToppings.map(t => `${t.name} (+$${t.price.toFixed(2)})`).join(", ") 
            : "None";

        // BUILD THE DISPLAY STRING
        selectedDetails.innerHTML = `
            <p><strong>Drink:</strong> ${currentSelection.name}</p>
            <p><strong>Size:</strong> ${currentSizeName} ${costTotal}</p>
            <p><strong>Sweetness:</strong> ${currentSweetness}</p>
            <p><strong>Toppings:</strong> ${toppingsText}</p>
            <p><strong>Current Price:</strong> $${currentSelection.price.toFixed(2)}</p>
        `;
    }
}

    // ADD TO CART LISTENER
    //  TRACK BUTTON STATE
    let isCartMode = false
    let isCheckoutMode = false

    addToCartBtn.addEventListener("click", (event) => {
        
        // Prevent button default behavior 
        event.preventDefault();

        // "Add Another Drink!" Logic -> Scroll to drinkk filter
        if (isCartMode) {
            document.getElementById('filter-box').scrollIntoView({
                behavior: 'smooth',
                block:'start'
            });

            // RESET BUTTON STATE
            isCartMode = false;
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.disabled = true;

            // CLEAR CURRENT SELECTION
            resetSelection();
            return;
        }

        // "Add to Cart!" Logic - Validation
        if (!currentSelection) {
            alert('Please select a drink first!');
            return;
        }

        if ((!currentSizeName || currentSizeName === 'Small') && currentSizePrice === 0) {
            alert('Please select a size!');
            return;
        }

        if (!currentSweetness) {
            alert('Please select a sweetness level!');
            return;
        }

        // ADD TO CART PRICE - Calculated by recalculateTotal
        cartData.push({
            name: currentSelection.name,
            size: currentSizeName,
            sweetness: currentSweetness,
            toppings: currentToppings.map(t => t.name),
            price: currentSelection.price
        });

        // UPDATE CART DISPLAY
        renderCart();
        saveCartToStorage();

        // Change button to Add Another Drink!
        addToCartBtn.textContent = 'Add Another Drink!';
        addToCartBtn.classList.add('cart-mode');
        isCartMode = true;

        // CLEAR SELECTION -> BEGIN CHECKOUT
        const clearBtn = document.getElementById("clearSelectionBtn");
        clearBtn.textContent = 'Begin Checkout!';
        clearBtn.classList.add('checkout-mode');
        isCheckoutMode = true;

});
    // CLEAR SELECTION SUMMARY AND BEGIN CHECKOUT BUTTON SECTION LISTENER
    const clearBtn = document.getElementById("clearSelectionBtn");
   
    clearBtn.addEventListener("click", () => {

        // IF "Begin Checkoout!" -> Scroll to Cart
        if (isCheckoutMode) {
            document.getElementById('your-cart').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            return; // Exits without clearing
        }

        // CLEAR SLECTION! LOGIC
        // 1. Check added inside Main Listener
        if (!confirm("Are you sure you want to clear current selection?")) {
            return;
        }

        // 2. Clearing LOGIC - RESET & CLEAR SELECTED DATA 
            currentSelection = null;
            currentBasePrice = 0;
            currentSizePrice = 0;
            currentSizeName = "Small";
            currentSweetness = "0%";
            currentToppings = [];

        // 3. RESET VISUAL DISPLAY
            document.querySelectorAll(".teaDes").forEach(card => card.classList.remove("selectedDrink"));
            sizeRows.forEach(row => row.classList.remove("active"));
            sweetnessCards.forEach(card => card.classList.remove("active"));
            toppingItems.forEach(item => item.classList.remove("active"));

        // 4. RESET TEXT AND BUTTON FUNCTIONALITY
            selectedDetails.innerHTML = "<p>No drink selected yet.</p>";
            addToCartBtn.textContent = "Add to Cart!";
            addToCartBtn.disabled = true;
            addToCartBtn.classList.remove('cart-mode');
            isCartMode = false;

        // 5. RESET CLEAR BUTTON (if cart is empty)
        if (cartData.length === 0) {
            clearBtn.textContent = "Clear Selection!";
            clearBtn.classList.remove('checkout-mode');
            isCheckoutMode = false;
        }    

        // 6. SCROLL LOGIC: SCROLL BACK TO TOP - DRINK FILTER SECTION
            const drinkSelection = document.getElementById("drinkFilters");
            if (drinkSelection) {
                drinkSelection.scrollIntoView({ behavior: "smooth" });
            }
        });

// CLEAR CART Confirmation LISTENER
    const clearOrderBtn = document.getElementById("clearOrderBtn");
    clearOrderBtn.addEventListener("click", (event) => {
    // 1. Ask for confirmation
        const userConfirmed = confirm("Are you sure you want to clear your cart?");

    // 2. Stop here if Answer: NO - Cancel
        if(!userConfirmed) {
            return; // exit function - code below never run
        }

    // 3. If Answer: YES - function proceed to clear data
        // 3a. EMPTY DATA ARRAY
        cartData = [];
        addToCartBtn.disabled = true;

        // 3b. UPDATE LOCALSTORAGE
        localStorage.setItem('perScholasTeaCart', JSON.stringify(cartData));
        localStorage.removeItem('perScholasTeaCartTimestamp');
    
        // 3c. RESET CLEAR SELECTION BUTTON
        const clearBtn = document.getElementById("clearSelectionBtn");
        clearBtn.textContent = "Clear Selection!";
        clearBtn.classList.remove('checkout-mode');
        isCheckoutMode = false;

        // 3d. UPDATE USER INTERFACE & STROAGE
        renderCart();
        alert("Cart has been cleared!");
    });

// F0RM LISTENER
    const orderForm = document.getElementById('orderForm');
    const orderName = document.getElementById('orderName');
    const orderPhone = document.getElementById('orderPhone');
    const orderEmail = document.getElementById('orderEmail');

    if (orderForm && orderName && orderPhone && orderEmail) {
        
        function setButtonLoading(button) {
            button.disabled = true;
            button.textContent = "Processing...";
            button.style.opacity = "0.6";
            button.style.cursor = "not-allowed";
        }
        function resetButton(button, originalText) {
            button.disabled = false;
            button.textContent = originalText;
            button.style.opacity = "1";
            button.style.cursor = "pointer";
        }
 
        orderForm.addEventListener("submit", (event) => {
            event.preventDefault();
            
        // A0. RESET ERROR VISUAL AT START OF EVERY ATTEMPT
            orderName.classList.remove("input-error");
            orderPhone.classList.remove("input-error");
            orderEmail.classList.remove("input-error");

        // A1. GET SUBMIT BUTTON & SET LOADING STATE
            const submitBtn = orderForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
    
        // A2. CHECK IF CART IS EMPTY
            if (cartData.length === 0) {
                alert("Your cart is empty! Please add drinks before submitting.");
                resetButton(submitBtn, originalBtnText);
                return;
            }
    
        // A3. GET FORM VALUES
            const nameValue = orderName.value.trim();
            const contactValue = orderPhone.value.trim();
            const emailValue = orderEmail.value.trim();
    
        // A4. STANDARDIZE PHONE NUMBER & EMAIL ENTERED
            const cleanPhone = contactValue.replace(/\D/g, '');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
        // A5. RE-ENABLE BUTTON ON VALIDATION FAILURE
            if (nameValue.length < 3) {
                alert("Please enter a valid name.");
                orderName.classList.add("input-error");
                resetButton(submitBtn, originalBtnText);
                return;
            }
             if (cleanPhone.length < 10) {
                alert("Please enter a valid 10-digit phone number.");
                orderPhone.classList.add("input-error");   
                // Re-enable button on validation failure
                resetButton(submitBtn, originalBtnText);
                return;
            }
            // Better email validation
            if (!emailPattern.test(emailValue)) {
                alert("Please enter a valid email address.");
                orderEmail.classList.add("input-error");
                // Re-enable button on validation failure
                resetButton(submitBtn, originalBtnText);
                return;
            }

            setButtonLoading(submitBtn);
            
            // VALIDATION PASSED - SHOW SUCCESS
            alert(`Thank you, ${nameValue}! Your order has been placed.`);
            // 4. RESET BORDERS
            orderName.classList.remove("input-error");
            orderPhone.classList.remove("input-error");
            orderEmail.classList.remove("input-error");

            // 5. CLEAR CART
            cartData = [];
            localStorage.setItem('perScholasTeaCart', JSON.stringify(cartData));
            localStorage.removeItem('perScholasTeaCartTimestamp');
            renderCart();
            // 6. RESET FORM
            orderForm.reset();
                resetButton(submitBtn, originalBtnText);
        });
    }
}); 