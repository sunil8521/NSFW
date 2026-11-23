#!/usr/bin/env python3
"""
Upload 'Rickys Resort - Princess Emily Episode Joi (720).mp4' to Streamtape and Vidara.
Uses curl for maximum upload throughput and reliability on 580MB+ video files.
"""

import os
import sys
import json
import time
import subprocess
import urllib.request
import urllib.parse

VIDEO_PATH = "/home/sunil/Downloads/EPORNER.COM - [rg8uAus0hFK] Rickys Resort - Princess Emily Episode    Joi (720).mp4"
CLEAN_TITLE = "Rickys Resort - Princess Emily Episode Joi (720p).mp4"

STREAMTAPE_LOGIN = "7bb2a22f2d31ec068241"
STREAMTAPE_KEY = "opD18VkagBHJVop"
VIDARA_API_KEY = "6dae6b41c887a0f27a54424365c50a0b6efcc1aadf4d70c77af4cc2519c2d347"

RESULT_FILE = "/home/sunil/_codding/python/new2026/zpo/scripts/rickys_upload_result.json"


def http_get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def upload_streamtape():
    print("\n" + "=" * 60, flush=True)
    print(">>> [1/2] STARTING UPLOAD TO STREAMTAPE...", flush=True)
    print("=" * 60, flush=True)

    # 1. Get upload slot
    url = f"https://api.streamtape.com/file/ul?login={STREAMTAPE_LOGIN}&key={STREAMTAPE_KEY}"
    res = http_get_json(url)
    if res.get("status") != 200:
        raise Exception(f"Streamtape slot error: {res}")

    upload_url = res["result"]["url"]
    print(f"[Streamtape] Target Server: {upload_url}", flush=True)
    print(f"[Streamtape] Uploading ~583 MB via curl...", flush=True)

    cmd = [
        "curl",
        "--progress-bar",
        "-F",
        f"file1=@{VIDEO_PATH};filename={CLEAN_TITLE}",
        upload_url,
    ]

    t0 = time.time()
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    elapsed = time.time() - t0

    if proc.returncode != 0:
        raise Exception(f"curl failed: {proc.stderr}")

    raw_output = proc.stdout.strip()
    print(f"[Streamtape] Upload finished in {int(elapsed)}s. Raw response: {raw_output}", flush=True)

    try:
        data = json.loads(raw_output)
    except Exception:
        raise Exception(f"Could not parse Streamtape response: {raw_output}")

    if data.get("status") != 200:
        raise Exception(f"Streamtape error: {data.get('msg')}")

    file_id = data["result"]["id"]
    return {
        "platform": "Streamtape",
        "file_id": file_id,
        "watch_url": f"https://streamtape.com/v/{file_id}",
        "embed_url": f"https://streamtape.com/e/{file_id}?color=229,46,46",
        "name": data["result"].get("name", CLEAN_TITLE),
        "size_bytes": data["result"].get("size"),
        "upload_time_seconds": round(elapsed, 1),
    }


def upload_vidara():
    print("\n" + "=" * 60, flush=True)
    print(">>> [2/2] STARTING UPLOAD TO VIDARA...", flush=True)
    print("=" * 60, flush=True)

    # 1. Get upload server
    url = f"https://api.vidara.so/v1/upload/server?api_key={VIDARA_API_KEY}"
    res = http_get_json(url)
    if res.get("status") != 200:
        raise Exception(f"Vidara server error: {res}")

    upload_server = res["result"]["upload_server"]
    print(f"[Vidara] Target Server: {upload_server}", flush=True)
    print(f"[Vidara] Uploading ~583 MB via curl...", flush=True)

    cmd = [
        "curl",
        "--progress-bar",
        "-X",
        "POST",
        upload_server,
        "-F",
        f"api_key={VIDARA_API_KEY}",
        "-F",
        f"file=@{VIDEO_PATH};filename={CLEAN_TITLE}",
    ]

    t0 = time.time()
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    elapsed = time.time() - t0

    if proc.returncode != 0:
        raise Exception(f"curl failed: {proc.stderr}")

    raw_output = proc.stdout.strip()
    print(f"[Vidara] Upload finished in {int(elapsed)}s. Raw response: {raw_output}", flush=True)

    try:
        data = json.loads(raw_output)
    except Exception:
        raise Exception(f"Could not parse Vidara response: {raw_output}")

    filecode = data.get("filecode")
    if not filecode and "result" in data:
        filecode = data["result"].get("filecode")

    if not filecode:
        raise Exception(f"Vidara error: No filecode found in {data}")

    return {
        "platform": "Vidara",
        "filecode": filecode,
        "watch_url": f"https://vidara.so/v/{filecode}",
        "embed_url": f"https://vidara.so/e/{filecode}",
        "title": data.get("title", CLEAN_TITLE),
        "video_id": data.get("video_id"),
        "upload_time_seconds": round(elapsed, 1),
    }


def main():
    if not os.path.exists(VIDEO_PATH):
        print(f"ERROR: Video file not found at: {VIDEO_PATH}")
        sys.exit(1)

    file_size_mb = os.path.getsize(VIDEO_PATH) / (1024 * 1024)
    print(f"Target Video: {VIDEO_PATH}")
    print(f"File Size:    {file_size_mb:.2f} MB")
    print(f"Clean Name:   {CLEAN_TITLE}")

    results = {}

    # Streamtape
    try:
        st = upload_streamtape()
        results["streamtape"] = st
        print(f"✓ Streamtape OK! Embed: {st['embed_url']}", flush=True)
    except Exception as e:
        print(f"✗ Streamtape Failed: {e}", flush=True)
        results["streamtape"] = {"error": str(e)}

    # Vidara
    try:
        vd = upload_vidara()
        results["vidara"] = vd
        print(f"✓ Vidara OK! Embed: {vd['embed_url']}", flush=True)
    except Exception as e:
        print(f"✗ Vidara Failed: {e}", flush=True)
        results["vidara"] = {"error": str(e)}

    # Save to JSON
    with open(RESULT_FILE, "w") as f:
        json.dump(results, f, indent=2)

    print("\n" + "=" * 60, flush=True)
    print("ALL UPLOADS COMPLETED! Summary saved to:", RESULT_FILE, flush=True)
    print("=" * 60, flush=True)
    print(json.dumps(results, indent=2), flush=True)


if __name__ == "__main__":
    main()
