/* Dr. Ramsha AI Clinic Assistant — Gemini AI + smart offline fallback */
(function () {
  "use strict";

  var fab = document.getElementById("chat-fab");
  var panel = document.getElementById("chat-panel");
  var closeBtn = document.getElementById("chat-close");
  var messagesEl = document.getElementById("chat-messages");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  if (!fab || !panel || !messagesEl) return;

  var STORAGE_KEY = "dr_ramsha_gemini_key";
  var history = [];
  var greeted = false;
  var busy = false;

  var SYSTEM =
    "You are the friendly AI assistant for Dr. Ramsha Ramzan, Doctor of Physical Therapy (DPT) in Bahawalpur, Punjab, Pakistan. " +
    "Clinic facts (always accurate): NeuroMusculoSkeletal physiotherapy; workplace Moeen Medicare and Infertility Hospital, Satellite Town, Bahawalpur; " +
    "hours Monday–Saturday 5:00 PM–9:00 PM; phone/WhatsApp 0312-7114451; email ramshaaramzan@gmail.com; " +
    "booking form at contact.html#book; Facebook https://www.facebook.com/ramsha.ramzan.2025 ; TikTok https://www.tiktok.com/@drramsharramzan . " +
    "Services: back & neck pain, joint pain, sports injury rehab, post-surgical rehab, neurological rehab, posture & mobility. " +
    "You may chat about anything the user asks in a helpful, polite way (English or simple Urdu). " +
    "For medical diagnosis or emergency, advise seeing a doctor or calling emergency services — do not diagnose. " +
    "Keep replies concise (2–5 short sentences unless the user asks for detail). Use warm professional tone. " +
    "When relevant, offer to help book (WhatsApp 0312-7114451 or online form).";

  function getKey() {
    try {
      return (localStorage.getItem(STORAGE_KEY) || "").trim();
    } catch (e) {
      return "";
    }
  }

  function setKey(k) {
    try {
      if (k) localStorage.setItem(STORAGE_KEY, k.trim());
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function setOpen(open) {
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    if (open) {
      if (!greeted) {
        greeted = true;
        var mode = getKey()
          ? "Full AI mode is on — ask me anything."
          : "You can ask about the clinic, or enable full AI to chat about anything.";
        addBot(
          "Assalam o Alaikum! I am the AI assistant for <strong>Dr. Ramsha Ramzan</strong>, DPT in Bahawalpur. " + mode
        );
        addQuickReplies(["Clinic hours", "Services", "How to book", "Enable full AI"]);
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
    return typing;
  }

  function hideTyping() {
    var t = document.getElementById("chat-typing-row");
    if (t) t.remove();
  }

  function offlineReply(raw) {
    var q = (raw || "").toLowerCase().trim();

    if (/enable full ai|full ai|api key|gemini|smart mode/.test(q)) {
      return {
        text:
          "To chat about <strong>anything</strong> with real AI:<br>" +
          "1. Open <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener\">Google AI Studio</a> (free)<br>" +
          "2. Create an API key<br>" +
          "3. Type here: <code>set key YOUR_KEY</code><br>" +
          "Your key stays only in this browser (not on our server).",
        chips: ["Clinic hours", "Services", "How to book"]
      };
    }

    if (/^set key\s+/i.test(raw.trim())) {
      var k = raw.trim().replace(/^set key\s+/i, "").trim();
      if (k.length > 20) {
        setKey(k);
        return {
          text: "Full AI is now <strong>enabled</strong>. Ask me anything — health tips, clinic info, general questions, or conversation.",
          chips: ["What can you do?", "Clinic hours", "Tell me a health tip"]
        };
      }
      return { text: "Please paste a valid key after <code>set key</code>.", chips: ["Enable full AI"] };
    }

    if (/^clear key$/i.test(q) || /^remove key$/i.test(q)) {
      setKey("");
      return { text: "API key removed. Clinic FAQ mode is active.", chips: ["Enable full AI", "Services"] };
    }

    if (/assalam|salam|hello|hi\b|hey|aoa|good (morning|evening|afternoon)/.test(q)) {
      return {
        text: "Wa Alaikum Assalam! How can I help you today?",
        chips: ["Clinic hours", "Services", "How to book", "Enable full AI"]
      };
    }
    if (/hour|timing|time|open|close|kab|schedule|evening/.test(q)) {
      return {
        text: "Clinic hours: <strong>Monday to Saturday, 5:00 PM – 9:00 PM</strong> in Bahawalpur.",
        chips: ["Location", "How to book", "WhatsApp"]
      };
    }
    if (/location|address|where|place|clinic|hospital|satellite|bahawalpur|map/.test(q)) {
      return {
        text: "Dr. Ramsha practices at <strong>Moeen Medicare and Infertility Hospital</strong>, Satellite Town, Bahawalpur, Punjab.",
        chips: ["Clinic hours", "Call", "WhatsApp"]
      };
    }
    if (/book|appoint|visit|consult|slot|reserve|how to book/.test(q)) {
      return {
        text:
          "Book in any of these ways:<br>• <a href=\"contact.html#book\">Online appointment form</a><br>" +
          "• WhatsApp <a href=\"https://wa.me/923127114451\" target=\"_blank\" rel=\"noopener\">0312-7114451</a><br>" +
          "• Call <a href=\"tel:+923127114451\">0312-7114451</a>",
        chips: ["WhatsApp", "Services", "Clinic hours"]
      };
    }
    if (/whatsapp|wa\b/.test(q)) {
      return {
        text: "WhatsApp: <a href=\"https://wa.me/923127114451?text=Assalam%20o%20Alaikum\" target=\"_blank\" rel=\"noopener\"><strong>0312-7114451</strong></a>",
        chips: ["How to book", "Clinic hours"]
      };
    }
    if (/call|phone|number|mobile/.test(q)) {
      return {
        text: "Phone: <a href=\"tel:+923127114451\"><strong>0312-7114451</strong></a><br>Email: <a href=\"mailto:ramshaaramzan@gmail.com\">ramshaaramzan@gmail.com</a>",
        chips: ["WhatsApp", "How to book"]
      };
    }
    if (/service|treat|pain|back|neck|knee|shoulder|sport|injur|rehab|physio|therapy|posture|joint|sciatica|stroke/.test(q)) {
      return {
        text:
          "Services include back &amp; neck pain, joint rehab, sports injuries, post-surgical rehab, neurological rehab, and posture care. " +
          "<a href=\"services.html\">Full services page →</a>",
        chips: ["How to book", "About doctor"]
      };
    }
    if (/about|doctor|ramsha|who|dpt|education|experience|qualif/.test(q)) {
      return {
        text:
          "<strong>Dr. Ramsha Ramzan</strong> is a Doctor of Physical Therapy and NeuroMusculoSkeletal specialist in Bahawalpur. " +
          "<a href=\"about.html\">Full profile →</a>",
        chips: ["Services", "How to book"]
      };
    }
    if (/fee|price|cost|charges|kitna|payment/.test(q)) {
      return {
        text: "Fees depend on the treatment plan. Please ask on WhatsApp <a href=\"https://wa.me/923127114451\" target=\"_blank\" rel=\"noopener\">0312-7114451</a> for current charges.",
        chips: ["WhatsApp", "How to book"]
      };
    }
    if (/thank|shukriya|jazak/.test(q)) {
      return { text: "You are welcome! Anything else I can help with?", chips: ["How to book", "Services"] };
    }
    if (/bye|allah hafiz|goodbye|khuda/.test(q)) {
      return { text: "Allah Hafiz! Take care.", chips: ["How to book"] };
    }
    if (/what can you do|help|menu/.test(q)) {
      return {
        text:
          "I can answer clinic questions (hours, location, services, booking). " +
          "For open conversation on any topic, enable full AI with a free Gemini key.",
        chips: ["Enable full AI", "Clinic hours", "Services"]
      };
    }

    return {
      text:
        "I can help with clinic hours, services, location, and booking. " +
        "To chat about <strong>any topic</strong>, reply <strong>Enable full AI</strong> and add a free Google Gemini key (stays in your browser only).",
      chips: ["Enable full AI", "Clinic hours", "Services", "How to book"]
    };
  }

  function callGemini(userText) {
    var key = getKey();
    history.push({ role: "user", parts: [{ text: userText }] });
    if (history.length > 24) history = history.slice(-24);

    var url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      encodeURIComponent(key);

    var body = {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: history,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 512
      }
    };

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg =
            (data && data.error && data.error.message) ||
            "AI request failed (" + res.status + ").";
          throw new Error(msg);
        }
        var text = "";
        try {
          text = data.candidates[0].content.parts
            .map(function (p) {
              return p.text || "";
            })
            .join("");
        } catch (e) {
          text = "";
        }
        if (!text) throw new Error("Empty AI response.");
        history.push({ role: "model", parts: [{ text: text }] });
        return text;
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatAiText(text) {
    var s = escapeHtml(text);
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\n/g, "<br>");
    return s;
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

    if (
      /^set key\s+/i.test(text.trim()) ||
      /^clear key$/i.test(lower) ||
      /^remove key$/i.test(lower) ||
      /enable full ai|full ai|api key/.test(lower)
    ) {
      var offCmd = offlineReply(text);
      showTyping();
      setTimeout(function () {
        hideTyping();
        addBot(offCmd.text);
        if (offCmd.chips) addQuickReplies(offCmd.chips);
      }, 350);
      return;
    }

    var key = getKey();
    if (key) {
      busy = true;
      showTyping();
      callGemini(text)
        .then(function (reply) {
          hideTyping();
          addBot(formatAiText(reply));
          addQuickReplies(["How to book", "Clinic hours", "Services"]);
        })
        .catch(function (err) {
          hideTyping();
          var m = (err && err.message) || "AI error";
          if (/API_KEY|invalid|403|400/i.test(m)) {
            addBot(
              "AI key issue: " +
                escapeHtml(m) +
                "<br>Type <code>clear key</code> then set a new key from <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener\">Google AI Studio</a>."
            );
          } else {
            addBot("AI is temporarily unavailable. " + escapeHtml(m) + "<br>Using clinic FAQ mode for now.");
            var off = offlineReply(text);
            addBot(off.text);
          }
          addQuickReplies(["Enable full AI", "Clinic hours", "How to book"]);
        })
        .finally(function () {
          busy = false;
        });
      return;
    }

    showTyping();
    setTimeout(function () {
      hideTyping();
      var res = offlineReply(text);
      addBot(res.text);
      if (res.chips && res.chips.length) addQuickReplies(res.chips);
    }, 400 + Math.min(300, text.length * 6));
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
