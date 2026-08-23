# Troubleshooting

Known problems on specific systems and hardware, and their workarounds.

## 2026-08-23

### Blank window or immediate exit on Wayland with an Nvidia GPU

```
Gdk-Message: Error 71 (Protocol error) dispatching to Wayland display.
```

WebKitGTK renders through DMA-BUF by default. On the Nvidia proprietary driver
the buffers it hands the compositor are rejected, the compositor drops the
connection and GDK reports the protocol error. Mesa drivers (Intel, AMD) are
not affected.

Fixed in 1.5.2, which disables the DMA-BUF renderer on Linux. On 1.5.1 and
older, start the app with:

```sh
WEBKIT_DISABLE_DMABUF_RENDERER=1 kana-trainer
```

The same variable still works in reverse: set it to `0` to keep the GPU path if your driver handles it.
