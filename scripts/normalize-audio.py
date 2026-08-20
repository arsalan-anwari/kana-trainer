import json
import subprocess
import sys
from pathlib import Path

import numpy as np

CATEGORIES = ("seion", "dakuon", "handakuon", "yoon")
RATE = 44100
TARGET_F0 = 330.0
TARGET_RMS_DB = -20.0
PEAK_CEILING_DB = -1.0
MAX_SHIFT_SEMITONES = 6.0
SILENCE_FLOOR_DB = -45.0
HEAD_PAD_MS = 30
TAIL_PAD_MS = 60
FADE_MS = 8
BITRATE = "64k"


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(RATE),
         "-f", "f32le", "-"],
        check=True, stdout=subprocess.PIPE).stdout
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)


def encode(samples, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(RATE), "-ac", "1",
         "-i", "-", "-c:a", "libmp3lame", "-b:a", BITRATE, "-ac", "1", str(path)],
        check=True, input=samples.astype("<f4").tobytes())


def frame_db(x, hop):
    count = max(1, len(x) // hop)
    power = np.array([np.mean(x[i * hop:(i + 1) * hop] ** 2) for i in range(count)])
    return 10 * np.log10(power + 1e-20)


def trim(x):
    hop = int(0.005 * RATE)
    db = frame_db(x, hop)
    threshold = max(SILENCE_FLOOR_DB, db.max() - 35.0)
    voiced = np.flatnonzero(db > threshold)
    if len(voiced) == 0:
        return x
    start = max(0, voiced[0] * hop - int(HEAD_PAD_MS / 1000 * RATE))
    stop = min(len(x), (voiced[-1] + 1) * hop + int(TAIL_PAD_MS / 1000 * RATE))
    clip = x[start:stop].copy()
    fade = min(int(FADE_MS / 1000 * RATE), len(clip) // 2)
    if fade > 0:
        ramp = np.linspace(0.0, 1.0, fade)
        clip[:fade] *= ramp
        clip[-fade:] *= ramp[::-1]
    return clip


def estimate_f0(x, fmin=140.0, fmax=500.0):
    size = int(0.040 * RATE)
    hop = int(0.010 * RATE)
    window = np.hanning(size)
    lo, hi = int(RATE / fmax), int(RATE / fmin)
    picks, weights = [], []
    for i in range(0, max(0, len(x) - size), hop):
        seg = x[i:i + size]
        energy = np.sqrt(np.mean(seg ** 2))
        if energy < 0.02:
            continue
        seg = (seg - seg.mean()) * window
        n = 1 << int(np.ceil(np.log2(size * 2)))
        spectrum = np.fft.rfft(seg, n)
        acf = np.fft.irfft(spectrum * np.conj(spectrum), n)[:size]
        if acf[0] <= 0:
            continue
        acf = acf / acf[0]
        band = acf[lo:min(hi, len(acf) - 1)]
        if len(band) == 0:
            continue
        best = band.max()
        if best < 0.35:
            continue
        candidates = np.flatnonzero(band >= 0.85 * best)
        picks.append(RATE / (lo + candidates[0]))
        weights.append(energy)
    if not picks:
        return None
    order = np.argsort(picks)
    picks = np.array(picks)[order]
    cumulative = np.cumsum(np.array(weights)[order])
    return float(picks[np.searchsorted(cumulative, cumulative[-1] / 2)])


def shift_pitch(x, cents):
    if abs(cents) < 5:
        return x
    raw = subprocess.run(
        ["sox", "-t", "f32", "-r", str(RATE), "-c", "1", "-",
         "-t", "f32", "-r", str(RATE), "-c", "1", "-", "pitch", f"{cents:.1f}"],
        check=True, input=x.astype("<f4").tobytes(), stdout=subprocess.PIPE).stdout
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)


def level(x):
    rms = np.sqrt(np.mean(x ** 2))
    if rms <= 0:
        return x
    gain = 10 ** ((TARGET_RMS_DB - 20 * np.log10(rms)) / 20)
    out = x * gain
    peak = np.max(np.abs(out))
    ceiling = 10 ** (PEAK_CEILING_DB / 20)
    if peak > ceiling:
        out *= ceiling / peak
    return out


def process(src, dst):
    report = []
    for category in CATEGORIES:
        for path in sorted((src / category).glob("*.mp3")):
            audio = trim(decode(path))
            f0 = estimate_f0(audio)
            semitones = 0.0
            if f0 is not None:
                semitones = float(np.clip(12 * np.log2(TARGET_F0 / f0),
                                          -MAX_SHIFT_SEMITONES, MAX_SHIFT_SEMITONES))
                audio = shift_pitch(audio, semitones * 100)
            audio = level(audio)
            encode(audio, dst / category / path.name)
            report.append({
                "file": f"{category}/{path.name}",
                "f0": round(f0, 1) if f0 else None,
                "semitones": round(semitones, 2),
                "clamped": bool(f0 is not None
                                and abs(12 * np.log2(TARGET_F0 / f0))
                                > MAX_SHIFT_SEMITONES),
                "seconds": round(len(audio) / RATE, 3),
            })
    return report


def main():
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    report = process(src, dst)
    shifted = [r for r in report if abs(r["semitones"]) >= 0.5]
    clamped = [r for r in report if r["clamped"]]
    print(f"normalized {len(report)} files into {dst}")
    print(f"pitch corrected {len(shifted)} of them")
    for entry in clamped:
        print(f"  off-pitch source, correction clamped: {entry['file']} "
              f"({entry['f0']} Hz)")
    if len(sys.argv) > 3:
        Path(sys.argv[3]).write_text(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
