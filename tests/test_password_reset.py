from backend.auth import create_reset_token


class TestPasswordResetRequest:
    def test_request_reset_success(self, client, test_user):
        response = client.post(
            "/api/auth/password-reset-request",
            json={"email": test_user.email},
        )
        assert response.status_code == 200
        data = response.json()
        assert "reset_token" in data
        assert "message" in data

    def test_request_reset_nonexistent_email(self, client):
        response = client.post(
            "/api/auth/password-reset-request",
            json={"email": "nonexistent@example.com"},
        )
        assert response.status_code == 404
        assert "未注册" in response.json()["detail"]

    def test_request_reset_missing_email(self, client):
        response = client.post(
            "/api/auth/password-reset-request",
            json={},
        )
        assert response.status_code == 422


class TestPasswordReset:
    def test_reset_password_success(self, client, test_user, db_session):
        reset_token = create_reset_token(data={"sub": str(test_user.id)})
        response = client.post(
            "/api/auth/password-reset",
            json={"token": reset_token, "new_password": "newpassword456"},
        )
        assert response.status_code == 200
        assert "成功" in response.json()["message"]

        db_session.refresh(test_user)
        from backend.auth import verify_password

        assert verify_password("newpassword456", test_user.hashed_password)

    def test_reset_password_invalid_token(self, client):
        response = client.post(
            "/api/auth/password-reset",
            json={"token": "invalid-token", "new_password": "newpassword456"},
        )
        assert response.status_code == 400

    def test_reset_password_with_access_token(self, client, test_user_token):
        response = client.post(
            "/api/auth/password-reset",
            json={"token": test_user_token, "new_password": "newpassword456"},
        )
        assert response.status_code == 400

    def test_reset_password_missing_fields(self, client):
        response = client.post(
            "/api/auth/password-reset",
            json={},
        )
        assert response.status_code == 422

    def test_full_reset_flow(self, client, test_user, db_session):
        request_response = client.post(
            "/api/auth/password-reset-request",
            json={"email": test_user.email},
        )
        assert request_response.status_code == 200
        reset_token = request_response.json()["reset_token"]

        reset_response = client.post(
            "/api/auth/password-reset",
            json={"token": reset_token, "new_password": "brandnewpass789"},
        )
        assert reset_response.status_code == 200

        login_response = client.post(
            "/api/auth/login",
            json={"email": test_user.email, "password": "brandnewpass789"},
        )
        assert login_response.status_code == 200
        assert "access_token" in login_response.json()

        old_login_response = client.post(
            "/api/auth/login",
            json={"email": test_user.email, "password": "testpass123"},
        )
        assert old_login_response.status_code == 401
