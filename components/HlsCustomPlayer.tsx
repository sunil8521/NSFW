"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Sparkles,
  PictureInPicture,
  Tv,
} from "lucide-react";

interface HlsCustomPlayerProps {
  src: string;
  poster?: string;
  title: string;
  theaterMode?: boolean;
  onToggleTheater?: () => void;
}

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label: string;
}

// Helper to format seconds into mm:ss or hh:mm:ss
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function HlsCustomPlayer({
  src,
  poster,
  title,
  theaterMode = false,
  onToggleTheater,
}: HlsCustomPlayerProps) {
  // DOM Refs (prevents high-frequency re-renders during playback & scrubbing)
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // High-frequency timeline refs (Direct DOM manipulation = 0 re-renders during playback!)
  const playedBarRef = useRef<HTMLDivElement>(null);
  const bufferedBarRef = useRef<HTMLDivElement>(null);
  const rangeInputRef = useRef<HTMLInputElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);
  const hoverTooltipRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Discrete, low-frequency UI states (only re-render on actual state changes)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // HLS Quality levels
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto

  // Controls visibility
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // High-performance time update (Direct DOM — No React re-render!)
  const updateTimelineUI = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    const duration = video.duration || 0;
    const progressPercent = duration > 0 ? (current / duration) * 100 : 0;

    // 1. Update played progress bar
    if (playedBarRef.current) {
      playedBarRef.current.style.width = `${progressPercent}%`;
    }

    // 2. Update scrubber range input value
    if (rangeInputRef.current) {
      rangeInputRef.current.value = String(current);
      if (duration > 0) rangeInputRef.current.max = String(duration);
    }

    // 3. Update buffered bar
    if (bufferedBarRef.current && video.buffered.length > 0 && duration > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufPercent = Math.min(100, (bufferedEnd / duration) * 100);
      bufferedBarRef.current.style.width = `${bufPercent}%`;
    }

    // 4. Update time text
    if (timeTextRef.current) {
      timeTextRef.current.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    }
  }, []);

  // Initialize HLS / Native Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);
    setIsBuffering(true);
    setQualityLevels([]);
    setCurrentQuality(-1);

    const isHlsSource =
      src.toLowerCase().includes(".m3u8") ||
      src.toLowerCase().includes("/hls/") ||
      src.toLowerCase().includes("playlist");

    let hls: Hls | null = null;

    if (isHlsSource && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsBuffering(false);
        if (data.levels && data.levels.length > 0) {
          const levels: QualityLevel[] = data.levels.map((lvl, idx) => ({
            index: idx,
            height: lvl.height,
            bitrate: lvl.bitrate,
            label: lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`,
          }));
          setQualityLevels(levels);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS fatal network error, attempting recovery...");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS fatal media error, recovering...");
              hls?.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error:", data);
              setError("Failed to load video stream. Please try another server.");
              hls?.destroy();
              break;
          }
        }
      });
    } else if (
      isHlsSource &&
      video.canPlayType("application/vnd.apple.mpegurl")
    ) {
      // Native Safari HLS
      video.src = src;
      video.addEventListener("loadedmetadata", () => setIsBuffering(false), { once: true });
    } else {
      // Progressive direct video (MP4 / WebM / MKV)
      video.src = src;
      video.addEventListener("loadedmetadata", () => setIsBuffering(false), { once: true });
    }

    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  // Handle Play / Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Scrubber Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const target = parseFloat(e.target.value);
    video.currentTime = target;
    updateTimelineUI();
  };

  // High-performance timeline hover preview (Direct DOM — 0 re-renders on mousemove!)
  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const tooltip = hoverTooltipRef.current;
    if (!video || !tooltip) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    const duration = video.duration || 0;

    tooltip.style.left = `${clampedPos * 100}%`;
    tooltip.textContent = formatTime(clampedPos * duration);
    tooltip.style.opacity = "1";
  };

  const handleTimelineLeave = () => {
    if (hoverTooltipRef.current) {
      hoverTooltipRef.current.style.opacity = "0";
    }
  };

  // Volume
  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, newVol));
    video.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      video.volume = volume || 0.5;
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Speed
  const handlePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettingsMenu(false);
  };

  // Quality switch (HLS)
  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setShowSettingsMenu(false);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => null);
    } else {
      document.exitFullscreen().catch(() => null);
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn("PiP error:", e);
    }
  };

  // Listen to Fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          updateTimelineUI();
          break;
        case "arrowright":
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
          updateTimelineUI();
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case "t":
          if (onToggleTheater) {
            e.preventDefault();
            onToggleTheater();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, volume, isMuted, onToggleTheater, updateTimelineUI]);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettingsMenu) {
          setShowControls(false);
        }
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !showSettingsMenu) {
      setShowControls(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden bg-black select-none group transition-all duration-300 ${
        theaterMode
          ? "aspect-video lg:aspect-[21/9] rounded-2xl shadow-2xl"
          : "aspect-video rounded-2xl shadow-xl"
      }`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={updateTimelineUI}
        onDurationChange={updateTimelineUI}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onWheel={(e) => {
          e.preventDefault();
          handleVolumeChange(volume + (e.deltaY < 0 ? 0.05 : -0.05));
        }}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-xs">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center space-y-3 z-30">
          <p className="text-sm font-semibold text-rose-400">{error}</p>
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Stream</span>
          </button>
        </div>
      )}

      {/* Big Center Play Button (When Paused) */}
      {!isPlaying && !isBuffering && !error && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/90 hover:bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent/50 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
          aria-label="Play video"
        >
          <Play className="w-7 h-7 sm:w-9 sm:h-9 ml-1 fill-current" />
        </button>
      )}

      {/* Top Title Overlay Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-200 pointer-events-none flex items-center justify-between ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-xs sm:text-sm font-semibold text-white drop-shadow truncate max-w-md">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {qualityLevels.length > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/30 text-accent border border-accent/40 backdrop-blur-sm">
              Adaptive HLS
            </span>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-3 px-3 sm:px-4 space-y-2 transition-opacity duration-200 z-20 ${
          showControls || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber Timeline */}
        <div
          className="relative group/timeline w-full h-4 flex items-center cursor-pointer"
          onMouseMove={handleTimelineHover}
          onMouseLeave={handleTimelineLeave}
        >
          {/* Hover Time Tooltip (Driven directly by DOM style — 0 re-renders!) */}
          <div
            ref={hoverTooltipRef}
            className="absolute bottom-5 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-zinc-700 text-[10px] font-mono text-white pointer-events-none opacity-0 transition-opacity duration-75"
          >
            0:00
          </div>

          {/* Background Track */}
          <div className="w-full h-1 group-hover/timeline:h-2 bg-zinc-700/60 rounded-full overflow-hidden transition-all relative">
            {/* Buffered Bar (Direct DOM update) */}
            <div
              ref={bufferedBarRef}
              className="absolute left-0 top-0 bottom-0 bg-zinc-500/50 rounded-full transition-all w-0"
            />
            {/* Played Bar (Direct DOM update) */}
            <div
              ref={playedBarRef}
              className="absolute left-0 top-0 bottom-0 bg-accent rounded-full transition-all w-0"
            />
          </div>

          {/* Hidden Range Input for full touch/mouse scrub precision */}
          <input
            ref={rangeInputRef}
            type="range"
            min={0}
            max={100}
            step="any"
            defaultValue={0}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left Controls: Play, Volume, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-200 hover:text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-200 hover:text-white transition-colors cursor-pointer"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-0 sm:w-16 h-1 accent-accent group-hover/volume:w-16 transition-all cursor-pointer hidden sm:block"
              />
            </div>

            {/* Time Display (Direct DOM text content) */}
            <span
              ref={timeTextRef}
              className="font-mono text-[11px] text-zinc-300 tracking-tight"
            >
              0:00 / 0:00
            </span>
          </div>

          {/* Right Controls: Quality/Speed Settings, PiP, Theater, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2 relative">
            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer ${
                  showSettingsMenu ? "bg-white/15 text-white" : ""
                }`}
                title="Playback Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Dropdown Menu */}
              {showSettingsMenu && (
                <div className="absolute right-0 bottom-9 w-44 rounded-xl bg-[#141414] border border-[#262626] shadow-2xl p-2 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  {/* Playback Speed */}
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 px-2 block mb-1">
                      Speed
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handlePlaybackRate(rate)}
                          className={`py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            playbackRate === rate
                              ? "bg-accent text-white"
                              : "bg-[#1c1c1c] text-zinc-300 hover:text-white hover:bg-[#252525]"
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Selector (if HLS) */}
                  {qualityLevels.length > 0 && (
                    <div className="pt-1.5 border-t border-[#222]">
                      <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 px-2 block mb-1">
                        Quality
                      </span>
                      <div className="space-y-0.5 max-h-32 overflow-y-auto">
                        <button
                          onClick={() => handleQualityChange(-1)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors cursor-pointer flex items-center justify-between ${
                            currentQuality === -1
                              ? "bg-accent/20 text-accent font-bold"
                              : "text-zinc-300 hover:bg-[#1c1c1c]"
                          }`}
                        >
                          <span>Auto</span>
                          {currentQuality === -1 && <Sparkles className="w-3 h-3 text-accent" />}
                        </button>
                        {qualityLevels.map((lvl) => (
                          <button
                            key={lvl.index}
                            onClick={() => handleQualityChange(lvl.index)}
                            className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors cursor-pointer flex items-center justify-between ${
                              currentQuality === lvl.index
                                ? "bg-accent/20 text-accent font-bold"
                                : "text-zinc-300 hover:bg-[#1c1c1c]"
                            }`}
                          >
                            <span>{lvl.label}</span>
                            {currentQuality === lvl.index && (
                              <Sparkles className="w-3 h-3 text-accent" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
              title="Picture-in-Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Theater Mode */}
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                className={`p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer hidden lg:block ${
                  theaterMode ? "text-accent bg-accent/15" : ""
                }`}
                title={theaterMode ? "Exit Theater Mode (T)" : "Theater Mode (T)"}
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
