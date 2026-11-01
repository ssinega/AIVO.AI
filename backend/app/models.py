from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    deviation_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    source_type = Column(String, default="TEXT") # PDF, TEXT, EMAIL
    occurrence_date = Column(String, nullable=True)
    reported_date = Column(String, nullable=True)
    department = Column(String, nullable=True)
    batch_number = Column(String, index=True, nullable=True)
    product_name = Column(String, nullable=True)
    manufacturing_stage = Column(String, nullable=True)
    equipment = Column(String, nullable=True)
    severity = Column(String, default="Moderate") # Critical, Major, Moderate, Minor
    immediate_action = Column(Text, nullable=True)
    
    # AI JSON outputs
    extracted_data = Column(JSON, nullable=True)
    five_whys = Column(JSON, nullable=True)
    fishbone = Column(JSON, nullable=True)
    root_causes = Column(JSON, nullable=True)
    evidence_gaps = Column(JSON, nullable=True)
    capas = Column(JSON, nullable=True)
    
    investigation_status = Column(String, default="Open") # Open, Under Investigation, Under Quality Review, Completed, Closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    capa_records = relationship("CAPA", back_populates="investigation", cascade="all, delete-orphan")
    evidence_records = relationship("InvestigationEvidence", back_populates="investigation", cascade="all, delete-orphan")

class CAPA(Base):
    __tablename__ = "capas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String, ForeignKey("investigations.id"), nullable=False)
    capa_type = Column(String, nullable=False) # Corrective, Preventive
    description = Column(Text, nullable=False)
    justification = Column(Text, nullable=True)
    responsible_department = Column(String, nullable=True)
    owner = Column(String, nullable=True)
    priority = Column(String, default="Medium") # High, Medium, Low
    target_date = Column(String, nullable=True)
    verification_method = Column(Text, nullable=True)
    effectiveness_criteria = Column(Text, nullable=True)
    status = Column(String, default="Proposed") # Proposed, Under Review, Approved, In Progress, Completed, Effectiveness Check, Closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="capa_records")

class InvestigationEvidence(Base):
    __tablename__ = "investigation_evidence"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String, ForeignKey("investigations.id"), nullable=False)
    evidence_name = Column(String, nullable=False)
    evidence_category = Column(String, nullable=False)
    status = Column(String, default="Pending") # Pending, Requested, Received, Reviewed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="evidence_records")
