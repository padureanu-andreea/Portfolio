from typing import Optional
from typing import Generator, Optional
from fastapi import FastAPI
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from proiect import Base, engine, Plant, OrderProduct, PlantMaterial, PlantProduct, Product, Material, ProductMaterial, SessionLocal, StorageProduct, StorageMaterial, Order 
from clase_api import PlantResponse, PlantCreate, PlantUpdate, PlantProductResponse, PlantProductCreate, PlantProductUpdate, PlantMaterialCreate,  PlantMaterialResponse, PlantMaterialUpdate, ProductCreate, ProductResponse, ProductUpdate, MaterialCreate, MaterialResponse, MaterialUpdate, OrderCreate, OrderResponse, OrderUpdate, OrderProductCreate, OrderProductResponse, OrderProductUpdate, StorageProductCreate, StorageProductResponse, StorageProductUpdate, StorageMaterialCreate, StorageMaterialResponse, StorageMaterialUpdate, ProductMaterialCreate, ProductMaterialResponse, ProductMaterialUpdate

Base.metadata.create_all(bind=engine)


app = FastAPI()

@app.get('/')
async def root():
    return {'message': 'Welcome!'}

# Dependency to get the database session
def get_db() -> Generator[Session, None, None]:
    db: Session = SessionLocal() 
    try:
        yield db
    finally:
        db.close()

@app.post("/plants/", response_model=PlantResponse)
def create_plant(plant: PlantCreate, db: Session = Depends(get_db)):
    if plant.capacity < 100:
        raise HTTPException(status_code=400, detail="Invalid capacity value! The capacity must be at least 100 units.")
    db_plant = Plant(**plant.model_dump())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

@app.get("/plants/", response_model=list[PlantResponse])
def read_all_plants(db: Session = Depends(get_db)):
    plants = db.query(Plant).all()
    return plants

