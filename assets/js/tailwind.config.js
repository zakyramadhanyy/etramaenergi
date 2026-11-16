/*
 * Konfigurasi Tailwind (Play CDN). Dimuat tepat setelah <script src="https://cdn.tailwindcss.com">.
 * Gaya visual: kanvas abu-biru (#F4F6FA), kartu putih, aksen biru #293173, font Plus Jakarta Sans.
 *
 * Skala tipografi (px): 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 72 · 80
 *   text-3xs 8 · text-2xs 10 · text-xs 12 · text-sm 14 · text-base 16 · text-xl 20 · text-2xl 24 · text-3xl 32
 *   text-4xl 40 · text-5xl 48 · text-6xl 56 · text-7xl 64 · text-8xl 72 · text-9xl 80
 *   (text-lg sengaja disamakan dengan 16 — 18px tidak ada di skala.)
 * Hirarki: headline 16 → sub 14/12 · headline 20/24 → sub 14 · tabel: isi 14, keterangan & header 12.
 */
tailwind.config = {
  theme: {
    fontSize: {
      '3xs': ['8px', '12px'],
      '2xs': ['10px', '14px'],
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['16px', '24px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['32px', '40px'],
      '4xl': ['40px', '48px'],
      '5xl': ['48px', '56px'],
      '6xl': ['56px', '64px'],
      '7xl': ['64px', '72px'],
      '8xl': ['72px', '80px'],
      '9xl': ['80px', '88px'],
    },
    extend: {
      colors: {
        brand: {
          navy: '#293173',
          'navy-hover': '#1E2557',
          'navy-deep': '#161B40',
          blue: '#293173',
          'blue-hover': '#1E2557',
          soft: '#ECEEF8',
        },
        // Palet "blue" dipetakan ke warna logo ETrama (indigo #293173) agar semua class blue-* mengikuti logo.
        blue: { 50: '#ECEEF8', 100: '#D9DDF0', 200: '#B3BAE0', 300: '#8C97D0', 400: '#5562B0', 500: '#3A468F', 600: '#293173', 700: '#232A63', 800: '#1E2557', 900: '#161B40', 950: '#0F1230' },
        canvas: '#F4F6FA',
        line: '#E5E9F0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        DEFAULT: '0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        lg: '0 16px 32px -12px rgba(15, 23, 42, 0.14)',
        xl: '0 16px 40px -8px rgba(15, 23, 42, 0.16)',
      },
      maxWidth: {
        content: '1440px',
      },
    },
  },
};
