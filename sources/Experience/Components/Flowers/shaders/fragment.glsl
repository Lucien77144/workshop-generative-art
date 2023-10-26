uniform float uProgress;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float isVisible = step(uProgress, uv.x);

    if(isVisible == 1.) {
        discard;
    };
    
    gl_FragColor = vec4(0.35, 0.84, 0.6, 1.0);
}
 