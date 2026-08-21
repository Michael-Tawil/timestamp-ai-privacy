console.log("TimeStamp AI content script running");

let isEnabled = true;

chrome.storage.sync.get({ enabled: true }, (settings) => {
  isEnabled = settings.enabled;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    isEnabled = changes.enabled.newValue;
    console.log("TimeStamp AI toggled:", isEnabled);
  }
});

function getTimestamp() {
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const date = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return `📅 ${date} · ${time} · ${timezone}`;
}

function getInputBox() {
  return (
    document.querySelector('.ProseMirror#prompt-textarea') ||
    document.querySelector('[data-testid="chat-input"]') ||
    document.querySelector('div.ql-editor[contenteditable="true"]') ||
    document.querySelector('.ProseMirror')
  );
}

function getSendButton() {
  return (
    document.querySelector('[data-testid="send-button"]') ||
    document.querySelector('button[aria-label="Send message"]') ||
    document.querySelector('button.send-button')
  );
}

function injectTimestamp() {
  if (!isEnabled) return;

  const input = getInputBox();
  if (!input) return;

  const original = input.innerText.trim();
  if (!original) return;

  if (original.startsWith("📅")) return;

  const newText = getTimestamp() + "\n\n" + original;

  input.focus();
  document.execCommand("selectAll", false, null);
  document.execCommand("insertText", false, newText);
}

function attachListener() {
  const sendButton = getSendButton();
  if (sendButton && !sendButton._tsAttached) {
    sendButton.addEventListener("click", injectTimestamp, true);
    sendButton._tsAttached = true;
  }

  const input = getInputBox();
  if (input && !input._tsAttached) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        injectTimestamp();
      }
    }, true);
    input._tsAttached = true;
  }
}

const observer = new MutationObserver(() => {
  attachListener();
});

observer.observe(document.body, { childList: true, subtree: true });

attachListener();

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    const input = getInputBox();
    if (input && document.activeElement === input) {
      injectTimestamp();
    }
  }
}, true);