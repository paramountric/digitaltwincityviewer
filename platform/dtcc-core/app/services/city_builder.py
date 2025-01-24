from pathlib import Path
import dtcc
from app.config.settings import DATA_DIR
from app.lib.dtcc_extensions import DTCCExtensions
from app.utils import ensure_directory, get_output_path, is_valid_file
from app.models.schemas import ProcessConfig

class CityBuilder:
    def __init__(self):
        self.dtcc_ext = DTCCExtensions()
    
    async def process_city(self, config: ProcessConfig):
        try:
            # Get paths from config or use defaults with proper path joining
            data_directory = get_output_path(DATA_DIR, config.data_directory)
            buildings_path = data_directory / config.buildings_file
            pointcloud_path = data_directory
            
            # Add validation using utility function
            if not data_directory.exists():
                raise ValueError(f"Data directory not found: {data_directory}")
            if not is_valid_file(buildings_path, ['.shp']):
                raise ValueError(f"Buildings file not found: {buildings_path}")
            
            # Set up parameters
            p = dtcc.parameters.default()
            p["auto_domain"] = True
            
            # Calculate bounds
            origin, bounds = dtcc.calculate_bounds(buildings_path, pointcloud_path, p)
            
            # Load city and pointcloud data
            city = dtcc.load_city(buildings_path, bounds=bounds)
            pointcloud = dtcc.load_pointcloud(pointcloud_path, bounds=bounds)
            
            # Build city model
            city = dtcc.build_city(city, pointcloud, bounds, p)
            
            # Build meshes
            ground_mesh, building_mesh = dtcc.build_mesh(city, p)
            volume_mesh, volume_mesh_boundary = dtcc.build_volume_mesh(city, p)
            
            # Create and ensure output directory exists
            output_dir = get_output_path(data_directory, "output")

            # then convert and save glb from the meshes

            self.dtcc_ext.save_glb(ground_mesh, output_dir / "ground_mesh.glb")
            self.dtcc_ext.save_glb(building_mesh, output_dir / "building_mesh.glb")
            self.dtcc_ext.save_glb(volume_mesh, output_dir / "volume_mesh.glb")
            self.dtcc_ext.save_glb(volume_mesh_boundary, output_dir / "volume_mesh_boundary.glb")
            
            return {
                "status": "success",
                "message": "City and meshes built successfully",
                "output_directory": str(output_dir)
            }
        except Exception as e:
            print(f"Error processing request: {e}")
            raise
