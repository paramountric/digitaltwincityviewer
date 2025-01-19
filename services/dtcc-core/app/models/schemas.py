from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from pathlib import Path
import dtcc

class DTCCParameters(BaseModel):
    """DTCC Core building parameters"""
    data_directory: str = Field(default="", description="Path to directory containing input data")
    output_directory: str = Field(default="", description="Path to directory where output data will be stored")
    build_mesh: bool = Field(default=True, description="Flag indicating whether to build ground and building meshes")
    build_volume_mesh: bool = Field(default=True, description="Flag indicating whether to build volume mesh")
    auto_domain: bool = Field(default=True, description="Flag indicating whether to automatically calculate the domain bounds")
    
    # Domain coordinates
    x_0: float = Field(default=0.0, description="x-coordinate of origin")
    y_0: float = Field(default=0.0, description="y-coordinate of origin")
    x_min: float = Field(default=0.0, description="Minimum x-coordinate of domain relative to origin")
    y_min: float = Field(default=0.0, description="Minimum y-coordinate of domain relative to origin")
    x_max: float = Field(default=0.0, description="Maximum x-coordinate of domain relative to origin")
    y_max: float = Field(default=0.0, description="Maximum y-coordinate of domain relative to origin")
    
    # Mesh parameters
    mesh_resolution: float = Field(default=10.0, description="Maximum cell size of generated meshes")
    domain_height: float = Field(default=100.0, description="Height of domain (bounding box)")

class ProcessConfig(BaseModel):
    """Configuration for city processing"""
    data_directory: str = Field(
        default="helsingborg-residential-2022",
        description="Name of the data directory containing input files"
    )
    buildings_file: str = Field(
        default="footprints.shp",
        description="Name of the shapefile containing building footprints"
    )
    dtcc_parameters: Optional[DTCCParameters] = Field(
        default_factory=DTCCParameters,
        description="DTCC specific parameters"
    )
    
    def to_dtcc_params(self) -> Dict[str, Any]:
        """Convert to DTCC parameters dictionary"""
        params = dtcc.parameters.default()  # Get DTCC defaults
        
        # Update with our parameters
        dtcc_params = self.dtcc_parameters.model_dump()
        params.update(dtcc_params)
        
        return params
