from playwright.sync_api import sync_playwright


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        desktop = browser.new_page(viewport={"width": 1440, "height": 900})
        desktop.goto("http://127.0.0.1:4173")
        desktop.wait_for_load_state("networkidle")
        desktop.screenshot(path="/tmp/xerina-desktop-home.png", full_page=True)
        assert desktop.locator(".page-home.is-active").count() == 1
        assert desktop.locator("h1").first.inner_text() == "把复杂系统，\n讲清楚并做出来。"
        assert desktop.locator(".home-experience").bounding_box()["y"] < desktop.locator(".home-projects").bounding_box()["y"]
        desktop.locator(".home-experience .experience-row").first.click()
        desktop.wait_for_timeout(250)
        assert desktop.url.endswith("#/experience/internship")
        assert desktop.locator(".page-experience-detail.is-active").count() == 1
        assert desktop.locator("[data-experience-title]").inner_text() == "后端开发实习生"
        assert desktop.locator("[data-experience-content] .experience-detail-section").count() == 4
        desktop.screenshot(path="/tmp/xerina-experience-detail-desktop.png", full_page=True)
        for route, title in [("project-lead", "校级创新项目负责人"), ("community", "技术社团核心成员")]:
            desktop.goto(f"http://127.0.0.1:4173/#/experience/{route}")
            desktop.wait_for_load_state("networkidle")
            assert desktop.locator("[data-experience-title]").inner_text() == title
        desktop.goto("http://127.0.0.1:4173/#/")
        desktop.wait_for_load_state("networkidle")
        desktop.locator(".nav-dropdown-trigger").click()
        desktop.wait_for_timeout(250)
        assert desktop.locator(".nav-dropdown.is-open .nav-dropdown-panel").is_visible()
        desktop.screenshot(path="/tmp/xerina-docs-dropdown-desktop.png", full_page=False)
        desktop.locator('.nav-dropdown-item[href="#/docs/rag"]').click()
        desktop.wait_for_timeout(250)
        assert desktop.url.endswith("#/docs/rag")
        assert desktop.locator(".page-detail.is-active").count() == 1
        desktop.goto("http://127.0.0.1:4173/#/")
        desktop.wait_for_load_state("networkidle")
        desktop.get_by_role("link", name="全部项目").click()
        desktop.wait_for_timeout(250)
        assert desktop.url.endswith("#/projects")
        assert desktop.locator(".page-projects.is-active").count() == 1
        desktop.locator('[data-filter="ai"]').click()
        assert desktop.locator('[data-project-category="platform"]').is_hidden()
        assert desktop.locator('[data-project-category="ai"]:visible').count() == 1
        desktop.locator('[data-project-category="ai"] .button-small').click()
        desktop.wait_for_timeout(250)
        desktop.screenshot(path="/tmp/xerina-project-doc-desktop.png", full_page=True)
        assert desktop.locator(".page-detail.is-active").count() == 1
        assert desktop.locator("[data-page].is-active").count() == 1
        assert desktop.locator(".doc-project-bar").is_visible()
        assert desktop.locator(".doc-sidebar").is_visible()
        assert desktop.locator("[data-doc-content] .doc-section").count() == 6
        desktop.get_by_role("link", name="系统设计").click()
        desktop.wait_for_timeout(250)
        assert desktop.url.endswith("#/docs/rag#architecture")
        assert desktop.locator("#architecture").is_visible()
        desktop.goto("http://127.0.0.1:4173/#/docs/order")
        desktop.wait_for_load_state("networkidle")
        assert desktop.locator("[data-detail-title]").inner_text() == "订单履约服务"

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.goto("http://127.0.0.1:4173/#/")
        mobile.wait_for_load_state("networkidle")
        mobile.screenshot(path="/tmp/xerina-mobile-home.png", full_page=True)
        mobile.locator(".menu-toggle").click()
        assert mobile.locator(".mobile-nav.is-open").is_visible()
        mobile.locator('.mobile-nav a[data-route="notes"]').click()
        mobile.wait_for_timeout(250)
        assert mobile.locator(".page-notes.is-active").count() == 1
        mobile.locator("[data-notes-search]").fill("RAG")
        assert mobile.locator('[data-note-category="ai"]:visible').count() == 1
        assert mobile.locator('[data-note-category="method"]:visible').count() == 0
        mobile.locator(".menu-toggle").click()
        mobile.locator(".mobile-nav-docs-trigger").click()
        mobile.wait_for_timeout(250)
        assert mobile.locator(".mobile-nav-group.is-open").is_visible()
        mobile.locator('.mobile-docs-menu a[href="#/docs/atlas"]').click()
        mobile.wait_for_timeout(250)
        assert mobile.url.endswith("#/docs/atlas")
        assert mobile.locator(".page-detail.is-active").count() == 1
        mobile.goto("http://127.0.0.1:4173/#/docs/atlas")
        mobile.wait_for_load_state("networkidle")
        mobile.screenshot(path="/tmp/xerina-project-doc-mobile.png", full_page=True)
        mobile.locator("[data-action='doc-sidebar']").click()
        assert mobile.locator(".doc-sidebar.is-open").is_visible()
        assert mobile.locator(".doc-tree").is_visible()
        mobile.get_by_role("link", name="核心实现").click()
        mobile.wait_for_timeout(250)
        assert mobile.url.endswith("#/docs/atlas#implementation")
        mobile.goto("http://127.0.0.1:4173/#/experience/internship")
        mobile.wait_for_load_state("networkidle")
        assert mobile.locator(".page-experience-detail.is-active").count() == 1
        assert mobile.locator("[data-experience-title]").inner_text() == "后端开发实习生"
        assert mobile.evaluate("window.scrollY < 2")
        mobile.screenshot(path="/tmp/xerina-experience-detail-mobile.png", full_page=True)
        mobile.locator('[data-experience-section="outcomes"]').click()
        mobile.wait_for_timeout(250)
        assert mobile.url.endswith("#/experience/internship#outcomes")
        assert mobile.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        browser.close()
    print("prototype smoke test passed")


if __name__ == "__main__":
    main()
