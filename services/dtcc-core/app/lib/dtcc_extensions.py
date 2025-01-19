import dtcc
import pygltflib

# https://github.com/dtcc-platform/dtcc-core/blob/develop/dtcc_core/io/meshes.py
class DTCCExtensions:
    def save_glb(self, mesh, path):
        triangles_binary_blob = mesh.faces.flatten().tobytes()
        points_binary_blob = mesh.vertices.flatten().tobytes()
        data = triangles_binary_blob + points_binary_blob

        model = pygltflib.GLTF2()
        scene = pygltflib.Scene(nodes=[0])
        model.scenes.append(scene)
        model.scene = 0
        nodes = pygltflib.Node(mesh=0)
        model.nodes.append(nodes)

        buffer = pygltflib.Buffer()
        buffer.byteLength = len(data)
        model.buffers.append(buffer)
        model.set_binary_blob(data)

        triangle_accessor = pygltflib.Accessor(
            bufferView=0,
            componentType=pygltflib.UNSIGNED_INT,
            count=mesh.faces.size,
            type=pygltflib.SCALAR,
            max=[int(mesh.faces.max())],
            min=[int(mesh.faces.min())],
        )
        model.accessors.append(triangle_accessor)
        points_accessor = pygltflib.Accessor(
            bufferView=1,
            componentType=pygltflib.FLOAT,
            count=len(mesh.vertices),
            type=pygltflib.VEC3,
            max=mesh.vertices.max(axis=0).tolist(),
            min=mesh.vertices.min(axis=0).tolist(),
        )
        model.accessors.append(points_accessor)

        triangle_view = pygltflib.BufferView(
            buffer=0,
            byteLength=len(triangles_binary_blob),
            byteOffset=0,
            target=pygltflib.ELEMENT_ARRAY_BUFFER,
        )
        model.bufferViews.append(triangle_view)
        points_view = pygltflib.BufferView(
            buffer=0,
            byteLength=len(points_binary_blob),
            byteOffset=len(triangles_binary_blob),
            target=pygltflib.ARRAY_BUFFER,
        )
        model.bufferViews.append(points_view)

        mesh = pygltflib.Mesh()
        primitive = pygltflib.Primitive(attributes={"POSITION": 1}, indices=0)
        mesh.primitives.append(primitive)
        model.meshes.append(mesh)

        model.set_binary_blob(data)
        model.save(path)
