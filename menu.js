// Wait for DOM to load - all initialization happens here
document.addEventListener('DOMContentLoaded', function() {
    // Set copyright year in footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});


// Smooth scrolling for navigation
