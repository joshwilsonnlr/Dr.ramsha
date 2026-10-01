// Appointment form: validation + AJAX submission to Formspree.
(function () {
  const ENDPOINT = 'https://formspree.io/f/mnpnwdqe';
  const form = document.getElementById('appointment-form');

  if (!form) {
    return;
  }

  const submitButton = document.getElementById('submit-btn');
  const buttonLabel = submitButton ? submitButton.querySelector('.btn-label') : null;
  const statusBox = document.getElementById('form-status');

  let isSubmitting = false;

  // Earliest selectable date is today in local time.
  const dateInput = form.elements.preferred_date;
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Preselect a service from ?service=slug, used by service links.
  const serviceParam = new URLSearchParams(window.location.search).get('service');
  if (serviceParam) {
    const matchingOption = form.querySelector(`#service option[data-key="${CSS.escape(serviceParam)}"]`);
    if (matchingOption) {
      form.elements.service.value = matchingOption.value;
    }
  }

  const validationRules = {
    full_name: (value) => value.trim().length >= 2 || 'Enter your full name.',
    phone: (value) => {
      const digits = value.replace(/\D/g, '');
      return (/^[+\d\s()-]+$/.test(value.trim()) && digits.length >= 10 && digits.length <= 15) || 'Enter a valid phone number, for example 0312 1234567.';
    },
    email: (value) => value.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) || 'Enter a valid email address.',
    service: (value) => value !== '' || 'Choose the service you need.',
    preferred_date: (value) => {
      if (!value) return 'Choose a preferred date.';
      return value >= dateInput.min || 'Choose today or a future date.';
    },
    consent: () => form.elements.consent.checked || 'Please agree to be contacted so we can reply to your request.',
  };

  function setFieldError(field, message) {
    const wrapper = field.closest('.field, .field-check');
    if (!wrapper) {
      return;
    }

    wrapper.querySelectorAll('.field-error').forEach((errorNode) => errorNode.remove());
    field.removeAttribute('aria-describedby');

    if (!message) {
      field.removeAttribute('aria-invalid');
      return;
    }

    const errorId = `${field.id}-error`;
    const errorText = document.createElement('span');
    errorText.className = 'field-error';
    errorText.id = errorId;
    errorText.textContent = message;

    wrapper.appendChild(errorText);
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
  }

  function validateField(fieldName) {
    const field = form.elements[fieldName];
    const rule = validationRules[fieldName];
    const rawValue = field.type === 'checkbox' ? '' : field.value;
    const result = rule(rawValue);

    setFieldError(field, result === true ? '' : result);
    return result === true;
  }

  function validateAllFields() {
    let firstInvalidField = null;

    Object.keys(validationRules).forEach((fieldName) => {
      if (!validateField(fieldName) && !firstInvalidField) {
        firstInvalidField = form.elements[fieldName];
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    return !firstInvalidField;
  }

  Object.keys(validationRules).forEach((fieldName) => {
    const field = form.elements[fieldName];

    field.addEventListener('blur', () => {
      if (field.value || field.type === 'checkbox') {
        validateField(fieldName);
      }
    });

    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid')) {
        validateField(fieldName);
      }
    });

    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid')) {
        validateField(fieldName);
      }
    });
  });

  function showStatus(type, title, text) {
    if (!statusBox) {
      return;
    }

    statusBox.hidden = false;
    statusBox.className = `form-status ${type}`;
    statusBox.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const paragraph = document.createElement('p');
    paragraph.textContent = text;

    statusBox.append(heading, paragraph);
    statusBox.focus();
  }

  function setLoadingState(isLoading) {
    isSubmitting = isLoading;

    if (submitButton) {
      submitButton.classList.toggle('is-loading', isLoading);
      submitButton.setAttribute('aria-disabled', String(isLoading));
      submitButton.setAttribute('aria-busy', String(isLoading));
    }

    if (buttonLabel) {
      buttonLabel.textContent = isLoading ? 'Sending...' : 'Request an Appointment';
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (statusBox) {
      statusBox.hidden = true;
    }

    if (!validateAllFields()) {
      return;
    }

    setLoadingState(true);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Formspree responded with ${response.status}`);
      }

      form.reset();
      showStatus(
        'success',
        'Appointment Request Sent!',
        'Thank you for contacting Dr. Ramsha Ramzan. Your appointment request has been received. We will contact you to confirm the appointment.'
      );
    } catch (error) {
      showStatus(
        'error',
        'Something went wrong.',
        'Your request could not be submitted. Please try again or contact us directly by phone or WhatsApp.'
      );
    } finally {
      setLoadingState(false);
    }
  });
})();

