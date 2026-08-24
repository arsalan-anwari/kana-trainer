# Troubleshooting

Known problems on specific systems and hardware, and their workarounds.

## 2026-08-24

### Crash notification for WebKitWebProcess when closing the app on KDE

```
/usr/libexec/webkit2gtk-4.1/WebKitWebProcess has encountered a fatal error and was closed.
```

Cosmetic, and not a bug in Kana Trainer. WebKitGTK runs the page in a separate
process, and on KDE that process segfaults while shutting itself down: a
worker thread releases Skia's GL objects from a thread-local destructor while
the main thread is already inside the driver's EGL teardown, so Skia touches
driver state that is being freed.

It happens only after you close the window, once everything is already being
freed, so nothing is lost and no data is affected. Kana Trainer cannot prevent
it; the crash is in a process it has already asked to exit. 

To stop KDE Plasma from showing the notification, mask the service that hands
core dumps to DrKonqi. It is a system unit, so this needs root, and it silences
the crash dialog for every application, not just this one. Core dumps are still
written and `coredumpctl` still works.

```sh
sudo systemctl mask drkonqi-coredump-processor@.service
```

## 2026-08-24

### Blank window or immediate exit on Wayland with an Nvidia GPU

```
Gdk-Message: Error 71 (Protocol error) dispatching to Wayland display.
```

GTK3 decides at the start of each frame whether to draw with GL or into a
shared-memory buffer, based on whether the window already has a paint GL
context. WebKitGTK only creates one from inside the draw, so the first frame
starts as a shared-memory frame and the window's EGL surface appears halfway
through it. Nvidia's driver arms explicit sync on the surface as soon as that
EGL surface exists, GTK then attaches the shared-memory buffer, which carries no
acquire point, and the compositor drops the connection. Mesa drivers (Intel,
AMD) do not arm explicit sync here, so the same sequence is harmless there.

Since 1.5.4 the app creates a GL context on its window before the first frame,
so every frame is a GL frame and no shared-memory buffer is ever attached. This
keeps hardware acceleration; 1.5.2 and 1.5.3 fixed the crash by turning
WebKitGTK's DMA-BUF renderer off instead, which gave up the GPU path.

The workaround only runs when the session is Wayland and the Nvidia kernel
driver is loaded (`/sys/module/nvidia_drm` exists). A session counts as Wayland
when `WAYLAND_DISPLAY`, `WAYLAND_SOCKET` or `XDG_SESSION_TYPE=wayland` is set
and `GDK_BACKEND` is not pointed at X11, which also covers launches that inherit
no session environment, such as a systemd unit or `sudo`.

If it still fails, fall back to the old workaround, which also disables the
early GL context:

```sh
WEBKIT_DISABLE_DMABUF_RENDERER=1 kana-trainer
```

Background and protocol traces: [tauri-apps/tauri#10702](https://github.com/tauri-apps/tauri/issues/10702).
