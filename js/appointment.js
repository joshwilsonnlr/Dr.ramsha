// Appointment form: validation + AJAX submission to Formspree.
(function () {
  const ENDPOINT = 'https://formspree.io/f/mnpnwdqe';
  const form = document.getElementById('appointment-form');
  if (!form) return;
  const btn = document.getElementById('submit-btn');
  const label = btn.querySelector('.btn-label');
  const status = document.getElementById('form-status');
  let submitting = false;

  // Earliest selectable date is today (local time).
  const dateInput = form.elements.preferred_date;
  const t = new Date();
  dateInput.min = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;

  // Preselect service from ?service=slug (links on the services pages).
  const slug = new URLSearchParams(location.search).get('service');
  if (slug) {
    const opt = form.querySelector(`#service option[data-key="${CSS.escape(slug)}"]`);
    if (opt) form.elements.service.value = opt.value;
  }

  const rules = {
    full_name: v => v.trim().length >= 2 || 'Enter your full name.',
    phone: v => {
      const digits = v.replace(/\D/g, '');
      return (/^[+\d\s()-]+$/.test(v.trim()) && digits.length >= 10 && digits.length <= 15) || 'Enter a valid phone number, for example 0312 1234567.';
    },
    email: v => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address.',
    service: v => v !== '' || 'Choose the service you need.',
    preferred_date: v => {
      if (!v) return 'Choose a preferred date.';
      return v >= dateInput.min || 'Choose today or a future date.';
    },
    consent: () => form.elements.consent.checked || 'Please agree to be contacted so we can reply to your request.'
  };

  function setError(field, msg) {
    const wrap = field.closest('.field, .field-check');
    wrap.querySelectorAll('.field-error').forEach(n => n.remove());
    field.removeAttribute('aria-describedby');
    if (!msg) { field.removeAttribute('aria-invalid'); return; }
    const id = field.id + '-error';
    const span = document.createElement('span');
    span.className = 'field-error'; span.id = id; span.textContent = msg;
    wrap.appendChild(span);
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', id);
  }
  function validateField(name) {
    const field = form.elements[name];
    const result = rules[name](field.type === 'checkbox' ? '' : field.value);
    setError(field, result === true ? '' : result);
    return result === true;
  }
  function validateAll() {
    let first = null;
    Object.keys(rules).forEach(n => { if (!validateField(n) && !first) first = form.elements[n]; });
    if (first) first.focus();
    return !first;
  }
  Object.keys(rules).forEach(n => {
    const f = form.elements[n];
    f.addEventListener('blur', () => { if (f.value || f.type === 'checkbox') validateField(n); });
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid')) validateField(n); });
    f.addEventListener('change', () => { if (f.getAttribute('aria-invalid')) validateField(n); });
  });

  function showStatus(type, title, text) {
    status.hidden = false;
    status.className = 'form-status ' + type;
    status.innerHTML = '';
    const h = document.createElement('h3'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = text;
    status.append(h, p);
    status.focus();
  }
  function setLoading(on) {
    submitting = on;
    btn.classList.toggle('is-loading', on);
    btn.setAttribute('aria-disabled', String(on));
    btn.setAttribute('aria-busy', String(on));
    label.textContent = on ? 'Sending...' : 'Request an Appointment';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submitting) return;               // blocks double submission
    status.hidden = true;
    if (!validateAll()) return;
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('Formspree responded ' + res.status);
      form.reset();                       // reset only after success
      showStatus('success', 'Appointment Request Sent!', 'Thank you for contacting Dr. Ramsha Ramzan. Your appointment request has been received. We will contact you to confirm the appointment.');
    } catch (err) {
      // Entered values stay in place so the patient can retry.
      showStatus('error', 'Something went wrong.', 'Your request could not be submitted. Please try again or contact us directly by phone or WhatsApp.');
    } finally {
      setLoading(false);
    }
  });
})();
