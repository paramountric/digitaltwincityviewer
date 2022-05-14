import { vec3, mat4 } from 'gl-matrix';

export function getModelMatrix(extent, addZ?: number) {
  const min = [extent[0], extent[1], extent[2]] as vec3;
  const max = [extent[3], extent[4], extent[5]] as vec3;

  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const offset = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );
  const position = vec3.negate(vec3.create(), offset);
  if (addZ) {
    position[2] += addZ;
    console.log(position);
  }

  const modelMatrix = mat4.fromTranslation(mat4.create(), position);

  return modelMatrix;
}
