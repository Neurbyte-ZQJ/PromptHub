class TestRegister:
    def test_register_success(self, client):
        response = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "password123",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "new@example.com"
        assert "id" in data
        assert "hashed_password" not in data

    def test_register_duplicate_username(self, client, test_user):
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "another@example.com",
            "password": "password123",
        })
        assert response.status_code == 400
        assert "用户名已存在" in response.json()["detail"]

    def test_register_duplicate_email(self, client, test_user):
        response = client.post("/api/auth/register", json={
            "username": "anotheruser",
            "email": "test@example.com",
            "password": "password123",
        })
        assert response.status_code == 400
        assert "邮箱已被注册" in response.json()["detail"]

    def test_register_missing_fields(self, client):
        response = client.post("/api/auth/register", json={
            "username": "newuser",
        })
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client, test_user):
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "testpass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401
        assert "邮箱或密码错误" in response.json()["detail"]

    def test_login_nonexistent_email(self, client):
        response = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "password123",
        })
        assert response.status_code == 401


class TestGetCurrentUser:
    def test_get_current_user_success(self, auth_client, test_user):
        response = auth_client.get("/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user.username
        assert data["email"] == test_user.email

    def test_get_current_user_no_token(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client):
        client.headers.update({"Authorization": "Bearer invalidtoken"})
        response = client.get("/api/auth/me")
        assert response.status_code == 401
