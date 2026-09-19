import json
import os
import struct
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAGIC_HEADER = b"SEVR0100"  # 8 bytes magic header for SeVR 1.0 container


class SevrEncoder:
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
        
        nonce = os.urandom(12)
        aesgcm = AESGCM(self.symmetric_key)
        associated_data = MAGIC_HEADER + struct.pack(">I", header_len) + header_json_bytes
        ciphertext_and_tag = aesgcm.encrypt(nonce, payload_bytes, associated_data)
        
        container_pre_sig = associated_data + nonce + ciphertext_and_tag
        signature = self.private_key.sign(container_pre_sig)
        
        return container_pre_sig + signature
