from sqlalchemy import Column, String, Text, DateTime, JSON, Integer
from sqlalchemy.sql import func
from .database import Base

class FeedbackRecord(Base):
    """反馈记录模型"""
    __tablename__ = "feedback_records"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    system_types = Column(JSON, nullable=False)
    modules = Column(JSON, nullable=False)
    analysis_result = Column(JSON, nullable=True)
    standard_format = Column(JSON, nullable=True)
    template_id = Column(String(100), default="default")
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Template(Base):
    """模板模型"""
    __tablename__ = "templates"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    config = Column(JSON, nullable=False)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AnalysisHistory(Base):
    """分析历史模型"""
    __tablename__ = "analysis_history"
    
    id = Column(String, primary_key=True, index=True)
    feedback_id = Column(String, nullable=False)
    analysis_type = Column(String(100), nullable=False)
    input_data = Column(JSON, nullable=False)
    output_data = Column(JSON, nullable=False)
    confidence_score = Column(String(10), nullable=True)
    processing_time = Column(Integer, nullable=True)  # 毫秒
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ConversionHistory(Base):
    """转化历史记录模型"""
    __tablename__ = "conversion_history"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)  # 用户标识
    title = Column(String(255), nullable=False)
    original_description = Column(Text, nullable=False)
    system_types = Column(JSON, nullable=False)
    modules = Column(JSON, nullable=False)
    analysis_result = Column(JSON, nullable=True)
    standard_format = Column(JSON, nullable=True)
    template_id = Column(String(100), default="default")
    files_info = Column(JSON, nullable=True)  # 文件信息（不存储实际文件）
    status = Column(String(50), default="completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
