import glsl from 'glslify';

/******************************************************************************/

export const main = glsl`
  uniform vec2 iResolution;
  uniform vec3 iMouse;
  uniform int iFrame;
  uniform float iGlobalTime;
  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;

  void main()
  {
    // convert uv from screen size to 0 to 1
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = -1.0 + 2.0 * uv;

    // Every 100th frame not the first 100 though
    // float revert = floor(float(iFrame)/100.) + 1.;
    // // Every 500th frame this will be 0 for 100 frames
    // revert = mod(revert, 5.);
    //
    // // 500 / 500 = 1 + 1 = 2 -> 2 % 5 = 2
    // // 4500 / 500 = 9 + 1 = 10 -> 10 % 5 = 0;
    // // 2000 / 500 = 4 + 1 = 5 -> 5 % 5 = 0;
    // float unwarp = floor(float(iFrame)/500.) + 1.;
    // unwarp = mod(unwarp, 5.);

    // Rotation rate based on mouse position
    float sinFactor = sin((iMouse.x*2.)*0.001);
    float cosFactor = cos((iMouse.x*2.)*0.001);
    if (iFrame > 100) {
        uv = vec2(uv.x, uv.y) * mat2(cosFactor, sinFactor, -sinFactor, cosFactor);
    }

    vec4 imagePixel = texture2D(iChannel1, uv*0.5 + 0.5);
    vec4 bufferPixel = texture2D(iChannel0, uv*0.5 + 0.5);

    float iFrameFloat = float(iFrame);
    if (iFrame < 100)
    {
      // Start out with the original image
      gl_FragColor = mix(vec4(1.0), imagePixel, 0.005*iFrameFloat);
    }
    else if (mod(floor(float(iFrame)/500.) + 1., 5.) < 0.0001)
    {
      uv *= 0.998;
      uv.y += 0.001;
      vec3 r = texture2D(iChannel0, uv*0.5 + 0.5).rgb;
      r += 0.0001;
      r = mod(abs(r), vec3(1.0));
      gl_FragColor = vec4(mix(r, vec3(0.95), smoothstep(0., 500., mod(float(iFrame)+500., 500.)*0.01)), 1.0);
    }
    else if (mod(floor(float(iFrame)/100.) + 1., 5.) < 0.0001)
    {
      // float smoothf = mod(float(iFrame)+500., 500.);
      // smoothf = smoothstep(0., 500., smoothf)*0.01;
      // if (smoothf < 0.005) {
      //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      // } else {
      //   gl_FragColor = vec4(0., 1., 0., 1.);
      // }
      uv *= 0.998;
      uv.y += 0.001;
      vec3 r = texture2D(iChannel0, uv*0.5 + 0.5).rgb;
      r += 0.0001;
      r = mod(abs(r), vec3(1.0));

      gl_FragColor = vec4(mix(r, imagePixel.rgb, smoothstep(0., 100., mod(float(iFrame)+100., 100.)*0.01)), 1.0);
    }
    else
    {
      // UVs start at 0.0 and move from -1 to 1
      uv *= 0.998;
      uv.y += 0.001;
      vec3 r = texture2D(iChannel0, uv*0.5 + 0.5).rgb;

      // r += 0.001;
      // r.r += r.g*0.001;
      // r.g += r.b*0.001;
      // r.b += r.r*0.001;
      r.r += (max(r.g*0.001, 0.0001));
      r.g += (max(r.b*0.001, 0.0001));
      r.b += (max(r.r*0.001, 0.0001));
      r = mod(abs(r), vec3(1.0));

      gl_FragColor = vec4(vec3(r), 1.0);
    }
  }
`

/******************************************************************************/

export const gaussianVertical = glsl`
  #pragma glslify: blur = require('glsl-fast-gaussian-blur')
  uniform vec2 iResolution;
  uniform sampler2D iChannel0;

  void main()
  {
    vec2 uv = gl_FragCoord.xy/iResolution.xy;
    gl_FragColor = blur(iChannel0, uv, iResolution.xy, vec2(0.0, 1.0));
  }
`

/******************************************************************************/

export const gaussianHorizontal = glsl`
  #pragma glslify: blur = require('glsl-fast-gaussian-blur')
  uniform vec2 iResolution;
  uniform sampler2D iChannel0;

  void main()
  {
    vec2 uv = gl_FragCoord.xy/iResolution.xy;
    gl_FragColor = blur(iChannel0, uv, iResolution.xy, vec2(1.0, 0.0));
  }
`

/******************************************************************************/

export const final = glsl`
  precision highp float;
  uniform vec2 iResolution;
  uniform int iFrame;
  uniform vec3 iMouse;
  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;

  void main()
  {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec4 bufferPixel = texture2D(iChannel0, uv);
    vec4 imagePixel = texture2D(iChannel1, uv);

    // bufferPixel = vec4(mix(bufferPixel.rgb, vec3(1.0), (iMouse.y+1.)/2.), 1.);
    // gl_FragColor = texture2D(iChannel1, uv * bufferPixel.rg);
    // gl_FragColor = bufferPixel;
    // This makes the warping happen from the center out
    uv = -1.0 + 2.0 * uv;
    vec2 scaleCenter = vec2(0.5, 0.5);
    uv = (uv - scaleCenter) * bufferPixel.rg + scaleCenter;
    gl_FragColor = texture2D(iChannel1, uv*0.5+0.5);
  }
`
