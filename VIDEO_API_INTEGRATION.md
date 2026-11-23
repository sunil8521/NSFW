# Streamtape & Vidara Video API Integration & Monetization Guide

This document outlines the complete integration, automated uploading, and on-site player monetization for **Streamtape** and **Vidara** on **DesiHotPic**.

---

## 1. Executive Summary & Research Answers

### Q1: Can we directly play videos on our site instead of redirecting?
**YES, 100%.**
Both Streamtape and Vidara officially support responsive `<iframe>` video embedding.
- **Streamtape Embed:** `https://streamtape.com/e/{file_id}`
  - Supports custom accent colors (e.g. `?color=229,46,46` matches DesiHotPic red).
  - Supports dynamic thumbnails (`?thumb={url}`).
  - Supports standard Player.js controls.
- **Vidara Embed:** `https://vidara.so/e/{filecode}` (or `https://vidara.so/embed/{filecode}`)
  - Responsive HTML5 player with multi-resolution streaming.

### Q2: If we play directly on our site (Embed), do we still EARN money?
**YES.**
Both platforms run dedicated **Publisher / Webmaster Programs** specifically for site embeds:
- When a user on your website clicks "Play" on the embedded player:
  1. The embedded player serves their pre-roll or popunder ad.
  2. When the user watches for ~5 to 10 seconds, it registers as a **valid monetized view** on your account dashboard.
  3. You earn cash according to the viewer's geographic tier (Tier 1 pays highest: $20–$40 / 10k views; Tier 4: $4–$10 / 10k views).
  4. Usually, up to 3 to 4 views per unique IP per 24 hours are counted.

### Q3: Can we scrape the direct .mp4 link and play in a custom `<video>` tag?
> [!CAUTION]
> **DO NOT DO THIS!**
> If you bypass their iframe player and extract raw `.mp4` URLs:
> 1. **You earn $0.00** because no ads are shown.
> 2. **Account Termination**: Streamtape & Vidara will ban your account for hotlinking/bandwidth abuse.
> 3. Direct stream URLs are token-gated and expire after a short time.
>
> **Best Practice:** Keep the embedded `<iframe>` inside an in-page player or modal. Your users stay on `DesiHotPic`, and you earn full ad revenue.

---

## 2. Verified Account Credentials

| Platform | Username / ID | API Key / Password | Status | Base API URL |
| :--- | :--- | :--- | :--- | :--- |
| **Streamtape** | `7bb2a22f2d31ec068241` | `opD18VkagBHJVop` | Verified (Active) | `https://api.streamtape.com` |
| **Vidara** | `saga8521` | `6dae6b41c887a0f27a54424365c50a0b6efcc1aadf4d70c77af4cc2519c2d347` | Verified (Active, Unlimited) | `https://api.vidara.so/v1` |

---

## 3. Streamtape API Reference & Workflow

### 3.1 Direct File Upload (2-Step)
1. **Get Upload URL:**
   ```bash
   GET https://api.streamtape.com/file/ul?login=7bb2a22f2d31ec068241&key=opD18VkagBHJVop
   ```
   **Response:**
   ```json
   {
     "status": 200,
     "msg": "OK",
     "result": {
       "url": "https://tapecontent.net/xfsupload/wg8ad12d3QiJRXG",
       "valid_until": "2026-11-23 05:00:00"
     }
   }
   ```

2. **Upload Video File:**
   ```bash
   curl -F "file1=@/path/to/video.mp4" "https://tapecontent.net/xfsupload/wg8ad12d3QiJRXG"
   ```
   **Response:**
   ```json
   {
     "status": 200,
     "msg": "OK",
     "result": {
       "id": "rbAarvRPXdYbaxY",
       "name": "video.mp4",
       "size": 12345678,
       "url": "https://streamtape.com/v/rbAarvRPXdYbaxY/video.mp4"
     }
   }
   ```

3. **Embed URL for Website:**
   ```html
   <iframe 
     src="https://streamtape.com/e/rbAarvRPXdYbaxY?color=229,46,46" 
     width="100%" 
     height="100%" 
     allowfullscreen 
     frameborder="0">
   </iframe>
   ```

### 3.2 Remote URL Upload (No local disk required)
```bash
curl "https://api.streamtape.com/remotedl/add?login=7bb2a22f2d31ec068241&key=opD18VkagBHJVop&url=https://remote-server.com/sample.mp4&name=DesiVideo.mp4"
```

---

## 4. Vidara API Reference & Workflow

### 4.1 Direct File Upload (2-Step)
1. **Get Upload Server:**
   ```bash
   curl "https://api.vidara.so/v1/upload/server?api_key=6dae6b41c887a0f27a54424365c50a0b6efcc1aadf4d70c77af4cc2519c2d347"
   ```
   **Response:**
   ```json
   {
     "status": 200,
     "msg": "OK",
     "result": {
       "upload_server": "https://s1.vidara.so/api/upload"
     }
   }
   ```

2. **Upload Video File:**
   ```bash
   curl -X POST "https://s1.vidara.so/api/upload" \
     -F "api_key=6dae6b41c887a0f27a54424365c50a0b6efcc1aadf4d70c77af4cc2519c2d347" \
     -F "file=@/path/to/video.mp4"
   ```
   **Response:**
   ```json
   {
     "status": 200,
     "url": "https://vidara.so/v/AbC123xY",
     "title": "video.mp4",
     "filecode": "AbC123xY",
     "video_id": 2494951
   }
   ```

