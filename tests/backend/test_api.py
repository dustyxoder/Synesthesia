"""Backend API tests."""
import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_model_info():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "genres" in data
    assert len(data["genres"]) == 10


@pytest.mark.asyncio
async def test_analyze_no_file():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/audio/analyze")
    assert response.status_code == 422  # Unprocessable entity — file required


@pytest.mark.asyncio
async def test_analyze_invalid_format():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/audio/analyze",
            files={"file": ("test.txt", b"not audio", "text/plain")},
        )
    assert response.status_code == 415
