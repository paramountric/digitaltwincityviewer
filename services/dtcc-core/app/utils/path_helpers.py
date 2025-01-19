from pathlib import Path
from typing import Union
import os
import shutil

def ensure_directory(path: Union[str, Path]) -> Path:
    """
    Ensure a directory exists, create it if it doesn't.
    
    Args:
        path: Directory path as string or Path object
        
    Returns:
        Path object of the ensured directory
    """
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    return path

def get_output_path(base_dir: Union[str, Path], name: str) -> Path:
    """
    Generate an output path and ensure the directory exists.
    
    Args:
        base_dir: Base directory for output
        name: Name of the output directory/file
        
    Returns:
        Path object for the output
    """
    output_path = Path(base_dir) / name
    ensure_directory(output_path.parent)
    return output_path

def clean_directory(path: Union[str, Path]) -> None:
    """
    Remove all contents of a directory without removing the directory itself.
    
    Args:
        path: Directory path to clean
    """
    path = Path(path)
    if path.exists():
        for item in path.iterdir():
            if item.is_file():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)

def is_valid_file(path: Union[str, Path], extensions: list[str] = None) -> bool:
    """
    Check if a file exists and optionally has a specific extension.
    
    Args:
        path: File path to check
        extensions: List of valid extensions (e.g., ['.json', '.geojson'])
        
    Returns:
        bool: True if file exists and has valid extension (if specified)
    """
    path = Path(path)
    if not path.is_file():
        return False
    if extensions:
        return path.suffix.lower() in extensions
    return True
