import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")

from backend.database import Base, get_db
from backend.main import app
from backend.models import User
from backend.auth import get_password_hash, create_access_token

TEST_DATABASE_URL = "sqlite:///./test_prompts.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def test_user(db_session):
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpass123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user):
    return create_access_token(data={"sub": str(test_user.id)})


@pytest.fixture
def auth_client(test_user_token):
    c = TestClient(app)
    c.headers.update({"Authorization": f"Bearer {test_user_token}"})
    return c


@pytest.fixture
def second_user(db_session):
    user = User(
        username="seconduser",
        email="second@example.com",
        hashed_password=get_password_hash("testpass123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def second_user_token(second_user):
    return create_access_token(data={"sub": str(second_user.id)})


@pytest.fixture
def second_auth_client(second_user_token):
    c = TestClient(app)
    c.headers.update({"Authorization": f"Bearer {second_user_token}"})
    return c
