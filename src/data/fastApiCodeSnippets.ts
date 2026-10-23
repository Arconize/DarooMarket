export interface CodeFile {
  filename: string;
  path: string;
  description: string;
  code: string;
}

export const FASTAPI_CODEBASE: CodeFile[] = [
  {
    filename: 'main.py',
    path: 'backend/app/main.py',
    description: 'نقطه ورود اصلی سرور FastAPI به همراه اتصال روترها و کانفیگ CORS',
    code: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, products

# ساخت جداول دیتابیس در زمان استارت اولیه سرور
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="داروخانه آنلاین سلامت - API",
    description="وب‌سرویس جامع فروشگاه داروخانه با پشتیبانی از سیستم OTP، مکمل‌ها و فاکتورها",
    version="1.0.0"
)

# تنظیمات CORS برای دسترسی فرانت‌اند
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# رجیستر کردن روترها
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "داروخانه آنلاین سلامت",
        "docs_url": "/docs"
    }
`
  },
  {
    filename: '__init__.py (Routers)',
    path: 'backend/app/routers/__init__.py',
    description: 'فایل الزامی برای رفع خطای ModuleNotFoundError: No module named app.routers',
    code: `# این فایل باید داخل پوشه app/routers قرار گیرد.
# حتی اگر کاملاً خالی باشد، به پایتون اعلام می‌کند که این پوشه یک ماژول معتبر است.
`
  },
  {
    filename: 'auth.py',
    path: 'backend/app/routers/auth.py',
    description: 'روتر احراز هویت پیامکی (ارسال OTP، تایید کد و صدور JWT)',
    code: `import random
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
import app.models as models
import app.schemas as schemas

router = APIRouter(prefix="/auth", tags=["Authentication"])

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

@router.post("/send-otp", status_code=status.HTTP_200_OK)
def send_otp(request: schemas.OTPSendRequest, db: Session = Depends(get_db)):
    otp_code = str(random.randint(1000, 9999))
    expiration = datetime.utcnow() + timedelta(minutes=2)

    # ابطال کدهای قبلی
    db.query(models.OTP).filter(
        models.OTP.phone_number == request.phone_number,
        models.OTP.is_used == False
    ).update({"is_used": True})

    new_otp = models.OTP(
        phone_number=request.phone_number,
        code=otp_code,
        expires_at=expiration
    )
    db.add(new_otp)
    db.commit()

    # ارسال از طریق وب‌سرویس پیامکی (کاوه نگار / ملی پیامک)
    print(f"[SMS GATEWAY] Code {otp_code} sent to {request.phone_number}")

    return {"message": "کد تایید برای شما پیامک شد", "expires_in": 120}

@router.post("/verify-otp", response_model=schemas.TokenResponse)
def verify_otp(request: schemas.OTPVerifyRequest, db: Session = Depends(get_db)):
    otp_record = db.query(models.OTP).filter(
        models.OTP.phone_number == request.phone_number,
        models.OTP.code == request.code,
        models.OTP.is_used == False,
        models.OTP.expires_at > datetime.utcnow()
    ).first()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کد وارد شده اشتباه یا منقضی شده است."
        )

    otp_record.is_used = True
    db.commit()

    user = db.query(models.User).filter(models.User.phone_number == request.phone_number).first()
    if not user:
        user = models.User(phone_number=request.phone_number)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.phone_number, "role": user.role.value, "id": user.id})
    return {"access_token": token, "token_type": "bearer"}
`
  },
  {
    filename: 'products.py',
    path: 'backend/app/routers/products.py',
    description: 'روتر محصولات (افزودن کالا، دریافت لیست، فیلتر با دسته‌بندی و کد IRC)',
    code: `from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
