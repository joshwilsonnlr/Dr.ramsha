/* AI-style clinic assistant for Dr. Ramsha Ramzan (rule-based, no API key) */
(function () {
  "use strict";

  var fab = document.getElementById("chat-fab");
  var panel = document.getElementById("chat-panel");
  var closeBtn = document.getElementById("chat-close");
  var messagesEl = document.getElementById("chat-messages");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  if (!fab || !panel || !messagesEl) return;

  var greeted = false;

  function setOpen(open) {
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    if (open) {
      if (!greeted) {
        greeted = true;
        addBot(
          "Assalam o Alaikum! I am the virtual assistant for <strong>Dr. Ramsha Ramzan</strong>, Doctor of Physical Therapy in Bahawalpur. Ask me about services, clinic hours, location, or how to book an appointment."
        );
        addQuickReplies(["Clinic hours", "Services", "Location", "Book appointment"]);
      }
      if (input) setTimeout(function () { input.focus(); }, 200);
    }
  }

  fab.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(panel.hidden);
  });
  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(false);
    });
  }
  document.addEventListener("click", function (e) {
    if (panel.hidden) return;
    // Keep open when click is inside panel or on the FAB
    if (panel.contains(e.target) || fab === e.target || fab.contains(e.target)) return;
    // Ignore clicks on nodes already removed from the panel (e.g. quick-reply chips)
    if (e.target && e.target.closest && e.target.closest("#chat-panel, #chat-widget, .chat-chip, .chat-quick")) return;
    setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) setOpen(false);
  });

  function addBot(text) {
    var row = document.createElement("div");
    row.className = "chat-msg chat-msg-bot";
    row.innerHTML = '<div class="chat-bubble">' + text + "</div>";
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUser(text) {
    var row = document.createElement("div");
    row.className = "chat-msg chat-msg-user";
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addQuickReplies(items) {
    var wrap = document.createElement("div");
    wrap.className = "chat-quick";
    items.forEach(function (label) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-chip";
      btn.textContent = label;
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleUser(label);
      });
      wrap.appendChild(btn);
    });
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function clearQuick() {
    messagesEl.querySelectorAll(".chat-quick").forEach(function (el) {
      el.remove();
    });
  }

  function replyFor(raw) {
    var q = (raw || "").toLowerCase().trim();

    if (!q) {
      return { text: "Please type a question, or choose an option below.", chips: ["Clinic hours", "Services", "Book appointment"] };
    }
    if (/assalam|salam|hello|hi\b|hey|aoa|good (morning|evening|afternoon)/.test(q)) {
      return { text: "Wa Alaikum Assalam! How can I help you today?", chips: ["Clinic hours", "Services", "Location", "Book appointment"] };
    }
    if (/hour|timing|time|open|close|kab|schedule|evening/.test(q)) {
      return { text: "Clinic hours are <strong>Monday to Saturday, 5:00 PM – 9:00 PM</strong>. Evening appointments are available so working patients in Bahawalpur can visit after work.", chips: ["Location", "Book appointment", "WhatsApp"] };
    }
    if (/location|address|where|place|clinic|hospital|satellite|bahawalpur|map/.test(q)) {
      return { text: "Dr. Ramsha practices at <strong>Moeen Medicare and Infertility Hospital</strong>, Satellite Town, Bahawalpur, Punjab. You can call or WhatsApp for directions.", chips: ["Clinic hours", "Call", "WhatsApp"] };
    }
    if (/book|appoint|visit|consult|slot|available|reserve/.test(q)) {
      return { text: "You can request an appointment online, or contact the clinic directly:<br>• <a href=\"contact.html#book\">Book online form</a><br>• WhatsApp: <a href=\"https://wa.me/923127114451\" target=\"_blank\" rel=\"noopener\">0312-7114451</a><br>• Call: <a href=\"tel:+923127114451\">0312-7114451</a>", chips: ["Book online", "WhatsApp", "Services"] };
    }
    if (/whatsapp|wa\b|message/.test(q)) {
      return { text: "You can message Dr. Ramsha on WhatsApp: <a href=\"https://wa.me/923127114451?text=Assalam%20o%20Alaikum%2C%20I%20would%20like%20to%20enquire%20about%20physiotherapy.\" target=\"_blank\" rel=\"noopener\"><strong>0312-7114451</strong></a>", chips: ["Book appointment", "Clinic hours"] };
    }
    if (/call|phone|number|contact|mobile/.test(q)) {
      return { text: "Phone: <a href=\"tel:+923127114451\"><strong>0312-7114451</strong></a><br>WhatsApp: <a href=\"https://wa.me/923127114451\" target=\"_blank\" rel=\"noopener\">0312-7114451</a><br>Email: <a href=\"mailto:ramshaaramzan@gmail.com\">ramshaaramzan@gmail.com</a>", chips: ["Book appointment", "Location"] };
    }
    if (/service|treat|pain|back|neck|knee|shoulder|sport|injur|rehab|physio|therapy|posture|joint|sciatica|stroke/.test(q)) {
      return { text: "Dr. Ramsha provides NeuroMusculoSkeletal physiotherapy, including:<br>• Back &amp; neck pain<br>• Joint pain &amp; rehabilitation<br>• Sports injury rehab<br>• Post-surgical rehabilitation<br>• Neurological rehab<br>• Posture &amp; mobility care<br><a href=\"services.html\">View all services →</a>", chips: ["Book appointment", "Clinic hours", "About doctor"] };
    }
    if (/about|doctor|ramsha|who|dpt|education|experience|qualif/.test(q)) {
      return { text: "<strong>Dr. Ramsha Ramzan</strong> is a Doctor of Physical Therapy (DPT) and NeuroMusculoSkeletal specialist. She trained at Agile Institute of Rehabilitation Sciences, Bahawalpur, and practices at Moeen Medicare, Satellite Town. <a href=\"about.html\">Read full profile →</a>", chips: ["Services", "Book appointment", "Location"] };
    }
    if (/fee|price|cost|charges|kitna|payment/.test(q)) {
      return { text: "Fees depend on the type of consultation and treatment plan. Please contact the clinic on WhatsApp or phone for current charges: <a href=\"https://wa.me/923127114451\" target=\"_blank\" rel=\"noopener\">0312-7114451</a>.", chips: ["WhatsApp", "Book appointment"] };
    }
    if (/thank|shukriya|jazak/.test(q)) {
      return { text: "You are welcome! Feel free to ask if you need anything else about physiotherapy care in Bahawalpur.", chips: ["Book appointment", "Services"] };
    }
    if (/bye|allah hafiz|goodbye|khuda/.test(q)) {
      return { text: "Allah Hafiz! Take care. Contact us anytime for physiotherapy support in Bahawalpur.", chips: ["Book appointment", "WhatsApp"] };
    }
    return { text: "I can help with clinic hours, services, location, and booking. For personal medical advice, please book a consultation or message on WhatsApp.", chips: ["Clinic hours", "Services", "Location", "Book appointment", "WhatsApp"] };
  }

  function handleUser(text) {
    clearQuick();
    addUser(text);
    var lower = text.toLowerCase();
    if (lower === "whatsapp") {
      window.open("https://wa.me/923127114451?text=Assalam%20o%20Alaikum%2C%20I%20would%20like%20to%20enquire%20about%20physiotherapy.", "_blank", "noopener");
    }
    if (lower === "call") {
      window.location.href = "tel:+923127114451";
    }
    if (lower === "book online") {
      window.location.href = "contact.html#book";
    }

    var typing = document.createElement("div");
    typing.className = "chat-msg chat-msg-bot chat-typing";
    typing.innerHTML = '<div class="chat-bubble"><span class="chat-dot"></span><span class="chat-dot"></span><span class="chat-dot"></span></div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    setTimeout(function () {
      typing.remove();
      var res = replyFor(text);
      addBot(res.text);
      if (res.chips && res.chips.length) addQuickReplies(res.chips);
    }, 450 + Math.min(400, text.length * 8));
  }

  if (form && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var val = (input.value || "").trim();
      if (!val) return;
      input.value = "";
      handleUser(val);
    });
  }
})();
