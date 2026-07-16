import { useEffect } from 'react';
import { useAppSettings } from '../hooks/useAppSettings';

interface AdsControllerProps {
  activeTool?: string;
}

export default function AdsController({ activeTool }: AdsControllerProps) {
  const { settings } = useAppSettings();

  useEffect(() => {
    // Cleanup function for tags injected manually
    const cleanup = (id: string) => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    };

    const isSmmPanel = activeTool === 'dih-smm' || window.location.pathname.includes('dih-smm');
    const hiderId = 'dh-smm-ad-hider';

    if (isSmmPanel) {
      cleanup('dh-header-ads');
      cleanup('dh-footer-ads');
      cleanup('dh-content1-scripts');
      cleanup('dh-content2-scripts');
      cleanup('dh-adsterra-h');
      cleanup('dh-adsterra-f');
      cleanup('dh-adsense-h');
      cleanup('dh-forced-adsterra-1');
      cleanup('dh-forced-adsterra-2');

      // Inject style to dynamically hide any ad elements that may have been loaded, without affecting standard React modals/portals
      let style = document.getElementById(hiderId) as HTMLStyleElement;
      if (!style) {
        style = document.createElement('style');
        style.id = hiderId;
        style.textContent = `
          /* Hide Adsterra social bar, popunder elements, and injected overlays */
          iframe[src*="effectivecpmnetwork"],
          iframe[id*="asg"],
          div[id*="asg"],
          iframe[class*="adsterra"],
          div[class*="adsterra"],
          [id^="at_"],
          [class^="at_"],
          body > iframe:not([id*="webpack"]):not([id*="vite"]),
          body > div:not(#root):not([class*="radix"]):not([class*="Dialog"]):not([id^="radix-"]):not([role="dialog"]) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
      return;
    }

    // Clean up SMM hider when on other tools
    cleanup(hiderId);

    if (!settings.enableAds) {
      cleanup('dh-header-ads');
      cleanup('dh-footer-ads');
      cleanup('dh-content1-scripts');
      cleanup('dh-content2-scripts');
      cleanup('dh-adsterra-h');
      cleanup('dh-adsterra-f');
      cleanup('dh-adsense-h');
      cleanup('dh-forced-adsterra-1');
      cleanup('dh-forced-adsterra-2');
      return;
    }

    // Inject the two specific Adsterra script tags provided by the user on all non-SMM pages
    // ONLY if enableAdsterra is enabled and they don't already exist in the DOM
    const injectScriptSrc = (src: string, id: string, targetNode: HTMLElement) => {
      if (document.getElementById(id)) {
        return; // Already injected and running! Do not reload or interrupt!
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      targetNode.appendChild(script);
    };

    const injectScripts = (content: string, targetId: string, targetNode: HTMLElement) => {
      if (!content) return;
      cleanup(targetId);

      const wrapper = document.createElement('div');
      wrapper.id = targetId;
      wrapper.style.display = 'none';
      wrapper.innerHTML = content;
      
      const scripts = wrapper.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = document.createElement('script');
        if (scripts[i].src) {
           script.src = scripts[i].src;
           script.async = true;
        } else {
           script.textContent = scripts[i].textContent;
        }
        Array.from(scripts[i].attributes).forEach(attr => {
           if (attr.name !== 'src') script.setAttribute(attr.name, attr.value);
        });
        targetNode.appendChild(script);
      }
      
      if (targetNode === document.head || targetNode === document.body) {
        const otherElements = Array.from(wrapper.childNodes).filter(node => node.nodeName !== 'SCRIPT');
        otherElements.forEach(node => targetNode.appendChild(node.cloneNode(true)));
      }
    };

    if (settings.enableAdsterra) {
      injectScriptSrc('https://pl29726384.effectivecpmnetwork.com/9c/20/d3/9c20d3c58eae216ba9be7731295b9ec9.js', 'dh-forced-adsterra-1', document.head);
      injectScriptSrc('https://pl29726386.effectivecpmnetwork.com/3c/6f/b3/3c6fb36b5d327b9524294f3251d4e7ea.js', 'dh-forced-adsterra-2', document.body);
      injectScripts(settings.adsterraHeader, 'dh-adsterra-h', document.head);
      injectScripts(settings.adsterraFooter, 'dh-adsterra-f', document.body);
    } else {
      cleanup('dh-forced-adsterra-1');
      cleanup('dh-forced-adsterra-2');
      cleanup('dh-adsterra-h');
      cleanup('dh-adsterra-f');
    }

    if (settings.enableAdsense) {
      injectScripts(settings.adsenseHeader, 'dh-adsense-h', document.head);
    } else {
      cleanup('dh-adsense-h');
    }

  }, [settings.enableAds, settings.enableAdsterra, settings.enableAdsense, settings.adsterraHeader, settings.adsterraFooter, settings.adsenseHeader, activeTool]);

  return null;
}
