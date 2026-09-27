export const backdropVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const backdropFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uBase;
  uniform vec3 uFirst;
  uniform vec3 uSecond;
  uniform float uTime;
  uniform float uAspect;
  uniform int uPreset;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1, 0)), f.x),
               mix(hash(cell + vec2(0, 1)), hash(cell + vec2(1, 1)), f.x), f.y);
  }
  float grainField(vec2 p) {
    float value = 0.0;
    float weight = 0.57;
    mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);
    for (int octave = 0; octave < 4; octave++) {
      value += noise(p) * weight;
      p = rotate * p * 2.04 + 7.13;
      weight *= 0.47;
    }
    return value;
  }
  float surface(vec2 p) {
    vec2 drift = vec2(uTime * 0.055, -uTime * 0.035);
    vec2 warp = vec2(grainField(p * 0.75 + drift), grainField(p * 0.75 + 8.4 - drift));
    vec2 q = p + (warp - 0.5) * 0.68;
    if (uPreset == 0) {

      float fold = q.y + 0.23 * q.x + 0.19 * sin(q.x * 2.4);
      float front = exp(-pow((fold + 0.12) / 0.29, 2.0));
      float back = exp(-pow((fold - 0.53) / 0.36, 2.0));
      return front * 0.7 + back * 0.3 + grainField(q * 2.2) * 0.08;
    }
    if (uPreset == 1) {

      float fold = q.x * 3.9 + q.y * 1.4 + grainField(q * 1.5) * 2.4;
      float broad = 0.5 + 0.5 * sin(fold);
      float weave = grainField(vec2(q.x * 2.0, q.y * 8.0));
      return pow(broad, 2.0) * 0.72 + weave * 0.16;
    }

    float height = grainField(q * 1.65) * 3.5 + length(q * vec2(0.6, 0.8)) * 0.55;
    float terrace = floor(height) + smoothstep(0.14, 0.86, fract(height));
    return terrace * 0.22;
  }
  void main() {
    if (uPreset < 0) {
      gl_FragColor = vec4(uBase, 1.0);
      #include <colorspace_fragment>
      return;
    }
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;
    float h = surface(p);
    float dx = surface(p + vec2(0.006, 0)) - h;
    float dy = surface(p + vec2(0, 0.006)) - h;
    vec3 normal = normalize(vec3(-dx * 36.0, -dy * 36.0, 1.0));
    float diffuse = dot(normal, normalize(vec3(-0.4, 0.65, 1.0)));
    float body = smoothstep(0.05, 0.95, h) * 0.68;
    float shoulder = smoothstep(0.5, 0.98, diffuse) * h * 0.25;

    vec3 color = mix(uBase, uFirst, clamp(body, 0.0, 0.8));
    color = mix(color, uSecond, clamp(shoulder, 0.0, 0.3));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`
