uniform vec2 res;
uniform float time;
uniform sampler2D imageTexture;
uniform sampler2D bufferTexture;

void main(){
  vec2 coord = gl_FragCoord.xy / res.xy;

  float sin_factor = sin(time*0.001);
  float cos_factor = cos(time*0.001);
  coord = vec2((coord.x - 0.5), coord.y - 0.5 ) * mat2(cos_factor, sin_factor, -sin_factor, cos_factor);

  coord += 0.5;

  if (time < 1.0) {
    gl_FragColor = texture2D(imageTexture, coord);
  } else {
    coord = -1.0 + 2.0 * coord;
    coord *= 0.995;
    coord.y += 0.001;
    vec2 step = 1.25/res.xy;
    vec3 r = texture2D(bufferTexture, coord*0.5 + 0.5).rgb;

    //r+= 0.001;
    r.r += r.g*0.001;
    r.g += r.b*0.001;
    r.b += r.r*0.001;
    r = mod(r, vec3(1.0));

    gl_FragColor = vec4(vec3(r), 1.0);
  }
}
