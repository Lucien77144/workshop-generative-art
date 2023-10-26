uniform sampler2D uDisplacement;
uniform sampler2D uMask;
uniform float uTime;
uniform vec3 uSize;
uniform float uMaxBladeSize;
uniform float uGrassScale;
uniform float uDateFactor;

varying vec2 vUv;
varying vec3 vPosition;
varying float vMask;

float reduce = 1500.;

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
vec4 permute(vec4 x) {
  return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}
// ------

float getNoise(float i) {
  return cnoise((vPosition.xz + i * max(uSize.x, uSize.z)) / 5.) / 1.;
}

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
	return texture2D(map, vec2(vPosition.x / uSize.x, -vPosition.z / uSize.z) + .5);
}

void main() {
  vPosition = position;
  vUv = uv;

  vec4 mask = getTexture2D(uMask);
  vec4 disp = getTexture2D(uDisplacement);

  float wind = getWind() / 5. * uGrassScale;
  vPosition.y += (disp.r * uSize.y) + wind;
  vPosition.z += wave(wind);
  
  float t = clamp(uTime * .001 - 1., 0., 1.);
  float f = uDateFactor * t * 2.;
  float noise = smoothstep(getNoise(4.) + 1., 0., f);
  vPosition.y -= (noise * uMaxBladeSize);

  vMask = 1. - (mask.b + mask.g + mask.r);
  vPosition.y -= (uMaxBladeSize - uMaxBladeSize * vMask);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.);
}