precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uPixelSize;
uniform vec2 uCssPixelSize;
uniform vec4 uLens;
uniform float uRadius;
uniform float uOpacity;
uniform float uInteractionRefraction;
uniform float uInteractionHighlight;
uniform float uInteractionShadow;
uniform float uInteractionEnergy;
uniform vec2 uVelocity;
uniform float uShape;
uniform float uSamples;
uniform float uDark;
uniform float uPattern;
uniform float uUseImage;
uniform sampler2D uEnvironment;

uniform float uEdgeWidthRatio;
uniform float uRimWidthRatio;
uniform float uInternalReflectionWidthRatio;
uniform float uShadowWidthRatio;
uniform float uMinimumEdgeWidth;
uniform float uMaximumEdgeWidth;
uniform float uIor;
uniform float uDispersionIor;
uniform float uPhysicalThickness;
uniform float uSurfaceCurvature;
uniform float uViewDepth;
uniform float uBulge;
uniform float uRoughness;
uniform float uScattering;
uniform float uDispersionPx;
uniform float uRimIntensity;
uniform float uInternalReflection;
uniform float uShadowStrength;
uniform float uTintOpacity;
uniform vec2 uLightDirection;
uniform float uDebugView;

float roundedRectSdf(vec2 point, vec2 halfSize, float radius) {
  vec2 q = abs(point) - halfSize + radius;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

float lensSdf(vec2 point, vec2 halfSize) {
  if (uShape > 1.5) return length(point) - min(halfSize.x, halfSize.y);
  float radius = uShape > 0.5 ? min(halfSize.x, halfSize.y) : uRadius;
  return roundedRectSdf(point, halfSize, min(radius, min(halfSize.x, halfSize.y)));
}

float lensCoverage(vec2 point, vec2 halfSize) {
  return 1.0 - smoothstep(-0.8, 0.8, lensSdf(point, halfSize));
}

vec2 deformPoint(vec2 point, vec2 halfSize) {
  float velocityEnergy = clamp(length(uVelocity) / 180.0, 0.0, 1.0);
  if (velocityEnergy < 0.002) return point;
  vec2 direction = normalize(vec2(uVelocity.x, -uVelocity.y) + vec2(0.0001));
  vec2 tangent = vec2(-direction.y, direction.x);
  float along = dot(point, direction);
  float across = dot(point, tangent);
  float directionalExtent = max(2.0, dot(abs(direction), halfSize));
  float side = smoothstep(-directionalExtent, directionalExtent, along);
  float directionalScale = mix(1.0 - velocityEnergy * 0.025, 1.0 + velocityEnergy * 0.035, side);
  float normalizedAlong = clamp(along / directionalExtent, -1.0, 1.0);
  float shear = normalizedAlong * velocityEnergy * min(halfSize.x, halfSize.y) * 0.04;
  return direction * (along / directionalScale) + tangent * (across - shear);
}

float edgeWidth(vec2 halfSize) {
  float minDimension = max(4.0, min(halfSize.x, halfSize.y) * 2.0);
  return clamp(minDimension * uEdgeWidthRatio, uMinimumEdgeWidth, uMaximumEdgeWidth);
}

float surfaceHeight(vec2 point, vec2 halfSize) {
  float distance = lensSdf(point, halfSize);
  float coverage = lensCoverage(point, halfSize);
  float inward = max(-distance, 0.0);
  float width = edgeWidth(halfSize);
  float edgeProgress = clamp(inward / max(width, 0.5), 0.0, 1.0);
  float curvature = 1.15 + uSurfaceCurvature * 1.4;
  float curvedRise = 1.0 - pow(1.0 - edgeProgress, curvature);
  float calmPlateau = smoothstep(0.0, 1.0, curvedRise);
  vec2 normalizedPoint = point / max(halfSize, vec2(1.0));
  float dome = pow(max(0.0, 1.0 - dot(normalizedPoint, normalizedPoint)), 1.6);
  float minDimension = max(4.0, min(halfSize.x, halfSize.y) * 2.0);
  float interactionCurve = 1.0 + max(0.0, uInteractionEnergy - 0.18) * 0.13;
  float thickness = minDimension * uPhysicalThickness * interactionCurve;
  float legacyBroadBody = mix(0.14, 1.0, calmPlateau);
  float shortRadius = max(1.0, min(halfSize.x, halfSize.y));
  float normalizedInterior = clamp(inward / shortRadius, 0.0, 1.0);
  float crossSection = normalizedInterior * (2.0 - normalizedInterior);
  float nx = clamp(abs(normalizedPoint.x), 0.0, 1.0);
  float ny = clamp(abs(normalizedPoint.y), 0.0, 1.0);
  float capsuleInterior = clamp(1.0 - pow(nx, 2.6) - ny * ny, 0.0, 1.0);
  float roundedInterior = clamp(1.0 - pow(nx, 4.0) - pow(ny, 4.0), 0.0, 1.0);
  float radialInterior = clamp(1.0 - dot(normalizedPoint, normalizedPoint), 0.0, 1.0);
  float twoAxisInterior = uShape > 1.5
    ? radialInterior
    : (uShape > 0.5 ? capsuleInterior : roundedInterior);
  float twoAxisDome = smoothstep(0.0, 1.0, twoAxisInterior);
  float expressiveHeight = mix(crossSection, twoAxisDome, 0.56);
  float expressiveBody = mix(0.08, 1.0, expressiveHeight);
  float expressiveMix = smoothstep(0.30, 0.34, uPhysicalThickness);
  float broadBody = mix(legacyBroadBody, expressiveBody, expressiveMix);
  float subtleBulge = 1.0 + dome * uBulge * 0.68;
  return coverage * thickness * broadBody * subtleBulge;
}

vec3 surfaceNormal(vec2 point, vec2 halfSize, out float slope) {
  float epsilon = 0.65;
  float dx = surfaceHeight(point + vec2(epsilon, 0.0), halfSize) -
    surfaceHeight(point - vec2(epsilon, 0.0), halfSize);
  float dy = surfaceHeight(point + vec2(0.0, epsilon), halfSize) -
    surfaceHeight(point - vec2(0.0, epsilon), halfSize);
  vec2 gradient = vec2(dx, dy) / (epsilon * 2.0);
  slope = length(gradient);
  float interactionCurve = 1.0 + max(0.0, uInteractionEnergy - 0.18) * 0.16;
  return normalize(vec3(-gradient * uSurfaceCurvature * interactionCurve, max(0.42, uViewDepth)));
}

float linePattern(vec2 uv) {
  vec2 cells = fract(uv * vec2(29.0, 23.0));
  vec2 edgeDistance = min(cells, 1.0 - cells);
  float grid = 1.0 - smoothstep(0.018, 0.055, min(edgeDistance.x, edgeDistance.y));
  float diagonal = 1.0 - smoothstep(
    0.015,
    0.045,
    abs(fract((uv.x * 1.35 + uv.y) * 9.0 + 0.17) - 0.5)
  );
  return max(grid * 0.82, diagonal * 0.56);
}

vec3 themeEnvironment(vec2 uv) {
  vec3 lightBase = vec3(0.925, 0.946, 0.952);
  vec3 darkBase = vec3(0.055, 0.066, 0.082);
  vec3 base = mix(lightBase, darkBase, uDark);
  vec3 accentA = mix(vec3(0.18, 0.55, 0.62), vec3(0.16, 0.50, 0.58), uDark);
  vec3 accentB = mix(vec3(0.86, 0.56, 0.22), vec3(0.70, 0.39, 0.18), uDark);
  float washA = exp(-length((uv - vec2(0.15, 0.84)) * vec2(1.0, 1.45)) * 4.6);
  float washB = exp(-length((uv - vec2(0.92, 0.12)) * vec2(1.2, 1.0)) * 5.2);
  vec3 color = base + accentA * washA * mix(0.045, 0.105, uDark) +
    accentB * washB * mix(0.028, 0.075, uDark);
  float lines = linePattern(uv) * uPattern;
  vec3 lineColor = mix(vec3(0.56, 0.67, 0.7), vec3(0.23, 0.32, 0.38), uDark);
  color = mix(color, lineColor, lines * mix(0.34, 0.58, uDark));
  float signal = (1.0 - smoothstep(0.01, 0.025, abs(fract(uv.x * 7.0 + 0.21) - 0.5))) *
    uPattern;
  color = mix(color, accentA, signal * mix(0.48, 0.58, uDark));
  return color;
}

vec3 environmentAt(vec2 uv) {
  vec2 safeUv = clamp(uv, vec2(0.002), vec2(0.998));
  vec3 color = themeEnvironment(safeUv);
  if (uUseImage > 0.5) color = texture2D(uEnvironment, vec2(safeUv.x, 1.0 - safeUv.y)).rgb;
  return color;
}

vec2 exitUv(vec3 ray, float localThickness) {
  float projectedDepth = localThickness * (1.0 + uViewDepth * 2.6) * uInteractionRefraction;
  return vUv + ray.xy / max(0.12, -ray.z) * projectedDepth * uCssPixelSize;
}

vec3 dispersedAt(vec2 redUv, vec2 greenUv, vec2 blueUv, vec2 offset) {
  return vec3(
    environmentAt(redUv + offset).r,
    environmentAt(greenUv + offset).g,
    environmentAt(blueUv + offset).b
  );
}

vec3 softShoulder(vec3 color) {
  vec3 positive = max(color, vec3(0.0));
  float peak = max(positive.r, max(positive.g, positive.b));
  if (peak <= 0.92) return positive;
  float mappedPeak = 0.92 + 0.08 * (1.0 - exp(-(peak - 0.92) * 5.0));
  return positive * (mappedPeak / max(peak, 0.0001));
}

vec3 applyLighting(
  vec3 transmission,
  vec3 reflectionColor,
  float reflectionWeight,
  vec3 highlightColor,
  float bodyLight,
  float bodyDark,
  float leadingLight,
  float trailingDark,
  vec3 rimColor,
  float rimWeight
) {
  float transmissionLuminance = dot(transmission, vec3(0.2126, 0.7152, 0.0722));
  float reflectionLuminance = dot(reflectionColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 reflectionChroma = reflectionColor - vec3(reflectionLuminance);
  vec3 result = transmission +
    vec3(reflectionLuminance - transmissionLuminance) * reflectionWeight * 0.68 +
    reflectionChroma * reflectionWeight * 0.24;
  result += highlightColor * (bodyLight + leadingLight);
  result *= 1.0 - clamp(bodyDark + trailingDark, 0.0, 0.42);
  result += rimColor * clamp(rimWeight, 0.0, 0.34) * 0.3;
  return softShoulder(result);
}

void main() {
  vec2 pixel = vUv * uResolution;
  vec2 center = uLens.xy;
  vec2 halfSize = max(vec2(1.0), uLens.zw * 0.5);
  vec2 undeformedLocal = pixel - center;
  vec2 local = deformPoint(undeformedLocal, halfSize);
  float distance = lensSdf(local, halfSize);
  float coverage = lensCoverage(local, halfSize);
  float inward = max(-distance, 0.0);
  float minDimension = max(4.0, min(halfSize.x, halfSize.y) * 2.0);
  float opticalEdgeWidth = edgeWidth(halfSize);
  float rimWidth = clamp(minDimension * uRimWidthRatio, 0.75, opticalEdgeWidth * 0.42);
  float internalWidth = clamp(
    minDimension * uInternalReflectionWidthRatio,
    1.25,
    opticalEdgeWidth * 0.72
  );
  float shadowWidth = clamp(minDimension * uShadowWidthRatio, 5.0, 24.0);

  float slope = 0.0;
  vec3 normal = surfaceNormal(local, halfSize, slope);
  vec2 normal2d = length(normal.xy) > 0.0001 ? normalize(normal.xy) : normalize(local + vec2(0.0001));
  float slopeEnergy = clamp(slope / max(0.6, uPhysicalThickness * 4.2), 0.0, 1.0);
  float edgeEnergy = 1.0 - smoothstep(0.0, opticalEdgeWidth, inward);
  float curvatureEnergy = coverage * clamp(slopeEnergy * 0.76 + edgeEnergy * 0.38, 0.0, 1.0);
  float localThickness = surfaceHeight(local, halfSize);

  vec3 viewDirection = vec3(0.0, 0.0, 1.0);
  float expressiveMix = smoothstep(0.30, 0.34, uPhysicalThickness);
  float effectiveDispersionIor = mix(
    uDispersionIor,
    min(uDispersionIor, 0.006),
    expressiveMix
  );
  float iorR = max(1.001, uIor - effectiveDispersionIor);
  float iorG = max(1.001, uIor);
  float iorB = max(1.001, uIor + effectiveDispersionIor);
  vec3 rayR = refract(-viewDirection, normal, 1.0 / iorR);
  vec3 rayG = refract(-viewDirection, normal, 1.0 / iorG);
  vec3 rayB = refract(-viewDirection, normal, 1.0 / iorB);
  vec2 redUv = exitUv(rayR, localThickness);
  vec2 greenUv = exitUv(rayG, localThickness);
  vec2 blueUv = exitUv(rayB, localThickness);
  float expressiveRefractionWeight =
    smoothstep(0.08, 0.68, curvatureEnergy) *
    mix(1.0, 0.72, edgeEnergy);
  float expressiveRefractionStrength =
    mix(1.22, 1.82, expressiveRefractionWeight);
  float expressiveRefractionGain =
    mix(1.0, expressiveRefractionStrength, expressiveMix);
  redUv = vUv + (redUv - vUv) * expressiveRefractionGain;
  greenUv = vUv + (greenUv - vUv) * expressiveRefractionGain;
  blueUv = vUv + (blueUv - vUv) * expressiveRefractionGain;
  float secondaryDispersion = 0.1 + curvatureEnergy * 0.9;
  float effectiveDispersionPx = mix(
    uDispersionPx,
    min(uDispersionPx, 1.15),
    expressiveMix
  );
  vec2 artisticDispersion = normal2d * effectiveDispersionPx * secondaryDispersion * uPixelSize;
  redUv += artisticDispersion;
  blueUv -= artisticDispersion;

  float effectiveRoughness = mix(
    uRoughness,
    min(uRoughness, 0.035),
    expressiveMix
  );
  float effectiveScattering = mix(
    uScattering,
    min(uScattering, 0.08),
    expressiveMix
  );
  float effectiveRimIntensity = mix(
    uRimIntensity,
    min(uRimIntensity, 0.14),
    expressiveMix
  );
  float effectiveInternalReflection = mix(
    uInternalReflection,
    min(uInternalReflection, 0.20),
    expressiveMix
  );
  float effectiveTintOpacity = mix(uTintOpacity, min(uTintOpacity, 0.004), expressiveMix);

  vec3 base = environmentAt(vUv);
  vec3 refractedGreen = environmentAt(greenUv);
  vec3 refractedBase = refractedGreen;
  vec3 expressiveRefractedBase = environmentAt(greenUv);
  vec3 legacyDispersed = dispersedAt(redUv, greenUv, blueUv, vec2(0.0));
  vec3 chromaticDelta = legacyDispersed - refractedBase;
  float shoulderWeight = smoothstep(0.12, 0.55, curvatureEnergy);
  float edgeWeight = smoothstep(0.25, 0.9, edgeEnergy);
  float chromaticWeight = expressiveMix * shoulderWeight * mix(0.2, 1.0, edgeWeight) * 0.32;
  float appliedChromaticWeight = mix(1.0, chromaticWeight, expressiveMix);

  vec2 tangent = vec2(-normal2d.y, normal2d.x);
  float scatterRadius = effectiveScattering * mix(0.42, 1.0, effectiveRoughness) *
    mix(0.45, 1.0, curvatureEnergy);
  vec3 legacyScattered = legacyDispersed * 2.0;
  float scatterWeight = 2.0;
  vec3 neutralScattered = expressiveRefractedBase * 2.0;
  float neutralScatterWeight = 2.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= uSamples) continue;
    float signedIndex = float(i) - 2.5;
    float weight = 1.0 - abs(signedIndex) * 0.1;
    vec2 scatterOffset = (
      tangent * signedIndex + normal2d * sin(float(i) * 2.3) * 0.32
    ) * scatterRadius * uPixelSize;
    legacyScattered += dispersedAt(redUv, greenUv, blueUv, scatterOffset) * weight;
    scatterWeight += weight;
    neutralScattered += environmentAt(greenUv + scatterOffset) * weight;
    neutralScatterWeight += weight;
  }
  legacyScattered /= scatterWeight;
  neutralScattered /= neutralScatterWeight;
  float spectralProtection = curvatureEnergy * smoothstep(0.5, 2.4, effectiveDispersionPx);
  float scatteringMix = clamp(effectiveRoughness * (1.0 - spectralProtection * 0.42), 0.0, 1.0);
  legacyScattered = mix(legacyDispersed, legacyScattered, scatteringMix);
  legacyScattered += chromaticDelta * spectralProtection * 0.22;
  neutralScattered = mix(expressiveRefractedBase, neutralScattered, scatteringMix);
  vec3 expressiveTransmission = neutralScattered + chromaticDelta * chromaticWeight;
  vec3 opticalTransmission = mix(legacyScattered, expressiveTransmission, expressiveMix);
  vec3 expressiveNoScattering = expressiveRefractedBase + chromaticDelta * chromaticWeight;
  vec3 noScatterSource = mix(legacyDispersed, expressiveNoScattering, expressiveMix);

  float environmentLuminance = dot(base, vec3(0.2126, 0.7152, 0.0722));
  float brightAdaptation = smoothstep(0.62, 0.9, environmentLuminance);
  float darkAdaptation = 1.0 - smoothstep(0.08, 0.36, environmentLuminance);
  float exposure = mix(0.92, 0.88, brightAdaptation);
  float expressiveExposure = mix(0.96, 0.945, brightAdaptation);
  float effectiveExposure = mix(exposure, expressiveExposure, expressiveMix);
  vec3 noScatterTransmission = noScatterSource * effectiveExposure;
  vec3 noTintTransmission = opticalTransmission * effectiveExposure;
  vec3 tintColor = mix(vec3(0.82, 0.9, 0.92), vec3(0.14, 0.18, 0.2), darkAdaptation);
  float tintLuminance = dot(tintColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 transmission = noTintTransmission +
    (tintColor - vec3(tintLuminance)) * effectiveTintOpacity * 0.22;

  float f0 = pow((uIor - 1.0) / (uIor + 1.0), 2.0);
  float fresnel = f0 + (1.0 - f0) *
    pow(1.0 - max(dot(viewDirection, normal), 0.0), 5.0);
  float transmissionBalance = 1.0 - fresnel * effectiveInternalReflection * 0.38;
  transmission *= transmissionBalance;
  noScatterTransmission *= transmissionBalance;
  noTintTransmission *= transmissionBalance;

  vec2 lightDirection = normalize(uLightDirection + vec2(0.0001));
  float facingLight = max(0.0, dot(normal2d, lightDirection));
  float facingAway = max(0.0, dot(normal2d, -lightDirection));
  float directionalLight = pow(facingLight, 2.6);
  float rimZone = coverage * (1.0 - smoothstep(0.0, rimWidth, inward));
  float interruptedRim = rimZone * pow(directionalLight, 1.15) *
    (0.28 + fresnel * 1.8) * effectiveRimIntensity * uInteractionHighlight;

  vec3 highlightColor = mix(vec3(0.97, 0.9, 0.72), vec3(0.88, 0.96, 1.0), uDark);
  vec3 brightRimColor = mix(highlightColor, base * 0.7, brightAdaptation);
  float expressiveBodyLightScale =
    mix(1.0, mix(1.0, 0.45, brightAdaptation), expressiveMix);
  float bodyLight =
    coverage *
    (1.0 - edgeEnergy) *
    directionalLight *
    effectiveRimIntensity *
    uInteractionHighlight *
    mix(0.035, 0.012, brightAdaptation) *
    expressiveBodyLightScale;
  float broadBodyEnergy = coverage * (1.0 - edgeEnergy * 0.38);
  float effectiveBodyDarkScale = mix(1.0, 0.55, expressiveMix);
  float effectiveDirectionalBodyDarkScale = mix(
    1.0,
    mix(0.62, 0.18, brightAdaptation),
    expressiveMix
  );
  float broadBodyDark =
    broadBodyEnergy *
    mix(0.022, 0.036, brightAdaptation) *
    effectiveBodyDarkScale;

  float directionalBodyDark =
    coverage *
    facingAway *
    curvatureEnergy *
    mix(0.055, 0.12, brightAdaptation) *
    effectiveDirectionalBodyDarkScale;

  float bodyDark =
    broadBodyDark + directionalBodyDark;

  float internalCenter = max(0.75, rimWidth + internalWidth * 0.26);
  float internalBand = coverage * exp(-pow(
    (inward - internalCenter) / max(0.7, internalWidth * 0.62),
    2.0
  ));
  float reflectionDirection = smoothstep(0.08, 0.76, directionalLight);
  float effectiveReflectionAdaptation = mix(
    1.0,
    mix(0.72, 0.22, brightAdaptation),
    expressiveMix
  );
  float reflectionWeight = internalBand * reflectionDirection * effectiveInternalReflection *
    (0.18 + fresnel * 1.35) * effectiveReflectionAdaptation;
  vec3 reflectedEnvironment = environmentAt(vUv - normal2d * max(1.0, internalWidth * 0.45) * uCssPixelSize);
  vec3 darkInternal = mix(reflectedEnvironment, base * 0.62, brightAdaptation);

  float velocityEnergy = clamp(length(uVelocity) / 180.0, 0.0, 1.0);
  vec2 leadingDirection = normalize(vec2(uVelocity.x, -uVelocity.y) + vec2(0.0001));
  float leading = pow(max(0.0, dot(normal2d, leadingDirection)), 2.0) * velocityEnergy;
  float trailing = pow(max(0.0, dot(normal2d, -leadingDirection)), 1.7) * velocityEnergy;
  float leadingLight = rimZone * leading * mix(0.12, 0.055, brightAdaptation);
  float trailingDark = rimZone * trailing * 0.14;

  vec3 noLighting = softShoulder(transmission);
  vec3 completeLens = applyLighting(
    transmission,
    darkInternal,
    reflectionWeight,
    highlightColor,
    bodyLight,
    bodyDark,
    leadingLight,
    trailingDark,
    brightRimColor,
    interruptedRim
  );
  vec3 noScatteringLens = applyLighting(
    noScatterTransmission,
    darkInternal,
    reflectionWeight,
    highlightColor,
    bodyLight,
    bodyDark,
    leadingLight,
    trailingDark,
    brightRimColor,
    interruptedRim
  );
  vec3 noTintLens = applyLighting(
    noTintTransmission,
    darkInternal,
    reflectionWeight,
    highlightColor,
    bodyLight,
    bodyDark,
    leadingLight,
    trailingDark,
    brightRimColor,
    interruptedRim
  );
  vec3 noRimLens = applyLighting(
    transmission,
    darkInternal,
    reflectionWeight,
    highlightColor,
    bodyLight,
    bodyDark,
    leadingLight,
    trailingDark,
    brightRimColor,
    0.0
  );

  float outside = smoothstep(-0.35, 0.8, distance);
  float outerBand = outside * (1.0 - smoothstep(0.0, shadowWidth, distance));
  float trailingShadow = 0.35 + 0.65 * facingAway;
  float adaptedShadow = uShadowStrength * mix(1.0, 1.22, brightAdaptation);
  float shadowAmount = outerBand * trailingShadow * adaptedShadow *
    uInteractionShadow * uOpacity;
  vec3 environmentSpill = environmentAt(vUv - lightDirection * 2.5 * uCssPixelSize);
  vec3 exterior = mix(base, environmentSpill, outerBand * 0.08 * adaptedShadow * uOpacity);
  exterior *= 1.0 - shadowAmount * mix(0.18, 0.1, darkAdaptation);

  float replacementMask = coverage * smoothstep(0.0, 0.12, uOpacity);
  vec3 finalComposite = mix(exterior, completeLens, replacementMask);
  vec3 noLightingComposite = mix(exterior, noLighting, replacementMask);
  vec3 noScatteringComposite = mix(exterior, noScatteringLens, replacementMask);
  vec3 noTintComposite = mix(exterior, noTintLens, replacementMask);
  vec3 noRimComposite = mix(exterior, noRimLens, replacementMask);

  if (uDebugView > 0.5 && uDebugView < 1.5) {
    gl_FragColor = vec4(vec3(coverage), 1.0);
    return;
  }
  if (uDebugView > 1.5 && uDebugView < 2.5) {
    vec3 normalView = vec3(normal.xy * 0.5 + 0.5, curvatureEnergy);
    gl_FragColor = vec4(mix(vec3(0.035), normalView, coverage), 1.0);
    return;
  }
  if (uDebugView > 2.5 && uDebugView < 3.5) {
    gl_FragColor = vec4(mix(base * 0.22, refractedGreen, coverage), 1.0);
    return;
  }
  if (uDebugView > 3.5 && uDebugView < 4.5) {
    vec3 separation = abs(chromaticDelta * appliedChromaticWeight) * 2.2;
    gl_FragColor = vec4(mix(vec3(0.02), separation, coverage), 1.0);
    return;
  }
  if (uDebugView > 4.5 && uDebugView < 5.5) {
    gl_FragColor = vec4(noLightingComposite, 1.0);
    return;
  }
  if (uDebugView > 5.5 && uDebugView < 6.5) {
    gl_FragColor = vec4(noScatteringComposite, 1.0);
    return;
  }
  if (uDebugView > 6.5 && uDebugView < 7.5) {
    gl_FragColor = vec4(noTintComposite, 1.0);
    return;
  }
  if (uDebugView > 7.5 && uDebugView < 8.5) {
    gl_FragColor = vec4(noRimComposite, 1.0);
    return;
  }

  gl_FragColor = vec4(finalComposite, 1.0);
}
