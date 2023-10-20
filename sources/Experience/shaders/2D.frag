uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uSize;
uniform vec3 uCursor;
varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

/**
* HELPERS
**/

// renvoie un nombre entre 0 et 1, la magnitude multiplie ce nombre
float clampedSine(float t, float magnitude) {
    // return (sin(t) + 1.) * .5 * magnitude;
    return (1. + cos(t)) / 2. * magnitude; 
}

float luminance(vec3 rgb) {
    return dot(rgb, vec3(.299, .587, .114));
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdBox(in vec2 p, in vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, .0)) + min(max(d.x, d.y), .0);
}

// -------------

void applyMirror(inout vec2 uv) {
    uv.y = 1. - uv.y;
}

void applyVerticalSymmetry(inout vec2 uv) {
    uv.y = abs(uv.y - .5) - .5;
}

void applyRotation(inout vec2 uv, float r) {
    uv -= .5;

    float a = atan(uv.y, uv.x);
    a -= r;
    uv = vec2(cos(a), sin(a)) * length(uv);
    uv += .5;
}

void applyZoom(inout vec2 uv, float z) {
    uv -= .5;
    uv *= 1. / z;
    uv += .5;
}

void applyFishEye(inout vec2 uv, float z) {
    uv -= .5;
    float l = length(uv);
    uv *= smoothstep(0., z * .5, l);
    uv += .5;
}

void applyRepeat(inout vec2 uv, float x, float y) {
    uv *= vec2(x, y);
    uv = fract(uv);
}

void applyNoise(inout vec2 uv, float frequence, float amplitude) {
    uv.x += sin((uv.y * frequence) + uTime) * amplitude;
}

void applyRows(inout vec2 uv, float t) {
    uv.x += sin((floor(uv.y * t) / t) * 50. + uTime * 10.) * .05;
}

void applyFold(inout vec2 uv, float strength) {
    uv -= .5;
    uv.y += abs(uv.x * strength);
    uv += .5;
}

void applyVerticalClamp(inout vec2 uv, float low, float high) {
    uv.y = clamp(uv.y, low, high);
}

void applyPixels(inout vec2 uv, float s) {
    // Diviser la taille de la texture par une valeur s :
    // Renvoie la size de la texture, deuxième paramètre = level of details (lod)
    // lod : choisir les mipmaps à prendre (plus c'est élevé pour la 'résolution' de l'image est faible et donc pixelisée)
    vec2 pix = vec2(s) / vec2(textureSize(uImage, 0));
    uv = floor(uv / pix) * pix;
}

void applySpine(inout vec2 uv, float s) {
    uv -= .5;
    float l = 1.-length(uv);
    float a = atan(uv.y, uv.x);

    a += l*s;
    uv = vec2(cos(a), sin(a)) * length(uv);
    uv += .5;
}

void applyPixelNoise(inout vec2 uv, float p, float s) {
    vec2 pix = vec2(p) / vec2(textureSize(uImage, 0));
    // uv += vec2(-1. + random(floor(uv / pix) * pix) * 2.) * s;

    uv.x += (-1. + random(floor(uv / pix) * pix) * 2.) * s;
    uv.y += (-1. + random(floor(uv / pix) * pix) * 2.) * s;
}

void applyScan(inout vec2 uv, float p) {
    uv.x += (random(uv.yy) * 2. - 1.) * p;
}

void applyScanSmooth(inout vec2 uv, float p, float s) {
    uv.x += ((random(uv.yy) * 2. - 1.) * p) * smoothstep(.0, 1., sin(uv.y * s + uTime * 5.));
}

void applyGlass(inout vec2 uv, float p, float s) {
    uv += (random(uv) * 2. - 1.) * p;
}

void applyCRT(inout vec2 uv, float s, float dir) {
    // sign: renvoie -1 si valeur négative, 0 si 0 et 1 si positif

    // uv -= .5;
    float crt = sin(abs(uv.y + dir) * 1000.);
    uv.x += sign(crt) * s;
    // uv += .5;
}

void applyBlackAndWhite(inout vec4 c) {
    c.rgb = vec3(luminance(c.rgb));
}

void applyThreshold(inout vec4 c, float limit) {
    c.rgb = vec3(step(limit, luminance(c.rgb)));
}

// limite le nombre de couleurs dans l'image 
void applycLimit(inout vec4 c, float s) { // s = nombre de couleur
    c = ceil(c * s) / s;
}

void applySonar(inout vec4 c, vec2 uv){
    uv -= .5;

    float l = length(uv);
    l *= 100.;
    l -= uTime * 10.;
    l = sin(l);
    l = smoothstep(-1., -.9, l);

    c.rgb *= l * vec3(0., 1., 0.5);

    uv += .5;
}

void applyGrid(inout vec4 c, vec2 uv){
    c *= .5 + .5 * smoothstep(1., .9, sin(uv.y * 200.));
    c *= .5 + .5 * smoothstep(1., .9, sin(uv.x * 200.));
}

void applyHorrizontalWaves(inout vec4 c, vec2 uv){
    c *= smoothstep(1., .9, sin(uv.y * 200. + sin(uv.x * 40.) * 2.));
}

void applyNegativeCircle(inout vec4 c, vec2 uv, float d, vec2 coord) { // d = diamètre
    coord += .5; // define base coord to center
    uv -= coord;

    float circle = step(sdCircle(uv, d / 2.), 0.);
    // mix postive and negative with the circle mask :
    c.rgb = mix(
        c.rgb, 
        1. - c.rgb, 
        circle
    ); 

    uv += coord;
}

void applyNegativeBox(inout vec4 c, vec2 uv, vec2 box, vec2 coord) {
    coord += .5; // define base coord to center
    uv -= coord;

    float circle = step(sdBox(uv, box), 0.);
    // mix postive and negative with the circle mask :
    c.rgb = mix(
        c.rgb, 
        1. - c.rgb, 
        circle
    ); 

    uv += coord;
}

void main() {
    vec2 uv = vUv;
    vec2 cursor = uCursor.xy;
    vec4 col = texture2D(uImage, uv);

// Uvs :
    // applyMirror(uv);
    // applyVerticalSymmetry(uv);
    // applyRotation(uv, PI / 4.);
    // applyZoom(uv, 2.);
    // applyZoom(uv, clampedSine(uTime, 2.) + 1.);
    // applyFishEye(uv, clampedSine(uTime, 1.));
    // applyRepeat(uv, 4., 5.);
    // applyNoise(uv, 50., .05);
    // applyRows(uv, 15.);
    // applyFold(uv, clampedSine(uTime, 2.));
    // applyVerticalClamp(uv, .5 - clampedSine(uTime, .5), .5 + clampedSine(uTime, .5));
    // applyPixels(uv, 1.);
    // applySpine(uv, 50.);
    // applyPixelNoise(uv, 2. + clampedSine(uTime + PI, .6), clampedSine(uTime, .2));
    // applyScan(uv, .2);
    // applyScanSmooth(uv, .01, 20.);
    // applyGlass(uv, .01, 20.);
    // applyCRT(uv, .001 + clampedSine(uTime, .01), uTime * .01);

// Colors and uvs :
    // applyBlackAndWhite(col);
    // applyThreshold(col, clampedSine(uTime, .5));
    // applyColorLimit(col, clampedSine(uTime, 16.));
    // applySonar(col, uv);
    // applyGrid(col, uv);
    // applyHorrizontalWaves(col, uv);
    applyNegativeCircle(col, uv, .25, cursor);
    // applyNegativeBox(col, uv, vec2(.25), cursor);

    gl_FragColor = col;
}