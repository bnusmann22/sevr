"""
SEVR Header Schema
==================
Defines the structure and validation for .sevr file headers.
"""

import json
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Optional, Dict, Any


class TLPLabel(str, Enum):
    """Traffic Light Protocol classification levels."""
    WHITE = "WHITE"      # Unlimited distribution
    GREEN = "GREEN"      # Limited distribution
    AMBER = "AMBER"      # Organization + recipients
    RED = "RED"          # Individual only


class ContentType(str, Enum):
    """Content types for encrypted payloads."""
    BINARY = "application/octet-stream"
    JSON = "application/json"
    TEXT = "text/plain"
    PDF = "application/pdf"
    XML = "application/xml"


@dataclass
class SevrHeader:
    """
    .sevr file header structure.

    Fields:
    - magic: Always "SEVR"
    - version: Always 1
    - file_id: UUID (unique identifier)
    - tlp_label: Classification level
    - created_at: ISO-8601 timestamp
    - expires_at: ISO-8601 timestamp or None
    - original_filename: Original file name
    - content_type: MIME type
    - payload_sha256: SHA-256 hash of plaintext
    - signature: Ed25519 signature (hex)
    """

    magic: str = "SEVR"
    version: int = 1
    file_id: str = None
    tlp_label: str = TLPLabel.WHITE.value
    created_at: str = None
    expires_at: Optional[str] = None
    original_filename: str = ""
    content_type: str = ContentType.BINARY.value
    payload_sha256: str = ""
    signature: Optional[str] = None

    def __post_init__(self):
        """Validate header on creation."""
        # Auto-generate file_id if not provided
        if not self.file_id:
            self.file_id = str(uuid.uuid4())

        # Auto-generate created_at if not provided
        if not self.created_at:
            self.created_at = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

        # Validation checks
        if self.magic != "SEVR":
            raise ValueError(f"Invalid magic: {self.magic}")

        if self.version != 1:
            raise ValueError(f"Invalid version: {self.version}")

        if self.tlp_label not in [label.value for label in TLPLabel]:
            raise ValueError(f"Invalid TLP label: {self.tlp_label}")

        if not self._is_valid_uuid(self.file_id):
            raise ValueError(f"Invalid file_id (not UUID): {self.file_id}")

        if not self._is_valid_iso8601(self.created_at):
            raise ValueError(f"Invalid created_at: {self.created_at}")

        if self.expires_at and not self._is_valid_iso8601(self.expires_at):
            raise ValueError(f"Invalid expires_at: {self.expires_at}")

        if self.expires_at and self.created_at >= self.expires_at:
            raise ValueError("expires_at must be after created_at")

        if not self.original_filename:
            raise ValueError("original_filename cannot be empty")

        if len(self.payload_sha256) != 64:
            raise ValueError(f"payload_sha256 must be 64 hex chars, got {len(self.payload_sha256)}")

    @staticmethod
    def _is_valid_uuid(value: str) -> bool:
        """Check if string is valid UUID."""
        try:
            uuid.UUID(value)
            return True
        except ValueError:
            return False

    @staticmethod
    def _is_valid_iso8601(value: str) -> bool:
        """Check if string is valid ISO-8601 UTC (ends with Z)."""
        try:
            if not value.endswith('Z'):
                return False
            datetime.fromisoformat(value.replace('Z', '+00:00'))
            return True
        except (ValueError, AttributeError):
            return False

    def to_dict(self, include_signature: bool = True) -> Dict[str, Any]:
        """Convert header to dictionary."""
        data = asdict(self)
        if not include_signature:
            data.pop("signature", None)
        return data

    def to_json(self, include_signature: bool = True) -> str:
        """Convert to compact JSON (no whitespace)."""
        data = self.to_dict(include_signature=include_signature)
        return json.dumps(data, separators=(',', ':'), sort_keys=True)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SevrHeader':
        """Create header from dictionary."""
        required = {"magic", "version", "file_id", "tlp_label", "created_at",
                   "original_filename", "content_type", "payload_sha256"}
        missing = required - set(data.keys())
        if missing:
            raise ValueError(f"Missing required fields: {missing}")

        return cls(
            magic=data["magic"],
            version=data["version"],
            file_id=data["file_id"],
            tlp_label=data["tlp_label"],
            created_at=data["created_at"],
            expires_at=data.get("expires_at"),
            original_filename=data["original_filename"],
            content_type=data["content_type"],
            payload_sha256=data["payload_sha256"],
            signature=data.get("signature")
        )

    def is_expired(self) -> bool:
        """Check if file has expired."""
        if not self.expires_at:
            return False
        expiry = datetime.fromisoformat(self.expires_at.replace('Z', '+00:00'))
        return datetime.now(timezone.utc) > expiry

    def get_ttl_seconds(self) -> Optional[int]:
        """Get seconds until expiration."""
        if not self.expires_at:
            return None
        expiry = datetime.fromisoformat(self.expires_at.replace('Z', '+00:00'))
        delta = expiry - datetime.now(timezone.utc)
        return max(0, int(delta.total_seconds()))


class SevrHeaderBuilder:
    """Fluent builder for SevrHeader."""

    def __init__(self):
        self.data = {
            "magic": "SEVR",
            "version": 1,
            "file_id": str(uuid.uuid4()),
            "tlp_label": TLPLabel.WHITE.value,
            "created_at": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            "original_filename": "",
            "content_type": ContentType.BINARY.value,
            "payload_sha256": ""
        }

    def file_id(self, value: str) -> 'SevrHeaderBuilder':
        self.data["file_id"] = value
        return self

    def tlp_label(self, value) -> 'SevrHeaderBuilder':
        if isinstance(value, TLPLabel):
            self.data["tlp_label"] = value.value
        else:
            self.data["tlp_label"] = value
        return self

    def original_filename(self, value: str) -> 'SevrHeaderBuilder':
        self.data["original_filename"] = value
        return self

    def content_type(self, value: str) -> 'SevrHeaderBuilder':
        self.data["content_type"] = value
        return self

    def payload_sha256(self, value: str) -> 'SevrHeaderBuilder':
        self.data["payload_sha256"] = value
        return self

    def expires_in_days(self, days: int) -> 'SevrHeaderBuilder':
        expiry = datetime.now(timezone.utc) + timedelta(days=days)
        self.data["expires_at"] = expiry.isoformat().replace('+00:00', 'Z')
        return self

    def expires_at(self, value: str) -> 'SevrHeaderBuilder':
        self.data["expires_at"] = value
        return self

    def build(self) -> SevrHeader:
        """Build and validate header."""
        return SevrHeader(**self.data)


# Constants
SEVR_MAGIC = b'SEVR'
SEVR_VERSION = 1
SEVR_KEY_SIZE = 32      # 256 bits for AES
SEVR_NONCE_SIZE = 12    # 96 bits for GCM
SEVR_TAG_SIZE = 16      # 128 bits for auth tag
