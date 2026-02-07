document.addEventListener("DOMContentLoaded", () => {

// CONSTANT VARIABLE
    const TOPPING_PRICE = 0.50;

// DRINK FILTERING LOGIC
    const filterButtons = document.querySelectorAll("#drinkFilters .filterBtn");
    const drinkGroups = document.querySelectorAll("fieldset[data-type");

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const filterValue = btn.dataset.filter;

            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            drinkGroups.forEach((group) => {
                const type = group.dataset.type;

                if (filterValue === "all" || filterValue === type) {
                    group.style.display = "";
                }
                else {
                    group.style.display = "none";
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

    let cartData = JSON.parse(localStorage.getItem("perScholasTeaCart")) ||[];

    let cartTotal = 0;
    let currentSelection = null;
    let currentBasePrice = 0;
    let currentSizePrice = 0;
    let currentSizeName = "Small";
    let currentSweetness = "0%";
    let currentToppings = [];

    const selectButtons = document.querySelectorAll(".teaDes .selectDrinkBtn");
    const sizeRows = document.querySelectorAll(".size-row")
    const sweetnessCards = document.querySelectorAll(".sweetness-card");
    const toppingItems = document.querySelectorAll(".topping-item")


// HELPER: RENDER CART & SAVE TO STORAGE
    function renderCart() {

        localStorage.setItem("perScholasTeaCart", JSON.stringify(cartData));
        cartList.innerHTML = "";
        let runningTotal = 0;

    // 1. CREATE DocumentFragment
        const fragment = document.createDocumentFragment();

        cartData.forEach((item, index) => {
            const li = document.createElement("li");
            const toppingString = item.toppings.length > 0
                ? ` + ${item.toppings.join(", ")}`
                : "";

            li.textContent = `
                ${index + 1}. ${item.name},
                ${item.size},
                ${item.sweetness},
                ${toppingsString} - $${item.price.toFixed(2)}`
            li.classList.add("cart-item")

    // 2. APPEND to FRAGMENT instead of cartList
            fragment.appendChild(li);

            runningTotal += item.price;
        });

    // 3. APPEND FRAGMENT to the DOM
        cartList.appendChild(fragment);

    // 4. UPDATENTOTAL TEXT
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

        const toppingsCost = currentToppings.length * TOPPING_PRICE;
        currentSelection.price = currentBasePrice +currentSizePrice + toppingsCost;
    }


// DRINK SELECTION LISTENER
    selectButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const drinkCard = btn.closest(".teaDes");

            const nameEl = drinkCard.querySelector("teaType");
            const priceEl = drinkCard.querySelector(".price");

            const drinkName = nameEl
                ? nameEl.childNodes[0].textContent.trim()
                : "Unknown Drink";

        // REMOVE `$` Character BEFORE PARSING
            const priceValue = priceEl
                ? parseFloat(priceEl.textContent.replace('$', '').trim())
                : 0;

        // RESET LOGIC TO DEFAULT
            currentBasePrice = priceValue;
            currentSizePrice = 0;
            currentSizeName = "Small";
            currentSweetness = "0%";
            currentToppings = [];

        // RESET BUTTON FOR NEW SELECTION
            addToCartBtn.textContent = "Add to Cart"

        // RESET VISUAL
            sizeRows.forEach(row => row.classList.remove("active"));
            sweetnessCards.forEach(card => card.classList.remove("active"));
            toppingItems.forEach(item.classList.remove("active"));

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
            const sizeSection = document.getElementById("size-section");
            if (sizeSection) {
                sizeSection.scrollIntoView({ behavior: "smooth" });
            } else {
                console.error("ID 'size-section' not found in HTML");
            }
        });
    });
    
// SIZE SELECTION LISTENER [OUTSIDE OF LOOP]
    sizeRows.forEach(row => {
        row.addEventListener("click", () => {
    // MAKE SELECTABLE ONLY AFTER A DRINK IS SELECTED
            if (!currentSelection) {
                alert("Please select a drink first!")
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
            currentSelection.price = currentBasePrice + currentSizePrice;

            updateDisplay();

        // SCROLL LOGIC: SIZE TO SWEETNESS LEVEL
            const sweetnessSection = document.getElementById("sweetness-section");
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
            const toppingSection = document.getElementById("toppings-section");
            if (toppingSection) toppingSection.scrollIntoView({ behavior: "smooth" });
        });
    });


// TOPPING LISTENER
    toppingItems.forEach (item => {
        item.addEventListener("click", () => {
            if (!currentSelection) {
                alert("Please select a drink first!");
                return;
            }

    // VISUAL UPDATE: TOGGLE ACTIVE CLASS
            item.classList.toggle("active");

    // GET TOPPING NAME FROM <h4> TAG
            const toppingName = item.querySelector("h4").textContent;

    // LOGIC - if ACTIVE ADD to array : REMOVE
            if (item.classList.contains("active")) {
                currentToppings.push(toppingName);
            } else {
                currentToppings = currentToppings.filter(t => t !== toppingSection);
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
                ? currentToppings.map(t => `${t} (+$${TOPPING_PRICE.toFixed(2)})`).join(", ")
                : "None";

            selectedDetails.innerHTML = `
                <p><strong>Drink:</strong> ${currentSelection.name}</p>
                <p><strong>Size:</strong> ${currentSizeName} ${costTotal}</p>
                <p><strong>Sweetness:</strong> ${currentSweetness}</p>
                <p><strong>Toppings:</strong> ${toppingsText}</p>
                <p><strong>Total:</strong> ${currentSelection.price.toFixed(2)}</p>
            `;
        }
    }


    addToCartBtn.addEventListener("click", () => {

    // MODE ONE: ADD ANOTHER DRINK!    
        if (!currentSelection) {
            const drinkSelection = document.getElementById("drinkFilters");
            if(drinkSection) {
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
            toppings: [...currentToppings],
            price: currentSelection.price
        };

    // 2. ADD ITEM TO MASTER DATA LIST
        cartData.push(newItemm);


    // 3. SAVE & UPDATE SCREEN
        renderCart();

    // 4. SCROLL LOGIC - SCROLL BACK TO DRINK FILTER
        addToCartBtn.textContent = "Add another drink!";
        addToCartBtn.disabled = true;


    // 5. RESET ALL PREVIOUS SELECTED ITEMS
        currentSelection = null;
        currentBasePrice = 0;
        currentSizePrice = 0;
        currentSizeName = "Small"
        currentSweetness = "0%"
        currentToppings = [];

    // 6. RESET ALL VISUAL 
        document.querySelectorAll(".teaDes").forEach(card => card.classList.remove("active"));
        sizeRows.forEach(row.classList.remove("active"));
        sweetnessCards.forEach(card.classList.remove("active"));
        toppingItems.forEach(item => item.classList.remove("active"));



    // 7. RESET SELECTION SUMMARY DISPLAY
        selectedDetails.innerHTML = `
            <p style="color: #8FB38F; font-weight: bold;">Drink added to cart!</p>
            <p>Select another drink below.</p>`;
        });

// CLEAR SELECTION SUMMARY SECTION LISTENER
    const clearBtn = document.getElementById("clearSelectionBtn")

    clearBtn.addEventListener("click", () => {
    
    // 1. RESET & CLEAR SELECTED DATA 
        currentSelection = null;
        currentBasePrice = 0;
        currentSizePrice = 0;
        currentSizeName = "Small"
        currentSweetness = "0%"
        currentToppings = [];


    // 2. RESET VISUAL DISPLAY
        document.querySelectorAll(".teaDes").forEach(card => card.classList.remove("active"));
        sizeRows.forEach(row => row.classList.remove("active"));
        sweetnessCards.forEach(card = card.classList.remove("active"));
        toppingItems.forEach(item => item.classList.remove("active"));

    // 3. RESET TEXT AND BUTTON FUNCTIONALITY
        selectedDetails.innerHTML = "<p>No drink selected yet.</p>"
        addToCartBtn.textContent = "Add to Cart!";
        addToCartBtn.disabled = true;


    // 4. SCROLL LOGIC: SCROLL BACK TO TOP - DRINK FILTER SECTION
        const drinkSelection = document.getElementById("drinkFilters");
        if (drinkSelection) {
            drinkSelection.scrollIntoView({ behavior: "smooth" });
        }
    });


// CLEAR CART LISTENER
    const clearCartBtn = document.getElementById("clearCartBtn");

    clearCartBtn.addEventListener("click", () => {
    
    // 1. EMPTY DATA ARRAY
        cartData = [];

    // 2. UPDATE USER INTERFACE & STROAGE
        renderCart();

        alert("Cart has been cleared!")
    });

// FROM LISTENER
    const orderForm = document.getElementById("orderForm");
    const orderName = document.getElementById("orderName");
    const orderContact = document.getElementById("orderContact");
    const orderEmail = document.getElementById("orderEmail");

    if(orderForm) {
        orderForm.addEventListener("submit", (event) => {

    // 1. GET CURRENT ORDER FORM VALUES
            const nameValue = orderName.value.trim();
            const contactValue = orderContact.value.trim();
            const emailValue = orderEmail.value.trim();

    // 2. STANDARIZE PHONE NUMBER ENTERED
            const cleanPhone = contactValue.replace(/\D/g, '');

    // 3. DOM VALIDATION LOGIC
            if (nameValue.length < 3) {
                event.preventDefault();
                alert("Please enter a valid name.");
                orderName.style.border = "2px solid red";
                return;
            }

            if (cleanPhone.length < 10) {
                event.preventDefault()
                alert("Please enter a valid 10-digit phone number.");
                orderContact.style.border = "2px solid red";
                return;
            }

            if (!emailValue.includes("@") || emailValue.length < 5) {
                alert("Please enter a valid email address.")
                orderEmail.style.border = "2px solid red";
                return;
            }

            alert(`Thank you, ${nameValue}! Your order has been placed.`);

    // 4. RESET BORDERS
            orderName.style.border = "1px solid #555";
            orderContact.style.border = "1px solid #555";
            orderEmail.style.border = "1px solid #555";


    // 5. CLEAR CART
            const clearCartBtn = document.getElementById("clearCartBtn");
            if(clearCartBtn) clearCartBtn.click();

            orderForm.reset();
            event.preventDefault();
        });
    }
});