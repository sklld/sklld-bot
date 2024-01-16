varying vec3 vCSMViewPosition;
uniform bool isExplosive;
uniform bool canSplash;
uniform bool isSpaced;
uniform bool isExternalModule;
uniform float thickness;
uniform float penetration;
uniform float caliber;
uniform float ricochet;
uniform float normalization;
uniform sampler2D externalModuleMask;
uniform sampler2D spacedArmorDepth;
uniform vec2 resolution;
varying mat4 vProjectionMatrix;

float depthToDistance(float depth) {
  mat4 projectionMatrixInverse = inverse(vProjectionMatrix);
  vec4 clipPosition = vec4(gl_FragCoord.xy / resolution * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 eyePosition = projectionMatrixInverse * clipPosition;
  vec3 NDCPosition = eyePosition.xyz / eyePosition.w;
  float worldDistance = length(NDCPosition);

  return worldDistance;
}

void main() {
  vec2 screenCoordinates = gl_FragCoord.xy / resolution;
  float spacedArmorDepthValue = texture2D(spacedArmorDepth, screenCoordinates).r;
  float currentDistance = depthToDistance(gl_FragCoord.z);
  float spacedArmorDistance = depthToDistance(spacedArmorDepthValue);
  float distanceFromSpacedArmor = currentDistance - spacedArmorDistance;
  vec4 externalModuleMaskColor = texture2D(externalModuleMask, screenCoordinates);
  bool isUnderExternalModule = externalModuleMaskColor.r == 1.0;
  vec3 normalizedNormal = normalize(vNormal);
  vec3 normalizedViewPosition = normalize(vCSMViewPosition);
  float dotProduct = dot(normalizedNormal, -normalizedViewPosition);
  float angle = acos(dotProduct);

  float penetrationChance = -1.0;
  float splashChance = -1.0;
  bool threeCalibersRule = caliber > 3.0 * thickness;

  if (!isUnderExternalModule && !isExternalModule && !isExplosive && !threeCalibersRule && angle >= ricochet) {
    penetrationChance = 0.0;
    splashChance = 0.0;
  } else {
    float piercedPenetration = penetration;

    // if (isUnderExternalModule) {
    //   // TODO: ADD 
    //   piercedPenetration -= 50.0;
    // }

    if (isExplosive) {
      // 50% loss of remaining penetration per meter
      piercedPenetration -= 0.5 * piercedPenetration * distanceFromSpacedArmor;
    }

    piercedPenetration = max(piercedPenetration, 0.0);

    bool twoCalibersRule = caliber > 2.0 * thickness;
    float finalNormalization = twoCalibersRule ? (normalization * 1.4 * caliber) / (2.0 * thickness) : normalization;
    float finalThickness = thickness / cos(angle - finalNormalization);
    float delta = finalThickness - piercedPenetration;
    float randomRadius = piercedPenetration * 0.05;

    if (delta > randomRadius) {
      penetrationChance = 0.0;
    } else if (delta < -randomRadius) {
      penetrationChance = 1.0;
    } else {
      penetrationChance = 1.0 - (delta + randomRadius) / (2.0 * randomRadius);
    }

    if (canSplash) {
      float reducedFinalThickness = finalThickness * (5.0 / 11.0);
      float splashDelta = reducedFinalThickness - piercedPenetration;

      if (splashDelta > randomRadius) {
        splashChance = 0.0;
      } else if (splashDelta < -randomRadius) {
        splashChance = 1.0;
      } else {
        splashChance = 1.0 - (splashDelta + randomRadius) / (2.0 * randomRadius);
      }
    } else {
      splashChance = 0.0;
    }
  }

  if (isSpaced) {
    // if (isExternalModule) {
    //   csm_FragColor = vec4(0.5, 0.0, 1.0, 0.5);
    // } else {
    //   if (isExplosive) {
    //     csm_FragColor = vec4(1.0, 0.0, 1.0, 0.5);
    //   } else {
    //     csm_FragColor = vec4(1.0, 0.0, 1.0, (1.0 - penetrationChance) * 0.5);
    //   }
    // }

    csm_FragColor = vec4(0.0);
  } else {
    csm_FragColor = vec4(1.0, splashChance * 0.392, 0.0, (1.0 - penetrationChance) * 0.5);
  }
}