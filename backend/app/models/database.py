from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import os

# 数据库配置
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./feedback_bridge.db")
ASYNC_DATABASE_URL = os.getenv("ASYNC_DATABASE_URL", "sqlite+aiosqlite:///./feedback_bridge.db")

# 创建数据库引擎
engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

# 创建基础模型类
Base = declarative_base()

# 数据库元数据
metadata = MetaData()

async def init_db():
    """初始化数据库"""
    try:
        # 创建所有表
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ 数据库初始化成功")
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        raise

async def get_db():
    """获取数据库会话"""
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
