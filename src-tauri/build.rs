fn main() {
    // Google Play requires 16 KB page alignment for native libraries on
    // 64-bit Android (enforced for new submissions since Nov 2025). Tauri's
    // build system ignores rustflags set in .cargo/config.toml for Android
    // targets, so the linker flags have to be injected here instead.
    let target = std::env::var("TARGET").unwrap_or_default();
    if target == "aarch64-linux-android" || target == "x86_64-linux-android" {
        println!("cargo:rustc-link-arg=-Wl,-z,max-page-size=16384");
        println!("cargo:rustc-link-arg=-Wl,-z,common-page-size=16384");
    }

    tauri_build::build();
}
