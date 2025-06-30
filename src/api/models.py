from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, ForeignKey, CheckConstraint, Date  # Agregar Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(
        String(80), unique=True, nullable=False)  # Agregar constraints
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    stores = relationship("Store", back_populates="owner")
    points = relationship("UserPoint", back_populates="user")


class Store(db.Model):
    __tablename__ = "stores"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    direccion: Mapped[str] = mapped_column(String(255), nullable=False)
    activo: Mapped[bool] = mapped_column(default=True, nullable=False)
    fecha_de_pago: Mapped[Date] = mapped_column(
        Date, nullable=True)  # Corregir tipo Date
    owner = relationship("User", back_populates="stores")
    menus = relationship("Menu", back_populates="store")
    categories = relationship("StoreCategory", back_populates="store")
    images = relationship("Image", back_populates="store")
    points = relationship("UserPoint", back_populates="store")


class StoreCategory(db.Model):
    __tablename__ = "storecategories"
    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    store = relationship("Store", back_populates="categories")


class Menu(db.Model):
    __tablename__ = "menus"
    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    store = relationship("Store", back_populates="menus")
    products = relationship("Product", back_populates="menu")


class Product(db.Model):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    menu_id: Mapped[int] = mapped_column(
        ForeignKey("menus.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    menu = relationship("Menu", back_populates="products")
    images = relationship("Image", back_populates="product")


class Image(db.Model):
    __tablename__ = "imagenes"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("products.id"), nullable=True)  # Puede ser opcional
    store_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("stores.id"), nullable=True)      # Puede ser opcional
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    url: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(default=0, nullable=False)
    product = relationship("Product", back_populates="images")
    store = relationship("Store", back_populates="images")


class UserPoint(db.Model):
    __tablename__ = "userpoints"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False)
    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id"), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    user = relationship("User", back_populates="points")
    store = relationship("Store", back_populates="points")