@app.get("/plants/{plant_id}", response_model=PlantResponse)
def read_plant(plant_id: int, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant

@app.put("/plants/{plant_id}", response_model=PlantResponse)
def update_plant(plant_id: int, plant: PlantCreate, db: Session = Depends(get_db)):
    db_plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not db_plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    for key, value in plant.model_dump().items():
        setattr(db_plant, key, value)
    db.commit()
    db.refresh(db_plant)
    return db_plant

@app.delete("/plants/{plant_id}")
def delete_plant(plant_id: int, db: Session = Depends(get_db)):
    db_plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not db_plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    db.delete(db_plant)
    db.commit()
    return {"detail": "Plant deleted successfully"}

@app.post("/PlantProduct/", response_model=PlantProductResponse)
def create_plant_product(plant_product: PlantProductCreate, db: Session = Depends(get_db)):
    if plant_product.quantity < 0:
        raise HTTPException(status_code=400, detail="Invalid quantity value")
    db_plant_product = PlantProduct(**plant_product.model_dump())
    db.add(db_plant_product)
    db.commit()
    db.refresh(db_plant_product)
    return db_plant_product

@app.get("/PlantProduct/", response_model=list[PlantProductResponse])
def read_all_plant_products(db: Session = Depends(get_db)):
    plant_products = db.query(PlantProduct).all()
    return plant_products

@app.get("/PlantProduct/{plant_product_id}", response_model=PlantProductResponse)
def read_plant_product(plant_product_id: int, db: Session = Depends(get_db)):
    plant_product = db.query(PlantProduct).filter(PlantProduct.id == plant_product_id).first()
    if not plant_product:
        raise HTTPException(status_code=404, detail="PlantProduct not found")
    return plant_product

@app.put("/PlantProduct/{plant_product_id}", response_model=PlantProductResponse)
def update_plant_product(plant_product_id: int, plant_product: PlantProductCreate, db: Session = Depends(get_db)):
    db_plant_product = db.query(PlantProduct).filter(PlantProduct.id == plant_product_id).first()
    if not db_plant_product:
        raise HTTPException(status_code=404, detail="PlantProduct not found")
    for key, value in plant_product.model_dump().items():
        setattr(db_plant_product, key, value)
    db.commit()
    db.refresh(db_plant_product)
    return db_plant_product

@app.delete("/PlantProduct/{plant_product_id}")
def delete_plant_product(plant_product_id: int, db: Session = Depends(get_db)):
    db_plant_product = db.query(PlantProduct).filter(PlantProduct.id == plant_product_id).first()
    if not db_plant_product:
        raise HTTPException(status_code=404, detail="PlantProduct not found")
    db.delete(db_plant_product)
    db.commit()
    return {"detail": "PlantProduct deleted successfully"}

@app.post("/PlantMaterial/", response_model=PlantProductResponse)
def create_plant_material(plant_material: PlantMaterialCreate, db: Session = Depends(get_db)):
    db_plant_material = PlantMaterial(**plant_material.model_dump())
    db.add(db_plant_material)
    db.commit()
    db.refresh(db_plant_material)
    return db_plant_material

@app.get("/PlantMaterial/", response_model=list[PlantMaterialResponse])
def read_all_plant_materials(db: Session = Depends(get_db)):
    plant_materials = db.query(PlantMaterial).all()
    return plant_materials

@app.get("/PlantMaterial/{plant_material_id}", response_model=PlantMaterialResponse)
def read_plant_material(plant_material_id: int, db: Session = Depends(get_db)):
    plant_material = db.query(PlantMaterial).filter(PlantMaterial.id == plant_material_id).first()
    if not plant_material:
        raise HTTPException(status_code=404, detail="PlantMaterial not found")
    return plant_material

@app.put("/PlantMaterial/{plant_material_id}", response_model=PlantMaterialResponse)
def update_plant_material(plant_material_id: int, plant_material: PlantMaterialCreate, db: Session = Depends(get_db)):
    db_plant_material = db.query(PlantMaterial).filter(PlantMaterial.id == plant_material_id).first()
    if not db_plant_material:
        raise HTTPException(status_code=404, detail="PlantMaterial not found")
    for key, value in plant_material.model_dump().items():
        setattr(db_plant_material, key, value)
    db.commit()
    db.refresh(db_plant_material)
    return db_plant_material

@app.delete("/PlantMaterial/{plant_material_id}")
def delete_plant_material(plant_material_id: int, db: Session = Depends(get_db)):
    db_plant_material = db.query(PlantMaterial).filter(PlantMaterial.id == plant_material_id).first()
    if not db_plant_material:
        raise HTTPException(status_code=404, detail="PlantMaterial not found")
    db.delete(db_plant_material)
    db.commit()
    return {"detail": "PlantMaterial deleted successfully"}

@app.post("/products/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    if product.price < 0:
        raise HTTPException(status_code=400, detail="Invalid price value")
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=list[ProductResponse])
def read_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@app.get("/products/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"detail": "Product deleted successfully"}

@app.post("/materials/", response_model=MaterialResponse)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    db_material = Material(**material.model_dump())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@app.get("/materials/", response_model=list[MaterialResponse])
def read_all_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).all()
    return materials

@app.get("/materials/{material_id}", response_model=MaterialResponse)
def read_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@app.put("/materials/{material_id}", response_model=MaterialResponse)
def update_material(material_id: int, material: MaterialUpdate, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(Material.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    for key, value in material.model_dump().items():
        setattr(db_material, key, value)
    db.commit()
    db.refresh(db_material)
    return db_material

@app.delete("/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(Material.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    db.delete(db_material)
    db.commit()
    return {"detail": "Material deleted successfully"}

@app.post("/storage_products/", response_model=StorageProductResponse)
def create_storage_product(storage_product: StorageProductCreate, db: Session = Depends(get_db)):
    if storage_product.quantity < 0:
        raise HTTPException(status_code=400, detail="Invalid quantity value")
    db_storage_product = StorageProduct(**storage_product.model_dump())
    db.add(db_storage_product)
    db.commit()
    db.refresh(db_storage_product)
    return db_storage_product

@app.get("/storage_products/", response_model=list[StorageProductResponse])
def read_all_storage_products(db: Session = Depends(get_db)):
    storage_products = db.query(StorageProduct).all()
    return storage_products

@app.get("/storage_products/{storage_product_id}", response_model=StorageProductResponse)
def read_storage_product(storage_product_id: int, db: Session = Depends(get_db)):
    storage_product = db.query(StorageProduct).filter(StorageProduct.id == storage_product_id).first()
    if not storage_product:
        raise HTTPException(status_code=404, detail="StorageProduct not found")
    return storage_product

@app.put("/storage_products/{storage_product_id}", response_model=StorageProductResponse)
def update_storage_product(storage_product_id: int, storage_product: StorageProductUpdate, db: Session = Depends(get_db)):
    db_storage_product = db.query(StorageProduct).filter(StorageProduct.id == storage_product_id).first()
    if not db_storage_product:
        raise HTTPException(status_code=404, detail="StorageProduct not found")
    for key, value in storage_product.model_dump().items():
        setattr(db_storage_product, key, value)
    db.commit()
    db.refresh(db_storage_product)
    return db_storage_product

@app.delete("/storage_products/{storage_product_id}")
def delete_storage_product(storage_product_id: int, db: Session = Depends(get_db)):
    db_storage_product = db.query(StorageProduct).filter(StorageProduct.id == storage_product_id).first()
    if not db_storage_product:
        raise HTTPException(status_code=404, detail="StorageProduct not found")
    db.delete(db_storage_product)
    db.commit()
    return {"detail": "StorageProduct deleted successfully"}

@app.post("/storage_materials/", response_model=StorageMaterialResponse)
def create_storage_material(storage_material: StorageMaterialCreate, db: Session = Depends(get_db)):
    if storage_material.quantity < 0:
        raise HTTPException(status_code=400, detail="Invalid quantity value")
    db_storage_material = StorageMaterial(**storage_material.model_dump())
    db.add(db_storage_material)
    db.commit()
    db.refresh(db_storage_material)
    return db_storage_material

@app.get("/storage_materials/", response_model=list[StorageMaterialResponse])
def read_all_storage_materials(db: Session = Depends(get_db)):
    storage_materials = db.query(StorageMaterial).all()
    return storage_materials

@app.get("/storage_materials/{storage_material_id}", response_model=StorageMaterialResponse)
def read_storage_material(storage_material_id: int, db: Session = Depends(get_db)):
    storage_material = db.query(StorageMaterial).filter(StorageMaterial.id == storage_material_id).first()
    if not storage_material:
        raise HTTPException(status_code=404, detail="StorageMaterial not found")
    return storage_material

@app.put("/storage_materials/{storage_material_id}", response_model=StorageMaterialResponse)
def update_storage_material(storage_material_id: int, storage_material: StorageMaterialUpdate, db: Session = Depends(get_db)):
    db_storage_material = db.query(StorageMaterial).filter(StorageMaterial.id == storage_material_id).first()
    if not db_storage_material:
        raise HTTPException(status_code=404, detail="StorageMaterial not found")
    for key, value in storage_material.model_dump().items():
        setattr(db_storage_material, key, value)
    db.commit()
    db.refresh(db_storage_material)
    return db_storage_material

@app.delete("/storage_materials/{storage_material_id}")
def delete_storage_material(storage_material_id: int, db: Session = Depends(get_db)):
    db_storage_material = db.query(StorageMaterial).filter(StorageMaterial.id == storage_material_id).first()
    if not db_storage_material:
        raise HTTPException(status_code=404, detail="StorageMaterial not found")
    db.delete(db_storage_material)
    db.commit()
    return {"detail": "StorageMaterial deleted successfully"}

@app.post("/product_materials/", response_model=ProductMaterialResponse)
def create_product_material(product_material: ProductMaterialCreate, db: Session = Depends(get_db)):
    if product_material.quantity < 0:
        raise HTTPException(status_code=400, detail="Invalid quantity value")
    db_product_material = ProductMaterial(**product_material.model_dump())
    db.add(db_product_material)
    db.commit()
    db.refresh(db_product_material)
    return db_product_material

@app.get("/product_materials/", response_model=list[ProductMaterialResponse])
def read_all_product_materials(db: Session = Depends(get_db)):
    product_materials = db.query(ProductMaterial).all()
    return product_materials

@app.get("/product_materials/{product_material_id}", response_model=ProductMaterialResponse)
def read_product_material(product_material_id: int, db: Session = Depends(get_db)):
    product_material = db.query(ProductMaterial).filter(ProductMaterial.id == product_material_id).first()
    if not product_material:
        raise HTTPException(status_code=404, detail="ProductMaterial not found")
    return product_material

@app.put("/product_materials/{product_material_id}", response_model=ProductMaterialResponse)
def update_product_material(product_material_id: int, product_material: ProductMaterialUpdate, db: Session = Depends(get_db)):
    db_product_material = db.query(ProductMaterial).filter(ProductMaterial.id == product_material_id).first()
    if not db_product_material:
        raise HTTPException(status_code=404, detail="ProductMaterial not found")
    for key, value in product_material.model_dump().items():
        setattr(db_product_material, key, value)
    db.commit()
    db.refresh(db_product_material)
    return db_product_material

@app.delete("/product_materials/{product_material_id}")
def delete_product_material(product_material_id: int, db: Session = Depends(get_db)):
    db_product_material = db.query(ProductMaterial).filter(ProductMaterial.id == product_material_id).first()
    if not db_product_material:
        raise HTTPException(status_code=404, detail="ProductMaterial not found")
    db.delete(db_product_material)
    db.commit()
    return {"detail": "ProductMaterial deleted successfully"}

@app.post("/orders/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    db_order = Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=list[OrderResponse])
def read_all_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders

@app.get("/orders/{order_id}", response_model=OrderResponse)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.put("/orders/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    for key, value in order.model_dump().items():
        setattr(db_order, key, value)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return {"detail": "Order deleted successfully"}

@app.post("/order_products/", response_model=OrderProductResponse)
def create_order_product(order_product: OrderProductCreate, db: Session = Depends(get_db)):
    if order_product.quantity < 0:
        raise HTTPException(status_code=400, detail="Invalid quantity value")
    db_order_product = OrderProduct(**order_product.model_dump())
    db.add(db_order_product)
    db.commit()
    db.refresh(db_order_product)
    return db_order_product

@app.get("/order_products/", response_model=list[OrderProductResponse])
def read_all_order_products(db: Session = Depends(get_db)):
    order_products = db.query(OrderProduct).all()
    return order_products

@app.get("/order_products/{order_product_id}", response_model=OrderProductResponse)
def read_order_product(order_product_id: int, db: Session = Depends(get_db)):
    order_product = db.query(OrderProduct).filter(OrderProduct.id == order_product_id).first()
    if not order_product:
        raise HTTPException(status_code=404, detail="OrderProduct not found")
    return order_product

@app.put("/order_products/{order_product_id}", response_model=OrderProductResponse)
def update_order_product(order_product_id: int, order_product: OrderProductUpdate, db: Session = Depends(get_db)):
    db_order_product = db.query(OrderProduct).filter(OrderProduct.id == order_product_id).first()
    if not db_order_product:
        raise HTTPException(status_code=404, detail="OrderProduct not found")
    for key, value in order_product.model_dump().items():
        setattr(db_order_product, key, value)
    db.commit()
    db.refresh(db_order_product)
    return db_order_product

@app.delete("/order_products/{order_product_id}")
def delete_order_product(order_product_id: int, db: Session = Depends(get_db)):
    db_order_product = db.query(OrderProduct).filter(OrderProduct.id == order_product_id).first()
    if not db_order_product:
        raise HTTPException(status_code=404, detail="OrderProduct not found")
    db.delete(db_order_product)
    db.commit()
    return {"detail": "OrderProduct deleted successfully"}
