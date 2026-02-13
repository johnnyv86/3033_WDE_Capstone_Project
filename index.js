
// Wait for DOM to load
// Get the current year and display it
document.addEventListener('DOMContentLoaded', function() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        // Set max to today's date
        const today = new Date().toISOString().split('T')[0];
        birthDateInput.setAttribute('max', today);
    }
});

document.addEventListener('DOMContentLoaded', function() {


    // Get the current year and display it
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Phone number validation and auto-formatting
    const phoneInput = document.getElementById('contactNumber');
    if (phoneInput) {
        // Format as user types
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });   
        // Validate when user leaves the field
        phoneInput.addEventListener('blur', function() {
            validatePhoneNumber(this);
        });
    }
    // Form submission handler
    const promoForm = document.getElementById('promoForm');
    if (promoForm) {
        promoForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent form from actually submitting
                // Validate phone number before submitting
                if (phoneInput && !validatePhoneNumber(phoneInput)) {
                    return; // Exit if validation fails
                }
                // Success Message after submit 
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.textContent = 'Form submitted successfully!';
                this.insertAdjacentElement('beforebegin', successMsg);
                // Clear form after delay
                setTimeout(() => {
                    this.reset();
                    successMsg.remove();
                }, 3000);
            });
    }
    // Clear button confirmation
    const clearBtn = document.getElementById('clearFormBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(event) {
                if (!confirm('Are you sure you want to clear all form data?')) 
                    {
                        event.preventDefault(); // Cancel the reset if user clicks "Cancel"
                    }
                });
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
// ===== HELPER FUNCTIONS =====
/**  
 * Auto-formats phone number to (XXX) XXX-XXXX as user types
 * @param {HTMLInputElement} input - The phone input element 
 */
function formatPhoneNumber(input) {
    // Get only digits
    let value = input.value.replace(/\D/g, '');
    // Limit to 10 digits
    value = value.substring(0, 10);
    // Format based on length
    let formatted = '';
    if (value.length === 0) {
        formatted = '';
    } else if (value.length <= 3) {
        // Show just digits until area code complete
        formatted = value;
    } else if (value.length <= 6) {
        // Format: (XXX) XXX
        formatted = '(' + value.substring(0, 3) + ') ' + value.substring(3);
    } else {
        // Format: (XXX) XXX-XXX
        formatted = '(' + value.substring(0, 3) + ') ' + value.substring(3,6) + '-' + value.substring(6);
    }
    // Update the input value
    input.value = formatted;
}
/** 
 * Validates that phone number has exactly 10 digits
 * @param {HTMLInputElement} input - The phone input element
 * @returns {boolean} True if valid, false otherwise
 */
function validatePhoneNumber(input) {
    const value = input.value.trim();
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
        input.setCustomValidity(''); // Clear any error
        return true;
    } else if (digitsOnly.length === 0) {
        input.setCustomValidity('Phone number is required.');
        input.reportValidity();
        return false;
    } else {
        input.setCustomValidity(`Phone number must be 10 digits. You entered ${digitsOnly.length}.`);
        input.reportValidity();
        return false;
    }
}