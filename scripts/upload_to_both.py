#!/usr/bin/env python3
"""
Dual Video Uploader for DesiHotPic
Uploads to Streamtape and Vidara simultaneously.
"""

import os
import sys
import json
import requests

STREAMTAPE_LOGIN = "7bb2a22f2d31ec068241"
STREAMTAPE_KEY = "opD18VkagBHJVop"
VIDARA_API_KEY = "6dae6b41c887a0f27a54424365c50a0b6efcc1aadf4d70c77af4cc2519c2d347"


def upload_streamtape(file_path):
    print("[Streamtape] Requesting upload slot...")
    res = requests.get(
        "https://api.streamtape.com/file/ul",
        params={"login": STREAMTAPE_LOGIN, "key": STREAMTAPE_KEY},
        timeout=30,
    ).json()

    if res.get("status") != 200:
        raise Exception(f"Streamtape Error: {res.get('msg')}")

    upload_url = res["result"]["url"]
    print(f"[Streamtape] Uploading...")

    with open(file_path, "rb") as f:
        upload_res = requests.post(upload_url, files={"file1": f}, timeout=600).json()

    if upload_res.get("status") != 200:
        raise Exception(f"Streamtape Upload Failed: {upload_res.get('msg')}")

    file_id = upload_res["result"]["id"]
    return {
        "provider": "streamtape",
        "label": "Server 1 (Streamtape)",
        "file_id": file_id,
        "watch_url": f"https://streamtape.com/v/{file_id}",
        "embed_url": f"https://streamtape.com/e/{file_id}?color=229,46,46",
    }


def upload_vidara(file_path):
    print("[Vidara] Requesting upload server...")
    res = requests.get(
        "https://api.vidara.so/v1/upload/server",
        params={"api_key": VIDARA_API_KEY},
        timeout=30,
    ).json()

    if res.get("status") != 200:
        raise Exception(f"Vidara Server Error: {res.get('msg')}")

    upload_server = res["result"]["upload_server"]
    print(f"[Vidara] Uploading...")

    with open(file_path, "rb") as f:
        upload_res = requests.post(
            upload_server,
            data={"api_key": VIDARA_API_KEY},
            files={"file": f},
            timeout=600,
        ).json()

    filecode = upload_res.get("filecode")
    if not filecode and "result" in upload_res:
        filecode = upload_res["result"].get("filecode")
    if not filecode:
        raise Exception(f"Vidara Upload Failed: {upload_res}")

    # If Vidara returns full URL like https://vidara.to/e/CODE, extract pure CODE
    if "/" in filecode:
        clean_code = filecode.rstrip("/").split("/")[-1]
    else:
        clean_code = filecode

    return {
        "provider": "vidara",
        "label": "Server 2 (Vidara)",
        "filecode": clean_code,
        "watch_url": f"https://vidara.so/v/{clean_code}",
        "embed_url": f"https://vidara.to/e/{clean_code}",
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 upload_to_both.py <path_to_video.mp4>")
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        sys.exit(1)

    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    print(f"Uploading '{file_path}' ({file_size_mb:.2f} MB)...")

    results = []

    # Streamtape
    try:
        st = upload_streamtape(file_path)
        print(f"✓ Streamtape Embed: {st['embed_url']}")
        results.append(st)
    except Exception as e:
        print(f"✗ Streamtape error: {e}")

    # Vidara
    try:
        vd = upload_vidara(file_path)
        print(f"✓ Vidara Embed: {vd['embed_url']}")
        results.append(vd)
    except Exception as e:
        print(f"✗ Vidara error: {e}")

    print("\n" + "=" * 50)
    print("COPY THIS FOR DESIHOTPIC VIDEO LINKS:")
    print("=" * 50)
    video_links = [
        {"label": r["label"], "url": r["embed_url"], "provider": r["provider"]}
        for r in results
    ]
    print(json.dumps(video_links, indent=2))


if __name__ == "__main__":
    main()
