export default `\
precision highp float;
varying vec4 vColor;
varying vec2 vPathPosition;
varying float vPathLength;
varying vec2 vPathOffset;
varying float vPathThickness;
varying vec2 vDirection;
varying float vIsPlaceholder;

uniform vec2 project_uViewportSize;
uniform float project_uScale;
uniform float time;

void main(void) {
  vec2 vDashArray = vec2(0.003, 0.003) * project_uScale;

  float solidLength = vDashArray.x;
  float gapLength = vDashArray.y;
  float unitLength = solidLength + gapLength;

  // wood effect
  // float pos = (vPathPosition.x * vDirection.x + vPathPosition.y * vDirection.y) * 0.5;
  float pos = (vPathPosition.x) * 0.5;
  float offsetLength = length(vPathOffset);
  float viewportRatio = project_uViewportSize.y;
  
  float unitOffset = mod(pos, unitLength);

  // float d = mod(vPathLength - time * 0.0001, 1000.);
  // float a1 = d < 300. ? mix(0., 1., d / 300.) : 0.0;
  // float a2 = exp(abs(1.) * 3.);
  // float a = a1 * a2;

  gl_FragColor = vColor;

  if (vIsPlaceholder > 0.0) {
    if (unitOffset > solidLength) {
      // for dashes:
      gl_FragColor = vec4(vColor.xyz, 0.6);
      // for lines on the sides
      if (offsetLength > (vPathThickness * 0.5) * project_uScale / viewportRatio - 0.003) {
        gl_FragColor = vec4(vColor.xyz, 1.0);
        //gl_FragColor = vColor;
      } else {
        discard;
      }
    } else {
      discard;
    }
  }
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);

}
`;
