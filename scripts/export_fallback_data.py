"""
Sinkronkan data budaya backend ke paket fallback frontend.

Jalankan dari root repo setiap kali data budaya backend berubah:
    python scripts/export_fallback_data.py
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "backend"))

from app.data.cultures import CULTURES  # noqa: E402

OUT_DIR = os.path.join(ROOT, "frontend", "src", "data")
OUT_FILE = os.path.join(OUT_DIR, "cultures.json")


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(CULTURES, f, ensure_ascii=False, separators=(",", ":"))
    size_kb = os.path.getsize(OUT_FILE) // 1024
    print(f"{len(CULTURES)} entri budaya -> {OUT_FILE} ({size_kb} KB)")


if __name__ == "__main__":
    main()
