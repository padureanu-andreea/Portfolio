import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from proiect import Base, OrderProduct, Plant, PlantMaterial, PlantProduct, Product, Material, ProductMaterial, StorageProduct, StorageMaterial, Order # type: ignore

# Connect to DB
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_FILE = os.path.join(BASE_DIR, "project.db")
DATABASE_URL = "sqlite:///" + DATABASE_FILE
engine = create_engine(DATABASE_URL, echo=True)
Base = declarative_base()

# Test connection
try:
    with engine.connect() as connection:
        print("Database connected successfully!")
except Exception as e:
    print(f"Error connecting to database: {e}")
# Create a new session
Session = sessionmaker(bind=engine)
session = Session()

# Generate example data

# Sample data for Plant
plants = [
    Plant(name='Green Valley Plant', location='Springfield, IL', capacity=1000),
    Plant(name='Herbal Remedies Factory', location='Madison, WI', capacity=1500),
    Plant(name='Natural Extracts Co.', location='Boulder, CO', capacity=2000),
    Plant(name='Pure Essence Plant', location='Austin, TX', capacity=1200),
    Plant(name='Botanical Ingredients Inc.', location='Seattle, WA', capacity=1800),
]
session.add_all(plants)

# Sample data for Product
products = [
    Product(name='Herbal Tea', description='A soothing herbal tea blend.', category='Beverage', price=5.99),
    Product(name='Natural Shampoo', description='Shampoo made from natural ingredients.', category='Cosmetics', price=12.99),
    Product(name='Essential Oil', description='Pure essential oil for aromatherapy.', category='Aromatherapy', price=15.99),
    Product(name='Herbal Extract', description='Concentrated herbal extract for health benefits.', category='Supplements', price=20.99),
    Product(name='Organic Soap', description='Handmade organic soap with natural ingredients.', category='Cosmetics', price=7.49),
]
session.add_all(products)

# Sample data for PlantProduct (linking plants and products)
plant_products = [
    PlantProduct(plant_id=1, product_id=1, quantity=200),
    PlantProduct(plant_id=1, product_id=2, quantity=150),
    PlantProduct(plant_id=2, product_id=3, quantity=300),
    PlantProduct(plant_id=3, product_id=4, quantity=100),
    PlantProduct(plant_id=4, product_id=5, quantity=250),
]
session.add_all(plant_products)

# Sample data for Material
materials = [
    Material(name='Chamomile', description='Dried chamomile flowers.', unit='grams', cost=2.50),
    Material(name='Lavender', description='Dried lavender flowers.', unit='grams', cost=3.00),
    Material(name='Coconut Oil', description='Organic coconut oil.', unit='liters', cost=10.00),
    Material(name='Aloe Vera', description='Fresh aloe vera gel.', unit='liters', cost=8.00),
    Material(name='Olive Oil', description='Extra virgin olive oil.', unit='liters', cost=12.00),
]
session.add_all(materials)

# Sample data for ProductMaterial (linking products and materials)
product_materials = [
    ProductMaterial(product_id=1, material_id=1, quantity=50),
    ProductMaterial(product_id=2, material_id=3, quantity=30),
    ProductMaterial(product_id=3, material_id=2, quantity=20),
    ProductMaterial(product_id=4, material_id=4, quantity=25),
    ProductMaterial(product_id=5, material_id=5, quantity=10),
]
session.add_all(product_materials)

# Sample data for PlantMaterial (linking plants and materials)
plant_materials = [
    PlantMaterial(plant_id=1, material_id=1, quantity=100),
    PlantMaterial(plant_id=2, material_id=2, quantity=80),
    PlantMaterial(plant_id=3, material_id=3, quantity=150),
    PlantMaterial(plant_id=4, material_id=4, quantity=90),
    PlantMaterial(plant_id=5, material_id=5, quantity=120),
]
session.add_all(plant_materials)

# Sample data for StorageProduct (storing products)
storage_products = [
    StorageProduct(product_id=1, quantity=500),
    StorageProduct(product_id=2, quantity=300),
    StorageProduct(product_id=3, quantity=400),
    StorageProduct(product_id=4, quantity=200),
    StorageProduct(product_id=5, quantity=600),
]
session.add_all(storage_products)

