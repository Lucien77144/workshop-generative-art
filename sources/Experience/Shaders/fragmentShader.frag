uniform float uDateFactor;
uniform sampler2D uBase;
uniform sampler2D uScreen;
uniform sampler2D uMask;
uniform float uTime;
varying vec2 vUv;

float clampedSine(float t, float magnitude) {
    return (1. + cos(t)) / 2. * magnitude; 
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float luminance(vec3 rgb) {
    return dot(rgb, vec3(.299, .587, .114));
}

// ------------------------------

void applyCRT(inout vec2 uv, float s, float dir, float oldness) {
    uv -= .5;
    float crt = sin(abs(uv.y + dir) * (50. * oldness + 1.));
    uv.x += sign(crt) * s;
    uv += .5;
}

void applyGlass(inout vec2 uv, float p, float s) {
    uv -= .5;
    uv += (random(uv) * s - 1.) * p;
    uv += .5;
}

vec4 applyBlackAndWhite(vec4 c, float f) {
    vec4 bw = vec4(luminance(c.rgb));
    return vec4(mix(bw.rgb, c.rgb, f), 1.);
}

void main() {
    vec2 uv = vUv;
    vec2 screenUv = vUv;
    vec4 light = vec4(.5, .2, .2, 1.);

    applyCRT(screenUv, .001 + clampedSine(uTime, .001) / 10., uTime * .001, uDateFactor);
    applyGlass(screenUv, .005 * uDateFactor, 5. * uDateFactor);

    vec4 base = texture2D(uBase, uv);
    vec4 screen = applyBlackAndWhite(texture2D(uScreen, screenUv), clampedSine(uTime, 1. - uDateFactor));
    vec4 mask = texture2D(uMask, uv);

    vec4 col = mix(screen, light, base.r);

    gl_FragColor = mix(base, col, mask.r);
}