// ==UserScript==
// @name         alphaXiv / Papers.cool / HJFY Bridge
// @name:zh-CN   alphaXiv / Papers.cool / 幻觉翻译入口
// @namespace    https://github.com/Peaceful-World-X/arxiv-papers-cool-bridge
// @version      2026-09-12.3
// @description  Add Papers.cool and HJFY entries to arXiv and alphaXiv paper pages.
// @description:zh-CN 在 arXiv 和 alphaXiv 论文页添加 Papers.cool 和幻觉翻译跳转入口。
// @author       Peaceful-World-X
// @license      MIT
// @homepageURL  https://github.com/Peaceful-World-X/arxiv-papers-cool-bridge
// @supportURL   https://github.com/Peaceful-World-X/arxiv-papers-cool-bridge/issues
// @updateURL    https://raw.githubusercontent.com/Peaceful-World-X/arxiv-papers-cool-bridge/main/arxiv-papers-cool-bridge.user.js
// @downloadURL  https://raw.githubusercontent.com/Peaceful-World-X/arxiv-papers-cool-bridge/main/arxiv-papers-cool-bridge.user.js
// @match        https://www.alphaxiv.org/abs/*
// @match        https://alphaxiv.org/abs/*
// @match        https://arxiv.org/abs/*
// @icon         https://papers.cool/static/favicon.ico
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    /**
     * true  = 打开 arXiv / alphaXiv 后自动打开 Papers.cool
     * false = 只添加导航入口
     */
    const AUTO_REDIRECT = false;

    // =========================
    // 节点 ID
    // =========================

    const ALPHAXIV_PAPERS_ID = 'papers-cool-nav-link';
    const ALPHAXIV_HJFY_ID = 'hjfy-nav-link';

    const ARXIV_PAPERS_ID = 'papers-cool-sidebar-link';
    const ARXIV_HJFY_ID = 'hjfy-sidebar-link';

    // =========================
    // 图标
    // =========================

    const PAPERS_ICON =
        'https://papers.cool/static/favicon.ico';

    // 幻觉翻译彩色圆形图标
    const HJFY_ICON =
        'https://raw.githubusercontent.com/yuchenwu73/ArXiv-Hjfy-Switcher/main/icons/icon128.png';

    // GitHub Raw 加载失败时的备用地址
    const HJFY_ICON_FALLBACK =
        'https://cdn.jsdelivr.net/gh/yuchenwu73/ArXiv-Hjfy-Switcher@main/icons/icon128.png';


    // =========================
    // 获取 arXiv ID
    // =========================

    function getArxivId() {
        const match = location.pathname.match(/^\/abs\/([^?#]+)/);

        return match
            ? decodeURIComponent(match[1])
            : null;
    }


    // =========================
    // 生成目标 URL
    // =========================

    function getPapersCoolUrl() {
        const id = getArxivId();

        return id
            ? `https://papers.cool/arxiv/${id}`
            : null;
    }

    function getHjfyUrl() {
        const id = getArxivId();

        return id
            ? `https://hjfy.top/arxiv/${id}`
            : null;
    }


    // =========================
    // alphaXiv 辅助函数
    // =========================

    function findElementByExactText(text) {
        return Array.from(
            document.querySelectorAll(
                'a, button, div, span'
            )
        ).find(
            el => el.textContent.trim() === text
        );
    }

    function getClickableNavItem(el) {
        if (!el) {
            return null;
        }

        return (
            el.closest(
                'a, button, [role="tab"], [role="button"]'
            ) || el
        );
    }


    // =========================
    // 添加图标 + 文字
    // =========================

    function appendBrand(
        link,
        text,
        iconUrl,
        size,
        marginRight,
        fallbackUrl = null
    ) {
        const icon = document.createElement('img');

        icon.src = iconUrl;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');

        icon.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            margin-right: ${marginRight}px;
            object-fit: contain;
            flex: 0 0 auto;
            display: block;
        `;

        /**
         * 主地址加载失败时尝试备用地址。
         */
        if (fallbackUrl) {
            let fallbackUsed = false;

            icon.addEventListener('error', () => {
                if (!fallbackUsed) {
                    fallbackUsed = true;
                    icon.src = fallbackUrl;
                    return;
                }

                icon.style.display = 'none';
            });
        } else {
            icon.addEventListener('error', () => {
                icon.style.display = 'none';
            });
        }

        const span = document.createElement('span');

        span.textContent = text;

        link.append(
            icon,
            span
        );
    }


    // =========================
    // alphaXiv 顶部导航样式
    // =========================

    function createAlphaLink({
        id,
        url,
        text,
        icon,
        iconFallback = null,
        referenceEl,
        hoverColor
    }) {
        const link =
            document.createElement('a');

        link.id = id;
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        link.title =
            `在${text}中查看这篇论文`;

        appendBrand(
            link,
            text,
            icon,
            18,
            8,
            iconFallback
        );

        link.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;

            height: 48px;

            padding: 0 14px;
            margin: 0;

            border: none;
            border-bottom: 2px solid transparent;

            background: transparent;

            color: #4b5563;

            font-size: 16px;
            font-weight: 400;
            line-height: 1;

            text-decoration: none;

            cursor: pointer;

            white-space: nowrap;

            box-sizing: border-box;
        `;

        link.addEventListener(
            'mouseenter',
            () => {
                link.style.color =
                    hoverColor;

                link.style.borderBottomColor =
                    hoverColor;
            }
        );

        link.addEventListener(
            'mouseleave',
            () => {
                link.style.color =
                    '#4b5563';

                link.style.borderBottomColor =
                    'transparent';
            }
        );

        /**
         * 尽量继承 alphaXiv 导航字体
         */
        if (referenceEl) {
            const cs =
                getComputedStyle(referenceEl);

            link.style.fontSize =
                cs.fontSize;

            link.style.fontWeight =
                cs.fontWeight;

            link.style.fontFamily =
                cs.fontFamily;
        }

        return link;
    }


    // =========================
    // arXiv 右侧栏样式
    // =========================

    function createArxivLink({
        id,
        url,
        text,
        icon,
        iconFallback = null,
        hoverColor
    }) {
        const link =
            document.createElement('a');

        link.id = id;
        link.href = url;

        link.target = '_blank';

        link.rel =
            'noopener noreferrer';

        link.title =
            `在${text}中查看这篇论文`;

        link.setAttribute(
            'aria-label',
            `在${text}中查看这篇论文`
        );

        appendBrand(
            link,
            text,
            icon,
            42,
            12,
            iconFallback
        );

        link.style.cssText = `
            display: flex;
            align-items: center;

            width: 100%;
            min-height: 72px;

            padding: 16px 24px;
            margin: 0;

            border: none;
            border-bottom: 4px solid #d9d9d9;

            background: #ffffff;

            color: #4b5563;

            font-family:
                Arial,
                "Microsoft YaHei",
                "PingFang SC",
                sans-serif;

            font-size: 28px;
            font-weight: 400;
            line-height: 1.1;

            text-decoration: none;

            box-sizing: border-box;
        `;

        link.addEventListener(
            'mouseenter',
            () => {
                link.style.color =
                    hoverColor;

                link.style.textDecoration =
                    'none';
            }
        );

        link.addEventListener(
            'mouseleave',
            () => {
                link.style.color =
                    '#4b5563';

                link.style.textDecoration =
                    'none';
            }
        );

        return link;
    }


    // =========================
    // alphaXiv
    // =========================

    function insertAlphaXivLinks() {
        const papersUrl =
            getPapersCoolUrl();

        const hjfyUrl =
            getHjfyUrl();

        if (
            !papersUrl ||
            !hjfyUrl
        ) {
            return;
        }

        let papersLink =
            document.getElementById(
                ALPHAXIV_PAPERS_ID
            );

        let hjfyLink =
            document.getElementById(
                ALPHAXIV_HJFY_ID
            );

        /**
         * 两个入口都已经存在：
         *
         * 只更新 URL，不再操作 DOM。
         *
         * 防止 MutationObserver
         * 无限触发导致页面一直加载。
         */
        if (
            papersLink &&
            hjfyLink
        ) {
            papersLink.href =
                papersUrl;

            hjfyLink.href =
                hjfyUrl;

            return;
        }


        const audioText =
            findElementByExactText('Audio') ||
            findElementByExactText('音频');

        const assistantText =
            findElementByExactText('Assistant') ||
            findElementByExactText('助手');

        const notesText =
            findElementByExactText('Notes') ||
            findElementByExactText('我的笔记');

        const commentsText =
            findElementByExactText('Comments') ||
            findElementByExactText('评论');


        const audioItem =
            getClickableNavItem(
                audioText
            );

        const assistantItem =
            getClickableNavItem(
                assistantText
            );

        const notesItem =
            getClickableNavItem(
                notesText
            );

        const commentsItem =
            getClickableNavItem(
                commentsText
            );


        const reference =
            audioItem ||
            assistantItem ||
            notesItem ||
            commentsItem;


        // Papers.cool
        if (!papersLink) {
            papersLink =
                createAlphaLink({
                    id:
                        ALPHAXIV_PAPERS_ID,

                    url:
                        papersUrl,

                    text:
                        'Papers.cool',

                    icon:
                        PAPERS_ICON,

                    referenceEl:
                        reference,

                    hoverColor:
                        '#991b1b'
                });
        }


        // 幻觉翻译
        if (!hjfyLink) {
            hjfyLink =
                createAlphaLink({
                    id:
                        ALPHAXIV_HJFY_ID,

                    url:
                        hjfyUrl,

                    text:
                        '幻觉翻译',

                    icon:
                        HJFY_ICON,

                    iconFallback:
                        HJFY_ICON_FALLBACK,

                    referenceEl:
                        reference,

                    hoverColor:
                        '#2563eb'
                });
        }


        /**
         * 优先：
         *
         * Audio
         * Papers.cool
         * 幻觉翻译
         */
        if (
            audioItem &&
            audioItem.parentElement
        ) {
            audioItem.insertAdjacentElement(
                'afterend',
                papersLink
            );

            papersLink.insertAdjacentElement(
                'afterend',
                hjfyLink
            );

            return;
        }


        /**
         * 第二选择：
         *
         * Assistant
         * Papers.cool
         * 幻觉翻译
         */
        if (
            assistantItem &&
            assistantItem.parentElement
        ) {
            assistantItem.insertAdjacentElement(
                'afterend',
                papersLink
            );

            papersLink.insertAdjacentElement(
                'afterend',
                hjfyLink
            );

            return;
        }


        /**
         * 最后尝试放到 Notes 前面
         */
        if (
            notesItem &&
            notesItem.parentElement
        ) {
            notesItem.insertAdjacentElement(
                'beforebegin',
                papersLink
            );

            papersLink.insertAdjacentElement(
                'afterend',
                hjfyLink
            );
        }
    }


    // =========================
    // 找 arXiv 的 alphaXiv 区块
    // =========================

    function findAlphaXivSidebarBlock(
        sidebar
    ) {
        const candidates =
            Array.from(
                sidebar.children
            );

        return (
            candidates.find(el => {
                if (
                    el.id ===
                        ARXIV_PAPERS_ID ||

                    el.id ===
                        ARXIV_HJFY_ID
                ) {
                    return false;
                }

                const text =
                    el.textContent.trim();

                return (
                    /^alphaXiv\b/i.test(text) ||

                    text.includes(
                        'View on alphaXiv'
                    )
                );
            }) ||
            null
        );
    }


    // =========================
    // arXiv
    // =========================

    function insertArxivLinks() {
        const papersUrl =
            getPapersCoolUrl();

        const hjfyUrl =
            getHjfyUrl();

        if (
            !papersUrl ||
            !hjfyUrl
        ) {
            return;
        }


        const sidebar =
            document.querySelector(
                '.extra-services'
            );

        if (!sidebar) {
            return;
        }


        let papersLink =
            document.getElementById(
                ARXIV_PAPERS_ID
            );

        let hjfyLink =
            document.getElementById(
                ARXIV_HJFY_ID
            );


        /**
         * 已存在时不重新插入。
         */
        if (
            papersLink &&
            hjfyLink
        ) {
            papersLink.href =
                papersUrl;

            hjfyLink.href =
                hjfyUrl;

            return;
        }


        // Papers.cool
        if (!papersLink) {
            papersLink =
                createArxivLink({
                    id:
                        ARXIV_PAPERS_ID,

                    url:
                        papersUrl,

                    text:
                        'Papers.cool',

                    icon:
                        PAPERS_ICON,

                    hoverColor:
                        '#2f7d32'
                });
        }


        // 幻觉翻译
        if (!hjfyLink) {
            hjfyLink =
                createArxivLink({
                    id:
                        ARXIV_HJFY_ID,

                    url:
                        hjfyUrl,

                    text:
                        '幻觉翻译',

                    icon:
                        HJFY_ICON,

                    iconFallback:
                        HJFY_ICON_FALLBACK,

                    hoverColor:
                        '#2563eb'
                });
        }


        const alphaXivBlock =
            findAlphaXivSidebarBlock(
                sidebar
            );


        /**
         * 正常情况下：
         *
         * Papers.cool
         * 幻觉翻译
         * alphaXiv
         */
        if (alphaXivBlock) {
            alphaXivBlock.insertAdjacentElement(
                'beforebegin',
                papersLink
            );

            papersLink.insertAdjacentElement(
                'afterend',
                hjfyLink
            );

            return;
        }


        /**
         * 找不到 alphaXiv 时：
         *
         * 直接放在 extra-services 顶部。
         */
        sidebar.prepend(
            hjfyLink
        );

        sidebar.prepend(
            papersLink
        );
    }


    // =========================
    // 主函数
    // =========================

    function main() {
        const papersUrl =
            getPapersCoolUrl();

        if (!papersUrl) {
            return;
        }


        // 自动打开 Papers.cool
        if (AUTO_REDIRECT) {
            window.open(
                papersUrl,
                '_blank',
                'noopener,noreferrer'
            );

            return;
        }


        // arXiv
        if (
            location.hostname ===
            'arxiv.org'
        ) {
            insertArxivLinks();

            return;
        }


        // alphaXiv
        if (
            location.hostname.endsWith(
                'alphaxiv.org'
            )
        ) {
            insertAlphaXivLinks();
        }
    }


    // =========================
    // 首次执行
    // =========================

    main();


    // =========================
    // 只监听 alphaXiv
    // =========================

    /**
     * arXiv 不使用 MutationObserver，
     * 避免之前出现的页面持续加载问题。
     *
     * alphaXiv 属于动态页面，
     * 因此只针对 alphaXiv 监听。
     */
    if (
        location.hostname.endsWith(
            'alphaxiv.org'
        )
    ) {
        let timer = null;

        const observer =
            new MutationObserver(() => {
                clearTimeout(timer);

                timer =
                    setTimeout(
                        main,
                        200
                    );
            });


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

})();