# Sample data for StorageMaterial (storing materials)
storage_materials = [
    StorageMaterial(material_id=1, quantity=150),
    StorageMaterial(material_id=2, quantity=100),
    StorageMaterial(material_id=3, quantity=200),
    StorageMaterial(material_id=4, quantity=180),
    StorageMaterial(material_id=5, quantity=220),
]
session.add_all(storage_materials)

# Sample data for Order
orders = [
    Order(order_date=datetime(2023, 1, 15), customer_name='Alice Johnson', status='Completed'),
    Order(order_date=datetime(2023, 2, 20), customer_name='Bob Smith', status='Pending'),
    Order(order_date=datetime(2023, 3, 5), customer_name='Charlie Brown', status='Shipped'),
    Order(order_date=datetime(2023, 4, 10), customer_name='Diana Prince', status='Completed'),
    Order(order_date=datetime(2023, 5, 25), customer_name='Ethan Hunt', status='Cancelled'),
]
session.add_all(orders)

# Sample data for OrderProduct (linking orders and products)
order_products = [
    OrderProduct(order_id=1, product_id=1, quantity=2),
    OrderProduct(order_id=1, product_id=3, quantity=1),
    OrderProduct(order_id=2, product_id=2, quantity=3),
    OrderProduct(order_id=3, product_id=4, quantity=2),
    OrderProduct(order_id=4, product_id=5, quantity=5),
]
session.add_all(order_products)

# Commit all changes
session.commit()  # Commit the changes to the database

# Close the session
session.close()


import os
from sqlalchemy import Column, ForeignKey, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Connect to DB
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_FILE = os.path.join(BASE_DIR, "project.db")
DATABASE_URL = "sqlite:///" + DATABASE_FILE
engine = create_engine(DATABASE_URL, echo=True)
Base = declarative_base()

try:
    with engine.connect() as connection:
        print("Database connected successfully!")
except Exception as e:
    print(f"Error connecting to database: {e}")

Session = sessionmaker(bind=engine)
session = Session()

class Plant(Base):
    __tablename__ = 'plant'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    location = Column(String)
    capacity = Column(Integer)

    plant_products = relationship("Plant_Products", back_populates="plant")
    plant_materials = relationship("Plant_Materials", back_populates="plant")

class Product(Base):
    __tablename__ = 'product'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    category = Column(String)
    price = Column(Integer)

    plant_products = relationship("Plant_Products", back_populates="product")
    product_materials = relationship("Product_Materials", back_populates="product")
    storage_products = relationship("Storage_Products", back_populates="product")
    order_products = relationship("Order_Products", back_populates="product")

class Material(Base):
    __tablename__ = 'material'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    unit = Column(String)
    cost = Column(Integer)

    plant_materials = relationship("Plant_Materials", back_populates="material")
    product_materials = relationship("Product_Materials", back_populates="material")
    storage_materials = relationship("Storage_Materials", back_populates="material")

class Plant_Products(Base):
    __tablename__ = 'plant_products'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey('plant.id'))
    product_id = Column(Integer, ForeignKey('product.id'))
    quantity = Column(Integer)

    plant = relationship("Plant", back_populates="plant_products")
    product = relationship("Product", back_populates="plant_products")

class Plant_Materials(Base):
    __tablename__ = 'plant_materials'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey('plant.id'))
    material_id = Column(Integer, ForeignKey('material.id'))
    quantity = Column(Integer)

    plant = relationship("Plant", back_populates="plant_materials")
    material = relationship("Material", back_populates="plant_materials")

class Storage_Products(Base):
    __tablename__ = 'storage_products'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    quantity = Column(Integer)

    product = relationship("Product", back_populates="storage_products")

class Storage_Materials(Base):
    __tablename__ = 'storage_materials'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    material_id = Column(Integer, ForeignKey('material.id'))
    quantity = Column(Integer)

    material = relationship("Material", back_populates="storage_materials")

class Product_Materials(Base):
    __tablename__ = 'product_materials'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    material_id = Column(Integer, ForeignKey('material.id'))
    quantity = Column(Integer)

    product = relationship("Product", back_populates="product_materials")
    material = relationship("Material", back_populates="product_materials")

class Order_Products(Base):
    __tablename__ = 'order_products'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    product_id = Column(Integer, ForeignKey('product.id'))
    quantity = Column(Integer)

    order = relationship("Orders", back_populates="order_products")
    product = relationship("Product", back_populates="order_products")

class Orders(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_date = Column(String)
    customer_name = Column(String)
    status = Column(String)

    order_products = relationship("Order_Products", back_populates="order")