module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Frontend design system colors
        primary: '#001e40',
        'primary-container': '#003366',
        'on-primary': '#ffffff',
        'on-primary-container': '#799dd6',
        secondary: '#006e1c',
        'secondary-container': '#91f78e',
        'on-secondary': '#ffffff',
        surface: '#f8f9fa',
        'surface-dim': '#d9dadb',
        'surface-bright': '#f8f9fa',
        'surface-container': '#edeeef',
        'surface-container-low': '#f3f4f5',
        'surface-container-high': '#e7e8e9',
        'on-surface': '#191c1d',
        'on-surface-variant': '#43474f',
        outline: '#737780',
        'outline-variant': '#c3c6d1',
        error: '#ba1a1a',
        // Legacy colors (keep for backward compat)
        saffron: '#FF9933',
        lightSaffron: '#FFD6A3',
        indiaGreen: '#138808',
        chakraNavy: '#000080',
        softGreen: '#E6F4EA',
        softGray: '#F5F7FA',
        darkText: '#1A1A1A'
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
}
