#!/usr/bin/env python3
"""Fingerprint the reader-facing copy of dxn.is (index.html and llms.txt).

dxn.md mirrors this copy in its canon. The dxn.md repo stores the fingerprint
of the dxn.is copy it was last synced to in DXNIS_COPY_FINGERPRINT, and
.githooks/pre-push blocks a dxn.is push whose copy fingerprint differs from it.

Usage:
  python3 scripts/copy_fingerprint.py            # working tree
  python3 scripts/copy_fingerprint.py --rev HEAD # a commit
"""
from __future__ import annotations

import argparse
import hashlib
import html
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = ("index.html", "llms.txt")


def read(path: str, rev: str | None) -> str:
    if rev:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "show", f"{rev}:{path}"],
            capture_output=True, text=True, check=True,
        )
        return out.stdout
    return (ROOT / path).read_text(encoding="utf-8")


def visible_copy(page: str) -> str:
    """Text a person or agent reads: body text, meta descriptions, and JSON-LD."""
    metas = re.findall(r'<meta[^>]+(?:name|property)="(?:description|og:description|twitter:description|og:title|twitter:title)"[^>]*>', page, re.I)
    meta_text = " ".join(re.findall(r'content="([^"]*)"', " ".join(metas)))
    ld = " ".join(re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', page, re.S | re.I))
    body = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
    body = re.sub(r"<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", body, flags=re.S | re.I)
    body = re.sub(r"<[^>]+>", " ", body)
    return " ".join([meta_text, ld, html.unescape(body)])


def fingerprint(rev: str | None = None) -> str:
    parts = []
    for name in FILES:
        text = read(name, rev)
        if name.endswith(".html"):
            text = visible_copy(text)
        parts.append(" ".join(text.split()))
    return hashlib.sha256("\n".join(parts).encode()).hexdigest()[:16]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rev", help="git revision to fingerprint instead of the working tree")
    args = parser.parse_args()
    print(fingerprint(args.rev))
    return 0


if __name__ == "__main__":
    sys.exit(main())
