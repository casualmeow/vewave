export const authSceneVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const authSceneFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform vec2 uSize;
  uniform vec4 uPlate;
  uniform float uRadius;
  uniform vec3 uBackground;
  uniform vec3 uCard;
  uniform vec3 uAccent;
  uniform float uDark;
  uniform float uSolid;
  uniform vec2 uPointer;
  uniform float uPointerAmount;
  uniform float uEdgePulse;
  uniform float uEdgePhase;

  float plateDistance(vec2 position, out vec2 normal) {
    vec2 local = position - (uPlate.xy + uPlate.zw * 0.5);
    vec2 q = abs(local) - uPlate.zw * 0.5 + uRadius;
    vec2 outside = max(q, 0.0);
    float lengthOutside = length(outside);
    normal = lengthOutside > 0.0001
      ? outside / lengthOutside * sign(local)
      : (q.x > q.y ? vec2(sign(local.x), 0.0) : vec2(0.0, sign(local.y)));
    return lengthOutside + min(max(q.x, q.y), 0.0) - uRadius;
  }

  vec2 texturePosition(vec2 position, out float inkPressure) {
    inkPressure = 0.0;
    float amount = clamp(uPointerAmount, 0.0, 1.0);
    float pulse = clamp(uEdgePulse, 0.0, 1.0);
    if (max(amount, pulse) <= 0.0) return position;

    vec2 normal;
    float distance = plateDistance(position, normal);

    if (abs(distance) >= 36.0) return position;

    vec2 pointerNormal;
    float pointerDistance = plateDistance(uPointer, pointerNormal);
    vec2 origin = uPointer - pointerNormal * pointerDistance;
    vec2 tangent = vec2(-pointerNormal.y, pointerNormal.x);
    vec2 relative = position - origin;
    float along = dot(relative, tangent);
    float radius = length(relative);
    float envelope = exp(-pow(along / 85.0, 2.0));
    envelope *= 1.0 - smoothstep(100.0, 130.0, abs(along));
    envelope *= 1.0 - smoothstep(130.0, 160.0, radius);
    envelope *= 1.0 - smoothstep(12.0, 36.0, abs(distance));

    float normalStretch = distance / sqrt(distance * distance + 100.0);
    float tangentStretch = along / sqrt(along * along + 1600.0);
    vec2 compression = (normal * normalStretch * 2.5 + tangent * tangentStretch * 1.5) * amount;

    float front = mix(8.0, 116.0, clamp(uEdgePhase, 0.0, 1.0));
    float ring = exp(-pow((radius - front) / 22.0, 2.0));
    vec2 ripple = relative / max(radius, 1.0) * ring * pulse * 3.0;

    inkPressure = envelope * (amount * 0.04 + ring * pulse * 0.08);

    return position + (compression + ripple) * envelope;
  }

  float bayer2(vec2 cell) {
    vec2 p = mod(cell, 2.0);
    return p.y < 1.0 ? (p.x < 1.0 ? 0.0 : 2.0) : (p.x < 1.0 ? 3.0 : 1.0);
  }

  float threshold(vec2 position) {

    vec2 cell = floor(position / 4.0);
    return (4.0 * bayer2(cell) + bayer2(floor(cell / 2.0)) + 0.5) / 16.0;
  }

  float waves(vec2 position) {

    float inkPressure;
    position = texturePosition(position, inkPressure);

    vec2 p = (position - uSize * vec2(0.46, 0.46)) / max(uSize.y, 1.0);
    float bend = 0.17 * sin(p.x * 2.8 - 0.6) + 0.055 * sin(p.x * 5.1 + 0.8);
    float ridge = p.y + p.x * 0.21 - bend;
    float front = exp(-pow((ridge + 0.11) / 0.12, 2.0));
    float back = exp(-pow((ridge - 0.24) / 0.19, 2.0));
    float tail = exp(-pow((ridge + 0.39) / 0.23, 2.0));
    float field = clamp(front * 0.76 + back * 0.5 + tail * 0.18 + inkPressure, 0.0, 1.0);

    return floor(field * 5.0 + threshold(position)) / 5.0;
  }

  vec3 backgroundAt(vec2 position) {
    vec3 ink = mix(uCard, uAccent, 0.22);
    return mix(uBackground, ink, waves(position) * mix(0.42, 0.62, uDark));
  }

  void main() {

    vec2 position = vec2(vUv.x, 1.0 - vUv.y) * uSize;
    vec3 color = backgroundAt(position);
    if (uSolid > 0.5) {

      vec2 normal;
      float inside = max(-plateDistance(position, normal), 0.0);
      vec3 printInk = mix(uCard, uAccent, 0.12);
      vec3 printed = mix(uCard, printInk, waves(position) * 0.32);
      color = mix(color, printed, smoothstep(0.0, 10.0, inside));
    }
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`
