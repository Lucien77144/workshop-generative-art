uniform vec3 uBaseColor;
uniform vec3 uSize;
uniform sampler2D uMask;
uniform sampler2D uBaseTexture;
uniform sampler2D uSecondTexture;
uniform float uDateFactor;
uniform float uTime;

varying vec3 vPosition;
varying vec2 vUv;

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

vec4 getTexture2D(sampler2D map) {
	return texture2D(map, vUv);
}

vec3 getTextureColor(sampler2D texture) {
	vec2 repeat = vec2(uSize.xz) / 3.;
  	vec2 uv = fract(vUv * repeat);
  	vec2 smooth_uv = repeat * uv;
  	vec4 duv = vec4(dFdx(smooth_uv), dFdy(smooth_uv));

  	return textureGrad(texture, uv, duv.xy, duv.zw).rgb;
}

float luminance(vec3 rgb) {
    return dot(rgb, vec3(.299, .587, .114));
}

void main() {
	vec3 color = mix(uBaseColor, getTextureColor(uSecondTexture), getTexture2D(uMask).r + getTexture2D(uMask).b);
	float distX = (vPosition.x + 20.5) * 4. / uSize.x;

	gl_FragColor = vec4(mix(color, getTextureColor(uBaseTexture), getTexture2D(uMask).b), distX);
  
  float t = clamp(uTime * .001 - 1., 0., 1.);
  float f = uDateFactor * t * 2.;
  float noise = smoothstep(getNoise(4.) + 1., 0., f);

  vec4 grey = vec4(vec3(luminance(gl_FragColor.rgb)), 1.);

	// float noise = smoothstep(getNoise(4.) + 1., 0., uDateFactor * 2.);
	gl_FragColor = mix(gl_FragColor, grey, noise);
}
