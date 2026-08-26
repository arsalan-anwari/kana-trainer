---
pretty_name: Kana Sounds
license: cc-by-4.0
language:
- ja
task_categories:
- audio-classification
- automatic-speech-recognition
- text-to-speech
tags:
- japanese
- kana
- hiragana
- katakana
- pronunciation
- language-learning
size_categories:
- n<1K
---

# Kana Sounds

104 short spoken clips, one for every hiragana and katakana character used by
[Kana Trainer](https://github.com/arsalan-anwari/kana-trainer): the 46 seion, 20 dakuon,
5 handakuon and 33 yoon. Every clip is trimmed, pitch corrected and loudness normalised
to a single voice level, so a set can be played back to back without any jump in volume.

## Dataset structure

```
audio/
  seion/       46 clips   a.mp3, i.mp3, ka.mp3, ... n.mp3
  dakuon/      20 clips   ga.mp3, za.mp3, ji.mp3, ... bo.mp3
  handakuon/    5 clips   pa.mp3, pi.mp3, pu.mp3, pe.mp3, po.mp3
  yoon/        33 clips   kya.mp3, sya.mp3, cya.mp3, ... pyo.mp3
favicon.png    the Kana Trainer icon
```

A clip is addressed by its group and romaji, `audio/<group>/<romaji>.mp3`. Hiragana and
katakana share a clip, because the two scripts are read out the same way: `audio/seion/a.mp3`
is the sound of both あ and ア.

## Audio format

| | |
| --- | --- |
| Format | MP3 (LAME), 128 kbps |
| Channels | mono |
| Sample rate | 44.1 kHz |
| Clips | 104 |
| Duration | 0.39 s to 1.54 s, 0.77 s median, 81 s in total |
| Loudness | -20 dBFS RMS, peaks held under -1 dBFS |
| Pitch | shifted towards 330 Hz where the source allowed it |
| Total size | 1.6 MB |

## Processing

The source recordings drift from 149 Hz to 367 Hz and vary about 15 dB in level. Each one
is put through [`scripts/normalize-audio.py`](https://github.com/arsalan-anwari/kana-trainer/blob/main/scripts/normalize-audio.py):

1. **Trim** leading and trailing silence at 35 dB below the loudest frame, keep 30 ms of head
   and 60 ms of tail padding, and apply an 8 ms fade at both ends.
2. **Pitch** estimate the fundamental by autocorrelation and shift towards 330 Hz with `sox`,
   clamped to 6 semitones so a badly off source is not mangled.
3. **Level** scale to -20 dBFS RMS, then pull the whole clip down if any peak passes -1 dBFS.
4. **Encode** back to mono 128 kbps MP3 with `ffmpeg`.

## Naming

File names follow the romaji spelling Kana Trainer shows, with four exceptions where the
clip keeps the kunrei style name of the source recording:

| Kana | Shown as | File |
| --- | --- | --- |
| ぢ / ヂ | dji | `audio/dakuon/di.mp3` |
| づ / ヅ | dzu | `audio/dakuon/du.mp3` |
| しゃ しゅ しょ | sha shu sho | `audio/yoon/sya.mp3`, `syu`, `syo` |
| ちゃ ちゅ ちょ | cha chu cho | `audio/yoon/cya.mp3`, `cyu`, `cyo` |
| じゃ じゅ じょ | ja ju jo | `audio/yoon/zya.mp3`, `zyu`, `zyo` |

## Usage

```python
from datasets import load_dataset

ds = load_dataset("audiofolder", data_files="hf://datasets/arsalan-anwari/kana-sounds/audio/**")
```

Or grab a single clip:

```python
from huggingface_hub import hf_hub_download

path = hf_hub_download("arsalan-anwari/kana-sounds", "audio/seion/a.mp3", repo_type="dataset")
```

## Character map

<details>
<summary>All 104 characters and the clip each one plays</summary>

#### Seion (basic sounds)

| Row | Hiragana | Katakana | Romaji | File |
| --- | --- | --- | --- | --- |
| A | あ | ア | a | `audio/seion/a.mp3` |
| A | い | イ | i | `audio/seion/i.mp3` |
| A | う | ウ | u | `audio/seion/u.mp3` |
| A | え | エ | e | `audio/seion/e.mp3` |
| A | お | オ | o | `audio/seion/o.mp3` |
| KA | か | カ | ka | `audio/seion/ka.mp3` |
| KA | き | キ | ki | `audio/seion/ki.mp3` |
| KA | く | ク | ku | `audio/seion/ku.mp3` |
| KA | け | ケ | ke | `audio/seion/ke.mp3` |
| KA | こ | コ | ko | `audio/seion/ko.mp3` |
| SA | さ | サ | sa | `audio/seion/sa.mp3` |
| SA | し | シ | shi | `audio/seion/shi.mp3` |
| SA | す | ス | su | `audio/seion/su.mp3` |
| SA | せ | セ | se | `audio/seion/se.mp3` |
| SA | そ | ソ | so | `audio/seion/so.mp3` |
| TA | た | タ | ta | `audio/seion/ta.mp3` |
| TA | ち | チ | chi | `audio/seion/chi.mp3` |
| TA | つ | ツ | tsu | `audio/seion/tsu.mp3` |
| TA | て | テ | te | `audio/seion/te.mp3` |
| TA | と | ト | to | `audio/seion/to.mp3` |
| NA | な | ナ | na | `audio/seion/na.mp3` |
| NA | に | ニ | ni | `audio/seion/ni.mp3` |
| NA | ぬ | ヌ | nu | `audio/seion/nu.mp3` |
| NA | ね | ネ | ne | `audio/seion/ne.mp3` |
| NA | の | ノ | no | `audio/seion/no.mp3` |
| HA | は | ハ | ha | `audio/seion/ha.mp3` |
| HA | ひ | ヒ | hi | `audio/seion/hi.mp3` |
| HA | ふ | フ | fu | `audio/seion/fu.mp3` |
| HA | へ | ヘ | he | `audio/seion/he.mp3` |
| HA | ほ | ホ | ho | `audio/seion/ho.mp3` |
| MA | ま | マ | ma | `audio/seion/ma.mp3` |
| MA | み | ミ | mi | `audio/seion/mi.mp3` |
| MA | む | ム | mu | `audio/seion/mu.mp3` |
| MA | め | メ | me | `audio/seion/me.mp3` |
| MA | も | モ | mo | `audio/seion/mo.mp3` |
| YA | や | ヤ | ya | `audio/seion/ya.mp3` |
| YA | ゆ | ユ | yu | `audio/seion/yu.mp3` |
| YA | よ | ヨ | yo | `audio/seion/yo.mp3` |
| RA | ら | ラ | ra | `audio/seion/ra.mp3` |
| RA | り | リ | ri | `audio/seion/ri.mp3` |
| RA | る | ル | ru | `audio/seion/ru.mp3` |
| RA | れ | レ | re | `audio/seion/re.mp3` |
| RA | ろ | ロ | ro | `audio/seion/ro.mp3` |
| WA | わ | ワ | wa | `audio/seion/wa.mp3` |
| WA | を | ヲ | wo | `audio/seion/wo.mp3` |
| N | ん | ン | n | `audio/seion/n.mp3` |

#### Dakuon (voiced)

| Row | Hiragana | Katakana | Romaji | File |
| --- | --- | --- | --- | --- |
| GA | が | ガ | ga | `audio/dakuon/ga.mp3` |
| GA | ぎ | ギ | gi | `audio/dakuon/gi.mp3` |
| GA | ぐ | グ | gu | `audio/dakuon/gu.mp3` |
| GA | げ | ゲ | ge | `audio/dakuon/ge.mp3` |
| GA | ご | ゴ | go | `audio/dakuon/go.mp3` |
| ZA | ざ | ザ | za | `audio/dakuon/za.mp3` |
| ZA | じ | ジ | ji | `audio/dakuon/ji.mp3` |
| ZA | ず | ズ | zu | `audio/dakuon/zu.mp3` |
| ZA | ぜ | ゼ | ze | `audio/dakuon/ze.mp3` |
| ZA | ぞ | ゾ | zo | `audio/dakuon/zo.mp3` |
| DA | だ | ダ | da | `audio/dakuon/da.mp3` |
| DA | ぢ | ヂ | dji | `audio/dakuon/di.mp3` |
| DA | づ | ヅ | dzu | `audio/dakuon/du.mp3` |
| DA | で | デ | de | `audio/dakuon/de.mp3` |
| DA | ど | ド | do | `audio/dakuon/do.mp3` |
| BA | ば | バ | ba | `audio/dakuon/ba.mp3` |
| BA | び | ビ | bi | `audio/dakuon/bi.mp3` |
| BA | ぶ | ブ | bu | `audio/dakuon/bu.mp3` |
| BA | べ | ベ | be | `audio/dakuon/be.mp3` |
| BA | ぼ | ボ | bo | `audio/dakuon/bo.mp3` |

#### Handakuon (p sounds)

| Row | Hiragana | Katakana | Romaji | File |
| --- | --- | --- | --- | --- |
| PA | ぱ | パ | pa | `audio/handakuon/pa.mp3` |
| PA | ぴ | ピ | pi | `audio/handakuon/pi.mp3` |
| PA | ぷ | プ | pu | `audio/handakuon/pu.mp3` |
| PA | ぺ | ペ | pe | `audio/handakuon/pe.mp3` |
| PA | ぽ | ポ | po | `audio/handakuon/po.mp3` |

#### Yoon (contracted)

| Row | Hiragana | Katakana | Romaji | File |
| --- | --- | --- | --- | --- |
| KYA | きゃ | キャ | kya | `audio/yoon/kya.mp3` |
| KYA | きゅ | キュ | kyu | `audio/yoon/kyu.mp3` |
| KYA | きょ | キョ | kyo | `audio/yoon/kyo.mp3` |
| SHA | しゃ | シャ | sha | `audio/yoon/sya.mp3` |
| SHA | しゅ | シュ | shu | `audio/yoon/syu.mp3` |
| SHA | しょ | ショ | sho | `audio/yoon/syo.mp3` |
| CHA | ちゃ | チャ | cha | `audio/yoon/cya.mp3` |
| CHA | ちゅ | チュ | chu | `audio/yoon/cyu.mp3` |
| CHA | ちょ | チョ | cho | `audio/yoon/cyo.mp3` |
| NYA | にゃ | ニャ | nya | `audio/yoon/nya.mp3` |
| NYA | にゅ | ニュ | nyu | `audio/yoon/nyu.mp3` |
| NYA | にょ | ニョ | nyo | `audio/yoon/nyo.mp3` |
| HYA | ひゃ | ヒャ | hya | `audio/yoon/hya.mp3` |
| HYA | ひゅ | ヒュ | hyu | `audio/yoon/hyu.mp3` |
| HYA | ひょ | ヒョ | hyo | `audio/yoon/hyo.mp3` |
| MYA | みゃ | ミャ | mya | `audio/yoon/mya.mp3` |
| MYA | みゅ | ミュ | myu | `audio/yoon/myu.mp3` |
| MYA | みょ | ミョ | myo | `audio/yoon/myo.mp3` |
| RYA | りゃ | リャ | rya | `audio/yoon/rya.mp3` |
| RYA | りゅ | リュ | ryu | `audio/yoon/ryu.mp3` |
| RYA | りょ | リョ | ryo | `audio/yoon/ryo.mp3` |
| GYA | ぎゃ | ギャ | gya | `audio/yoon/gya.mp3` |
| GYA | ぎゅ | ギュ | gyu | `audio/yoon/gyu.mp3` |
| GYA | ぎょ | ギョ | gyo | `audio/yoon/gyo.mp3` |
| JA | じゃ | ジャ | ja | `audio/yoon/zya.mp3` |
| JA | じゅ | ジュ | ju | `audio/yoon/zyu.mp3` |
| JA | じょ | ジョ | jo | `audio/yoon/zyo.mp3` |
| BYA | びゃ | ビャ | bya | `audio/yoon/bya.mp3` |
| BYA | びゅ | ビュ | byu | `audio/yoon/byu.mp3` |
| BYA | びょ | ビョ | byo | `audio/yoon/byo.mp3` |
| PYA | ぴゃ | ピャ | pya | `audio/yoon/pya.mp3` |
| PYA | ぴゅ | ピュ | pyu | `audio/yoon/pyu.mp3` |
| PYA | ぴょ | ピョ | pyo | `audio/yoon/pyo.mp3` |

</details>

## Licence and credits

The recordings come from [Learn Japanese Adventure](https://www.learn-japanese-adventure.com/learn-how-to-speak-japanese.html)
and are used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); the normalised
clips in this dataset carry the same licence. Please keep the attribution when you reuse them.

The Kana Trainer application itself is Apache-2.0 and lives at
[github.com/arsalan-anwari/kana-trainer](https://github.com/arsalan-anwari/kana-trainer).

## Citation

```bibtex
@misc{anwari_kana_sounds,
  title  = {Kana Sounds},
  author = {Anwari, Arsalan},
  url    = {https://huggingface.co/datasets/arsalan-anwari/kana-sounds},
  note   = {Recordings from Learn Japanese Adventure, CC BY 4.0}
}
```
