document.addEventListener("DOMContentLoaded", () => {
// CONSTANT VARIABLE
    const TOPPING_PRICE = 0.50;
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
// DRINK BUILDER & CART SECTION LOGIC
    const selectedDetails = document.getElementById("selectedDrinkDetails");
    const addToCartBtn = document.getElementById("addToCartBtn");
    const cartList = document.getElementById("cartItems");
    const cartEmptyMsg = document.getElementById("cartEmptyMsg");
    const cartTotalEl = document.getElementById("cartTotal");
    let cartData = [];
    try {
        const stored = localStorage.getItem('perScholasTeaCart');
        if (stored) {
            const parsed = JSON.parse(stored);
            const timestamp = localStorage.getItem('perScholasTeaCartTimestamp');
            const hourInMs = 3600000;
            if (timestamp && Date.now() - parseInt(timestamp) > hourInMs * 24) {
                localStorage.removeItem('perScholasTeaCart');
                localStorage.removeItem('perScholasTeaCartTimestamp');
                cartData = [];
            } else {
                cartData = parsed;
            }
        }
    } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        // Clear Corrupted data from LocalStorage
        localStorage.removeItem('perScholasTeaCart');
        cartData = [];
    }
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
// HELPER: RENDER CART & SAVE TO STORAGE
    function renderCart() {
        cartList.innerHTML = "";
        let runningTotal = 0;
    // 1. CREATE DocumentFragment
        const fragment = document.createDocumentFragment();
        cartData.forEach((item, index) => {
            const li = document.createElement("li");
            const toppingsString = item.toppings.length > 0
                ? ` + ${item.toppings.join(", ")}`
                : "";
            li.textContent = `${index + 1}. ${item.name}, ${item.size}, ${item.sweetness}, ${toppingsString} - $${item.price.toFixed(2)}`;
            li.classList.add("cart-items");
    // 2. APPEND to FRAGMENT instead of cartList
            fragment.appendChild(li);
            runningTotal += item.price;
        });
    // 3. APPEND FRAGMENT to the DOM
        cartList.appendChild(fragment);
    // 4. UPDATE TOTAL TEXT
        cartTotalEl.textContent = `Total: $${runningTotal.toFixed(2)}`;
    // 5. TOGGLE EMPTY MESSAGE
        if (cartData.length === 0) {
            if (cartEmptyMsg) cartEmptyMsg.style.display = "block";
        } else {
            if (cartEmptyMsg) cartEmptyMsg.style.display = "none";
        }
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
// DRINK SELECTION LISTENER
    selectButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const drinkCard = btn.closest(".teaDes");
            const drinkName = btn.dataset.name;
        // REMOVE `$` Character BEFORE PARSING
            const priceValue = parseFloat(btn.dataset.price);
    
        // RESET LOGIC TO DEFAULT
            currentBasePrice = priceValue;
            currentSizePrice = 0;
            currentSizeName = "Small";
            currentSweetness = "0%";
            currentToppings = [];
        // RESET BUTTON FOR NEW SELECTION
            addToCartBtn.textContent = "Add to Cart";
        // RESET VISUAL
            sizeRows.forEach(row => row.classList.remove("active"));
            sweetnessCards.forEach(card => card.classList.remove("active"));
            toppingItems.forEach(item => item.classList.remove("active"));
        // SET INITIAL SELECTION OBJECT
            currentSelection = { name: drinkName, price: currentBasePrice };
        // HELPER FUNCTION TO UPDATE TEXT
            updateDisplay();
            addToCartBtn.disabled = false;
        // HIGHLIGHT DRINK CARD
            document
                .querySelectorAll(".teaDes")
                .forEach((card) => card.classList.remove("selectedDrink"));
            drinkCard.classList.add("selectedDrink");
        // SCROLL LOGIC TO DRINK SIZE AFTER SELECT CLICKED
            const sizeSection = document.getElementById("order-size");
            if (sizeSection) {
                sizeSection.scrollIntoView({ behavior: "smooth" });
            } else {
                console.error("ID 'order-size' not found in HTML");
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
        item.addEventListener("click", () => {
            if (!currentSelection) {
                alert("Please select a drink first!");
                return;
            }
    // VISUAL UPDATE: TOGGLE ACTIVE CLASS
            item.classList.toggle("active");
    // GET TOPPING NAME FROM <h4> TAG
            const toppingName = item.querySelector("h4").textContent;

    // GET SPECIFIC PRICE OF THIS TOPPING
            const toppingPrice = parseFloat(item.querySelector(".selectToppingBtn").dataset.price);

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
    // CREATE STRING "($0.75) or EMPTY if FREE"
            const costTotal = currentSizePrice > 0
                ? `(+$${currentSizePrice.toFixed(2)})`
                : "";
            const toppingsText = currentToppings.length > 0
                ? currentToppings.map(t => `${t.name} (+$${t.price.toFixed(2)})`).join(", ") 
                : "None";

            selectedDetails.innerHTML = `
                <p><strong>Drink:</strong> ${currentSelection.name}</p>
                <p><strong>Size:</strong> ${currentSizeName} ${costTotal}</p>
                <p><strong>Sweetness:</strong> ${currentSweetness}</p>
                <p><strong>Toppings:</strong> ${toppingsText}</p>
                <p><strong>Total:</strong> $${currentSelection.price.toFixed(2)}</p>
            `;
        }
    }
    // ADD TO CART LISTENER
    addToCartBtn.addEventListener("click", () => {
    // MODE ONE: ADD ANOTHER DRINK!    
        if (!currentSelection) {
            const drinkSection = document.getElementById("drinkFilters");
            if (drinkSection) {
                drinkSection.scrollIntoView({ behavior: "smooth" });
            }
            return;
        }
    // MODE TWO: CREATE CART ITEM
    // 1. CREATE DATA OBJECT FOR NEW ITEM
        const newItem = {
            name: currentSelection.name,
            size: currentSizeName,
            sweetness: currentSweetness,
            toppings: currentToppings.map(t => t.name),
            price: currentSelection.price
        };
    // 2. ADD ITEM TO MASTER DATA LIST
        cartData.push(newItem);
    // 3. SAVE & UPDATE SCREEN
        localStorage.setItem('perScholasTeaCart', JSON.stringify(cartData));

       
        localStorage.setItem('perScholasTeaCartTimestamp', Date.now().toString());
        

        renderCart();

    // 4. SCROLL LOGIC - SCROLL BACK TO DRINK FILTER
        addToCartBtn.textContent = "Add another drink!";
 
    // 5. RESET ALL PREVIOUS SELECTED ITEMS
        currentSelection = null;
        currentBasePrice = 0;
        currentSizePrice = 0;
        currentSizeName = "Small";
        currentSweetness = "0%";
        currentToppings = [];
    // 6. RESET ALL VISUAL 
        document.querySelectorAll(".teaDes").forEach(card => {
            card.classList.remove("selectedDrink");
        });
        sizeRows.forEach(row => row.classList.remove("active"));
        sweetnessCards.forEach(card => card.classList.remove("active"));
        toppingItems.forEach(item => item.classList.remove("active"));
    // 7. RESET SELECTION SUMMARY DISPLAY
        selectedDetails.innerHTML = `
            <p style="color: var(--color-primary); font-weight: bold;">Drink added to cart!</p>
            <p>Select another drink below.</p>`;
        });
// CLEAR SELECTION SUMMARY SECTION LISTENER
    const clearBtn = document.getElementById("clearSelectionBtn");
   
    clearBtn.addEventListener("click", () => {
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

        // 5. SCROLL LOGIC: SCROLL BACK TO TOP - DRINK FILTER SECTION
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
    
        // 3c. UPDATE USER INTERFACE & STROAGE
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
    console.log('Filter buttons:', document.querySelectorAll("#drinkFilters .filterBtn"));
console.log('Drink groups:', document.querySelectorAll("section[data-type]"))
