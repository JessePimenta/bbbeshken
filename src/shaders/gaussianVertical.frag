#pragma glslify: blur = require('glsl-fast-gaussian-blur')
uniform vec2 iResolution;
uniform sampler2D iChannel0;

void main()
{
  vec2 uv = gl_FragCoord.xy/iResolution.xy;
  gl_FragColor = blur(iChannel0, uv, iResolution.xy, vec2(0.0, 1.0));
}
