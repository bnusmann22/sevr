import hashlib
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from .encoder import SevrEncoder
from .decoder import SevrDecoder, SevrDecoderError


def test_sevr_container_roundtrip():
    # Setup keys
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    sym_key = AESGCM.generate_key(bit_length=256)

    encoder = SevrEncoder(private_key=private_key, symmetric_key=sym_key)
    decoder = SevrDecoder(public_key=public_key, symmetric_key=sym_key)

    # Test payload & metadata
    payload_data = b"CONFIDENTIAL_GENOMIC_DATASET_V1_2026_SEVR" * 100
    metadata = {
        "file_id": "file_test_123",
        "name": "genomic_seq.fasta",
        "tlp": "AMBER_STRICT",
        "institution": "University Enclave Tech",
        "recipient": "dr.okafor@varsity.edu.ng"
    }
    watermark = {
        "stamped": True,
        "watermark_id": "wm_001"
    }

    # Encode
    container_bytes = encoder.encode(payload_data, metadata, watermark)
    assert len(container_bytes) > len(payload_data)

    # Inspect header without decrypting
    header = decoder.inspect_header(container_bytes)
    assert header["metadata"]["file_id"] == "file_test_123"
    assert header["watermark"]["watermark_id"] == "wm_001"

    # Decode and verify payload
    decoded_payload, decoded_header = decoder.decode(container_bytes)
    assert decoded_payload == payload_data
    assert hashlib.sha256(decoded_payload).hexdigest() == hashlib.sha256(payload_data).hexdigest()
    assert decoded_header["metadata"]["name"] == "genomic_seq.fasta"


def test_sevr_container_tamper_detection():
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    sym_key = AESGCM.generate_key(bit_length=256)

    encoder = SevrEncoder(private_key=private_key, symmetric_key=sym_key)
    decoder = SevrDecoder(public_key=public_key, symmetric_key=sym_key)

    container_bytes = encoder.encode(b"Secret Data", {"file_id": "file_1"})

    # Tamper with payload byte
    tampered_bytes = bytearray(container_bytes)
    tampered_bytes[30] ^= 0xFF

    try:
        decoder.decode(bytes(tampered_bytes))
        assert False, "Should have raised SevrDecoderError due to signature tamper"
    except SevrDecoderError:
        pass


def test_sevr_container_expiration():
    from datetime import datetime, timedelta, timezone
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    sym_key = AESGCM.generate_key(bit_length=256)

    encoder = SevrEncoder(private_key=private_key, symmetric_key=sym_key)
    decoder = SevrDecoder(public_key=public_key, symmetric_key=sym_key)

    # Encode container that expired 1 hour ago
    past_dt = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    expired_container = encoder.encode(
        b"CONFIDENTIAL_DATASET",
        {"file_id": "file_exp"},
        expires_at=past_dt
    )

    header = decoder.inspect_header(expired_container)
    assert header["status"]["is_expired"] is True

    try:
        decoder.decode(expired_container, enforce_expiration=True)
        assert False, "Should have raised SevrDecoderError due to expired clearance"
    except SevrDecoderError as err:
        assert "CONTAINER_TIME_LOCKED" in str(err)


if __name__ == "__main__":
    test_sevr_container_roundtrip()
    test_sevr_container_tamper_detection()
    test_sevr_container_expiration()
    print("ALL SEVR FORMAT TESTS PASSED SUCCESSFULLY!")
