module.exports = {
  purge: {
    enabled: true,
    content: [
      './*.html',
      './**/*.html',
      './assets/js/**/*.js'
    ],
    options: {
      safelist: [
        'hidden',
        'block',
        'flex',
        'grid',
        'w-full',
        'sm:w-1/2',
        'lg:w-1/3',
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3'
      ]
    }
  },
  theme: {
    extend: {}
  },
  variants: {},
  plugins: []
};
