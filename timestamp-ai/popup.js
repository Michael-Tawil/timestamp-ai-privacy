const toggle = document.getElementById("toggleEnabled");
const statusText = document.getElementById("statusText");

chrome.storage.sync.get({ enabled: true }, (settings) => {
  toggle.checked = settings.enabled;
  statusText.textContent = settings.enabled ? "Active" : "Paused";
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ enabled });
  statusText.textContent = enabled ? "Active" : "Paused";
});