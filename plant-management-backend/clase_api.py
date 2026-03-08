from pydantic import BaseModel

class PlantCreate(BaseModel):
    name: str
    location: str
    capacity: int

    class Config:
        from_attributes = True

class PlantResponse(BaseModel):
    id: int
    name: str
    location: str
    capacity: int

    class Config:
        from_attributes = True  


class PlantUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    capacity: int | None = None

    class Config:
        from_attributes = True

class PlantProductCreate(BaseModel):
    plant_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True  

class PlantProductResponse(BaseModel):
    id: int
    plant_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class PlantProductUpdate(BaseModel):    
    plant_id: int | None = None
    product_id: int | None = None
    quantity: int | None = None

    class Config:
        from_attributes = True

class PlantMaterialCreate(BaseModel):
    plant_id: int
    material_id: int
    quantity: int

    class Config:
        from_attributes = True

class PlantMaterialResponse(BaseModel):
    id: int
    plant_id: int
    material_id: int
    quantity: int

    class Config:
        from_attributes = True

class PlantMaterialUpdate(BaseModel):
    plant_id: int | None = None
    material_id: int | None = None
    quantity: int | None = None

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    description: str 
    category: str 
    price: int

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    category: str
    price: int

    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    price: int | None = None

    class Config:
        from_attributes = True

class MaterialCreate(BaseModel):
    name: str
    description: str
    unit: str 
    cost: int

    class Config:
        from_attributes = True

class MaterialResponse(BaseModel):
    id: int
    name: str
    description: str 
    unit: str
    cost: int

    class Config:
        from_attributes = True

class MaterialUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    unit: str | None = None
    cost: int | None = None

    class Config:
        from_attributes = True

class StorageProductCreate(BaseModel):
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class StorageProductResponse(BaseModel):
    id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class StorageProductUpdate(BaseModel):
    product_id: int | None = None
    quantity: int | None = None

    class Config:
        from_attributes = True

class StorageMaterialCreate(BaseModel):
    material_id: int
    quantity: int

    class Config:
        from_attributes = True

class StorageMaterialResponse(BaseModel):
    id: int
    material_id: int
    quantity: int

    class Config:
        from_attributes = True

class StorageMaterialUpdate(BaseModel):
    material_id: int | None = None
    quantity: int | None = None

    class Config:
        from_attributes = True

class OrderProductCreate(BaseModel):
    order_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class OrderProductResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class OrderProductUpdate(BaseModel):
    order_id: int | None = None
    product_id: int | None = None
    quantity: int | None = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    order_date: str
    customer_name: str
    status: str

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_date: str
    customer_name: str
    status: str

    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    order_date: str | None = None
    customer_name: str | None = None
    status: str | None = None

    class Config:
        from_attributes = True

class ProductMaterialCreate(BaseModel):
    product_id: int
    material_id: int
    quantity: int

    class Config:
        from_attributes = True

class ProductMaterialResponse(BaseModel):
    id: int
    product_id: int
    material_id: int
    quantity: int

    class Config:
        from_attributes = True

class ProductMaterialUpdate(BaseModel):
    product_id: int | None = None
    material_id: int | None = None
    quantity: int | None = None

    class Config:
        from_attributes = True