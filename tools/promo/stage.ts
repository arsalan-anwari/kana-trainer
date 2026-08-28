import type { Locator, Page } from "@playwright/test";

export type Card = { title: string; lines: string[] };

type StageApi = {
  caption: (text: string) => void;
  hideCaption: () => void;
  card: (card: Card) => void;
  hideCard: () => void;
  scrollTo: (y: number, ms: number) => void;
};

declare global {
  interface Window {
    __promo: StageApi;
  }
}

// Injects the cursor, caption, card and scroll layer into the page.
export function installStage(intro: Card): void {
  const css = `
    #promo-layer, #promo-layer * { box-sizing: border-box; }
    #promo-cursor {
      position: fixed; left: 50%; top: 50%; z-index: 2147483000;
      width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 999px;
      border: 2px solid #1b1915; background: rgba(27, 25, 21, 0.18);
      box-shadow: 0 2px 10px rgba(27, 25, 21, 0.25);
      pointer-events: none; opacity: 0;
      transition: opacity 200ms ease, left 70ms linear, top 70ms linear;
    }
    #promo-cursor.on { opacity: 1; }
    #promo-tap {
      position: fixed; left: 50%; top: 50%; z-index: 2147482999;
      width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 999px;
      border: 2px solid #1b1915; pointer-events: none; opacity: 0;
    }
    #promo-tap.go { animation: promo-tap 420ms ease-out; }
    @keyframes promo-tap {
      from { opacity: 0.8; transform: scale(1); }
      to { opacity: 0; transform: scale(3.2); }
    }
    #promo-caption {
      position: fixed; left: 50%; bottom: 34px; z-index: 2147483001;
      transform: translate(-50%, 14px);
      max-width: 78vw; padding: 13px 30px; border-radius: 999px;
      background: #1b1915; color: #f7f2e7;
      font: 600 21px/1.25 ui-sans-serif, system-ui, sans-serif;
      letter-spacing: 0.005em; text-align: center; white-space: nowrap;
      box-shadow: 0 12px 30px rgba(27, 25, 21, 0.22);
      opacity: 0; transition: opacity 220ms ease, transform 220ms ease;
      pointer-events: none;
    }
    #promo-caption.on { opacity: 1; transform: translate(-50%, 0); }
    #promo-card {
      position: fixed; inset: 0; z-index: 2147483002;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 22px; background: #f7f2e7; color: #1b1915;
      font-family: ui-sans-serif, system-ui, sans-serif; text-align: center;
      opacity: 0; transition: opacity 320ms ease; pointer-events: none;
      transform: translateZ(0); will-change: opacity;
    }
    #promo-card.on { opacity: 1; }
    #promo-card .mark {
      display: flex; align-items: center; justify-content: center;
      width: 100px; height: 100px; border-radius: 24px;
      background: #1b1915; color: #f7f2e7; font-size: 54px; font-weight: 500;
      font-family: "Hiragino Kaku Gothic ProN", "Noto Sans CJK JP", "Noto Sans JP", sans-serif;
    }
    #promo-card .title { font-size: 54px; font-weight: 800; letter-spacing: -0.02em; }
    #promo-card .line { font-size: 24px; color: #6e6657; }
    #promo-card .line.mono { font-family: ui-monospace, monospace; color: #1b1915; }
  `;

  const build = (): void => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    const layer = document.createElement("div");
    layer.id = "promo-layer";
    layer.innerHTML =
      '<div id="promo-cursor"></div><div id="promo-tap"></div><div id="promo-caption"></div>' +
      '<div id="promo-card"></div>';
    document.body.appendChild(layer);

    const cursor = document.getElementById("promo-cursor") as HTMLElement;
    const tap = document.getElementById("promo-tap") as HTMLElement;
    const caption = document.getElementById("promo-caption") as HTMLElement;
    const card = document.getElementById("promo-card") as HTMLElement;

    window.addEventListener(
      "mousemove",
      (event) => {
        cursor.classList.add("on");
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      },
      true
    );

    window.addEventListener(
      "mousedown",
      (event) => {
        tap.style.left = `${event.clientX}px`;
        tap.style.top = `${event.clientY}px`;
        tap.classList.remove("go");
        void tap.offsetWidth;
        tap.classList.add("go");
      },
      true
    );

    const paint = (next: Card): void => {
      const lines = next.lines
        .map((line) => `<div class="line${line.startsWith("$") ? " mono" : ""}">${line}</div>`)
        .join("");
      card.innerHTML = `<div class="mark">あ</div><div class="title">${next.title}</div>${lines}`;
    };

    window.__promo = {
      caption: (text) => {
        caption.textContent = text;
        caption.classList.add("on");
      },
      hideCaption: () => caption.classList.remove("on"),
      card: (next) => {
        paint(next);
        card.classList.add("on");
      },
      hideCard: () => card.classList.remove("on"),
      scrollTo: (y, ms) => {
        const from = window.scrollY;
        const distance = y - from;
        const started = performance.now();
        const step = (now: number): void => {
          const t = Math.min(1, (now - started) / ms);
          const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
          window.scrollTo(0, from + distance * eased);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    };

    // show the intro card while the app mounts
    paint(intro);
    card.classList.add("on");
    card.style.transition = "none";
    requestAnimationFrame(() => {
      card.style.transition = "";
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
}

// Node side remote control for the stage.
export class Stage {
  private readonly started = Date.now();

  constructor(private readonly page: Page) {}

  // prints where a beat lands on the timeline
  mark(label: string): void {
    console.log(`  ${((Date.now() - this.started) / 1000).toFixed(1)}s  ${label}`);
  }

  beat(ms: number): Promise<void> {
    return this.page.waitForTimeout(ms);
  }

  async caption(text: string, settle = 0): Promise<void> {
    await this.page.evaluate((value) => window.__promo.caption(value), text);
    if (settle > 0) await this.beat(settle);
  }

  async hideCaption(): Promise<void> {
    await this.page.evaluate(() => window.__promo.hideCaption());
  }

  async card(card: Card, hold: number): Promise<void> {
    await this.page.evaluate((value) => window.__promo.card(value), card);
    await this.beat(hold);
  }

  async hideCard(): Promise<void> {
    await this.page.evaluate(() => window.__promo.hideCard());
    await this.beat(340);
  }

  // scrolls the window with an eased animation and waits for it to land
  async scroll(y: number, ms = 520): Promise<void> {
    await this.page.evaluate(
      ({ target, duration }) => window.__promo.scrollTo(target, duration),
      { target: y, duration: ms }
    );
    await this.beat(ms + 80);
  }

  // centres a target that sits off screen and returns its centre point
  private async reveal(target: Locator): Promise<{ x: number; y: number } | null> {
    const view = this.page.viewportSize();
    let box = await target.boundingBox();
    if (box === null || view === null) return null;

    if (box.y < 90 || box.y + box.height > view.height - 130) {
      const top = await this.page.evaluate(() => window.scrollY);
      await this.scroll(Math.max(0, top + box.y + box.height / 2 - view.height / 2), 260);
      box = await target.boundingBox();
      if (box === null) return null;
    }

    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }

  // scrolls an element to the top of the screen
  async frame(selector: string, offset = 14, ms = 240): Promise<void> {
    const y = await this.page.evaluate(
      ({ target, top }) => {
        const element = document.querySelector(target);
        return element === null ? null : window.scrollY + element.getBoundingClientRect().top - top;
      },
      { target: selector, top: offset }
    );
    if (y === null) return;
    await this.scroll(Math.max(0, y), ms);
  }

  // moves the cursor onto a target and clicks it, pin skips the scroll
  async tap(target: Locator, settle = 220, pin = false): Promise<void> {
    const point = pin ? await this.centre(target) : await this.reveal(target);
    if (point !== null) await this.page.mouse.move(point.x, point.y, { steps: 5 });
    await target.click();
    await this.beat(settle);
  }

  private async centre(target: Locator): Promise<{ x: number; y: number } | null> {
    const box = await target.boundingBox();
    return box === null ? null : { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }

  // brings a target into view without clicking it
  async show(target: Locator, settle = 260): Promise<void> {
    await this.reveal(target);
    await this.beat(settle);
  }

  // moves the cursor onto a target without clicking it
  async hover(target: Locator, settle = 220): Promise<void> {
    const point = await this.reveal(target);
    if (point === null) return;
    await this.page.mouse.move(point.x, point.y, { steps: 5 });
    await this.beat(settle);
  }

  async type(text: string): Promise<void> {
    await this.page.keyboard.type(text, { delay: 85 });
  }

  async press(key: string, settle = 200): Promise<void> {
    await this.page.keyboard.press(key);
    await this.beat(settle);
  }
}
