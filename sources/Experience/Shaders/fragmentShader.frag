uniform float uDateFactorMin;
uniform sampler2D uBase;
uniform sampler2D uScreen;
uniform sampler2D uMask;
uniform float uTime;
uniform float uScene;
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

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
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
    vec4 light = vec4(1.);

    applyCRT(screenUv, .001 + clampedSine(uTime, .001) / 10., uTime * .001, uDateFactorMin);
    applyGlass(screenUv, .005 * uDateFactorMin, 5. * uDateFactorMin);

    vec4 base = texture2D(uBase, uv);
    vec4 screen = texture2D(uScreen, screenUv);
    float mask = texture2D(uMask, uv).r;

    vec4 bw = applyBlackAndWhite(screen, (noise(vec2(uTime * .01)) * .25 + .75) * (1. - uDateFactorMin));
    vec4 col = mix(bw, light, base.r);

    float css = 1. - (screen.b - screen.r - screen.g);

    gl_FragColor.rgb = vec3(mix(base, col, mask));
    gl_FragColor.a = css;
}