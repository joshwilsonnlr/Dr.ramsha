/**
 * Appointment form handling for Formspree (https://formspree.io/f/xljdkzyd)
 */
(function () {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const buttonLabel = submitButton ? submitButton.querySelector('span') || submitButton : null;
  const statusBox = document.getElementById('form-status');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const dateInput = document.getElementById('date');

  function setMinDate() {
    if (!dateInput) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  function clearFieldErrors() {
    form.querySelectorAll('.field-error').forEach((el) => el.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute('aria-invalid');
    });
  }

  function showFieldError(input, message) {
    if (!input) return;
    input.setAttribute('aria-invalid', 'true');
    const errorText = document.createElement('p');
    errorText.className = 'field-error';
    errorText.textContent = message;
    const field = input.closest('.field') || input.parentElement;
    if (field) field.appendChild(errorText);
  }

  function isValidPhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }

  function isValidEmail(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm() {
    clearFieldErrors();
    let valid = true;

    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach((field) => {
      if (field.type === 'checkbox') {
        if (!field.checked) {
          valid = false;
          showFieldError(field, 'This field is required.');
        }
        return;
      }
      if (!String(field.value || '').trim()) {
        valid = false;
        showFieldError(field, 'This field is required.');
      }
    });

    if (phoneInput && phoneInput.value.trim() && !isValidPhone(phoneInput.value)) {
      valid = false;
      showFieldError(phoneInput, 'Enter a valid phone number.');
    }

    if (emailInput && emailInput.value.trim() && !isValidEmail(emailInput.value)) {
      valid = false;
      showFieldError(emailInput, 'Enter a valid email address.');
    }

    return valid;
  }

  function showStatus(type, title, text) {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.className = `form-status ${type}`;
    statusBox.innerHTML = '';
    statusBox.setAttribute('tabindex', '-1');
    const heading = document.createElement('strong');
    heading.textContent = title;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    statusBox.append(heading, paragraph);
    statusBox.focus();
  }

  function setLoading(isLoading) {
    if (!submitButton) return;
    submitButton.disabled = isLoading;
    submitButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    if (buttonLabel) {
      buttonLabel.textContent = isLoading ? 'Sending...' : 'Request an Appointment';
    } else {
      submitButton.textContent = isLoading ? 'Sending...' : 'Request an Appointment';
    }
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (statusBox) {
      statusBox.hidden = true;
    }
    if (!validateForm()) {
      showStatus('error', 'Please check the form', 'Some required fields need attention.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Formspree responded with ${response.status}`);
      }

      showStatus(
        'success',
        'Request sent',
        'Thank you for contacting Dr. Ramsha Ramzan. Your appointment request has been received. We will contact you by phone or WhatsApp to confirm the time. For urgent queries, message 0312-7114451.'
      );
      form.reset();
      setMinDate();
    } catch (error) {
      showStatus(
        'error',
        'Could not send request',
        'Please try again, or contact us directly on WhatsApp or phone: 0312-7114451.'
      );
    } finally {
      setLoading(false);
    }
  });

  setMinDate();
})();
