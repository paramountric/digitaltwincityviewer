# DTCC API

The DTCC Platform provides a comprehensive API for interacting with various components of the digital twin city models. The API is designed to be flexible and powerful, allowing users to manipulate city models, geometries, and other related data structures.

## Classes

- **Object**: Base class for all object classes.
- **GeometryType**: Enumeration representing different geometry types.
- **Building**: Represents a building in a city.
- **BuildingPart**: Represents a part of a building.
- **City**: Represents a city, the top-level container class for city models.
- **CityObject**: Represents a generic object in a city.
- **Terrain**: Represents a terrain object in a city.
- **RoadNetwork**: Represents a road network in a city.
- **RoadType**: Enumeration representing different road types.
- **Landuse**: Represents a land use object in a city.
- **LanduseClasses**: Enumeration representing different land use classes.
- **Bounds**: Represents the boundaries of a rectangular region in the xy plane with optional extension along the z-axis (depth).
- **Geometry**: Base class for all geometry classes.
- **Grid**: Represents a structured quadrilateral grid in 2D.
- **Mesh**: Represents an unstructured triangular mesh in 3D.
- **MultiSurface**: Represents planar surfaces in 3D.
- **PointCloud**: Represents a set of points in 3D.
- **Surface**: Represents a planar surface in 3D.
- **Transform**: Represents an affine transformation to a global coordinate system.
- **VolumeGrid**: Represents a structured hexahedral grid in 3D.
- **VolumeMesh**: Represents an unstructured tetrahedral mesh in 3D.
- **LineString**: Represents a line string geometry.
- **MultiLineString**: Represents multiple line strings.
- **Field**: Represents a field (scalar or vector) defined on a geometry.
- **Raster**: A georeferenced n-dimensional raster of values.

## Free Functions

- **Logging Functions**: `error`, `critical`, `debug`, `info`, `warning` - Log messages of various severities.
- **Logging Initialization**: `init_logging`, `get_logger` - Initialize and retrieve loggers for packages.
- **Mesh Functions**: `load_mesh`, `save_mesh`, `save_volume_mesh`, `load_volume_mesh` - Load and save mesh and volume mesh files.
- **PointCloud Functions**: `load_pointcloud`, `save_pointcloud` - Load and save PointCloud objects.
- **Raster Functions**: `load_raster`, `save_raster` - Load and save Raster objects.
- **City Functions**: `load_city`, `load_footprints`, `save_footprints`, `load_cityjson`, `load_roadnetwork` - Load and save city-related data.
- **Building Functions**: `extract_roof_points`, `compute_building_heights`, `build_lod1_buildings`, `build_surface_mesh` - Extract and compute building data.
- **Terrain Functions**: `build_terrain_mesh`, `build_terrain_raster`, `flat_terrain` - Build and manipulate terrain data.
- **Footprint Functions**: `merge_building_footprints`, `simplify_building_footprints`, `fix_building_footprint_clearance`, `split_footprint_walls` - Manage building footprints.
- **Building Management**: `merge_buildings`, `fix_building_clearance`, `clean_building_surfaces` - Manage and clean building data.

For more detailed information, please refer to the [DTCC API Reference](https://platform.dtcc.chalmers.se/api.html).
