uniform vec3 uSize;
uniform vec3 uColor;

varying vec3 vPosition;

void main()
{
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter;

	float distX = (vPosition.x + 20.5) / uSize.x;

    gl_FragColor = vec4(uColor, (strength - 0.1) * distX);
}