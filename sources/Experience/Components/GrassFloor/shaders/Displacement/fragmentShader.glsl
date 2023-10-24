uniform vec3 uBaseColor;
uniform vec3 uSize;
uniform sampler2D uMask;
uniform sampler2D uBaseTexture;
uniform sampler2D uSecondTexture;

varying vec3 vPosition;
varying vec2 vUv;

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

void main() {
	vec3 color = mix(uBaseColor, getTextureColor(uSecondTexture), getTexture2D(uMask).r + getTexture2D(uMask).b);
	float distX = (vPosition.x + 20.5) * 4. / uSize.x;

	gl_FragColor = vec4(mix(color, getTextureColor(uBaseTexture), getTexture2D(uMask).b), distX);
}