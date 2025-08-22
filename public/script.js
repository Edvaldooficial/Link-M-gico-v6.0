function summarizeToThreeLines(text) {
  if (!text) return "";
  let clean = text.replace(/\s+/g, " ").trim();
  if (clean.length > 260) clean = clean.slice(0, 260) + "...";
  return clean;
}

function navigateToChat() {
  document.getElementById("chat").scrollIntoView({ behavior: "smooth" });
  document.getElementById("chatWindow").classList.remove("hidden");
}

document.getElementById("extractBtn").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value;
  const res = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  document.getElementById("extractedData").textContent = summarizeToThreeLines(
    data.summary || data.description || data.rawText || ""
  );
});

document.getElementById("activate-chatbot").addEventListener("click", navigateToChat);

document.getElementById("sendBtn").addEventListener("click", async () => {
  const message = document.getElementById("chatInput").value;
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML += `<div class="user">Você: ${message}</div>`;
  chatWindow.innerHTML += `<div class="bot">${data.reply}</div>`;
  document.getElementById("chatInput").value = "";
});
