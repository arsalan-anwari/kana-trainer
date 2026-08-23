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

Fixed in 1.5.2. Since 1.5.3 the renderer is only disabled when the session is
Wayland and the Nvidia kernel driver is loaded (`/sys/module/nvidia_drm`
exists), so Mesa systems keep the GPU path. A session counts as Wayland when
`WAYLAND_DISPLAY`, `WAYLAND_SOCKET` or `XDG_SESSION_TYPE=wayland` is set and
`GDK_BACKEND` is not pointed at X11, which also covers launches that inherit no
session environment, such as a systemd unit or `sudo`.

On 1.5.1 and older, or if the detection misses your setup, start the app with:

```sh
WEBKIT_DISABLE_DMABUF_RENDERER=1 kana-trainer
```

The same variable still works in reverse: set it to `0` to keep the GPU path if your driver handles it.
