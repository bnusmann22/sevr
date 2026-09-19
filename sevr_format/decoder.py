import json
import struct
from typing import Any, Dict, Tuple

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAGIC_HEADER = b"SEVR0100"


class SevrDecoderError(Exception):
    """Exception raised when .sevr container validation or decryption fails."""
    pass


class SevrDecoder:
    """
    Decoder & verifier for .sevr cryptographic containers.
    """

    def __init__(self, public_key: ed25519.Ed25519PublicKey, symmetric_key: bytes):
        self.public_key = public_key
        self.symmetric_key = symmetric_key

    def inspect_header(self, container_bytes: bytes) -> Dict[str, Any]:
        """Reads header metadata without decrypting payload or requiring keys."""
        if len(container_bytes) < 12:
            raise SevrDecoderError("Container file too small to contain valid header")
        
        magic = container_bytes[:8]
        if magic != MAGIC_HEADER:
            raise SevrDecoderError(f"Invalid magic header: expected {MAGIC_HEADER.decode()}, got {magic}")
        
        (header_len,) = struct.unpack(">I", container_bytes[8:12])
        if len(container_bytes) < 12 + header_len:
            raise SevrDecoderError("Container payload truncated: header length exceeds file size")
        
        header_json_bytes = container_bytes[12 : 12 + header_len]
        try:
            return json.loads(header_json_bytes.decode("utf-8"))
        except Exception as e:
            raise SevrDecoderError(f"Failed to parse header JSON: {str(e)}")

    def decode(self, container_bytes: bytes) -> Tuple[bytes, Dict[str, Any]]:
        """
        Verifies Ed25519 signature, inspects metadata, decrypts payload, and returns (payload_bytes, header_dict).
        """
        if len(container_bytes) < 12 + 12 + 16 + 64:  # header_fixed + nonce + tag + sig
            raise SevrDecoderError("Container file too small to be valid .sevr container")

        # Extract 64-byte signature from end of file
        signature = container_bytes[-64:]
        container_pre_sig = container_bytes[:-64]

        # 1. Verify Ed25519 digital signature
        try:
            self.public_key.verify(signature, container_pre_sig)
        except InvalidSignature:
            raise SevrDecoderError("Invalid Ed25519 signature: container tamper detected")

        # 2. Parse magic header and length
        magic = container_pre_sig[:8]
        if magic != MAGIC_HEADER:
            raise SevrDecoderError("Invalid magic header")

        (header_len,) = struct.unpack(">I", container_pre_sig[8:12])
        header_end = 12 + header_len
        header_json_bytes = container_pre_sig[12:header_end]
        
        try:
            header_dict = json.loads(header_json_bytes.decode("utf-8"))
        except Exception as e:
            raise SevrDecoderError(f"Failed to parse container metadata: {str(e)}")

        # 3. Extract AES-GCM nonce (12 bytes) and ciphertext
        nonce = container_pre_sig[header_end : header_end + 12]
        ciphertext_and_tag = container_pre_sig[header_end + 12 :]

        # 4. Decrypt AES-256-GCM payload with associated data
        associated_data = container_pre_sig[:header_end]
        aesgcm = AESGCM(self.symmetric_key)
        
        try:
            payload_bytes = aesgcm.decrypt(nonce, ciphertext_and_tag, associated_data)
        except Exception as e:
            raise SevrDecoderError(f"Decryption failed or ciphertext tampered: {str(e)}")

        return payload_bytes, header_dict
