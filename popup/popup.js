const repoInput = document.getElementById("repo");
const analyzeBtn = document.getElementById("analyze");
const statusEl = document.getElementById("status");

// Accepts "owner/repo", "github.com/owner/repo", or a full URL (including /tree/main/...).
function parseRepo(input) {
  const value = input.trim();
  if (!value) return null;

  let path = value;
  if (/^https?:\/\//i.test(value) || value.startsWith("github.com")) {
    try {
      const url = new URL(value.startsWith("http") ? value : `https://${value}`);
      if (url.hostname !== "github.com") return null;
      path = url.pathname;
    } catch {
      return null;
    }
  }

  const [owner, repo] = path.split("/").filter(Boolean);
  if (!owner || !repo) return null;

  return { owner, repo: repo.replace(/\.git$/, "") };
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

// On open: if the active tab is a GitHub repo page, prefill the input.
async function detectCurrentRepo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    const parsed = tab.url.includes("github.com") ? parseRepo(tab.url) : null;
    if (parsed) {
      repoInput.value = `${parsed.owner}/${parsed.repo}`;
      setStatus("Detected from current tab.");
    }
  } catch (err) {
    console.error("Could not read active tab:", err);
  }
}

analyzeBtn.addEventListener("click", () => {
  const parsed = parseRepo(repoInput.value);
  if (!parsed) {
    setStatus("Enter a valid repo, e.g. microsoft/vscode", true);
    return;
  }
  setStatus(`Ready to analyze ${parsed.owner}/${parsed.repo} (coming in Step 2)`);
});

detectCurrentRepo();