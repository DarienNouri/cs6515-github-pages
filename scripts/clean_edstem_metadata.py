#!/usr/bin/env python3
"""Clean EdStem scraper metadata and anonymize comment user attributions across HTML files.

Removes:
  - Top post metadata block:
      <p><strong>Category</strong>: Staff Use Only &gt; Supplemental Material
      <strong>Date</strong>: ... <strong>Link</strong>: <a href="https://edstem.org/...">...</a>
      <strong>Pinned</strong>: ... | <strong>Votes</strong>: ... |
      <strong>Views</strong>: ...</p>
  - User identifiers in comment headers:
      <li><p><strong>Comment</strong> by User <id> on <date> (Votes: <n>)</p>  -> <li><p><strong>Comment</strong></p>
      <li><strong>Comment</strong> by User <id> on <date> (Votes: <n>)       -> <li><strong>Comment</strong>
"""

import glob
import os
import re
import sys

PAT_META = re.compile(r"<p><strong>Category</strong>:.*?</p>\s*", re.DOTALL)
PAT_P = re.compile(r"(<li>\s*<p>\s*<strong>Comment</strong>)\s+by\s+User\s+\d+.*?(</p>)", re.DOTALL)
PAT_NOP = re.compile(r"(<li>\s*<strong>Comment</strong>)\s+by\s+User\s+\d+.*?(?=\s*\n\s*<blockquote>)", re.DOTALL)

def process_repo(repo_root: str):
    print(f"\nProcessing repository: {repo_root}")
    all_html = glob.glob(os.path.join(repo_root, "**/*.html"), recursive=True)
    
    modified_files = 0
    total_meta_removed = 0
    total_comments_cleaned = 0

    for path in sorted(all_html):
        with open(path, "r", encoding="utf-8") as fp:
            orig = fp.read()
        
        c, n_meta = PAT_META.subn("", orig)
        c, n_p = PAT_P.subn(r"\1\2", c)
        c, n_nop = PAT_NOP.subn(r"\1", c)

        n_comments = n_p + n_nop
        if n_meta > 0 or n_comments > 0:
            with open(path, "w", encoding="utf-8") as fp:
                fp.write(c)
            modified_files += 1
            total_meta_removed += n_meta
            total_comments_cleaned += n_comments
            rel = os.path.relpath(path, repo_root)
            print(f"  Cleaned {rel}: {n_meta} metadata blocks, {n_comments} comments")

    print(f"Repo summary for {os.path.basename(repo_root)}:")
    print(f"  Files modified: {modified_files}")
    print(f"  Post metadata blocks removed: {total_meta_removed}")
    print(f"  Comments anonymized: {total_comments_cleaned}")

def main():
    repos = [
        "/Users/darien/projects/cs6515-notes",
        "/Users/darien/projects/cs6515-github-pages"
    ]
    for r in repos:
        if os.path.exists(r):
            process_repo(r)
        else:
            print(f"Repo path not found: {r}", file=sys.stderr)

if __name__ == "__main__":
    main()
