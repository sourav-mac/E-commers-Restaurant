module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        petuk: {
          dark: '#1a1a1a',
          charcoal: '#222222',
          orange: '#FF7A00',
          orangeLight: '#FFA033',
          offwhite: '#F2F2F2',
          cream: '#f6efe6'
        }
      },
      backgroundImage: {
        'dark-texture': 'repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 2px, #222222 2px, #222222 4px)'
      }
    }
  },
  plugins: []
}
