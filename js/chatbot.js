/* Basic clinic chat assistant for Dr. Ramsha Ramzan — FAQ only, no external AI */
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
  var busy = false;

  function setOpen(open) {
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    if (open) {
      if (!greeted) {
        greeted = true;
        addBot(
          "Assalam o Alaikum! I am the clinic assistant for <strong>Dr. Ramsha Ramzan</strong>, DPT in Bahawalpur. Ask about hours, services, location, or booking."
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
    if (panel.contains(e.target) || fab === e.target || fab.contains(e.target)) return;
    if (e.target && e.target.closest && e.target.closest("#chat-panel, #chat-widget, .chat-chip, .chat-quick")) return;
    setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) setOpen(false);
  });

  function addBot(html) {
    var row = document.createElement("div");
    row.className = "chat-msg chat-msg-bot";
    row.innerHTML = '<div class="chat-bubble">' + html + "</div>";
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

  function showTyping() {
    var typing = document.createElement("div");
    typing.className = "chat-msg chat-msg-bot chat-typing";
    typing.id = "chat-typing-row";
    typing.innerHTML =
      '<div class="chat-bubble"><span class="chat-dot"></span><span class="chat-dot"></span><span class="chat-dot"></span></div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var t = document.getElementById("chat-typing-row");
    if (t) t.remove();
  }

  function replyFor(raw) {
    var q = (raw || "").toLowerCase().trim();

    if (/assalam|salam|hello|hi\b|hey|aoa|good (morning|evening|afternoon)/.test(q)) {
      return {
        text: "Wa Alaikum Assalam! How can I help you today?",
        chips: ["Clinic hours", "Services", "Location", "Book appointment"]
      };
    }
    if (/hour|timing|time|open|close|kab|schedule|evening/.test(q)) {
      return {
        text: "Clinic hours are <strong>Monday to Saturday, 5:00 PM – 9:00 PM</strong> at Moeen Medicare, Satellite Town, Bahawalpur.",
        chips: ["Location", "Book appointment", "WhatsApp"]
      };
    }
    if (/location|address|where|place|clinic|hospital|satellite|bahawalpur|map/.test(q)) {
      return {
        text: "Dr. Ramsha practices at <strong>Moeen Medicare and Infertility Hospital</strong>, Satellite Town, Bahawalpur, Punjab.",
        chips: ["Clinic hours", "Call", "WhatsApp"]
      };
    }
    if (/book|appoint|visit|consult|slot|available|reserve/.test(q)) {
      return {
        text:
          "You can book in these ways:<br>• <a href=\"contact.html#book\">Online appointment form</a><br>" +
          "• WhatsApp: <a href=\"https://wa.me/923127114451\" target=\"_blank\" rel=\"noopener\">0312-7114451</a><br>" +
          "• Call: <a href=\"tel:+923127114451\">0312-7114451</a>",
        chips: ["WhatsApp", "Services", "Clinic hours"]
      };
    }
    if (/whatsapp|wa\b|message/.test(q)) {
      return {
        text: "WhatsApp: <a href=\"https://wa.me/923127114451?text=Assalam%20o%20Alaikum\" target=\"_blank\" rel=\"noopener\"><strong>0312-7114451</strong></a>",
        chips: ["Book appointment", "Clinic hours"]
      };
    }
    if (/call|phone|number|contact|mobile/.test(q)) {
      return {
        text:
          "Phone: <a href=\"tel:+923127114451\"><strong>0312-7114451</strong></a><br>" +
          "WhatsApp: <a href=\"https://wa.me/923127114451\" target=\"_blank\" rel=\"noopener\">0312-7114451</a><br>" +
          "Email: <a href=\"mailto:ramshaaramzan@gmail.com\">ramshaaramzan@gmail.com</a>",
        chips: ["Book appointment", "Location"]
      };
    }
    if (/service|treat|pain|back|neck|knee|shoulder|sport|injur|rehab|physio|therapy|posture|joint|sciatica|stroke/.test(q)) {
      return {
        text:
          "Services include back &amp; neck pain, joint rehab, sports injuries, post-surgical rehab, neurological rehab, and posture care. " +
          "<a href=\"services.html\">View all services →</a>",
        chips: ["Book appointment", "Clinic hours", "About doctor"]
      };
    }
    if (/about|doctor|ramsha|who|dpt|education|experience|qualif/.test(q)) {
      return {
        text:
          "<strong>Dr. Ramsha Ramzan</strong> is a Doctor of Physical Therapy (DPT) and NeuroMusculoSkeletal specialist in Bahawalpur. " +
          "<a href=\"about.html\">Read full profile →</a>",
        chips: ["Services", "Book appointment", "Location"]
      };
    }
    if (/fee|price|cost|charges|kitna|payment/.test(q)) {
      return {
        text: "Fees depend on the treatment plan. Please ask on WhatsApp or phone: <a href=\"https://wa.me/923127114451\" target=\"_blank\" rel=\"noopener\">0312-7114451</a>.",
        chips: ["WhatsApp", "Book appointment"]
      };
    }
    if (/facebook|tiktok|social|follow|instagram/.test(q)) {
      return {
        text:
          "Follow Dr. Ramsha:<br>" +
          "• <a href=\"https://www.facebook.com/ramsha.ramzan.2025\" target=\"_blank\" rel=\"noopener\">Facebook</a><br>" +
          "• <a href=\"https://www.tiktok.com/@drramsharramzan\" target=\"_blank\" rel=\"noopener\">TikTok</a>",
        chips: ["Book appointment", "Clinic hours"]
      };
    }
    if (/thank|shukriya|jazak/.test(q)) {
      return { text: "You are welcome! Anything else I can help with?", chips: ["Book appointment", "Services"] };
    }
    if (/bye|allah hafiz|goodbye|khuda/.test(q)) {
      return { text: "Allah Hafiz! Take care.", chips: ["Book appointment"] };
    }

    return {
      text:
        "I can help with <strong>clinic hours, services, location, and booking</strong>. " +
        "For medical advice, please book a consultation or message on WhatsApp.",
      chips: ["Clinic hours", "Services", "Location", "Book appointment", "WhatsApp"]
    };
  }

  function handleUser(text) {
    if (busy) return;
    clearQuick();
    addUser(text);

    var lower = text.toLowerCase().trim();
    if (lower === "whatsapp") {
      window.open(
        "https://wa.me/923127114451?text=Assalam%20o%20Alaikum%2C%20I%20would%20like%20to%20enquire%20about%20physiotherapy.",
        "_blank",
        "noopener"
      );
    }
    if (lower === "call") {
      window.location.href = "tel:+923127114451";
    }
    if (lower === "book online") {
      window.location.href = "contact.html#book";
    }

    busy = true;
    showTyping();
    setTimeout(function () {
      hideTyping();
      var res = replyFor(text);
      addBot(res.text);
      if (res.chips && res.chips.length) addQuickReplies(res.chips);
      busy = false;
    }, 350 + Math.min(250, text.length * 5));
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
