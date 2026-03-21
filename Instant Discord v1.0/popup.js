const senderInput = document.getElementById('sender-name-input');
const webhookList = document.getElementById('webhook-list');
const addBtn      = document.getElementById('add-webhook');
const saveBtn     = document.getElementById('save-btn');
const saveStatus  = document.getElementById('save-status');

const DELETE_SVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M11.5 3.5l-.7 7.7a1 1 0 0 1-1 .8H4.2a1 1 0 0 1-1-.8L2.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7 6.5v3M5.5 6.5l.2 3M8.5 6.5l-.2 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}

function showStatus(msg, type) {
  saveStatus.textContent = msg;
  saveStatus.className = 'save-status visible ' + type;
  setTimeout(() => {
    saveStatus.textContent = '';
    saveStatus.className = 'save-status';
  }, 2500);
}

// ── Render webhook rows ───────────────────────────────────────────────────────

function renderWebhooks(webhooks) {
  webhookList.innerHTML = '';
  if (!webhooks.length) webhooks = [{ name: '', url: '' }];
  webhooks.forEach(wh => addRow(wh.name, wh.url));
}

function addRow(name = '', url = '') {
  const card = document.createElement('div');
  card.className = 'channel-card';


  card.innerHTML = `
    <div class="channel-row1">
      <input type="text" class="text-input webhook-name-input"
        placeholder="Discord channel name" value="${escHtml(name)}" />
      <button class="delete-btn" title="Remove channel">${DELETE_SVG}</button>
    </div>
    <input type="text" class="text-input webhook-url-input"
      placeholder="Discord webhook URL" value="${escHtml(url)}" spellcheck="false"/>
  `;

  // No clear buttons — inputs are plain

  // Delete card
  card.querySelector('.delete-btn').addEventListener('click', () => {
    card.remove();
    if (!webhookList.querySelectorAll('.channel-card').length) addRow();
  });

  // Block YouTube shortcuts
  card.querySelectorAll('input').forEach(el => {
    ['keydown','keypress','keyup'].forEach(ev =>
      el.addEventListener(ev, e => e.stopPropagation())
    );
  });

  webhookList.appendChild(card);
}

function collectWebhooks() {
  return [...webhookList.querySelectorAll('.channel-card')].map(card => ({
    name: card.querySelector('.webhook-name-input').value.trim(),
    url:  card.querySelector('.webhook-url-input').value.trim(),
  })).filter(wh => wh.url);
}

// ── Load ──────────────────────────────────────────────────────────────────────

chrome.storage.sync.get({ senderName: '', discordWebhooks: [] }, (data) => {
  senderInput.value = data.senderName || '';
  renderWebhooks(data.discordWebhooks.length ? data.discordWebhooks : []);
});

// ── Events ────────────────────────────────────────────────────────────────────

['keydown','keypress','keyup'].forEach(ev =>
  senderInput.addEventListener(ev, e => e.stopPropagation())
);

senderInput.addEventListener('input', () => {
  if (senderInput.value.trim()) senderInput.style.borderColor = '#313339';
});
senderInput.addEventListener('blur', () => {
  senderInput.style.borderColor = senderInput.value.trim() ? '#313339' : '#ff4d50';
});

addBtn.addEventListener('click', () => addRow());

saveBtn.addEventListener('click', () => {
  const senderName = senderInput.value.trim();
  const webhooks   = collectWebhooks();

  if (!senderName) {
    senderInput.style.borderColor = '#ff4d50';
    showStatus('⚠ Your name is required', 'err');
    senderInput.focus();
    return;
  }

  for (const wh of webhooks) {
    if (wh.url && !wh.url.startsWith('https://discord.com/api/webhooks/')) {
      showStatus(`⚠ Invalid webhook URL${wh.name ? ' for "' + wh.name + '"' : ''}`, 'err');
      return;
    }
  }

  chrome.storage.sync.set({ senderName, discordWebhooks: webhooks }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', senderName, webhooks }, () => {
        void chrome.runtime.lastError;
      });
    });
    showStatus('✓ Saved!', 'ok');
  });
});
