# ⚡ Instant Discord

> Share any YouTube video or Short to your Discord channels — without ever leaving YouTube.

![Version](https://img.shields.io/badge/version-1.0-5865F2?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Chrome-yellow?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## The Problem

YouTube's native share button has never played well with Discord. Every time I wanted to send a video to my friends, I had to:

1. Copy the URL
2. Switch tabs to Discord
3. Find the right channel
4. Paste and type a message

All while the video sat there paused. It completely broke the flow.

**Instant Discord fixes that.** Hover over the video, click the button, and it's in your Discord channel in seconds — no pausing, no tab switching, no friction.

---

## Features

- **One-click sharing** — hover over any YouTube video or Short to reveal the share button
- **YouTube Shorts support** — the share button appears in the Shorts action bar
- **Custom message** — add a message before sending
- **Timestamp support** — share from a specific moment using "Use Current" or type it manually (e.g. `2:30`)
- **Multiple channels** — configure multiple Discord webhook channels and choose which one to share to
- **Video thumbnail** — the shared message includes the video thumbnail automatically
- **Sender name** — personalize messages with your name as a prefix
- **Responsive UI** — the compose panel adapts on smaller viewports

---

## Installation

### From Chrome Web Store *(recommended)*
Search for **Instant Discord** on the Chrome Web Store and click **Add to Chrome**.

### Manual (Developer Mode)
1. Download and unzip the extension folder
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the unzipped `Instant Discord` folder

---

## Setup

### Step 1 — Get a Discord Webhook URL
1. Open Discord and go to the channel you want to share videos to
2. Right-click the channel → **Edit Channel**
3. Go to **Integrations** → **Webhooks** → **New Webhook**
4. Give it a name and click **Copy Webhook URL**

### Step 2 — Configure the Extension
1. Click the ⚡ **Instant Discord** icon in your Chrome toolbar
2. Enter your **name** (shown as a prefix in Discord messages)
3. Paste your **webhook URL** and give the channel a name
4. Add more channels with **+ Add Channel** if needed
5. Click **Save**
<img width="471" height="664" alt="image" src="https://github.com/user-attachments/assets/444b3e8b-f9cd-497e-91f8-d17f83f04926" />

### Step 3 — Share
1. Go to any YouTube video or Short
2. Hover over the player — the ⚡ button appears
3. Click it to open the compose panel
4. Optionally add a message, select a channel, or set a start timestamp
5. Hit **Send It!**
<img width="517" height="703" alt="image" src="https://github.com/user-attachments/assets/8591c390-8006-4047-ab9e-8b529546fdac" />

---

## How It Works

```
User hovers over YouTube player
        ↓
⚡ Instant Discord button appears (bottom-right)
        ↓
User clicks → Compose panel opens
        ↓
User fills in message + optional timestamp
        ↓
Clicks "Send It!"
        ↓
Extension posts to Discord webhook:
  • Sender prefix message
  • Rich embed with title, URL, thumbnail
  • Timestamp appended to URL if set (?t=Xs)
```

---

## Message Format

When you send a video, Discord receives:

**Content:**
```
Curtis has sent and said: Bro check this out 🔥
```
*(or "said nothing" if no message is typed)*

**Embed includes:**
- Video title
- Clickable URL (with timestamp if set)
- Video thumbnail
- Footer: *Shared via Instant Discord*

---

## Project Structure

```
Instant Discord/
├── manifest.json      # Extension config, permissions
├── content.js         # Injected into YouTube — share button & compose panel
├── popup.html         # Settings UI markup & styles
├── popup.js           # Settings UI logic
├── icons/
│   ├── logo.svg       # Source logo
│   ├── icon16.png     # Toolbar icon
│   ├── icon48.png     # Extensions page icon
│   └── icon128.png    # Chrome Web Store icon
└── README.md
```

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `activeTab` | Read the current YouTube tab's URL and video title |
| `storage` | Save your name, webhook URLs, and channel names locally |
| `youtube.com` | Inject the share button into the YouTube player |
| `discord.com/api/webhooks/*` | Send the video to your Discord channel via webhook |

No data is collected. Everything is stored locally in your browser.

---

## Privacy

- Your name and webhook URLs are stored **locally** in Chrome's built-in storage
- Nothing is sent to any external server except Discord (via your own webhook)
- No analytics, no tracking, no ads

---

## Responsive Behaviour

| Viewport | What's hidden |
|---|---|
| < 1024px | Message input field |
| < 768px | Message input + Start At timestamp field |
| ≥ 1024px | Full compose panel |

---

## Credits

Coded by **Claude** · Designed by **2korde**

---

## License

MIT — free to use, modify, and distribute.
