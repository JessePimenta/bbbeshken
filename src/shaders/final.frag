precision highp float;
uniform vec2 iResolution;
uniform int iFrame;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
varying vec2 vUv;

void main()
{
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec4 bufferPixel = texture2D(iChannel0, uv);
  vec4 imagePixel = texture2D(iChannel1, uv);
  // gl_FragColor = texture2D(iChannel1, uv * bufferPixel.rg);
  gl_FragColor = bufferPixel;
  // This makes the warping happen from the center out
  // uv = -1.0 + 2.0 * uv;
  // vec2 scaleCenter = vec2(0.5, 0.5);
  // uv = (uv - scaleCenter) * bufferPixel.rg + scaleCenter;
  // gl_FragColor = texture2D(iChannel1, uv);
}
