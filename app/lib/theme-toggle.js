'use client';

import { useEffect } from 'react';

export default function ThemeToggle() {
  useEffect(() => {
    // base
    const htmlClass = document.documentElement.classList;
    setTimeout(() => {
      htmlClass.remove('not-ready');
    }, 10);

    // mobile menu
    const btnMenu = document.querySelector('.btn-menu');
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        htmlClass.toggle('open');
      });
    }

    // dark theme
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const lightBg = '#faf8f1'; // Hugo Paper默认背景色
    const setDark = (isDark) => {
      metaTheme.setAttribute('content', isDark ? "rgb(0 0 0 / 85%)" : lightBg);
      htmlClass[isDark ? 'add' : 'remove']('dark');
      localStorage.setItem('dark', isDark);
    };

    // init
    const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (htmlClass.contains('dark')) {
      setDark(true);
    } else {
      const darkVal = localStorage.getItem('dark');
      setDark(darkVal ? darkVal === 'true' : darkScheme.matches);
    }

    // listen system
    darkScheme.addEventListener('change', (event) => {
      setDark(event.matches);
    });

    // manual switch
    const btnDark = document.querySelector('.btn-dark');
    if (btnDark) {
      btnDark.addEventListener('click', () => {
        setDark(localStorage.getItem('dark') !== 'true');
      });
    }

    // Cleanup
    return () => {
      if (btnMenu) {
        btnMenu.removeEventListener('click', () => {
          htmlClass.toggle('open');
        });
      }
      if (btnDark) {
        btnDark.removeEventListener('click', () => {
          setDark(localStorage.getItem('dark') !== 'true');
        });
      }
      darkScheme.removeEventListener('change', (event) => {
        setDark(event.matches);
      });
    };
  }, []);

  return null;
}