3. **Embed URL for Website:**
   ```html
   <iframe 
     src="https://vidara.so/e/AbC123xY" 
     width="100%" 
     height="100%" 
     allowfullscreen 
     frameborder="0">
   </iframe>
   ```

### 4.2 Remote URL Upload (Direct from Link)
```bash
curl "https://api.vidara.so/v1/upload/url?api_key=6dae6b41c887a0f27a54424365c50a0b6efcc1aadf4d70c77af4cc2519c2d347&url=https://remote-server.com/sample.mp4"
```

---

## 5. Dual-Upload Python Script (`scripts/upload_to_both.py`)

A fully-featured automation script that simultaneously uploads a video to **both** Streamtape and Vidara, returning ready-to-use embed links for DesiHotPic posts:

```python
#!/usr/bin/env python3
"""
Dual Video Uploader for DesiHotPic
Uploads to Streamtape and Vidara simultaneously.
"""

import os
import sys
import requests

# Credentials
STREAMTAPE_LOGIN = "7bb2a22f2d31ec068241"
STREAMTAPE_KEY = "opD18VkagBHJVop"
VIDARA_API_KEY = "6dae6b41c887a0f27a54424365c50a0b6efcc1aadf4d70c77af4cc2519c2d347"


def upload_streamtape(file_path):
    print("[Streamtape] Requesting upload slot...")
    url_res = requests.get(
        "https://api.streamtape.com/file/ul",
        params={"login": STREAMTAPE_LOGIN, "key": STREAMTAPE_KEY},
    ).json()

    if url_res.get("status") != 200:
        raise Exception(f"Streamtape Error: {url_res.get('msg')}")

    upload_url = url_res["result"]["url"]
    print(f"[Streamtape] Uploading to {upload_url}...")

    with open(file_path, "rb") as f:
        res = requests.post(upload_url, files={"file1": f}).json()

    if res.get("status") != 200:
        raise Exception(f"Streamtape Upload Failed: {res.get('msg')}")

    file_id = res["result"]["id"]
    return {
        "provider": "streamtape",
        "label": "Server 1 (Streamtape)",
        "file_id": file_id,
        "watch_url": f"https://streamtape.com/v/{file_id}",
        "embed_url": f"https://streamtape.com/e/{file_id}?color=229,46,46",
    }


def upload_vidara(file_path):
    print("[Vidara] Requesting upload server...")
    srv_res = requests.get(
        "https://api.vidara.so/v1/upload/server",
        params={"api_key": VIDARA_API_KEY},
    ).json()

    if srv_res.get("status") != 200:
        raise Exception(f"Vidara Server Error: {srv_res.get('msg')}")

    upload_server = srv_res["result"]["upload_server"]
    print(f"[Vidara] Uploading to {upload_server}...")

    with open(file_path, "rb") as f:
        res = requests.post(
            upload_server,
            data={"api_key": VIDARA_API_KEY},
            files={"file": f},
        ).json()

    filecode = res.get("filecode")
    if not filecode:
        raise Exception(f"Vidara Upload Failed: {res}")

    return {
        "provider": "vidara",
        "label": "Server 2 (Vidara)",
        "filecode": filecode,
        "watch_url": f"https://vidara.so/v/{filecode}",
        "embed_url": f"https://vidara.so/e/{filecode}",
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 upload_to_both.py <path_to_video.mp4>")
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        sys.exit(1)

    print(f"Uploading '{file_path}' ({os.path.getsize(file_path)/(1024*1024):.2f} MB)...")

    results = []

    # 1. Streamtape
    try:
        st_data = upload_streamtape(file_path)
        print(f"✓ Streamtape Embed: {st_data['embed_url']}")
        results.append(st_data)
    except Exception as e:
        print(f"✗ Streamtape error: {e}")

    # 2. Vidara
    try:
        vd_data = upload_vidara(file_path)
        print(f"✓ Vidara Embed: {vd_data['embed_url']}")
        results.append(vd_data)
    except Exception as e:
        print(f"✗ Vidara error: {e}")

    print("\n--- JSON FOR DESIHOTPIC POST ---")
    import json
    video_links = [
        {"label": r["label"], "url": r["embed_url"], "provider": r["provider"]}
        for r in results
    ]
    print(json.dumps(video_links, indent=2))


if __name__ == "__main__":
    main()
```

---

## 6. Recommended DesiHotPic UI Integration

### Embedded Player with Server Switcher
Instead of sending users away with `target="_blank"`, integrate an in-page responsive player:

```tsx
// Server Switcher Tab:
// [ Server 1: Streamtape ] [ Server 2: Vidara ]

<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#262626]">
  <iframe
    src={currentActiveServer.url}
    className="w-full h-full border-0"
    allowFullScreen
    allow="autoplay; fullscreen; encrypted-media"
  />
</div>
```

### Benefits of Dual-Server Setup:
1. **Redundancy**: If Streamtape has buffering or temporary DMCA issues, Server 2 (Vidara) keeps working.
2. **Double Monetization**: Track earnings on both dashboards and optimize traffic to the highest-paying tier.
3. **No Drop-Off**: Users watch videos without ever leaving `DesiHotPic`.
