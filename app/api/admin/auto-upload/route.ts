import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/dal";
import { dbService } from "@/lib/db";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";
export const maxDuration = 600; // 10 minutes

const STREAMTAPE_LOGIN = process.env.STREAMTAPE_LOGIN!;
const STREAMTAPE_KEY = process.env.STREAMTAPE_KEY!;
const VIDARA_API_KEY = process.env.VIDARA_API_KEY!;

function execCurlJson(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const p = spawn("curl", ["-s", "--ipv4", ...args]);
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => (stderr += d));
    p.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `curl exited with code ${code}`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (err) {
        resolve(stdout);
      }
    });
  });
}

function runCurlUploadWithProgress(
  args: string[],
  onProgress: (percent: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const p = spawn("curl", ["-#", "--ipv4", ...args]);
    let stdout = "";
    let stderr = "";

    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => {
      const text = d.toString();
      stderr += text;
      // Match percentage in curl progress output e.g. 45.2% or 50%
      const match = text.match(/(\d+(?:\.\d+)?)%/);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val)) {
          onProgress(val);
        }
      }
    });

    p.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Upload curl exited with code ${code}`));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        // Find last JSON occurrence in stdout
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return resolve(JSON.parse(jsonMatch[0]));
          } catch {}
        }
        resolve(stdout);
      }
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const remoteUrl = (formData.get("remoteUrl") as string | null)?.trim() || "";
  const customTitle = (formData.get("title") as string | null)?.trim() || "";

  if (!file && !remoteUrl) {
    return new Response(
      JSON.stringify({ error: "Please provide either a video file or a remote URL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let tempFilePath: string | null = null;

      const sendEvent = (data: Record<string, any>) => {
        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (e) {
          // Controller might be closed
        }
      };

      try {
        let videoTitle = customTitle;
        let originalName = "";
        let fileSize = 0;

        // ─── 1. HANDLE LOCAL FILE OR REMOTE URL ───────────────────
        if (file && file.size > 0) {
          originalName = file.name;
          fileSize = file.size;
          if (!videoTitle) {
            videoTitle = file.name.replace(/\.[^/.]+$/, "");
          }

          sendEvent({
            stage: "preparing",
            percent: 5,
            message: `Receiving file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`,
          });

          // Write buffer to temporary file for streaming upload
          const tempDir = os.tmpdir();
          tempFilePath = path.join(
            tempDir,
            `upload_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
          );

          const bytes = await file.arrayBuffer();
          fs.writeFileSync(tempFilePath, Buffer.from(bytes));

          sendEvent({
            stage: "prepared",
            percent: 10,
            message: "File cached, contacting Streamtape and Vidara...",
          });

          // ─── 2. STREAMTAPE UPLOAD ──────────────────────────────────
          sendEvent({
            stage: "streamtape_init",
            percent: 12,
            message: "Requesting Streamtape upload server...",
          });

          const stSlotUrl = `https://api.streamtape.com/file/ul?login=${STREAMTAPE_LOGIN}&key=${STREAMTAPE_KEY}`;
          const stSlotRes = await execCurlJson([stSlotUrl]);

          if (stSlotRes?.status !== 200 || !stSlotRes?.result?.url) {
            throw new Error(`Streamtape slot error: ${stSlotRes?.msg || "Failed to obtain slot"}`);
          }

          const stUploadServer = stSlotRes.result.url;
          sendEvent({
            stage: "streamtape_uploading",
            percent: 15,
            message: "Uploading to Streamtape...",
          });

          const stResult = await runCurlUploadWithProgress(
            [
              "-F",
              `file1=@${tempFilePath};filename=${videoTitle}.mp4`,
              stUploadServer,
            ],
            (progressVal) => {
              // Scale Streamtape progress between 15% and 50%
              const overall = Math.min(50, Math.round(15 + progressVal * 0.35));
              sendEvent({
                stage: "streamtape_uploading",
                percent: overall,
                streamtapePercent: Math.round(progressVal),
                message: `Uploading to Streamtape: ${Math.round(progressVal)}%`,
              });
            }
          );

          if (stResult?.status !== 200 || !stResult?.result?.id) {
            throw new Error(`Streamtape upload failed: ${stResult?.msg || JSON.stringify(stResult)}`);
          }

          const stFileId = stResult.result.id;
          const streamtapeData = {
            fileId: stFileId,
            watchUrl: `https://streamtape.com/v/${stFileId}`,
            embedUrl: `https://streamtape.com/e/${stFileId}?color=229,46,46`,
          };

          sendEvent({
            stage: "streamtape_done",
            percent: 52,
            message: "Streamtape upload complete! Starting Vidara upload...",
            streamtape: streamtapeData,
          });

          // ─── 3. VIDARA UPLOAD ──────────────────────────────────────
          sendEvent({
            stage: "vidara_init",
            percent: 55,
            message: "Requesting Vidara upload server...",
          });

          const vdSlotUrl = `https://api.vidara.so/v1/upload/server?api_key=${VIDARA_API_KEY}`;
          const vdSlotRes = await execCurlJson([vdSlotUrl]);

          if (vdSlotRes?.status !== 200 || !vdSlotRes?.result?.upload_server) {
            throw new Error(`Vidara server error: ${vdSlotRes?.msg || "Failed to obtain server"}`);
          }

          const vdUploadServer = vdSlotRes.result.upload_server;
          sendEvent({
            stage: "vidara_uploading",
            percent: 58,
            message: "Uploading to Vidara...",
          });

          const vdResult = await runCurlUploadWithProgress(
            [
              "-X",
              "POST",
              vdUploadServer,
              "-F",
              `api_key=${VIDARA_API_KEY}`,
              "-F",
              `key=${VIDARA_API_KEY}`,
              "-F",
              `file=@${tempFilePath};filename=${videoTitle}.mp4`,
            ],
            (progressVal) => {
              // Scale Vidara progress between 58% and 94%
              const overall = Math.min(94, Math.round(58 + progressVal * 0.36));
              sendEvent({
                stage: "vidara_uploading",
                percent: overall,
                vidaraPercent: Math.round(progressVal),
                message: `Uploading to Vidara: ${Math.round(progressVal)}%`,
              });
            }
          );

          let vdFilecode = vdResult?.filecode;
          if (!vdFilecode && vdResult?.result?.filecode) {
            vdFilecode = vdResult.result.filecode;
          }

          if (!vdFilecode) {
            throw new Error(`Vidara upload failed: ${JSON.stringify(vdResult)}`);
          }

          // Clean filecode if it has URL parts
          const cleanVdCode = vdFilecode.includes("/")
            ? vdFilecode.replace(/\/+$/, "").split("/").pop()
            : vdFilecode;

          const vidaraData = {
            filecode: cleanVdCode,
            watchUrl: `https://vidara.so/v/${cleanVdCode}`,
            embedUrl: `https://vidara.to/e/${cleanVdCode}`,
          };

          sendEvent({
            stage: "vidara_done",
            percent: 96,
            message: "Vidara upload complete! Saving to database...",
            vidara: vidaraData,
          });

          // ─── 4. SAVE TO DATABASE ───────────────────────────────────
          const savedVideo = await dbService.createUploadedVideo({
            title: videoTitle,
            originalName,
            size: fileSize,
            streamtape: streamtapeData,
            vidara: vidaraData,
          });

          sendEvent({
            stage: "completed",
            percent: 100,
            message: "Both uploads finished and saved to database!",
            result: savedVideo,
          });
        } else if (remoteUrl) {
          // ─── REMOTE URL UPLOAD ─────────────────────────────────────
          originalName = remoteUrl;
          if (!videoTitle) {
            const parsedUrl = new URL(remoteUrl);
            videoTitle = path.basename(parsedUrl.pathname) || "Remote Video";
          }

          sendEvent({
            stage: "remote_init",
            percent: 20,
            message: "Adding remote upload to Streamtape...",
          });

          // Streamtape remote dl
          const stRemoteUrl = `https://api.streamtape.com/remotedl/add?login=${STREAMTAPE_LOGIN}&key=${STREAMTAPE_KEY}&url=${encodeURIComponent(
            remoteUrl
          )}&name=${encodeURIComponent(videoTitle + ".mp4")}`;
          const stRes = await execCurlJson([stRemoteUrl]);

          const stId = stRes?.result?.id;
          if (!stId) {
            throw new Error(`Streamtape remote upload failed: ${stRes?.msg || JSON.stringify(stRes)}`);
          }

          const streamtapeData = {
            fileId: stId,
            watchUrl: `https://streamtape.com/v/${stId}`,
            embedUrl: `https://streamtape.com/e/${stId}?color=229,46,46`,
          };

          sendEvent({
            stage: "remote_streamtape_done",
            percent: 60,
            message: "Streamtape remote added! Adding to Vidara...",
            streamtape: streamtapeData,
          });

          // Vidara remote dl
          const vdRemoteUrl = `https://api.vidara.so/v1/upload/url?api_key=${VIDARA_API_KEY}&url=${encodeURIComponent(
            remoteUrl
          )}`;
          const vdRes = await execCurlJson([vdRemoteUrl]);

          const vdFilecode = vdRes?.data?.filecode || vdRes?.result?.filecode;
          if (!vdFilecode) {
            throw new Error(`Vidara remote upload failed: ${vdRes?.msg || JSON.stringify(vdRes)}`);
          }

          const cleanVdCode = vdFilecode.includes("/")
            ? vdFilecode.replace(/\/+$/, "").split("/").pop()
            : vdFilecode;

          const vidaraData = {
            filecode: cleanVdCode,
            watchUrl: `https://vidara.so/v/${cleanVdCode}`,
            embedUrl: `https://vidara.to/e/${cleanVdCode}`,
          };

          sendEvent({
            stage: "remote_vidara_done",
            percent: 90,
            message: "Vidara remote added! Saving to database...",
            vidara: vidaraData,
          });

          const savedVideo = await dbService.createUploadedVideo({
            title: videoTitle,
            originalName,
            streamtape: streamtapeData,
            vidara: vidaraData,
          });

          sendEvent({
            stage: "completed",
            percent: 100,
            message: "Remote uploads queued and saved to database!",
            result: savedVideo,
          });
        }
      } catch (err: any) {
        sendEvent({
          stage: "error",
          percent: 0,
          message: err?.message || "An unexpected error occurred during upload",
        });
      } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          try {
            fs.unlinkSync(tempFilePath);
          } catch {}
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
