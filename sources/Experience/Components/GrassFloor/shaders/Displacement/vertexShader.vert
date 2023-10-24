varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D uDisplacement;
uniform vec3 uSize;

vec4 getTexture2D(sampler2D map) {
	return texture2D(map, vUv);
}

void main() {
	vUv = uv;
	vPosition = position;

	vec4 displacement = getTexture2D(uDisplacement);
	vec3 newPosition = vPosition + normal * (displacement.r * uSize.y);

	newPosition.y -= uSize.y * 0.5;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}