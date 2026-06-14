import { ref, computed, watchEffect } from 'vue';
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui';

const STORAGE_KEY = 'devtools-theme';
const isDark = ref<boolean>(localStorage.getItem(STORAGE_KEY) === 'dark');

if (localStorage.getItem(STORAGE_KEY) === null) {
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useTheme = () => {
  const toggle = () => {
    isDark.value = !isDark.value;
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light');
  };

  const naiveTheme = computed(() => (isDark.value ? darkTheme : null));

  const themeOverrides: GlobalThemeOverrides = {
    common: {
      primaryColor: '#2563eb',
      primaryColorHover: '#3b82f6',
      primaryColorPressed: '#1d4ed8',
      primaryColorSuppl: '#3b82f6',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    },
    Button: {
      heightMedium: '36px',
      fontSizeMedium: '14px',
      borderRadiusMedium: '8px',
    },
    Input: {
      borderRadius: '8px',
      fontSize: '14px',
    },
  };

  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
  });

  return { isDark, toggle, naiveTheme, themeOverrides };
};
