#!/usr/bin/env python3
"""Resolve the server.ts rebase conflict.

The upstream commits (cce4237, 05c527e) changed getSEOForUrl/injectMeta --
the exact block this branch moved into src/lib/seo-core.ts. Our version of
seo-core.ts already contains those upstream changes PLUS the later
noindex/future-date logic, so the correct resolution is to keep our import
header and discard the stale duplicate block from upstream.
"""
from pathlib import Path

P = Path(r"C:\Users\accts\blueoceanhub\repo\server.ts")
src = P.read_text(encoding="utf-8")

assert "<<<<<<<" in src, "no conflict markers found"

lines = src.split("\n")
out, i = [], 0
ours_seen = theirs_seen = False
while i < len(lines):
    ln = lines[i]
    if ln.startswith("<<<<<<<"):
        ours_seen = True
        i += 1
        while i < len(lines) and not lines[i].startswith("======="):
            i += 1          # skip OUR side
        i += 1
        while i < len(lines) and not lines[i].startswith(">>>>>>>"):
            i += 1          # skip THEIR side
        i += 1
        continue
    if ln.startswith("=======") or ln.startswith(">>>>>>>"):
        i += 1
        continue
    out.append(ln)
    i += 1

resolved = "\n".join(out)
P.write_text(resolved, encoding="utf-8")

assert ours_seen and theirs_seen, "expected both conflict sides to be skipped"
assert "<<<<<<" not in resolved and ">>>>>>>" not in resolved, "markers remain"
assert "from \"./src/lib/seo-core\"" in resolved, "lost the shared SEO import"
assert "function getSEOForUrl" not in resolved, "stale duplicate block survived"

print(f"server.ts resolved: {len(src.splitlines())} -> {len(resolved.splitlines())} lines")
print("kept: import from src/lib/seo-core")
print("discarded: upstream's stale inline getSEOForUrl/injectMeta")
print("conflict markers remaining:", resolved.count("<<<<<<"))