from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, ForeignKey, CheckConstraint, Date,Boolean,Table  # Agregar Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Optional,List

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)  # Agregar constraints
    password_hash: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=True,default="User")
    stores: Mapped[List["Store"]] = relationship("Store", back_populates="user")
    #points = relationship("UserPoint", back_populates="user")
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=1)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            # do not serialize the password, its a security breach
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)  # Hashea con pbkdf2:sha256

    def check_password(self, password):
        return check_password_hash(self.password_hash, password) # Valida el Hash del password

store_category_asociation=Table(
    "store_category",
    db.metadata,
    db.Column("store_id",db.Integer,ForeignKey("stores.id"), primary_key = True ),
    db.Column("categories_id",db.Integer,ForeignKey("categories.id"), primary_key = True )
)

class Store(db.Model):
    __tablename__ = "stores"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    direccion: Mapped[str] = mapped_column(String(255), nullable=False)
    activo: Mapped[bool] = mapped_column(default=True, nullable=False)
    fecha_de_pago: Mapped[Date] = mapped_column(Date, nullable=True)  
 
    #menus = relationship("Menu", back_populates="store")
    user: Mapped["User"] = relationship("User",back_populates="stores" )
    categories: Mapped[List["Category"]] = relationship("Category", secondary=store_category_asociation, back_populates="stores")
    #images = relationship("Image", back_populates="store")
    #points = relationship("UserPoint", back_populates="store")

    def serialize(self):
        return {
            "nombre": self.nombre,
            "direccion": self.direccion
            # do not serialize the password, its a security breach
        }

class Category(db.Model):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    stores: Mapped[List[Store]] = relationship("Store", secondary=store_category_asociation, back_populates="categories")



#class Menu(db.Model):
#    __tablename__ = "menus"
#    id: Mapped[int] = mapped_column(primary_key=True)
#    store_id: Mapped[int] = mapped_column(
#        ForeignKey("stores.id"), nullable=False)
#    category: Mapped[str] = mapped_column(String(100), nullable=False)
#    description: Mapped[str] = mapped_column(String(255), nullable=True)
#    store = relationship("Store", back_populates="menus")
#    products = relationship("Product", back_populates="menu")


#class Product(db.Model):
#    __tablename__ = "products"
#    id: Mapped[int] = mapped_column(primary_key=True)
#    menu_id: Mapped[int] = mapped_column(
#        ForeignKey("menus.id"), nullable=False)
#    name: Mapped[str] = mapped_column(String(100), nullable=False)
#    description: Mapped[str] = mapped_column(String(255), nullable=True)
#    menu = relationship("Menu", back_populates="products")
#    images = relationship("Image", back_populates="product")


#class Image(db.Model):
#    __tablename__ = "imagenes"
#    id: Mapped[int] = mapped_column(primary_key=True)
#    product_id: Mapped[Optional[int]] = mapped_column(
#        ForeignKey("products.id"), nullable=True)  # Puede ser opcional
#    store_id: Mapped[Optional[int]] = mapped_column(
#        ForeignKey("stores.id"), nullable=True)      # Puede ser opcional
#    name: Mapped[str] = mapped_column(String(100), nullable=False)
#    type: Mapped[str] = mapped_column(String(50), nullable=False)
#    url: Mapped[str] = mapped_column(String(255), nullable=False)
#    position: Mapped[int] = mapped_column(default=0, nullable=False)
#    product = relationship("Product", back_populates="images")
#    store = relationship("Store", back_populates="images")


#class UserPoint(db.Model):
#    __tablename__ = "userpoints"
#    id: Mapped[int] = mapped_column(primary_key=True)
#    user_id: Mapped[int] = mapped_column(
#        ForeignKey("users.id"), nullable=False)
#    store_id: Mapped[int] = mapped_column(
#        ForeignKey("stores.id"), nullable=False)
#    description: Mapped[str] = mapped_column(String(255), nullable=True)
#    user = relationship("User", back_populates="points")
#    store = relationship("Store", back_populates="points")
