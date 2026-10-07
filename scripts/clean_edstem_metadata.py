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

def clean_edstem_links(text: str) -> str:
    text = re.sub(
        r'<p>See\s+<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>#183</a>\s*-->\s*does\s+this\s+link\s+work\s+for\s+anyone\?</p>',
        r'<p>See discussion topic #183.</p>',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'\(here:\s*<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]><span>https?://edstem\.org[^<]*</span></a>\s*\)',
        r'',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<p><a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*slides/988468[\"\x27]>https?://edstem\.org[^<]*</a></p>\s*',
        r'',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'\(see:\s*<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>https?://edstem\.org[^<]*</a>\),',
        r'provided,',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<ul>\s*<li><a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*slides/\d+[\"\x27]>https?://edstem\.org[^<]*</a></li>\s*</ul>',
        r'',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>one\s+mystery</a>',
        r'one mystery',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<p>This is discussed in Course Readiness:\s*<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]><span>https?://edstem\.org[^<]*</span></a></p>',
        r'<p>This is discussed in Course Readiness.</p>',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<ul>\s*<li><p><a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]><span>https?://edstem\.org[^<]*</span></a></p></li>\s*<li><p><a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]><span>https?://edstem\.org[^<]*</span></a></p></li>\s*</ul>',
        r'<p>Refer to the sample solutions and recurrence relation formatting examples above.</p>',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<p><a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>https?://edstem\.org[^<]*</a></p>\s*<p>And</p>\s*<p><a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>https?://edstem\.org[^<]*</a></p>',
        r'<p>Refer to the sample solutions and recurrence relation formatting examples above.</p>',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<p>That is equally correct, for the same reasons stated here:\s*<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>https?://edstem\.org[^<]*</a></p>',
        r'<p>That is equally correct, for the same reasons stated in earlier guidance.</p>',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<p>Commentary on multiple tables for a separate question, but maybe\s*useful to think about here too:</p>\s*<ul>\s*<li><a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>https?://edstem\.org[^<]*</a></li>\s*</ul>',
        r'<p>Commentary on multiple tables: refer to the multi-table dynamic programming examples.</p>',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>(Follow\s+the\s+examples\s+and\s+sample\s+solutions)</a>',
        r'\1',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<p>Discussed here:\s*<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>https?://edstem\.org[^<]*</a></p>',
        r'<p>Discussed in the course guidance examples.</p>',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'See:\s*<a\s+href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27]>https?://edstem\.org[^<]*</a>',
        r'See earlier guidance examples.',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r'<a\s+[^>]*href=[\"\x27]https?://edstem\.org[^\"\x27]*[\"\x27][^>]*>(.*?)</a>',
        lambda m: m.group(1) if not ('http' in m.group(1)) else '',
        text,
        flags=re.IGNORECASE | re.DOTALL
    )
    return text

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
        c = clean_edstem_links(c)

        n_comments = n_p + n_nop
        if c != orig:
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
