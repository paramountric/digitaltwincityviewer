import asyncio
import httpx
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import uuid
import subprocess

# Load environment variables from .env file
load_dotenv()

N8N_URL = "http://supabase_n8n_digitaltwincityviewer:5678"
N8N_EMAIL = os.getenv("N8N_EMAIL")
N8N_PASSWORD = os.getenv("N8N_PASSWORD")
API_KEY_FILE = "/app/data/n8n_api_key.json"
DATA_DIR = Path("/app/data")

async def get_auth_token(client: httpx.AsyncClient) -> str | None:
    print(f"Attempting to login with email: {N8N_EMAIL}")
    
    try:
        login_response = await client.post(
            f"{N8N_URL}/rest/login",
            json={
                "email": N8N_EMAIL,
                "password": N8N_PASSWORD
            }
        )
        
        if login_response.status_code != 200:
            print(f"Login failed with status {login_response.status_code}: {login_response.text}")
            return None
            
        auth_cookie = login_response.cookies.get("n8n-auth")
        if not auth_cookie:
            print("No auth cookie received in response")
            return None
            
        print("Successfully obtained auth token")
        return auth_cookie
        
    except Exception as e:
        print(f"Login request failed: {str(e)}")
        return None

async def get_or_create_api_key(client: httpx.AsyncClient, auth_token: str) -> str | None:
    # Check if API key exists in volume
    if os.path.exists(API_KEY_FILE):
        try:
            with open(API_KEY_FILE, 'r') as f:
                data = json.load(f)
                print("Found existing API key in volume")
                return data.get('api_key')
        except Exception as e:
            print(f"Error reading API key from volume: {e}")
    
    # Create new key if none exists
    try:
        unique_label = f"dtcc-core-{uuid.uuid4()}"
        response = await client.post(
            f"{N8N_URL}/rest/api-keys",
            headers={
                "Cookie": f"n8n-auth={auth_token}",
                "Content-Type": "application/json"
            },
            json={
                "label": unique_label, # not working...
                "name": unique_label # not working...
            }
        )
        
        if response.status_code != 200:
            print(f"API key creation failed with status {response.status_code}: {response.text}")
            return None
            
        api_key = response.json()["data"]["apiKey"]
        
        # Save the new key to volume
        os.makedirs(os.path.dirname(API_KEY_FILE), exist_ok=True)
        with open(API_KEY_FILE, 'w') as f:
            json.dump({
                'api_key': api_key,
                'label': unique_label
            }, f)
        
        print(f"Created and saved new API key with label: {unique_label}")
        return api_key
        
    except Exception as e:
        print(f"Failed to create or save API key: {str(e)}")
        return None

async def download_demo_data() -> bool:
    """Download DTCC demo data to the data volume"""
    try:
        print("Downloading DTCC demo data...")
        
        # Create data directory if it doesn't exist
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        # Change to the data directory before running the command
        os.chdir(str(DATA_DIR))
        
        # Run the dtcc-download-demo-data command
        result = subprocess.run(
            ["dtcc-download-demo-data"],
            capture_output=True,
            text=True,
            check=True
        )
        
        if result.returncode == 0:
            print(f"Demo data downloaded successfully to {DATA_DIR}")
            print(f"Command output: {result.stdout}")
            return True
        else:
            print(f"Error downloading demo data: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Failed to download demo data: {e}")
        return False

async def setup_workflows():
    if not N8N_EMAIL or not N8N_PASSWORD:
        print("Error: N8N_EMAIL or N8N_PASSWORD environment variables are not set")
        return
    
    # Check for existing API key before doing anything else
    if os.path.exists(API_KEY_FILE):
        try:
            with open(API_KEY_FILE, 'r') as f:
                data = json.load(f)
                if data.get('api_key'):
                    print("Setup already completed (API key exists)")
                    return
        except Exception as e:
            print(f"Error reading API key file: {e}")

            # Download demo data first
    if not await download_demo_data():
        print("Warning: Failed to download demo data, continuing with setup...")

    try:
        async with httpx.AsyncClient() as client:
            # Get auth token first
            auth_token = await get_auth_token(client)
            if not auth_token:
                print("Failed to obtain auth token")
                return
            
            # Create new API key with unique name
            api_key = await get_or_create_api_key(client, auth_token)
            if not api_key:
                print("Failed to get or create API key")
                return
            
            print("Successfully created API key")
            
            # Set up headers with API key
            headers = {
                "X-N8N-API-KEY": api_key,
                "Content-Type": "application/json"
            }
            
            print("Attempting to import workflow...")
            
            # Import workflow
            workflow_path = Path(__file__).parent / "process-dtcc.json"
            with open(workflow_path) as f:
                workflow_data = json.load(f)
            
            response = await client.post(
                f"{N8N_URL}/api/v1/workflows",
                headers=headers,
                json=workflow_data,
                timeout=10.0
            )
            
            if response.status_code not in (200, 201):
                print(f"Error importing workflow: {response.text}")
                return
                
            workflow_id = response.json()["id"]
            
            # Activate workflow in a separate request
            activate_response = await client.post(
                f"{N8N_URL}/api/v1/workflows/{workflow_id}/activate",
                headers=headers
            )
            
            if activate_response.status_code == 200:
                print(f"Workflow imported and activated with ID: {workflow_id}")
            else:
                print(f"Error activating workflow: {activate_response.text}")
                
    except Exception as e:
        print(f"Error during setup: {str(e)}")

if __name__ == "__main__":
    asyncio.run(setup_workflows())