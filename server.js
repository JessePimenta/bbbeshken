var budo = require('budo')
var babelify = require('babelify')

budo('./src/index.js', {
  live: true,             // setup live reload
  port: 7000,             // use this port
  watchGlob: '**/*.{html,css,js,frag,vert}',
  browserify: {
    transform: [
      babelify.configure({
        presets: ['es2015'],
        plugins: ['glslify']
      })
    ]  // ES6
  }
}).on('connect', function (ev) {
  console.log('Server running on %s', ev.uri)
  console.log('LiveReload running on port %s', ev.livePort)
}).on('update', function (buffer) {
  console.log('bundle - %d bytes', buffer.length)
})