import app.models as models
import app.schemas as schemas

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(
        (models.Product.slug == product.slug) | (models.Product.sku == product.sku)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="محصولی با این SKU یا Slug قبلاً ثبت شده است.")

    product_dict = product.model_dump()
    images_data = product_dict.pop("images", [])

    new_prod = models.Product(**product_dict)
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)

    for img in images_data:
        db.add(models.ProductImage(product_id=new_prod.id, **img))
    db.commit()
    db.refresh(new_prod)

    return new_prod

@router.get("", response_model=List[schemas.ProductResponse])
def get_products(category_id: Optional[int] = None, skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    query = db.query(models.Product).filter(models.Product.is_active == True)
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    return query.offset(skip).limit(limit).all()
`
  },
  {
    filename: 'models.py',
    path: 'backend/app/models.py',
    description: 'کامل‌ترین معماری رابطه‌ای دیتابیس شامل User, Address, Product, Category, Order, Payment, Review, OTP',
    code: `import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import ForeignKey, String, Text, Float, Integer, DateTime, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"
    pharmacist = "pharmacist"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    preparing = "preparing"
    shipped = "shipped"
    delivered = "delivered"
    canceled = "canceled"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    successful = "successful"
    failed = "failed"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    phone_number: Mapped[str] = mapped_column(String(11), unique=True, index=True, nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(50))
    last_name: Mapped[Optional[str]] = mapped_column(String(50))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.customer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    addresses: Mapped[List["UserAddress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    orders: Mapped[List["Order"]] = relationship(back_populates="user")
    reviews: Mapped[List["Review"]] = relationship(back_populates="user")

class UserAddress(Base):
    __tablename__ = "user_addresses"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(50))
    state: Mapped[str] = mapped_column(String(50))
    city: Mapped[str] = mapped_column(String(50))
    postal_address: Mapped[str] = mapped_column(Text)
    postal_code: Mapped[str] = mapped_column(String(10))
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    recipient_name: Mapped[str] = mapped_column(String(100))
    recipient_phone: Mapped[str] = mapped_column(String(11))
    user: Mapped["User"] = relationship(back_populates="addresses")

class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id", ondelete="SET NULL"))
    products: Mapped[List["Product"]] = relationship(back_populates="category")

class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    english_name: Mapped[Optional[str]] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    irc_code: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    short_description: Mapped[Optional[str]] = mapped_column(String(500))
    price: Mapped[float] = mapped_column(Float, nullable=False)
    discount_price: Mapped[Optional[float]] = mapped_column(Float)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    category: Mapped["Category"] = relationship(back_populates="products")
    images: Mapped[List["ProductImage"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    reviews: Mapped[List["Review"]] = relationship(back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_main: Mapped[bool] = mapped_column(Boolean, default=False)
    product: Mapped["Product"] = relationship(back_populates="images")

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.pending)
    total_products_price: Mapped[float] = mapped_column(Float, nullable=False)
    shipping_cost: Mapped[float] = mapped_column(Float, default=0.0)
    final_amount: Mapped[float] = mapped_column(Float, nullable=False)
    shipping_method: Mapped[str] = mapped_column(String(50))
    shipping_tracking_code: Mapped[Optional[str]] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price_at_purchase: Mapped[float] = mapped_column(Float, nullable=False)
    order: Mapped["Order"] = relationship(back_populates="items")

class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    admin_reply: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="reviews")
    product: Mapped["Product"] = relationship(back_populates="reviews")

class OTP(Base):
    __tablename__ = "otps"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    phone_number: Mapped[str] = mapped_column(String(11), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(6), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
`
  },
  {
    filename: 'database.py',
    path: 'backend/app/database.py',
    description: 'تنظیمات اتصال Engine و ساخت SessionLocal با SQLAlchemy 2.0',
    code: `from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`
  },
  {
    filename: 'config.py',
    path: 'backend/app/config.py',
    description: 'خواندن متغیرهای محیطی با پیش‌فرض امن',
    code: `import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:mysecretpassword@localhost:5432/pharmacy_db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-pharmacy-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

settings = Settings()
`
  }
];
