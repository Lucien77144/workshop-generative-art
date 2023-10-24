uniform float uPixelRatio;
uniform float uFliesSize;
uniform float uTime;

attribute float aScale;

varying vec3 vPosition;

void main()
{
    vPosition = position;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += sin(uTime + modelPosition.x * 500.0) * aScale * 0.2;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectionPosition;
    gl_PointSize = uFliesSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / -viewPosition.z);
}