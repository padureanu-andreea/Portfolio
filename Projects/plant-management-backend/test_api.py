# test_api.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import api
from proiect import Base # Importăm Base din proiect.py
from api import get_db # Importăm funcția originală get_db

# --- Configurare Bază de Date de Testare ---
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def client_fixture():
    # 1. Asigură-te că tabelele sunt create PE test_engine
    #    Este posibil ca acest apel să fie necesar înainte de a suprascrie get_db
    #    pentru ca structura să existe când TestClient este instanțiat și face primele interacțiuni.
    Base.metadata.create_all(bind=test_engine)
    print(f"\n[FIXTURE SETUP] Tables in Base.metadata after create_all: {list(Base.metadata.tables.keys())}")

    # 2. Funcție de override pentru get_db
    def override_get_db_for_testing():
        db = None
        try:
            db = TestingSessionLocal() # Folosește sesiunea legată la test_engine
            yield db
        finally:
            if db:
                db.close()

    # 3. Aplică suprascrierea dependenței
    original_get_db_dependency = api.app.dependency_overrides.get(get_db)
    api.app.dependency_overrides[get_db] = override_get_db_for_testing
    
    # 4. Creează clientul DUPĂ ce override-ul este setat
    #    și DUPĂ ce tabelele sunt create pe test_engine.
    client = TestClient(api.app)
    yield client # Aici rulează testul
    
    # 5. Curățare DUPĂ fiecare test
    if original_get_db_dependency:
        api.app.dependency_overrides[get_db] = original_get_db_dependency
    elif get_db in api.app.dependency_overrides:
        del api.app.dependency_overrides[get_db]
            
    print("[FIXTURE TEARDOWN] Dropping tables from test_engine.")
    Base.metadata.drop_all(bind=test_engine)


def test_invalid_capacity(client_fixture):
    client = client_fixture
    response = client.post("/plants/", json={"name": "Test Plant", "location": "Test Location", "capacity": -1000})
    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid capacity value! The capacity must be at least 100 units."}

# def test_create_product_success(client_fixture):
#     client = client_fixture
#     payload = {"name": "Test Product 1", "description": "O descriere", "category": "Test Cat", "price": 10}
#     print(f"[TEST_CREATE_PRODUCT] Sending payload: {payload}")
#     response = client.post("/products/", json=payload)
    
#     print(f"[TEST_CREATE_PRODUCT] Response status: {response.status_code}")
#     if response.status_code != 201: # Mai mult debug
#         print(f"[TEST_CREATE_PRODUCT] Response content for error: {response.text}")
    
#     data = response.json()
#     assert response.status_code == 201
#     assert data["name"] == "Test Product 1"
#     assert "id" in data

# def test_get_product_not_found(client_fixture):
#     client = client_fixture
#     response = client.get("/products/99999")
#     print(f"[TEST_GET_NOT_FOUND] Response status: {response.status_code}")
#     if response.status_code != 404: # Mai mult debug
#         print(f"[TEST_GET_NOT_FOUND] Response content for error: {response.text}")

#     assert response.status_code == 404
#     assert response.json() == {"detail": "Product not found"}















# # Testing
# # Create a TestClient for the FastAPI app
# import pytest
# # from unittest.mock import Base
# from fastapi.testclient import TestClient
# from sqlalchemy import Engine
# from sqlalchemy.orm import sessionmaker
# import api
# from proiect import Base, SessionLocal
# from api import get_db

# client = TestClient(api.app)

# @pytest.fixture(scope="module")
# def test_db():
#     # Create the database schema
#     Base.metadata.create_all(bind=Engine)
#     yield
#     # Drop the database schema after tests
#     Base.metadata.drop_all(bind=Engine)

# @pytest.fixture(scope="function")
# def override_get_db(test_db):
#     # Override the get_db dependency to use the test database
#     def get_db_override():
#         db = SessionLocal()
#         try:
#             yield db
#         finally:
#             db.close()

#     api.app.dependency_overrides[api.get_db] = get_db_override
#     yield
#     # del app.dependency_overrides[get_db]

# def test_invalid_capacity():
#     response = client.post("/plants/", json={"name": "Test Plant", "location": "Test Location", "capacity": -1000})
#     assert response.status_code == 400
#     assert response.json() == {"detail": "Invalid capacity value! The capacity must be at least 100 units."}

# def test_create_product_success(test_db):
#     response = client.post(
#         "/products/",
#         json={"name": "Test Product 1", "category": "Test", "price": 10.5},
#     )
#     data = response.json()

#     assert response.status_code == 200 # Verificăm status code-ul
#     assert data["name"] == "Test Product 1"
#     assert "id" in data # Verificăm că a primit un ID

# def test_get_product_not_found(test_db):
#     response = client.get("/products/999")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "Product not found"}