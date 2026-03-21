// Instant Discord — YouTube & YouTube Shorts share button
(function () {
  'use strict';

  let webhooks   = [];
  let senderName = '';
  let injected   = false;
  let shortsInjecting = false;

  // Inline SVG logo — avoids chrome.runtime.getURL issues in content scripts
  const LOGO_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#5865F2"/><path d="M27.9384 17.7214C27.8851 17.6056 27.7998 17.5075 27.6925 17.4388C27.5852 17.37 27.4605 17.3334 27.333 17.3334H20.1877L21.313 12.828C21.3487 12.6826 21.3344 12.5294 21.2724 12.3931C21.2105 12.2569 21.1044 12.1454 20.9714 12.0767C20.8383 12.008 20.686 11.9861 20.539 12.0146C20.392 12.043 20.2589 12.1201 20.161 12.2334L12.161 21.5667C12.0783 21.6635 12.0249 21.7819 12.0074 21.908C11.9898 22.0341 12.0087 22.1626 12.0618 22.2783C12.115 22.394 12.2002 22.4921 12.3073 22.5609C12.4144 22.6298 12.539 22.6665 12.6664 22.6667H19.8117L18.6864 27.172C18.6501 27.3177 18.6641 27.4713 18.7261 27.608C18.788 27.7447 18.8943 27.8566 19.0277 27.9254C19.1219 27.9747 19.2267 28.0004 19.333 28C19.4291 27.9998 19.524 27.9789 19.6112 27.9386C19.6984 27.8984 19.7759 27.8397 19.8384 27.7667L27.8384 18.4334C27.9213 18.3367 27.9748 18.2182 27.9926 18.092C28.0103 17.9658 27.9915 17.8372 27.9384 17.7214Z" fill="white"/></svg>`;

  // Smaller version for the compose panel header (24px)
  const LOGO_SM  = `<svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#5865F2"/><path d="M27.9384 17.7214C27.8851 17.6056 27.7998 17.5075 27.6925 17.4388C27.5852 17.37 27.4605 17.3334 27.333 17.3334H20.1877L21.313 12.828C21.3487 12.6826 21.3344 12.5294 21.2724 12.3931C21.2105 12.2569 21.1044 12.1454 20.9714 12.0767C20.8383 12.008 20.686 11.9861 20.539 12.0146C20.392 12.043 20.2589 12.1201 20.161 12.2334L12.161 21.5667C12.0783 21.6635 12.0249 21.7819 12.0074 21.908C11.9898 22.0341 12.0087 22.1626 12.0618 22.2783C12.115 22.394 12.2002 22.4921 12.3073 22.5609C12.4144 22.6298 12.539 22.6665 12.6664 22.6667H19.8117L18.6864 27.172C18.6501 27.3177 18.6641 27.4713 18.7261 27.608C18.788 27.7447 18.8943 27.8566 19.0277 27.9254C19.1219 27.9747 19.2267 28.0004 19.333 28C19.4291 27.9998 19.524 27.9789 19.6112 27.9386C19.6984 27.8984 19.7759 27.8397 19.8384 27.7667L27.8384 18.4334C27.9213 18.3367 27.9748 18.2182 27.9926 18.092C28.0103 17.9658 27.9915 17.8372 27.9384 17.7214Z" fill="white"/></svg>`;

  // Shorts button — 48px circular
  const LOGO_CIRCLE = `<svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="20" fill="#5865F2"/><path d="M27.9384 17.7214C27.8851 17.6056 27.7998 17.5075 27.6925 17.4388C27.5852 17.37 27.4605 17.3334 27.333 17.3334H20.1877L21.313 12.828C21.3487 12.6826 21.3344 12.5294 21.2724 12.3931C21.2105 12.2569 21.1044 12.1454 20.9714 12.0767C20.8383 12.008 20.686 11.9861 20.539 12.0146C20.392 12.043 20.2589 12.1201 20.161 12.2334L12.161 21.5667C12.0783 21.6635 12.0249 21.7819 12.0074 21.908C11.9898 22.0341 12.0087 22.1626 12.0618 22.2783C12.115 22.394 12.2002 22.4921 12.3073 22.5609C12.4144 22.6298 12.539 22.6665 12.6664 22.6667H19.8117L18.6864 27.172C18.6501 27.3177 18.6641 27.4713 18.7261 27.608C18.788 27.7447 18.8943 27.8566 19.0277 27.9254C19.1219 27.9747 19.2267 28.0004 19.333 28C19.4291 27.9998 19.524 27.9789 19.6112 27.9386C19.6984 27.8984 19.7759 27.8397 19.8384 27.7667L27.8384 18.4334C27.9213 18.3367 27.9748 18.2182 27.9926 18.092C28.0103 17.9658 27.9915 17.8372 27.9384 17.7214Z" fill="white"/></svg>`;

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function isShorts() { return location.pathname.startsWith('/shorts/'); }

  function getShortsId() {
    const m = location.pathname.match(/^\/shorts\/([^/?]+)/);
    return m ? m[1] : null;
  }

  function getPlayer()       { return document.getElementById('movie_player'); }
  function getVideo()        { return document.querySelector('video.html5-main-video'); }
  function getShareButton()  { return document.getElementById('cellar-discord-btn'); }
  function getComposePanel() { return document.getElementById('cellar-compose-panel'); }

  function getShortsActionBar() {
    return document.querySelector('ytd-reel-video-renderer[is-active] #actions')
        || document.querySelector('#actions.ytd-reel-player-overlay-renderer')
        || document.querySelector('ytd-shorts #actions');
  }

  function parseTimestamp(str) {
    const s = str.trim();
    if (!s) return null;
    const parts = s.split(':').map(Number);
    if (parts.some(isNaN)) return null;
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }

  function formatTimestamp(secs) {
    secs = Math.floor(secs);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function buildVideoUrl(seconds) {
    const base = location.href.split('&t=')[0].split('?t=')[0];
    if (!seconds || seconds <= 0) return base;
    const url = new URL(base);
    url.searchParams.set('t', seconds + 's');
    return url.toString();
  }

  function getVideoId() {
    // Regular video: ?v=VIDEO_ID
    const params = new URLSearchParams(location.search);
    if (params.get('v')) return params.get('v');
    // Shorts: /shorts/VIDEO_ID
    const m = location.pathname.match(/^\/shorts\/([^/?]+)/);
    return m ? m[1] : null;
  }

  function getThumbnailUrl() {
    const id = getVideoId();
    if (!id) return null;
    // maxresdefault is the highest quality; falls back to hqdefault if unavailable
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  }

  function updateShareButtonVisibility() {
    const btn = getShareButton();
    if (!btn) return;
    btn.style.display = webhooks.length ? 'flex' : 'none';
  }

  function refreshChannelDropdown() {
    const panel = getComposePanel();
    if (!panel) return;
    const row = panel.querySelector('#cellar-channel-row');
    const sel = panel.querySelector('#cellar-channel-select');
    if (!sel || !row) return;
    row.style.display = webhooks.length >= 2 ? 'flex' : 'none';
    const cur = sel.value;
    sel.innerHTML = webhooks.map((wh, i) =>
      `<option value="${i}">${wh.name || 'Channel ' + (i + 1)}</option>`
    ).join('');
    if (webhooks[cur]) sel.value = cur;
  }

  // ── Regular video ─────────────────────────────────────────────────────────────

  function tryInitRegular() {
    if (injected) return;
    const player = getPlayer();
    if (!player) return;
    injected = true;
    injectPlayerButton(player);
  }

  function injectPlayerButton(player) {
    if (getShareButton()) { updateShareButtonVisibility(); return; }

    const btn = document.createElement('button');
    btn.id = 'cellar-discord-btn';
    btn.title = 'Instant Discord';
    // Logo only — no text
    btn.innerHTML = LOGO_SVG;
    btn.style.cssText = `
      position:absolute;bottom:80px;right:16px;z-index:2147483646;
      display:flex;align-items:center;justify-content:center;
      width:40px;height:40px;
      background:none;border:none;border-radius:8px;
      cursor:pointer;opacity:0;
      transition:opacity 0.2s,transform 0.15s,filter 0.15s;
      transform:translateY(4px);pointer-events:none;
      box-shadow:0 4px 16px rgba(0,0,0,0.5);
      padding:0;
    `;
    btn.addEventListener('mouseenter', () => { btn.style.filter = 'brightness(1.15)'; btn.style.transform = 'scale(1.06)'; });
    btn.addEventListener('mouseleave', () => { btn.style.filter = ''; btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleComposePanel(); });

    player.addEventListener('mouseenter', () => showPlayerBtn(true));
    player.addEventListener('mouseleave', (e) => {
      if (getComposePanel()?.contains(e.relatedTarget)) return;
      showPlayerBtn(false);
    });

    player.appendChild(btn);
    buildComposePanel(player, false);
    updateShareButtonVisibility();
  }

  function showPlayerBtn(visible) {
    const btn = getShareButton();
    if (!btn || !webhooks.length) return;
    btn.style.opacity       = visible ? '1' : '0';
    btn.style.transform     = visible ? 'scale(1)' : 'translateY(4px)';
    btn.style.pointerEvents = visible ? 'auto' : 'none';
  }

  // ── Shorts ────────────────────────────────────────────────────────────────────

  function tryInitShorts() {
    if (shortsInjecting) return;
    const bar = getShortsActionBar();
    if (!bar) return;
    if (bar.querySelector('#cellar-discord-btn')) return;

    shortsInjecting = true;
    document.querySelectorAll('#cellar-shorts-wrapper').forEach(el => el.remove());
    document.getElementById('cellar-compose-panel')?.remove();

    injectShortsButton(bar);
    shortsInjecting = false;
  }

  function injectShortsButton(bar) {
    const wrapper = document.createElement('div');
    wrapper.id = 'cellar-shorts-wrapper';
    wrapper.style.cssText = `
      display:flex;flex-direction:column;align-items:center;gap:4px;margin-top:8px;
    `;

    const btn = document.createElement('button');
    btn.id = 'cellar-discord-btn';
    btn.title = 'Instant Discord';
    btn.innerHTML = LOGO_CIRCLE;
    btn.style.cssText = `
      display:flex;align-items:center;justify-content:center;
      width:48px;height:48px;border-radius:50%;
      background:none;border:none;cursor:pointer;padding:0;
      transition:transform 0.15s,filter 0.15s;
      box-shadow:0 4px 12px rgba(0,0,0,0.4);flex-shrink:0;
    `;
    btn.addEventListener('mouseenter', () => { btn.style.filter = 'brightness(1.15)'; btn.style.transform = 'scale(1.08)'; });
    btn.addEventListener('mouseleave', () => { btn.style.filter = ''; btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleComposePanel(); });

    wrapper.appendChild(btn);
    bar.appendChild(wrapper);

    buildComposePanel(wrapper, true);
    updateShareButtonVisibility();
  }

  // ── Compose panel ─────────────────────────────────────────────────────────────

  function buildComposePanel(anchor, isShortMode) {
    if (getComposePanel()) return;

    const panel = document.createElement('div');
    panel.id = 'cellar-compose-panel';

    const posStyle = isShortMode ? 'bottom:0;right:70px;' : 'bottom:130px;right:16px;';
    panel.style.cssText = `
      position:absolute;${posStyle}z-index:2147483647;
      width:300px;
      background:#1e2022;border:1px solid #333030;border-radius:12px;
      font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
      display:none;flex-direction:column;overflow:hidden;
    `;

    const CHEVRON_DOWN = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#7e838a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const CLOSE_ICON   = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="#7e838a" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    const TIME_ICON    = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3.5l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;

    const inputStyle = `
      width:100%;background:#1e2022;border:1px solid #313339;border-radius:6px;
      padding:8px;font-size:12px;font-weight:500;color:#e3e5e8;
      font-family:inherit;outline:none;transition:border-color 0.15s;box-sizing:border-box;
    `;

    const labelStyle = `
      font-size:10px;font-weight:600;color:#b2b3c2;
      text-transform:uppercase;letter-spacing:0.6px;
    `;

    const tsSection = isShortMode ? '' : `
      <div id="cellar-ts-section" style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px;">
        <div style="${labelStyle}">
          Start at <span style="font-size:10px;font-weight:500;color:#6a6b76;text-transform:none;letter-spacing:0.16px;">(optional)</span>
        </div>
        <div style="display:flex;gap:8px;align-items:stretch;">
          <input id="cellar-timestamp-input" type="text" placeholder="e.g. 2:30" maxlength="9"
            style="${inputStyle}flex:1;min-width:0;height:32px;" />
          <button id="cellar-timestamp-current" style="
            flex:1;min-width:0;height:32px;box-sizing:border-box;
            background:#272b2e;border:1px solid #444751;border-radius:6px;
            color:#95999e;font-size:12px;font-weight:700;font-family:inherit;
            cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;
            transition:all 0.15s;white-space:nowrap;padding:0 8px;
          ">${TIME_ICON} Use Current</button>
        </div>
        <div id="cellar-timestamp-preview" style="font-size:11px;color:#5865f2;"></div>
      </div>
    `;

    panel.innerHTML = `
      <!-- Header -->
      <div style="background:#313339;padding:12px 16px;display:flex;align-items:center;gap:10px;">
        ${LOGO_SM}
        <div style="flex:1;min-width:0;display:flex;align-items:baseline;gap:6px;">
          <span style="font-size:12px;font-weight:700;font-style:italic;color:#fff;white-space:nowrap;">Instant Discord</span>
          <span style="font-size:11px;color:#abacb9;">v1.0</span>
        </div>
        <button id="cellar-compose-close" style="background:none;border:none;cursor:pointer;padding:0;display:flex;color:#7e838a;transition:color 0.15s;">
          ${CLOSE_ICON}
        </button>
      </div>

      <!-- Content -->
      <div style="padding:16px;display:flex;flex-direction:column;">

        <!-- Channel dropdown (hidden when 1 webhook) -->
        <div id="cellar-channel-row" style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px;">
          <div style="${labelStyle}">Channel</div>
          <div style="position:relative;">
            <select id="cellar-channel-select" style="
              width:100%;background:#282b2d;border:1px solid #313339;border-radius:6px;
              padding:8px 32px 8px 8px;color:#e3e5e8;font-size:12px;font-weight:500;
              font-family:inherit;cursor:pointer;appearance:none;-webkit-appearance:none;
              outline:none;height:32px;transition:border-color 0.15s;box-sizing:border-box;
            "></select>
            <span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;">${CHEVRON_DOWN}</span>
          </div>
        </div>

        <!-- Message (hidden on viewports < 1024px) -->
        <div id="cellar-msg-section" style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px;">
          <div style="${labelStyle}">
            Message <span style="font-size:10px;font-weight:500;color:#6a6b76;text-transform:none;letter-spacing:0.16px;">(optional)</span>
          </div>
          <textarea id="cellar-compose-message" placeholder="Add a message to your bros..."
            style="${inputStyle}height:60px;resize:vertical;display:block;"></textarea>
        </div>

        ${tsSection}

        <!-- Send -->
        <button id="cellar-compose-send" style="
          width:100%;padding:8px;background:#5865f2;color:#fff;border:none;
          border-radius:6px;font-size:12px;font-weight:700;font-family:inherit;
          cursor:pointer;transition:background 0.15s;
        ">Send It!</button>

        <!-- Status — collapses when empty -->
        <div id="cellar-compose-status" style="
          font-size:11px;text-align:center;color:#7e838a;
          max-height:0;overflow:hidden;
          transition:max-height 0.2s ease, padding-top 0.2s ease;
          padding-top:0;margin-top:0;
        "></div>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #333030;padding:12px 36px;text-align:center;font-size:11px;color:#5c5e72;">
        Coded by Claude + Designed by 2korde
      </div>
    `;

    anchor.appendChild(panel);

    // Close
    const closeBtn = panel.querySelector('#cellar-compose-close');
    closeBtn.addEventListener('click', closeComposePanel);
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = '#e3e5e8'; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = '#7e838a'; });

    // Channel select
    const sel = panel.querySelector('#cellar-channel-select');
    sel.addEventListener('focus', () => { sel.style.borderColor = '#5865f2'; });
    sel.addEventListener('blur',  () => { sel.style.borderColor = '#313339'; });

    // Block YouTube shortcuts + focus styles
    panel.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('focus', () => { el.style.borderColor = '#5865f2'; });
      el.addEventListener('blur',  () => { el.style.borderColor = '#313339'; });
      ['keydown','keypress','keyup'].forEach(ev =>
        el.addEventListener(ev, e => e.stopPropagation())
      );
    });

    // Timestamp (regular only)
    if (!isShortMode) {
      const tsInput   = panel.querySelector('#cellar-timestamp-input');
      const tsPreview = panel.querySelector('#cellar-timestamp-preview');
      const tsCurBtn  = panel.querySelector('#cellar-timestamp-current');

      tsInput.addEventListener('input', () => {
        const secs = parseTimestamp(tsInput.value);
        if (!tsInput.value.trim()) {
          tsPreview.textContent = '';
        } else if (secs === null) {
          tsPreview.style.color = '#ff4d50';
          tsPreview.textContent = 'Invalid — use m:ss or h:mm:ss';
        } else {
          tsPreview.style.color = '#5865f2';
          tsPreview.textContent = `→ ?t=${secs}s  (${formatTimestamp(secs)})`;
        }
      });

      tsCurBtn.addEventListener('click', () => {
        const video = getVideo();
        if (!video) return;
        const secs = Math.floor(video.currentTime);
        tsInput.value = formatTimestamp(secs);
        tsPreview.style.color = '#5865f2';
        tsPreview.textContent = `→ ?t=${secs}s  (${formatTimestamp(secs)})`;
      });
      tsCurBtn.addEventListener('mouseenter', () => { tsCurBtn.style.borderColor = '#5865f2'; tsCurBtn.style.color = '#e3e5e8'; });
      tsCurBtn.addEventListener('mouseleave', () => { tsCurBtn.style.borderColor = '#444751'; tsCurBtn.style.color = '#95999e'; });
    }

    // Send
    const sendBtn = panel.querySelector('#cellar-compose-send');
    sendBtn.addEventListener('click', sendToDiscord);
    sendBtn.addEventListener('mouseenter', () => { sendBtn.style.background = '#4752c4'; });
    sendBtn.addEventListener('mouseleave', () => { sendBtn.style.background = '#5865f2'; });

    // Hide message field <1024px, hide timestamp section <768px
    function applyViewportLayout() {
      const w = window.innerWidth;
      const msgSection = panel.querySelector('#cellar-msg-section');
      const tsSection  = panel.querySelector('#cellar-ts-section');
      if (msgSection) msgSection.style.display = w < 1024 ? 'none' : 'flex';
      if (tsSection)  tsSection.style.display  = w < 768  ? 'none' : 'flex';
    }
    applyViewportLayout();
    window.addEventListener('resize', applyViewportLayout);

    // Keep button visible while panel hovered (regular only)
    if (!isShortMode) {
      panel.addEventListener('mouseenter', () => showPlayerBtn(true));
      panel.addEventListener('mouseleave', (e) => {
        if (!getPlayer()?.contains(e.relatedTarget)) showPlayerBtn(false);
      });
    }

    // Click outside → close
    document.addEventListener('click', (e) => {
      const p = getComposePanel();
      const b = getShareButton();
      if (p && p.style.display !== 'none' && !p.contains(e.target) && !b?.contains(e.target))
        closeComposePanel();
    });
  }

  function toggleComposePanel() {
    const panel = getComposePanel();
    if (!panel) return;
    panel.style.display === 'flex' ? closeComposePanel() : openComposePanel();
  }

  function openComposePanel() {
    const panel = getComposePanel();
    if (!panel) return;
    refreshChannelDropdown();
    panel.style.display = 'flex';
    // Reset status
    const status = panel.querySelector('#cellar-compose-status');
    if (status) { status.textContent = ''; status.style.maxHeight = '0'; }
    setTimeout(() => panel.querySelector('#cellar-compose-message')?.focus(), 50);
  }

  function closeComposePanel() {
    const p = getComposePanel();
    if (p) p.style.display = 'none';
  }

  // ── Send ──────────────────────────────────────────────────────────────────────

  function setStatus(panel, msg, color) {
    const status = panel?.querySelector('#cellar-compose-status');
    if (!status) return;
    status.textContent = msg;
    status.style.color = color;
    status.style.maxHeight  = msg ? '30px' : '0';
    status.style.paddingTop = msg ? '6px'  : '0';
  }

  async function sendToDiscord() {
    const panel   = getComposePanel();
    const sendBtn = panel?.querySelector('#cellar-compose-send');

    const selIdx  = parseInt(panel?.querySelector('#cellar-channel-select')?.value ?? '0', 10);
    const webhook = webhooks[isNaN(selIdx) ? 0 : selIdx];
    if (!webhook?.url) { setStatus(panel, '✗ No webhook configured.', '#ff4d50'); return; }

    const message   = panel?.querySelector('#cellar-compose-message')?.value.trim() || '';
    const tsRaw     = panel?.querySelector('#cellar-timestamp-input')?.value.trim() || '';
    const tsSeconds = parseTimestamp(tsRaw);

    if (tsRaw && tsSeconds === null) { setStatus(panel, '✗ Invalid timestamp format.', '#ff4d50'); return; }

    const title       = document.title.replace(' - YouTube', '').trim();
    const videoUrl    = buildVideoUrl(tsSeconds);
    const tsLabel     = tsSeconds > 0 ? ` *(starting at ${formatTimestamp(tsSeconds)})*` : '';
    const description = `📺 ${videoUrl}${tsLabel}`;

    // Build prefix message using sender name
    const name    = senderName || 'Someone';
    const said    = message
      ? `${name} has sent and said ${message}`
      : `${name} has sent and said nothing`;

    if (sendBtn) { sendBtn.textContent = 'Sending…'; sendBtn.disabled = true; }
    setStatus(panel, '', '');

    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: said,
          embeds: [{
            title, url: videoUrl, description,
            color:  0xFF0000,
            image:  { url: getThumbnailUrl() },
            footer: { text: 'Shared via Instant Discord' },
          }],
        }),
      });

      if (res.ok) {
        setStatus(panel, `✓ Sent to ${webhook.name || 'channel'}!`, '#23a55a');
        if (sendBtn) { sendBtn.innerHTML = 'Send It!'; sendBtn.disabled = false; }
        setTimeout(() => {
          panel.querySelector('#cellar-compose-message').value = '';
          const tsInp = panel.querySelector('#cellar-timestamp-input');
          const tsPrv = panel.querySelector('#cellar-timestamp-preview');
          if (tsInp) tsInp.value = '';
          if (tsPrv) tsPrv.textContent = '';
          closeComposePanel();
        }, 1500);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      setStatus(panel, '✗ Failed. Check webhook URL.', '#ff4d50');
      if (sendBtn) { sendBtn.innerHTML = 'Send It!'; sendBtn.disabled = false; }
      console.error('[InstantDiscord] Send failed:', err);
    }
  }

  // ── Init & SPA navigation ─────────────────────────────────────────────────────

  function tryInit() {
    if (isShorts()) tryInitShorts();
    else             tryInitRegular();
  }

  chrome.storage.sync.get({ senderName: '', discordWebhooks: [] }, (data) => {
    senderName = data.senderName || '';
    webhooks   = data.discordWebhooks || [];
    tryInit();
  });

  let lastHref = location.href;
  const observer = new MutationObserver(() => {
    const href = location.href;
    if (href !== lastHref) {
      lastHref = href;
      if (!isShorts()) {
        injected = false;
        shortsInjecting = false;
        document.getElementById('cellar-discord-btn')?.remove();
        document.getElementById('cellar-compose-panel')?.remove();
      } else {
        shortsInjecting = false;
        document.querySelectorAll('#cellar-shorts-wrapper').forEach(el => el.remove());
        document.getElementById('cellar-compose-panel')?.remove();
      }
    }
    tryInit();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  setTimeout(tryInit, 1000);

  chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
    if (msg?.type === 'SETTINGS_UPDATED') {
      senderName = msg.senderName || '';
      webhooks   = msg.webhooks   || [];
      updateShareButtonVisibility();
      refreshChannelDropdown();
      tryInit();
    }
    return false;
  });
})();
