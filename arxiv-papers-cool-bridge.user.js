// ==UserScript==
// @name         arXiv Papers.cool Bridge
// @name:zh-CN   arXiv / alphaXiv Papers.cool 入口
// @namespace    https://github.com/Peaceful-World-X/arxiv-papers-cool-bridge
// @version      2026-07-09
// @description  Add a natural Papers.cool entry to arXiv and alphaXiv paper pages.
// @description:zh-CN 在 arXiv 和 alphaXiv 论文页添加自然风格的 Papers.cool 跳转入口。
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
     * true  = 打开 arxiv/alphaxiv 后自动跳转到 papers.cool
     * false = 只显示一个自然风格的导航入口
     */
    const AUTO_REDIRECT = false;

    const ALPHAXIV_LINK_ID = 'papers-cool-nav-link';
    const ARXIV_LINK_ID = 'papers-cool-sidebar-link';
    const PAPERS_COOL_ICON = 'https://papers.cool/static/favicon.ico';

    function getArxivId() {
        const match = location.pathname.match(/^\/abs\/([^?#]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    function getPapersCoolUrl() {
        const arxivId = getArxivId();
        return arxivId ? `https://papers.cool/arxiv/${arxivId}` : null;
    }

    function findElementByExactText(text) {
        const candidates = Array.from(document.querySelectorAll('a, button, div, span'));
        return candidates.find(el => el.textContent.trim() === text);
    }

    function getClickableNavItem(el) {
        if (!el) return null;

        return el.closest('a, button, [role="tab"], [role="button"]') || el;
    }

    function appendPapersCoolBrand(link, iconSize, iconMarginRight) {
        const icon = document.createElement('img');
        icon.src = PAPERS_COOL_ICON;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.cssText = `
            width: ${iconSize}px;
            height: ${iconSize}px;
            margin-right: ${iconMarginRight}px;
            object-fit: contain;
            flex: 0 0 auto;
        `;

        const text = document.createElement('span');
        text.textContent = 'Papers.cool';

        link.append(icon, text);
    }

    function createAlphaXivNavLink(referenceEl, url) {
        const link = document.createElement('a');

        link.id = ALPHAXIV_LINK_ID;
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = 'Open this paper on Papers.cool';

        appendPapersCoolBrand(link, 18, 8);

        /**
         * 这里不用红色按钮，而是模拟 alphaxiv 顶部导航：
         * - 透明背景
         * - 普通文字
         * - hover 时变深
         * - 底部细线反馈
         */
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

        link.addEventListener('mouseenter', () => {
            link.style.color = '#991b1b';
            link.style.borderBottomColor = '#991b1b';
        });

        link.addEventListener('mouseleave', () => {
            link.style.color = '#4b5563';
            link.style.borderBottomColor = 'transparent';
        });

        // 如果能找到导航项，就尽量继承它的字体样式。
        if (referenceEl) {
            const cs = window.getComputedStyle(referenceEl);
            link.style.fontSize = cs.fontSize || link.style.fontSize;
            link.style.fontWeight = cs.fontWeight || link.style.fontWeight;
            link.style.fontFamily = cs.fontFamily || link.style.fontFamily;
        }

        return link;
    }

    function createArxivSidebarLink(url) {
        const link = document.createElement('a');

        link.id = ARXIV_LINK_ID;
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = 'Open this paper on Papers.cool';
        link.setAttribute('aria-label', 'Open this paper on Papers.cool');

        appendPapersCoolBrand(link, 42, 12);

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
            font-family: Arial, Helvetica, sans-serif;
            font-size: 28px;
            font-weight: 400;
            line-height: 1.1;
            text-decoration: none;
            box-sizing: border-box;
        `;

        link.addEventListener('mouseenter', () => {
            link.style.color = '#2f7d32';
            link.style.textDecoration = 'none';
        });

        link.addEventListener('mouseleave', () => {
            link.style.color = '#4b5563';
            link.style.textDecoration = 'none';
        });

        return link;
    }

    function insertAlphaXivLink() {
        const url = getPapersCoolUrl();
        if (!url) return;

        const old = document.getElementById(ALPHAXIV_LINK_ID);
        if (old) {
            old.href = url;
            return;
        }

        const audioText = findElementByExactText('Audio') || findElementByExactText('音频');
        const assistantText = findElementByExactText('Assistant') || findElementByExactText('助手');
        const notesText = findElementByExactText('Notes') || findElementByExactText('我的笔记');
        const commentsText = findElementByExactText('Comments') || findElementByExactText('评论');

        const audioItem = getClickableNavItem(audioText);
        const assistantItem = getClickableNavItem(assistantText);
        const notesItem = getClickableNavItem(notesText);
        const commentsItem = getClickableNavItem(commentsText);

        const referenceItem = audioItem || assistantItem || notesItem || commentsItem;
        const link = createAlphaXivNavLink(referenceItem, url);

        // 优先插入到 Audio 后面，保持在中间导航栏。
        if (audioItem && audioItem.parentElement) {
            audioItem.insertAdjacentElement('afterend', link);
            return;
        }

        // 如果找不到 Audio，再插入到 Assistant 后面。
        if (assistantItem && assistantItem.parentElement) {
            assistantItem.insertAdjacentElement('afterend', link);
            return;
        }

        // 如果找不到 Assistant，就插入到 Notes 前面
        if (notesItem && notesItem.parentElement) {
            notesItem.insertAdjacentElement('beforebegin', link);
            return;
        }

        // 兜底：固定在右上角，但仍然是文字导航风格
        link.style.position = 'fixed';
        link.style.top = '0';
        link.style.right = '360px';
        link.style.zIndex = '999999';
        document.body.appendChild(link);
    }

    function findAlphaXivSidebarBlock(sidebar) {
        const candidates = Array.from(sidebar.querySelectorAll(':scope > *, :scope div, :scope section'));

        return candidates.find(el => {
            if (el.id === ARXIV_LINK_ID || el.closest(`#${ARXIV_LINK_ID}`)) return false;
            const text = el.textContent.trim();
            return /^alphaXiv\b/i.test(text) || text.includes('View on alphaXiv');
        }) || null;
    }

    function insertArxivLink() {
        const url = getPapersCoolUrl();
        if (!url) return;

        const sidebar = document.querySelector('.extra-services');
        if (!sidebar) return;

        const old = document.getElementById(ARXIV_LINK_ID);
        const alphaXivBlock = findAlphaXivSidebarBlock(sidebar);

        if (old) {
            old.href = url;
            if (alphaXivBlock && old.nextElementSibling !== alphaXivBlock) {
                alphaXivBlock.insertAdjacentElement('beforebegin', old);
            }
            return;
        }

        const link = createArxivSidebarLink(url);

        if (alphaXivBlock) {
            alphaXivBlock.insertAdjacentElement('beforebegin', link);
            return;
        }

        sidebar.insertAdjacentElement('afterbegin', link);
    }

    function main() {
        const url = getPapersCoolUrl();
        if (!url) return;

        if (AUTO_REDIRECT) {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        if (location.hostname.endsWith('alphaxiv.org')) {
            insertAlphaXivLink();
            return;
        }

        if (location.hostname === 'arxiv.org') {
            insertArxivLink();
        }
    }

    main();

    const observer = new MutationObserver(() => {
        main();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
