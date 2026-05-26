class TestToggleFavorite:
    def test_add_favorite(self, auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "收藏测试",
            "content": "内容",
            "is_public": True,
        })
        prompt_id = create_resp.json()["id"]

        response = auth_client.post(f"/api/prompts/{prompt_id}/favorite")
        assert response.status_code == 200
        data = response.json()
        assert data["prompt_id"] == prompt_id

        get_resp = auth_client.get(f"/api/prompts/{prompt_id}")
        assert get_resp.json()["is_favorited"] is True
        assert get_resp.json()["favorite_count"] == 1

    def test_remove_favorite(self, auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "取消收藏测试",
            "content": "内容",
        })
        prompt_id = create_resp.json()["id"]

        auth_client.post(f"/api/prompts/{prompt_id}/favorite")
        response = auth_client.post(f"/api/prompts/{prompt_id}/favorite")
        assert response.status_code == 200

        get_resp = auth_client.get(f"/api/prompts/{prompt_id}")
        assert get_resp.json()["is_favorited"] is False
        assert get_resp.json()["favorite_count"] == 0

    def test_favorite_prompt_not_found(self, auth_client):
        response = auth_client.post("/api/prompts/99999/favorite")
        assert response.status_code == 404

    def test_favorite_private_prompt_by_other(self, auth_client, second_auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "私有",
            "content": "内容",
            "is_public": False,
        })
        prompt_id = create_resp.json()["id"]

        response = second_auth_client.post(f"/api/prompts/{prompt_id}/favorite")
        assert response.status_code == 403

    def test_favorites_only_filter(self, auth_client):
        p1 = auth_client.post("/api/prompts", json={"title": "普通", "content": "a"}).json()
        p2 = auth_client.post("/api/prompts", json={"title": "收藏的", "content": "b"}).json()

        auth_client.post(f"/api/prompts/{p2['id']}/favorite")

        response = auth_client.get("/api/prompts", params={"favorites_only": True})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "收藏的"
