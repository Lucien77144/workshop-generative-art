uniform float uTime;
uniform sampler2D uDisplacement;
uniform sampler2D uMask;
uniform vec3 uSize;
uniform float uMaxBladeSize;

varying vec2 vUv;
varying vec3 vBasePosition;
varying vec3 vPosition;
varying float vMask;

float wave(float tipDistance) {
  // Tip is the fifth vertex drawn per blade
  bool isTip = (gl_VertexID + 1) % 5  == 0;

  float waveDistance = isTip ? tipDistance : 0.;
  return sin(vPosition.z + uTime / 1500.) * waveDistance;
}

float getWind() {
  float windFactor = uTime / 1500. + (vPosition.x + vPosition.z * 2.) / 3.;
  return -(cos(windFactor) + sin(windFactor) + 1.) / 20.;
}

vec4 getTexture2D(sampler2D map) {
	return texture2D(map, vec2(vBasePosition.x / uSize.x, -vBasePosition.z / uSize.z) + .5);
}

void main() {
  vPosition = position;
  vBasePosition = position;
  vUv = uv;
  
  float wind = getWind();
  vPosition.y += (getTexture2D(uDisplacement).r * uSize.y) + wind;
  vBasePosition.y += wind;
  vPosition.z += wave(wind);

  vMask = 1. - (getTexture2D(uMask).b + getTexture2D(uMask).g + getTexture2D(uMask).r);
  vPosition.y -= (uMaxBladeSize - uMaxBladeSize * vMask);
  vPosition.z += 1.;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.);
}