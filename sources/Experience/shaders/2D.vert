varying vec2 vUv;
uniform vec3 uCursor;

void main() {
    vUv = uv;
    vec3 pos = position;

    // vUv -= .5;

    // pos.z *= 1. + abs(uCursor.x * uv.x / 5.);
    // pos.x *= 1. + (uv.x * (uCursor.x));
    // pos.y *= 1. + (uv.x * abs(uCursor.y));
    // pos.y *= cos(uCursor.x);
    // vUv += .5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}