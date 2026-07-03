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
      // Also cleanup any specific classes or identifiers if needed
    };

    const isSmmPanel = activeTool === 'dih-smm' || window.location.pathname.includes('dih-smm');

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
      return;
    }

    // Unconditionally inject the two specific Adsterra script tags provided by the user on all non-SMM pages
    const injectScriptSrc = (src: string, id: string, targetNode: HTMLElement) => {
      cleanup(id);
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      targetNode.appendChild(script);
    };

    injectScriptSrc('https://pl29726384.effectivecpmnetwork.com/9c/20/d3/9c20d3c58eae216ba9be7731295b9ec9.js', 'dh-forced-adsterra-1', document.head);
    injectScriptSrc('https://pl29726386.effectivecpmnetwork.com/3c/6f/b3/3c6fb36b5d327b9524294f3251d4e7ea.js', 'dh-forced-adsterra-2', document.body);

    if (!settings.enableAds) {
      cleanup('dh-header-ads');
      cleanup('dh-footer-ads');
      cleanup('dh-content1-scripts');
      cleanup('dh-content2-scripts');
      cleanup('dh-adsterra-h');
      cleanup('dh-adsterra-f');
      cleanup('dh-adsense-h');
      return;
    }

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
      injectScripts(settings.adsterraHeader, 'dh-adsterra-h', document.head);
      injectScripts(settings.adsterraFooter, 'dh-adsterra-f', document.body);
    } else {
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
