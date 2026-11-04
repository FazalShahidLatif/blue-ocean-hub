#!/usr/bin/env python3
"""
Replace the markdown body of an article in the source data files.

Usage: python set_article_content.py <article-id> <content-file>

Reads the current src/data/articles*.ts files, locates the article entry by id,
and swaps its `content: \`...\`` value with the contents of <content-file>
(preserved verbatim as a template literal).
"""
import glob
import re
import sys


def find_and_replace(article_id: str, new_content: str) -> bool:
    files = sorted(glob.glob("src/data/articles*.ts"))
    for path in files:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

        # Locate the article object by id
        id_match = re.search(r'id:\s*"%s"' % re.escape(article_id), text)
        if not id_match:
            continue

        # From the id position, find the content: ` ... ` block
        start_search = id_match.end()
        window = text[start_search:start_search + 2000]
        content_match = re.search(r"content:\s*`", window)
        if not content_match:
            print(f"  could not locate content field for {article_id} in {path}")
            continue

        content_start = start_search + content_match.end()
        # Find the closing backtick, skipping escaped ones (\`)
        i = content_start
        while i < len(text):
            if text[i] == "`" and (i == 0 or text[i - 1] != "\\"):
                break
            i += 1
        end = i

        old = text[content_start:end]
        new_text = text[:content_start] + new_content + text[end:]

        with open(path, "w", encoding="utf-8") as f:
            f.write(new_text)

        print(f"  updated {article_id} in {path}")
        print(f"  old length: {len(old)} chars | new length: {len(new_content)} chars")
        return True

    print(f"  article id '{article_id}' not found in any articles*.ts")
    return False


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    aid, cfile = sys.argv[1], sys.argv[2]
    with open(cfile, "r", encoding="utf-8") as f:
        content = f.read()
    ok = find_and_replace(aid, content)
    sys.exit(0 if ok else 1)
