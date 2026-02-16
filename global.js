
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    

    const yearSpan = document.getElementById('currentYear');
    const birthDateInput = document.getElementById('birthDate');
    const visitDateInput = document.getElementById('visitDate');

    const now = new Date();
    const today = now.toLocaleDateString('en-CA');

    // Get the current year and display it
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Set max date for birth date input
    if (birthDateInput) {
        // Set max to today's date
        birthDateInput.setAttribute('max', today);
    }

    // Set max date for feedback visit date
    if (visitDateInput) {
        visitDateInput.setAttribute('max', today);
    }

    // Phone number validation and auto-formatting
    // Get ALL phone input
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    phoneInputs.forEach(phoneInput => {
        // 1. INPUT EVENT Format as they type AND clear errors immediately
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);

            if (this.classList.contains('input-error')) {
                this.classList.remove('input-error');
                this.setCustomValidity('');
            }
        });

        // 2. BLUR EVENT
        phoneInput.addEventListener('blur', function() {
            validatePhoneNumber(this, false);
        });
    });

/**
 * GENERIC FORM SUBMISSION HANDLER
 * @param {HTMLFormElement} form - The form element
 * @param {Function} customValidation - Optional custom validation function
 * @param {Function} getSuccessMessage - Function that returns success message
 */

    function handleFormSubmit(form, customValidation, getSuccessMessage) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            let isValid = true;

            // Run custom validation when provided 
            if (customValidation && !customValidation(form)) {
                isValid = false;
            }

            // Validate ALL phone inputs
            const phoneInput = form.querySelector('input[type="tel"]');
            if (phoneInput && !validatePhoneNumber(phoneInput, true)) {
                isValid = false;
            }

            // Proceed ONLY when ALL Validations PASSES
            if (!isValid) {
                return;
            }

            // Show Success Message
            const msgContainer = document.getElementById('form-message-container');
            msgContainer.innerHTML = '';
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = getSuccessMessage(form);
            msgContainer.appendChild(successDiv);

            // Reset Form after a delay
            setTimeout(() => {
                form.reset();
                msgContainer.innerHTML = '';
                if (phoneInput) {
                    phoneInput.classList.remove('input-error');
                    phoneInput.setCustomValidity('');
                }
            }, 3000); 
        });
    }

    // Form Submission: promoForm
    const promoForm = document.getElementById('promoForm');
    if (promoForm) {
        handleFormSubmit(
            promoForm,
            null, // no custom validation
            (form) => {
                const name = form.querySelector('#promoFName').value;
                const email = form.querySelector('#promoEmail').value;
                return `Thanks ${name}! You'll receive emails at ${email}.`;
            }
        );
    }


    // Form Submisssion: rewardsForm
    const rewardsForm = document.getElementById('rewardsForm');
    if (rewardsForm) {
        handleFormSubmit(
            rewardsForm,

            // Custom Password Validation
            (form) => {
                const password = form.querySelector('#dePassword');
                const confirmPassword = form.querySelector('#rePassword');

                // Clears Error on input (sets up listener first time validation runs)
                if (!confirmPassword.dataset.listenerAdded) {
                    confirmPassword.addEventListener('input', function() {
                        if (this.validity.customError) {
                            this.setCustomValidity('');
                        }
                    });
                     confirmPassword.dataset.listenerAdded = 'true';
                }

                // Check if passwords match
                if (password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity("Passwords do not match");
                    confirmPassword.reportValidity();

                    // ERROR CLEARS on ANY input
                    return false;
                }

                return true;

            },
            (form) => {
                const name = form.querySelector('#rewardsFName').value;
                const email = form.querySelector('#rewardsEmail').value;
                return `Welcome to the Club ${name}! We've sent a confirmation to ${email}.`;
            }
        )
    }


    // contactForm Submission Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        handleFormSubmit(
            contactForm,
            null, // no custom validation
            (form) => {
                const name = form.querySelector('#contactName').value;
                const email = form.querySelector('#contactEmail').value;
                return `Thanks ${name}! We'll be in touch at ${email} shortly.`;
            }
        );
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
    const oldValue = input.value;
    const oldLength = oldValue.length;

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
    const newLength = formatted.length;
    const lengthDiff = newLength - oldLength;
    let newCursorPos = cursorPosition + lengthDiff;

    if (newCursorPos > 0 && formatted[newCursorPos - 1] === ')') {
        newCursorPos += 1; // to skip past the ')'
    }
    if (newCursorPos > 0 && formatted[newCursorPos - 1] === ' ' ) {
        newCursorPos += 1;
    }
    
    input.setSelectionRange(newCursorPos, newCursorPos);
}

/** 
 * Validates that phone number has exactly 10 digits
 * @param {HTMLInputElement} input - The phone input element
 * @param {boolean} showPopup - Whether to trigger the browser's error bubble immediately
 * @returns {boolean} True if valid, false otherwise
 */

function validatePhoneNumber(input, showPopup = true) {
    if (!input) return false;

    const value = input.value.trim();
    const digitsOnly = value.replace(/\D/g, '');

    // Case 1: Valid (10 digits)
    if (digitsOnly.length === 10) {
        input.setCustomValidity(''); // Clear any error
        input.classList.remove('input-error'); // Remove red border
        return true;
    } 

    // Case 2: Empty or Invalid characters (Let HTML 'required' handle this on submit, don't error on blur)
    else if (digitsOnly.length === 0) {
        // If invalid characters entered
        if (input.value.trim().length > 0) {
            input.setCustomValidity('Please enter a valid 10-digit phone number.');
            input.classList.add('input-error');
            if (showPopup) input.reportValidity();
            return false;
        }

        // If empty, clear custom errors & rely on the HTML 'required' attribute.
        // We explicitly clear custom validity so the browser's native "Required" error can show.
        input.setCustomValidity('');
        input.classList.remove('input-error');

        // Return false if field is required and empty 
        return !input.hasAttribute('required');
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
};