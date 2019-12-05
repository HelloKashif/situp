const tailwindcss = require('tailwindcss')
const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
    plugins: [
        tailwindcss('./config/tailwind.js'),
        require('autoprefixer'),

        //PurgeCSS
        process.env.NODE_ENV === 'production' &&
            purgecss({
                content: ['./src/**/*.js'],
                defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
            }),
    ],
}
