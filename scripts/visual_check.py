from pathlib import Path
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4173"
PAGES = [
    ("home", "/"),
    ("experience", "/experience"),
    ("projects", "/projects/"),
    ("project-detail", "/projects/xerina-atlas"),
    ("articles", "/articles/"),
    ("article-detail", "/articles/ai-ready-content"),
    ("about", "/about"),
    ("resume", "/resume"),
]


def audit_page(page, name: str, path: str, viewport: str) -> list[str]:
    errors: list[str] = []
    response = page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
    if response is None or not response.ok:
        errors.append(f"{name}: HTTP response was not successful")

    h1_count = page.locator("h1").count()
    if h1_count != 1:
        errors.append(f"{name}: expected one h1, found {h1_count}")

    overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    if overflow:
        errors.append(f"{name}: horizontal overflow at {viewport}")

    broken_local_links = page.eval_on_selector_all(
        'a[href^="/"]',
        "els => els.filter(el => !el.getAttribute('href')).map(el => el.outerHTML)",
    )
    if broken_local_links:
        errors.append(f"{name}: local link without href")

    return errors


def main() -> None:
    all_errors: list[str] = []
    console_errors: list[str] = []
    network_errors: list[str] = []
    screenshot_dir = Path("/tmp/xerina-atlas-visual-check")
    screenshot_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        )

        for viewport_name, width, height in [
            ("desktop", 1440, 1000),
            ("mobile", 375, 812),
        ]:
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()

            def on_console(message) -> None:
                if message.type not in {"error", "warning"}:
                    return
                details = []
                for argument in message.args:
                    try:
                        rendered = argument.evaluate(
                            "value => value && value.nodeType ? value.outerHTML.slice(0, 1200) : JSON.stringify(value)"
                        )
                        if rendered and rendered not in message.text:
                            details.append(rendered)
                    except Exception:
                        continue
                suffix = f" | {' | '.join(details)}" if details else ""
                console_errors.append(f"{page.url}: {message.text}{suffix}")

            page.on("console", on_console)
            page.on("pageerror", lambda error: console_errors.append(f"{page.url}: {error}"))
            page.on(
                "response",
                lambda response: network_errors.append(f"{response.status} {response.url}")
                if response.url.startswith(BASE_URL) and response.status >= 400
                else None,
            )
            page.on(
                "requestfailed",
                lambda request: network_errors.append(f"FAILED {request.url}")
                if request.url.startswith(BASE_URL)
                else None,
            )

            for name, path in PAGES:
                all_errors.extend(audit_page(page, name, path, viewport_name))
                if name in {"home", "projects", "project-detail", "article-detail"}:
                    page.screenshot(
                        path=str(screenshot_dir / f"{name}-{viewport_name}.png"),
                        full_page=True,
                    )

            if viewport_name == "desktop":
                resume_download = context.request.get(f"{BASE_URL}/resume-xerina.md")
                if not resume_download.ok:
                    all_errors.append("resume: downloadable resume file is unavailable")

                page.goto(f"{BASE_URL}/projects/", wait_until="networkidle")
                page.get_by_role("button", name="AI 应用").click()
                page.wait_for_timeout(250)
                if page.locator(".project-card").count() != 1:
                    all_errors.append("projects: category filter did not reduce cards to one")

                page.goto(f"{BASE_URL}/articles/", wait_until="networkidle")
                page.get_by_role("button", name="架构设计").click()
                page.wait_for_timeout(250)
                if page.locator(".article-index__item").count() != 1:
                    all_errors.append("articles: category filter did not reduce articles to one")

                page.goto(f"{BASE_URL}/", wait_until="networkidle")
                page.locator("html").evaluate("el => el.classList.add('dark')")
                page.wait_for_timeout(250)
                skill_card_background = page.locator(".skill-card").first.evaluate(
                    "el => getComputedStyle(el).backgroundColor"
                )
                if skill_card_background == "rgb(255, 255, 255)":
                    all_errors.append("home: skill card did not switch to a dark surface")
                dark_overflow = page.evaluate(
                    "document.documentElement.scrollWidth > document.documentElement.clientWidth"
                )
                if dark_overflow:
                    all_errors.append("home: horizontal overflow in dark mode")
                page.screenshot(
                    path=str(screenshot_dir / "home-desktop-dark.png"),
                    full_page=True,
                )

            context.close()

        browser.close()

    filtered_console_errors = [
        error for error in console_errors if "favicon" not in error.lower() and "404" not in error.lower()
    ]
    if filtered_console_errors:
        all_errors.extend(f"console: {error}" for error in sorted(set(filtered_console_errors)))
    if network_errors:
        all_errors.extend(f"network: {error}" for error in sorted(set(network_errors)))

    if all_errors:
        print("VISUAL_CHECK_FAILED")
        for error in all_errors:
            print(f"- {error}")
        raise SystemExit(1)

    print("VISUAL_CHECK_PASSED")
    print(f"screenshots={screenshot_dir}")


if __name__ == "__main__":
    main()
