# import os
# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker, relationship
# from datetime import datetime

# # Connect to DB
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DATABASE_FILE = os.path.join(BASE_DIR, "project.db")
# DATABASE_URL = "sqlite:///" + DATABASE_FILE
# engine = create_engine(DATABASE_URL, echo=True)
# Base = declarative_base()

# ### Test DB Connections
# # Test connection
# try:
#     with engine.connect() as connection:
#         print("Database connected successfully!")
# except Exception as e:
#     print(f"Error connecting to database: {e}")

# Session = sessionmaker(bind=engine)
# session = Session()

# ### Get DB data based on model
# def query_plants():
#     print("Plants:")
#     for plant in session.query(Plant).all():
#         print(f"ID: {plant.id}, Name: {plant.name}, Location: {plant.location}, Capacity: {plant.capacity}")

# # Close the session
# session.close()

# ### DB Table Class model, example to also create table
# # Define the Plant model
# class Plant(Base):
#     __tablename__ = 'plant'
    
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     name = Column(String, unique=True, nullable=False)
#     location = Column(String)
#     capacity = Column(Integer)

#     # Relationship with Products
#     products = relationship("Product", back_populates="plant")

# # Create Tables
# Base.metadata.create_all(engine)

# ### Pydantic Class model for DB Table, used in FastAPI requests
# # Pydantic model
# class PlantRead(BaseModel):
#     id: int
#     name: str
#     location: str
#     capacity: int

# ### Insert data to DB based on Table Class structure
# # Sample data for Plant
# plants = [
#     Plant(name='Green Valley Plant', location='Springfield, IL', capacity=1000),
#     Plant(name='Herbal Remedies Factory', location='Madison, WI', capacity=1500),
#     Plant(name='Natural Extracts Co.', location='Boulder, CO', capacity=2000),
#     Plant(name='Pure Essence Plant', location='Austin, TX', capacity=1200),
#     Plant(name='Botanical Ingredients Inc.', location='Seattle, WA', capacity=1800),
# ]
# session.add_all(plants)


# ### FastAPI example quick setup, need to import base classes for Tables structures
# app = FastAPI()

# @app.get('/')
# async def root():
#     return {'message': 'Welcome!'}

# # Dependency to get the database session
# def get_db() -> Session:
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # Endpoint to get all plants
# @app.get("/plants/", response_model=List[PlantRead])
# def read_all_plants(db: Session = Depends(get_db)):
#     plants = db.query(Plant).all()
#     return plants

# # Testing
# # Create a TestClient for the FastAPI app
# client = TestClient(app)

# @pytest.fixture(scope="module")
# def test_db():
#     # Create the database schema
#     Base.metadata.create_all(bind=engine)
#     yield
#     # Drop the database schema after tests
#     Base.metadata.drop_all(bind=engine)

# @pytest.fixture(scope="function")
# def override_get_db(test_db):
#     # Override the get_db dependency to use the test database
#     def get_db_override():
#         db = SessionLocal()
#         try:
#             yield db
#         finally:
#             db.close()

#     app.dependency_overrides[get_db] = get_db_override
#     yield
#     # del app.dependency_overrides[get_db]

# # Plant Tests
# def test_create_plant(override_get_db):
#     response = client.post("/plants/", json={"name": "Test Plant", "location": "Test Location", "capacity": 1000})
#     assert response.status_code == 200
#     assert response.json()["name"] == "Test Plant"