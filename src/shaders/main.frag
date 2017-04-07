uniform vec2 iResolution;
uniform vec3 iMouse;
uniform int iFrame;
uniform float iGlobalTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

varying vec2 vUv;

void main()
{
  // convert uv from screen size to 0 to 1
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  uv = -1.0 + 2.0 * uv;

  vec4 imagePixel = texture2D(iChannel1, uv*0.5 + 0.5);
  vec4 bufferPixel = texture2D(iChannel0, uv*0.5 + 0.5);

  float sinFactor = sin(0.001);
  float cosFactor = cos(0.001);
  if (iFrame > 100) {
    if (iMouse.x > 0.0) {
      uv = vec2(uv.x, uv.y) * mat2(cosFactor, sinFactor, -sinFactor, cosFactor);
    } else {
      uv = vec2(uv.x, uv.y) * mat2(cosFactor, -sinFactor, sinFactor, cosFactor);
    }
  }
  float iFrameFloat = float(iFrame);
  if (iFrame < 100) {
    gl_FragColor = mix(vec4(1.0), imagePixel, 0.005*iFrameFloat);
  } else if (iMouse.z > 0.0) {
    vec3 i = texture2D(iChannel1, uv*0.5 + 0.5).rgb;
    vec3 b = texture2D(iChannel0, uv*0.5 + 0.5).rgb;
    gl_FragColor = vec4(mix(b, vec3(0.95), 0.005), 1.0);
  } else {
    // UVs start at 0.0 and move from -1 to 1
    uv *= 0.998;
    // uv.y += 0.001;
    vec3 r = texture2D(iChannel0, uv*0.5 + 0.5).rgb;

    r += 0.0001;
    r.r += (max(r.g*0.001, 0.0001));
    r.g += (max(r.b*0.001, 0.0001));
    r.b += (max(r.r*0.001, 0.0001));
    r = mod(abs(r), vec3(1.0));

    gl_FragColor = vec4(vec3(r), 1.0);
  }
}
