import os
# from tokenize import Ignore # Removed unused import
from sqlalchemy import Column, ForeignKey, Integer, String, create_engine, DateTime # Added DateTime if needed for Order.order_date
# from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declarative_base
Base = declarative_base()

from sqlalchemy.orm import sessionmaker, relationship
# from datetime import datetime # Removed unused import (unless using DateTime column type)


# Connect to DB
# Ensure __file__ is defined if running this directly, otherwise replace BASE_DIR logic
# For example, if running interactively or in a notebook:
# BASE_DIR = os.path.dirname('.') # Or provide an absolute path
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
except NameError:
    print("Warning: '__file__' not defined. Using current directory for database.")
    BASE_DIR = os.path.abspath('.') # Use current directory as fallback

DATABASE_FILE = os.path.join(BASE_DIR, "project.db")
DATABASE_URL = "sqlite:///" + DATABASE_FILE
engine = create_engine(DATABASE_URL, echo=True) # Set echo=False for less verbose output in production
# Base = declarative_base()

# You might want to create tables *after* defining all models
# Base.metadata.create_all(engine) # Example: Call this after all classes are defined

try:
    with engine.connect() as connection:
        print("Database connected successfully!")
except Exception as e:
    print(f"Error connecting to database: {e}")

# Session setup is usually done after models are defined
# Session = sessionmaker(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # SessionLocal is a factory for new Session objects
# session = Session() # Creating a global session is often discouraged; create sessions as needed

# --- Model Definitions ---

class Plant(Base):
    __tablename__ = 'plant'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    location = Column(String)
    capacity = Column(Integer)

    # Relationships (One-to-Many)
    plant_products = relationship("PlantProduct", back_populates="plant")
    plant_materials = relationship("PlantMaterial", back_populates="plant")

class PlantProduct(Base):
    __tablename__ = 'plant_products' # Many-to-Many association table: Plant <-> Product

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey('plant.id'))
    product_id = Column(Integer, ForeignKey('product.id'))
    quantity = Column(Integer)

    # Relationships (Many-to-One)
    plant = relationship("Plant", back_populates="plant_products")
    product = relationship("Product", back_populates="plant_products") # Corrected: singular 'product', matches Product class

class PlantMaterial(Base):
    __tablename__ = 'plant_materials' # Many-to-Many association table: Plant <-> Material

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey('plant.id'))
    material_id = Column(Integer, ForeignKey('material.id'))
    quantity = Column(Integer)

    # Relationships (Many-to-One)
    plant = relationship("Plant", back_populates="plant_materials")      # Corrected: singular 'plant'
    material = relationship("Material", back_populates="plant_materials") # Corrected: singular 'material', matches Material class

class Product(Base):
    __tablename__ = 'product'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    category = Column(String)
    price = Column(Integer) 

    # Relationships (One-to-Many)
    plant_products = relationship("PlantProduct", back_populates="product")      
    product_materials = relationship("ProductMaterial", back_populates="product")  
    storage_products = relationship("StorageProduct", back_populates="product")    
    order_products = relationship("OrderProduct", back_populates="product")        

class Material(Base):
    __tablename__ = 'material'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    unit = Column(String)
    cost = Column(Integer) # Consider using Numeric or Float for cost

    # Relationships (One-to-Many back-references from association tables)
    plant_materials = relationship("PlantMaterial", back_populates="material")      # Corrected: Class name 'PlantMaterial', back_populates 'material'
    product_materials = relationship("ProductMaterial", back_populates="material")  # Corrected: Class name 'ProductMaterial', back_populates 'material'
    storage_materials = relationship("StorageMaterial", back_populates="material")  # Corrected: Class name 'StorageMaterial', back_populates 'material'

class StorageProduct(Base):
    __tablename__ = 'storage_products' # Represents product stock (likely should be linked to a Storage location/concept if you have multiple)

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    quantity = Column(Integer)

    # Relationship (Many-to-One)
    product = relationship("Product", back_populates="storage_products") # Corrected: singular 'product', Class name 'Product'

class StorageMaterial(Base):
    __tablename__ = 'storage_materials' # Represents material stock

    id = Column(Integer, primary_key=True, autoincrement=True)
    material_id = Column(Integer, ForeignKey('material.id'))
    quantity = Column(Integer)

    # Relationship (Many-to-One)
    material = relationship("Material", back_populates="storage_materials") # Corrected: singular 'material', Class name 'Material'

class ProductMaterial(Base):
    __tablename__ = 'product_materials' # Many-to-Many association table: Product <-> Material (Bill of Materials)

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    material_id = Column(Integer, ForeignKey('material.id'))
    quantity = Column(Integer) # Quantity of material needed per unit of product

    # Relationships (Many-to-One)
    product = relationship("Product", back_populates="product_materials")   # Corrected: singular 'product', Class name 'Product'
    material = relationship("Material", back_populates="product_materials") # Corrected: singular 'material', Class name 'Material'

class OrderProduct(Base):
    __tablename__ = 'order_products' # Many-to-Many association table: Order <-> Product

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id')) # Note table name 'orders'
    product_id = Column(Integer, ForeignKey('product.id'))
    quantity = Column(Integer)

    # Relationships (Many-to-One)
    order = relationship("Order", back_populates="order_products")     # Corrected: singular 'order', Class name 'Order'
    product = relationship("Product", back_populates="order_products") # Corrected: singular 'product', Class name 'Product'

class Order(Base):
    __tablename__ = 'orders' # Table name often plural

    id = Column(Integer, primary_key=True, autoincrement=True)
    # Note: Your insertion code uses datetime object, but model uses String.
    # Use DateTime type for actual date storage:
    # order_date = Column(DateTime)
    order_date = Column(String) # Keeping as String as per your original model
    customer_name = Column(String)
    status = Column(String)

    # Relationship (One-to-Many)
    order_products = relationship("OrderProduct", back_populates="order") # Corrected: Class name 'OrderProduct', back_populates 'order'

# --- Create Tables ---
# It's good practice to create tables after all models are defined by Base
# print("Creating database tables...")
# Base.metadata.create_all(engine)
# print("Database tables created (if they didn't exist).")

# Example of how to use the session (better practice than global session):
# def add_plant(name, location, capacity):
#     with Session() as session: # Use context manager
#         with session.begin(): # Use transaction block
#             new_plant = Plant(name=name, location=location, capacity=capacity)
#             session.add(new_plant)
#         # Session is automatically committed on exiting 'begin()' if no errors
#         # Session is automatically closed on exiting 'with Session()'




