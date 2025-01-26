export default `\
attribute vec3 positions;

attribute vec2 instanceSourcePositions;
attribute vec2 instanceTargetPositions;
attribute vec2 instanceSourceDirections;
attribute vec2 instanceTargetDirections;
attribute vec3 instanceLinkColors;
attribute float instanceLinkWidths;
attribute float instanceLinkIsPlaceholder;
attribute vec3 instancePickingColors;
// attribute vec2 instanceDashArrays;
// attribute float instanceDashOffsets;

// varying vec2 vDashArray;
varying vec2 vDirection;
varying vec2 vPathPosition;
varying float vPathLength;
varying vec4 vColor;
varying vec2 vPathOffset;
varying float vPathThickness;
varying float vIsPlaceholder;

uniform float opacity;
uniform float numSegments;
uniform float borderWidth;
uniform float widthScale;
uniform float widthMinPixels;
uniform float widthMaxPixels;
uniform int widthUnits;

vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * project_uViewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
  vec2 offset_screenspace = dir_screenspace * offset_direction * width / 2.0;
  vec2 offset_clipspace = project_pixel_size_to_clipspace(offset_screenspace).xy;
  return offset_clipspace;
}

vec2 getExtrusionOffsetOld(vec2 line_clipspace, float offset_direction, float width) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * project_uViewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
  vec2 offset_screenspace = dir_screenspace * offset_direction * width / 2.0 * project_uScale;
  // vec2 offset_commonspace = project_position(offset_screenspace);
  // vec2 offset_clipspace = project_common_position_to_clipspace(vec4(offset_commonspace, 0, 1)).xy;
  return offset_screenspace / project_uViewportSize;
}

float getSegmentRatio(float index) {
  return smoothstep(0.0, 1.0, index / numSegments);
}

vec4 mt(float segmentRatio) {
  mat4 M = mat4(
    2, -2, 1, 1,
    -3, 3, -2, -1,
    0, 0, 1, 0,
    1, 0, 0, 0
  );
  float t = segmentRatio;
  float t2 = pow(t, 2.0);
  float t3 = pow(t2, 2.0);
  vec4 T = vec4(t3, t2, t, 1);
  return M * T;
}

vec3 bezier(vec3 A, vec3 B, vec3 C, vec3 D, float t) {
  vec3 E = mix(A, B, t);
  vec3 F = mix(B, C, t);
  vec3 G = mix(C, D, t);

  vec3 H = mix(E, F, t);
  vec3 I = mix(F, G, t);

  vec3 P = mix(H, I, t);

  return P;
}

vec4 computeCurve(vec4 source, vec4 target, vec2 sourceDir, vec2 targetDir, float segmentRatio) {
  vec3 start = source.xyz;
  vec2 mid = (target.xy - source.xy) * 0.5;
  vec2 offset1 = mid * sourceDir;
  vec2 offset2 = mid * targetDir;
  
  vec3 cp1 = source.xyz + vec3(offset1, 0);
  vec3 cp2 = target.xyz - vec3(offset2, 0);
  vec3 end = target.xyz;
  vec3 bez = bezier(start, cp1, cp2, end, segmentRatio);
  return vec4(bez.xy, 0, 1.);
}

void main(void) {
  geometry.pickingColor = instancePickingColors;
  vec4 sourcePos = vec4(project_position(instanceSourcePositions), 0., 1.0);
  vec4 targetPos = vec4(project_position(instanceTargetPositions), 0., 1.0);
  vec4 source = project_common_position_to_clipspace(sourcePos);
  vec4 target = project_common_position_to_clipspace(targetPos);
  // this is integer i..NUM_SEGMENTS
  float segmentIndex = positions.x;
  float segmentRatio = getSegmentRatio(segmentIndex);
  vec4 p = computeCurve(source, target, instanceSourceDirections, instanceTargetDirections, segmentRatio);
  // next point
  float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
  float nextSegmentRatio = getSegmentRatio(segmentIndex + indexDir);
  vec4 nextP = computeCurve(source, target, instanceSourceDirections, instanceTargetDirections, nextSegmentRatio);

  float widthPixels = clamp(
    project_size_to_pixel(instanceLinkWidths * widthScale, widthUnits),
    widthMinPixels, widthMaxPixels
  );

  // extrude
  float direction = float(positions.y);
  direction = mix(-1.0, 1.0, step(segmentIndex, 0.0)) * direction;
  vec2 segmentDir = nextP.xy - p.xy;
  vec2 offset = getExtrusionOffset(segmentDir, direction, widthPixels);
  gl_Position = p + vec4(offset, 0.0, 0.0);

  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  DECKGL_FILTER_COLOR(vColor, geometry);

  vDirection = positions.xy;
  vColor = vec4(instanceLinkColors / 255., opacity);
  vPathPosition = p.xy;
  vPathLength = length(source.xy - target.xy);
  vPathThickness = widthPixels;
  vPathOffset = offset;
  vIsPlaceholder = instanceLinkIsPlaceholder;
}
`;
