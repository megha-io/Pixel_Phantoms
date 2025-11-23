document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const feedbackMsg = document.getElementById('form-feedback');
    const submitBtn = document.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerHTML;

    // Form elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    const charCounter = document.querySelector('.char-counter');

    // Error message elements
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    // Validation patterns and limits
    const validationRules = {
        name: {
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s'-]+$/,
            errorMessages: {
                required: 'Name is required',
                minLength: 'Name must be at least 2 characters',
                maxLength: 'Name must be less than 50 characters',
                pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes'
            }
        },
        email: {
            pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            errorMessages: {
                required: 'Email is required',
                pattern: 'Please enter a valid email address'
            }
        },
        message: {
            minLength: 10,
            maxLength: 500,
            errorMessages: {
                required: 'Message is required',
                minLength: 'Message must be at least 10 characters',
                maxLength: 'Message must be less than 500 characters'
            }
        }
    };

    // Input sanitization function
    function sanitizeInput(input) {
        return input.trim().replace(/[<>"'&]/g, (char) => {
            const entityMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return entityMap[char];
        });
    }

    // Show error message function
    function showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
    }

    // Hide error message function
    function hideError(element) {
        element.classList.remove('show');
        setTimeout(() => {
            element.textContent = '';
        }, 300);
    }

    // Validate individual field
    function validateField(input, rules, errorElement) {
        const value = sanitizeInput(input.value);
        const fieldName = input.id;

        // Check if field is empty
        if (!value) {
            showError(errorElement, rules.errorMessages.required);
            input.classList.remove('valid');
            input.classList.add('invalid');
            return false;
        }

        // Check minimum length
        if (rules.minLength && value.length < rules.minLength) {
            showError(errorElement, rules.errorMessages.minLength);
            input.classList.remove('valid');
            input.classList.add('invalid');
            return false;
        }

        // Check maximum length
        if (rules.maxLength && value.length > rules.maxLength) {
            showError(errorElement, rules.errorMessages.maxLength);
            input.classList.remove('valid');
            input.classList.add('invalid');
            return false;
        }

        // Check pattern (for name and email)
        if (rules.pattern && !rules.pattern.test(value)) {
            showError(errorElement, rules.errorMessages.pattern);
            input.classList.remove('valid');
            input.classList.add('invalid');
            return false;
        }

        // If all validations pass
        hideError(errorElement);
        input.classList.remove('invalid');
        input.classList.add('valid');
        return true;
    }

    // Update character counter
    function updateCharCounter() {
        const currentLength = messageInput.value.length;
        const maxLength = validationRules.message.maxLength;
        
        charCount.textContent = currentLength;
        
        // Update counter color based on usage
        charCounter.classList.remove('warning', 'error');
        if (currentLength > maxLength * 0.8) {
            charCounter.classList.add('warning');
        }
        if (currentLength >= maxLength) {
            charCounter.classList.add('error');
        }
    }

    // Debounced validation function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Real-time validation with debouncing
    const debouncedValidateName = debounce(() => {
        validateField(nameInput, validationRules.name, nameError);
    }, 300);

    const debouncedValidateEmail = debounce(() => {
        validateField(emailInput, validationRules.email, emailError);
    }, 300);

    const debouncedValidateMessage = debounce(() => {
        validateField(messageInput, validationRules.message, messageError);
    }, 300);

    // Event listeners for real-time validation
    nameInput.addEventListener('input', debouncedValidateName);
    nameInput.addEventListener('blur', () => validateField(nameInput, validationRules.name, nameError));

    emailInput.addEventListener('input', debouncedValidateEmail);
    emailInput.addEventListener('blur', () => validateField(emailInput, validationRules.email, emailError));

    messageInput.addEventListener('input', () => {
        updateCharCounter();
        debouncedValidateMessage();
    });
    messageInput.addEventListener('blur', () => validateField(messageInput, validationRules.message, messageError));

    // Initialize character counter
    updateCharCounter();

    // Form submission handler
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate all fields before submission
            const isNameValid = validateField(nameInput, validationRules.name, nameError);
            const isEmailValid = validateField(emailInput, validationRules.email, emailError);
            const isMessageValid = validateField(messageInput, validationRules.message, messageError);

            // If any field is invalid, stop submission
            if (!isNameValid || !isEmailValid || !isMessageValid) {
                feedbackMsg.textContent = '❌ Please fix the errors above before submitting.';
                feedbackMsg.className = 'feedback-message error';
                return;
            }

            // Check for whitespace-only submissions
            const sanitizedName = sanitizeInput(nameInput.value);
            const sanitizedEmail = sanitizeInput(emailInput.value);
            const sanitizedMessage = sanitizeInput(messageInput.value);

            if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
                feedbackMsg.textContent = '❌ Please provide valid content in all fields.';
                feedbackMsg.className = 'feedback-message error';
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin spinner"></i> Sending...';
            feedbackMsg.className = 'feedback-message';

            // Simulate API call with error handling
            setTimeout(() => {
                try {
                    // Simulate random success/failure for demo (90% success rate)
                    const isSuccess = Math.random() > 0.1;
                    
                    if (isSuccess) {
                        // Success state
                        feedbackMsg.textContent = "✅ Message sent successfully! We'll get back to you soon.";
                        feedbackMsg.className = 'feedback-message success';
                        
                        // Reset form and validation states
                        contactForm.reset();
                        updateCharCounter();
                        
                        // Clear validation classes
                        [nameInput, emailInput, messageInput].forEach(input => {
                            input.classList.remove('valid', 'invalid');
                        });
                        
                        // Hide all error messages
                        [nameError, emailError, messageError].forEach(hideError);
                        
                    } else {
                        // Simulate network error
                        throw new Error('Network error');
                    }
                    
                } catch (error) {
                    // Error state
                    feedbackMsg.textContent = '❌ Failed to send message. Please try again later.';
                    feedbackMsg.className = 'feedback-message error';
                }
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;

                // Hide feedback message after 5 seconds
                setTimeout(() => {
                    feedbackMsg.style.opacity = '0';
                    setTimeout(() => {
                        feedbackMsg.className = 'feedback-message';
                        feedbackMsg.style.opacity = '1';
                    }, 300);
                }, 5000);

            }, 1500);
        });
    }
});