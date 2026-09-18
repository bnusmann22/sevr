import httpx

from .config import get_settings


class NextcloudClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = settings.nextcloud_url.rstrip("/")
        self.username = settings.nextcloud_service_user
        self.password = settings.nextcloud_service_password

    def _client(self) -> httpx.Client:
        return httpx.Client(auth=(self.username, self.password), timeout=30.0)

    def healthcheck(self) -> bool:
        with self._client() as client:
            response = client.get(f"{self.base_url}/status.php")
            response.raise_for_status()
        return True

    def upload(self, remote_path: str, content: bytes) -> None:
        target = f"{self.base_url}/remote.php/dav/files/{self.username}/{remote_path.lstrip('/')}"
        with self._client() as client:
            response = client.put(target, content=content)
            response.raise_for_status()

    def download(self, remote_path: str) -> bytes:
        target = f"{self.base_url}/remote.php/dav/files/{self.username}/{remote_path.lstrip('/')}"
        with self._client() as client:
            response = client.get(target)
            response.raise_for_status()
            return response.content

    def list_files(self, remote_path: str = "") -> str:
        target = f"{self.base_url}/remote.php/dav/files/{self.username}/{remote_path.lstrip('/')}"
        with self._client() as client:
            response = client.request("PROPFIND", target, headers={"Depth": "1"})
            response.raise_for_status()
            return response.text
