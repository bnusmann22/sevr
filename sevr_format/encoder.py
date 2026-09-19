import json
import os
import struct
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAGIC_HEADER = b"SEVR0100"  # 8 bytes magic header for SeVR 1.0 container


class SevrEncoder:
    """
    Encoder for .sevr cryptographic container format.
    
    Layout:
    1. Magic Header: b"SEVR0100" (8 bytes)
    2. Header Length: uint32 (4 bytes, big-endian)
    3. Metadata Header (JSON bytes): metadata + watermark manifest
    4. Nonce: IV for AES-256-GCM (12 bytes)
    5. Ciphertext + Auth Tag: AES-256-GCM encrypted payload (ciphertext + 16 bytes tag)
    6. Digital Signature: Ed25519 signature over preceding bytes (64 bytes)
    """

    def __init__(self, private_key: Optional[ed25519.Ed25519PrivateKey] = None, symmetric_key: Optional[bytes] = None):
        self.private_key = private_key or ed25519.Ed25519PrivateKey.generate()
        self.symmetric_key = symmetric_key or AESGCM.generate_key(bit_length=256)

    def encode(
        self,
        payload_bytes: bytes,
        metadata: Dict[str, Any],
        watermark_manifest: Optional[Dict[str, Any]] = None
    ) -> bytes:
        header_data = {
            "metadata": {
                **metadata,
                "created_at": metadata.get("created_at") or datetime.now(timezone.utc).isoformat(),
            },
            "watermark": watermark_manifest or {}
        }
        
        header_json_bytes = json.dumps(header_data, sort_keys=True).encode("utf-8")
        header_len = len(header_json_bytes)
        
        # Generate 12-byte nonce for AES-256-GCM
        nonce = os.urandom(12)
        
        # Encrypt payload with AES-256-GCM
        aesgcm = AESGCM(self.symmetric_key)
        # Pass header bytes as associated data to bind header to payload
        associated_data = MAGIC_HEADER + struct.pack(">I", header_len) + header_json_bytes
        ciphertext_and_tag = aesgcm.encrypt(nonce, payload_bytes, associated_data)
        
        # Pre-signature payload
        container_pre_sig = associated_data + nonce + ciphertext_and_tag
        
        # Generate 64-byte Ed25519 signature
        signature = self.private_key.sign(container_pre_sig)
        
        # Complete container
        return container_pre_sig + signature
