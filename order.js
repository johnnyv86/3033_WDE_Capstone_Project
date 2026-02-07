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
});