import argparse
import json
import subprocess
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
BITRATE = "128k"


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(RATE),
         "-f", "f32le", "-"],
        check=True, stdout=subprocess.PIPE).stdout
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)


def encode(samples, path, bitrate=BITRATE):
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(RATE), "-ac", "1",
         "-i", "-", "-c:a", "libmp3lame", "-b:a", bitrate, "-ac", "1", str(path)],
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


def rms_db(x):
    rms = np.sqrt(np.mean(x ** 2))
    return float(20 * np.log10(rms)) if rms > 0 else float("-inf")


def level(x, target_db=TARGET_RMS_DB, ceiling_db=PEAK_CEILING_DB):
    rms = np.sqrt(np.mean(x ** 2))
    if rms <= 0:
        return x
    gain = 10 ** ((target_db - 20 * np.log10(rms)) / 20)
    out = x * gain
    peak = np.max(np.abs(out))
    ceiling = 10 ** (ceiling_db / 20)
    if peak > ceiling:
        out *= ceiling / peak
    return out


def process(src, dst, pitch=False, bitrate=BITRATE,
            target_db=TARGET_RMS_DB, ceiling_db=PEAK_CEILING_DB):
    report = []
    for category in CATEGORIES:
        for path in sorted((src / category).glob("*.mp3")):
            audio = trim(decode(path))
            before = rms_db(audio)
            f0, semitones, clamped = None, 0.0, False
            if pitch:
                f0 = estimate_f0(audio)
                if f0 is not None:
                    wanted = 12 * np.log2(TARGET_F0 / f0)
                    semitones = float(np.clip(wanted, -MAX_SHIFT_SEMITONES,
                                              MAX_SHIFT_SEMITONES))
                    clamped = abs(wanted) > MAX_SHIFT_SEMITONES
                    audio = shift_pitch(audio, semitones * 100)
            audio = level(audio, target_db, ceiling_db)
            encode(audio, dst / category / path.name, bitrate)
            report.append({
                "file": f"{category}/{path.name}",
                "f0": round(f0, 1) if f0 else None,
                "semitones": round(semitones, 2),
                "clamped": clamped,
                "rms_before": round(before, 2),
                "rms_after": round(rms_db(audio), 2),
                "seconds": round(len(audio) / RATE, 3),
            })
    return report


def main():
    parser = argparse.ArgumentParser(
        description="Trim, level and re-encode the kana clips.")
    parser.add_argument("src", type=Path)
    parser.add_argument("dst", type=Path)
    parser.add_argument("report", type=Path, nargs="?")
    parser.add_argument("--pitch", action="store_true",
                        help=f"also shift every clip to {TARGET_F0:.0f} Hz (needs sox)")
    parser.add_argument("--bitrate", default=BITRATE)
    parser.add_argument("--target-rms", type=float, default=TARGET_RMS_DB)
    parser.add_argument("--peak-ceiling", type=float, default=PEAK_CEILING_DB)
    args = parser.parse_args()

    report = process(args.src, args.dst, args.pitch, args.bitrate,
                     args.target_rms, args.peak_ceiling)
    after = [r["rms_after"] for r in report]
    print(f"normalized {len(report)} files into {args.dst} at {args.bitrate}")
    print(f"RMS {min(after):.2f} to {max(after):.2f} dB "
          f"(spread {max(after) - min(after):.2f} dB)")
    if args.pitch:
        shifted = [r for r in report if abs(r["semitones"]) >= 0.5]
        print(f"pitch corrected {len(shifted)} of them")
        for entry in report:
            if entry["clamped"]:
                print(f"  off-pitch source, correction clamped: {entry['file']} "
                      f"({entry['f0']} Hz)")
    if args.report:
        args.report.write_text(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
