uniform sampler2D uDisplacement;
uniform sampler2D uMask;
uniform float uTime;
uniform vec3 uSize;
uniform float uMaxBladeSize;

varying vec2 vUv;
varying vec3 vBasePosition;
varying vec3 vPosition;
varying float vMask;

float reduce = 1500.;

float wave(float tipDistance) {
  // Tip is the fifth vertex drawn per blade
  bool isTip = (gl_VertexID + 1) % 5  == 0;

  float waveDistance = isTip ? tipDistance : 0.;
  return sin(vPosition.z + uTime / reduce) * waveDistance;
}

float getWind() {
  float windFactor = uTime / reduce + (vPosition.x + vPosition.z * 2.) / 3.;
  return -(cos(windFactor) + sin(windFactor) + 1.) / 20.;
}

vec4 getTexture2D(sampler2D map) {
	return texture2D(map, vec2(vBasePosition.x / uSize.x, -vBasePosition.z / uSize.z) + .5);
}

void main() {
  vPosition = position;
  vBasePosition = position;
  vUv = uv;

  vec4 mask = getTexture2D(uMask);
  vec4 disp = getTexture2D(uDisplacement);

  float wind = getWind() / 3.;
  vPosition.y += (disp.r * uSize.y) + wind;
  vBasePosition.y += wind;
  vPosition.z += wave(wind);

  vMask = 1. - (mask.b + mask.g + mask.r);
  vPosition.y -= (uMaxBladeSize - uMaxBladeSize * vMask);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.);
}