# Usage: python3 tools/cachebust.py .   (run from the repository root after changing any CSS or JS file)
# Adds ?v=<content hash> to CSS and JS links in every HTML page, so browsers fetch new versions after each push.
import hashlib, pathlib, re, sys
site = pathlib.Path(sys.argv[1])
assets = {}
for f in list(site.glob("assets/css/*.css")) + list(site.glob("assets/js/*.js")):
    assets[f.relative_to(site).as_posix()] = hashlib.sha1(f.read_bytes()).hexdigest()[:8]
n = 0
for page in site.rglob("*.html"):
    if "posts" in page.parts: continue
    s = page.read_text()
    def sub(m):
        global n
        path = m.group(2)
        key = path.lstrip("./")
        while key.startswith("../"): key = key[3:]
        if key not in assets: return m.group(0)
        n += 1
        return f'{m.group(1)}{path}?v={assets[key]}{m.group(4)}'
    s2 = re.sub(r'((?:href|src)=")((?:\.\./)*assets/(?:css|js)/[^"?]+)(\?v=[0-9a-f]+)?(")', sub, s)
    if s2 != s: page.write_text(s2)
print("versioned links:", n)
