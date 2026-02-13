
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Get the current year and display it
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Set max date for birth date input

    
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        // Set max to today's date
        const now = new Date();
        const today = now.toLocaleDateString('en-CA');
        birthDateInput.setAttribute('max', today);
    }


    // Phone number validation and auto-formatting
    const phoneInput = document.getElementById('contactNumber');
    if (phoneInput) {
        // 1. INPUT EVENT: Format as they type AND clear errors immediately
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);

            // If the user is typing, assume they are fixing number.
            // Remove the ugly red border immediately
            if (this.classList.contains('input-error')) {
                this.classList.remove('input-error');
                this.setCustomValidity('');
            }
        });   

        // 2. BLUR EVENT: Validate quietly when user leaves the field (Red border only, no popup)
        phoneInput.addEventListener('blur', function() {
            // Pass 'false' to say "Don't show the popup bubble yet"
            validatePhoneNumber(this, false);
        });
    }

    // Form submission handler
    const promoForm = document.getElementById('promoForm');
    if (promoForm) {
        promoForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form from actually submitting
            
            // Validate phone number before submitting: if error bubble appears
            if (phoneInput && !validatePhoneNumber(phoneInput, true)) {
                phoneInput.focus(); // Draw attention to the problem field

                return; // Exit if validation fails

            }

            // Success Message after submit 
            // Get the container
            const msgContainer = document.getElementById('form-message-container');

            // Set the content
            const email = document.getElementById('promoEmail').value;
            msgContainer.innerHTML = `<div class="success-message">Thank you! You'll receive emails at ${email}</div>`;
     
            
            // Clear form after delay
            setTimeout(() => {
                promoForm.reset();
                msgContainer.innerHTML = ''; //Clears the message
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
});
// ===== HELPER FUNCTIONS =====
/**  
 * Auto-formats phone number to (XXX) XXX-XXXX as user types
 * @param {HTMLInputElement} input - The phone input element 
 */
function formatPhoneNumber(input) {

    // 1. Save cursor position
    const cursorPosition = input.selectionStart;
    const oldLength = input.value.length;

    // Remove non-digits
    let value = input.value.replace(/\D/g, '');

    // Remove leading '1' if entered by user
    if (value.length > 10 && value.startsWith('1')) {
        value = value.substring(1);
    }
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
        // Format: (XXX) XXX-XXXX
        formatted = '(' + value.substring(0, 3) + ') ' + value.substring(3,6) + '-' + value.substring(6);
    }
    // Update the input value
    input.value = formatted;

    // 2. Restore cursor position 
    const newLength = input.value.length;
    input.setSelectionRange(cursorPosition + (newLength - oldLength), cursorPosition + (newLength - oldLength));
}
/** 
 * Validates that phone number has exactly 10 digits
 * @param {HTMLInputElement} input - The phone input element
 * @param {boolean} showPopup - Whether to trigger the browser's error bubble immediately
 * @returns {boolean} True if valid, false otherwise
 */
function validatePhoneNumber(input, showPopup = true) {
    const value = input.value.trim();
    const digitsOnly = value.replace(/\D/g, '');

    // Case 1: Valid (10 digits)
    if (digitsOnly.length === 10) {
        input.setCustomValidity(''); // Clear any error
        input.classList.remove('input-error'); // Remove red border
        return true;
    } 
    // Case 2: Empty (Let HTML 'required' handle this on submit, don't error on blur)
    else if (digitsOnly.length === 0) {
        // If it's empty, we rely on the HTML 'required' attribute.
        // We explicitly clear custom validity so the browser's native "Required" error can show.
        input.setCustomValidity('');
        input.classList.remove('input-error');
        return true;
    } 
    // Case 3: Invalid (Wrong length)
    else {
        // Set the error message for the browser to know
        input.setCustomValidity(`Phone number must be 10 digits. You entered ${digitsOnly.length}.`);

        // Add visual red border defined in CSS
        input.classList.add('input-error');

        // Shows annoying popup bubble only when explicitly asked for (e.g., on Submit)
        if (showPopup) {
            input.reportValidity();
        }
        
        return false;
    }
}