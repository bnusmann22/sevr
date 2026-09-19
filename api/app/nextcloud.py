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

    def ensure_directory(self, remote_path: str) -> None:
        parts = [p for p in remote_path.strip("/").split("/") if p]
        current = ""
        with self._client() as client:
            for part in parts:
                current = f"{current}/{part}" if current else part
                target = f"{self.base_url}/remote.php/dav/files/{self.username}/{current}"
                response = client.request("PROPFIND", target, headers={"Depth": "0"})
                if response.status_code == 404:
                    mkcol = client.request("MKCOL", target)
                    if mkcol.status_code not in (201, 405):
                        mkcol.raise_for_status()

    def upload(self, remote_path: str, content: bytes) -> None:
        clean_path = remote_path.lstrip("/")
        if "/" in clean_path:
            parent_dir = clean_path.rsplit("/", 1)[0]
            self.ensure_directory(parent_dir)
        target = f"{self.base_url}/remote.php/dav/files/{self.username}/{clean_path}"
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
