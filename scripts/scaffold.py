#!/usr/bin/env python3
"""Scaffold a React+Vite+TS+Tailwind project from the bundled template.

Usage: python scaffold.py <target-dir> [--name <package-name>]

Copies assets/react-vite-template into <target-dir>, renames the package in
package.json and the title in index.html to <package-name> (default: target
directory name), then prints next steps. Never overwrites existing files.
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

TEMPLATE = Path(__file__).resolve().parent.parent / "assets" / "react-vite-template"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", help="Directory to create the project in")
    parser.add_argument("--name", help="Package name (default: target dir name)")
    args = parser.parse_args()

    target = Path(args.target).resolve()
    if target.exists() and any(target.iterdir()):
        print(f"ERROR: {target} exists and is not empty", file=sys.stderr)
        return 1
    if not TEMPLATE.is_dir():
        print(f"ERROR: template not found at {TEMPLATE}", file=sys.stderr)
        return 1

    shutil.copytree(TEMPLATE, target)

    name = args.name or target.name
    pkg_path = target / "package.json"
    pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
    pkg["name"] = name
    pkg_path.write_text(json.dumps(pkg, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    html_path = target / "index.html"
    html = html_path.read_text(encoding="utf-8").replace(
        "<title>React Vite Template</title>", f"<title>{name}</title>"
    )
    html_path.write_text(html, encoding="utf-8")

    print(f"Scaffolded project at {target}")
    print("Next: npm install && npm run dev")
    return 0


if __name__ == "__main__":
    sys.exit(main())
