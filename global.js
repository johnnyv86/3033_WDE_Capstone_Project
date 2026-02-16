
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


    // promoForm Submission handler
    const promoForm = document.getElementById('promoForm');
    if (promoForm) {
        promoForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form from actually submitting

            //Get phone input specifically inside index form
            const currentPhoneInput = document.getElementById('promoPhone');
            
            // Validate phone number before submitting: if error bubble appears
            if (currentPhoneInput && !validatePhoneNumber(currentPhoneInput, true)) {
                currentPhoneInput.focus(); // Draw attention to the problem field

                return; // Exit if validation fails
            }

            // Success Message after submit 
            // Get the container
            const msgContainer = document.getElementById('form-message-container');

            // Set the content
            const email = document.getElementById('promoEmail').value; 
            const name = document.getElementById('promoFName').value;

            msgContainer.innerHTML = '';
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = `Thanks ${name}! You'll receive emails at ${email}.`;
            msgContainer.appendChild(successDiv);

            
            // Clear form after delay
            setTimeout(() => {
                promoForm.reset();
                msgContainer.innerHTML = ''; //Clears the message


                // Remove error class 
                if (currentPhoneInput) {
                    currentPhoneInput.classList.remove('input-error');
                    currentPhoneInput.setCustomValidity(''); // Clear internal error flags
                }
            }, 3000);
        });
    }

    // rewardsForm Submission FORM HANDLER
    const rewardsForm = document.getElementById('rewardsForm');
    if (rewardsForm) {
        rewardsForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Validate password Elements
            const name = document.getElementById('rewardsFName').value;
            const email = document.getElementById('rewardsEmail').value;
            const passwordInput = document.getElementById('dePassword');
            const confirmPassword = document.getElementById('rePassword');

            if (passwordInput.value !== confirmPassword.value) { // Checks value of properties

                // CAll methods on the element
                confirmPassword.setCustomValidity("Passwords do not match"); // Set error on confirmation field
                confirmPassword.reportValidity(); // Shows error bubble

                // One time listener: clears error once typing starts
                confirmPassword.addEventListener('input', function() {
                    confirmPassword.setCustomValidity('');
                }, { once: true}); // Auto removes listener after running

                return; // Stops submission
            }

            // Phone number Validation Logic
            const phoneInput = document.getElementById('rewardsPhone');
            if (phoneInput && !validatePhoneNumber(phoneInput, true)) {
                phoneInput.focus();
                return;
            }

            const msgContainer = document.getElementById('form-message-container');

            // Customize the message for the rewards program
            msgContainer.innerHTML = '';
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = `Welcome to the Club ${name}! We've sent a confirmation to ${email}.`;
            msgContainer.appendChild(successDiv);

            setTimeout(() => {
                rewardsForm.reset();
                msgContainer.innerHTML = '';
                if (phoneInput) {
                    phoneInput.classList.remove('input-error');
                    phoneInput.setCustomValidity('');
                }
            }, 3000);
        })
    }

    // contactForm Submission Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Validate Phone Number
            const currentPhoneInput = contactForm.querySelector('input[name="contactNumber"]');
            if (currentPhoneInput && !validatePhoneNumber(currentPhoneInput, true)) {
                currentPhoneInput.focus();
                return;
            }

            // Success Message
            const msgContainer = document.getElementById('form-message-container');
            const name = document.getElementById('contactFName').value;
            const email = document.getElementById('contactEmail').value;

            msgContainer.innerHTML = '';
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = `Thanks ${name}! We'll be in touch at ${email} shortly.`;
            msgContainer.appendChild(successDiv);

            setTimeout(() => {
                contactForm.reset();
                msgContainer.innerHTML = '';
                if (currentPhoneInput) {
                    currentPhoneInput.classList.remove('input-error');
                    currentPhoneInput.setCustomValidity('');
                }
            }, 3000);
        })
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
};