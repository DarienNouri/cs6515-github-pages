import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/build-discovery.py"
spec = importlib.util.spec_from_file_location("discovery", SCRIPT)
discovery = importlib.util.module_from_spec(spec)
spec.loader.exec_module(discovery)


class DiscoveryTests(unittest.TestCase):
    def test_export_is_static_complete_deduplicated_and_repeatable(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            lesson = ('<title>DP &amp; graphs</title><nav>Navigation noise</nav><main>'
                      '<h1>Two sequences</h1><p>Use \\(L(i,j)\\) when X&lt;Y.</p>'
                      '<pre><code>if x &lt; y:  \n    return L[i][j]  </code></pre>'
                      '<script>hiddenScript()</script><p>Finish.</p></main>')
            (root / "lesson one.html").write_text(lesson)
            (root / "copy.html").write_text(lesson)
            (root / "transcripts").mkdir()
            (root / "transcripts/lecture.txt").write_text("Spoken lecture with a distinct explanation.  \n \t\n")
            (root / "reading.pdf").write_bytes(b"%PDF-test")
            (root / "vendor").mkdir()
            (root / "vendor/ignored.html").write_text(lesson)
            with contextlib.redirect_stdout(io.StringIO()):
                discovery.build(root, "https://example.org/course/")
            manifest = json.loads((root / "content-manifest.json").read_text())
            self.assertEqual(manifest["distinct_sources"], 2)
            self.assertEqual(len(manifest["sources"]), 3)
            self.assertEqual(len(manifest["pdfs"]), 1)
            source = (root / "course-source.txt").read_text()
            self.assertEqual(source.count("# DP & graphs"), 1)
            self.assertIn("Spoken lecture", source)
            self.assertIn("\\(L(i,j)\\)", source)
            self.assertIn("if x < y:\n    return L[i][j]", source)
            self.assertNotIn("hiddenScript", source)
            self.assertNotIn("Navigation noise", source)
            combined = (root / "course-source.html").read_text()
            for export in (source, combined):
                self.assertTrue(all(line == line.rstrip() for line in export.splitlines()))
            self.assertIn("if x &lt; y:", combined)
            self.assertNotIn("<script", combined)
            xml = ET.parse(root / "sitemap.xml")
            urls = [e.text for e in xml.findall(".//{*}loc")]
            self.assertIn("https://example.org/course/lesson%20one.html", urls)
            self.assertIn("https://example.org/course/reading.pdf", urls)
            self.assertTrue(all(u.startswith("https://example.org/course/") for u in urls))
            first = {p.name: p.read_bytes() for p in root.iterdir() if p.is_file()}
            with contextlib.redirect_stdout(io.StringIO()):
                discovery.build(root, "https://example.org/course/")
            self.assertEqual(first, {p.name: p.read_bytes() for p in root.iterdir() if p.is_file()})


if __name__ == "__main__":
    unittest.main()
