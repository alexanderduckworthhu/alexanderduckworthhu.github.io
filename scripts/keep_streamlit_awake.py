#!/usr/bin/env python3
"""Visit Streamlit Cloud demos and wake them if sleeping."""

from __future__ import annotations

import sys
import time

from playwright.sync_api import TimeoutError as PlaywrightTimeout
from playwright.sync_api import sync_playwright

APPS = [
    "https://where-needs-overlap.streamlit.app/",
    "https://multilingual-rag-assistant.streamlit.app/",
    "https://icu-mortality-vital-shap.streamlit.app/",
    "https://snp-trait-explorer.streamlit.app/",
    "https://climate-migration-risk-index.streamlit.app/",
    "https://esg-composite-scoring.streamlit.app/",
]

WAKE_SELECTORS = [
    'button:has-text("Yes, get this app back up!")',
    'button:has-text("Yes, get this app back up")',
    'text=Yes, get this app back up!',
]


def wake_app(page, url: str) -> str:
    page.goto(url, wait_until="domcontentloaded", timeout=90_000)
    time.sleep(3)

    for selector in WAKE_SELECTORS:
        try:
            btn = page.locator(selector).first
            if btn.is_visible(timeout=2_000):
                btn.click(timeout=10_000)
                page.wait_for_load_state("domcontentloaded", timeout=90_000)
                time.sleep(8)
                return "woke"
        except PlaywrightTimeout:
            continue
        except Exception:
            continue

    # Already awake: give the SPA a moment to open the websocket session.
    time.sleep(5)
    return "visited"


def main() -> int:
    failures = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        )
        page = context.new_page()

        for url in APPS:
            try:
                status = wake_app(page, url)
                print(f"OK  [{status}] {url}")
            except Exception as exc:
                failures += 1
                print(f"FAIL {url}: {exc}", file=sys.stderr)

        browser.close()

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
