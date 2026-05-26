class TestCreateCategory:
    def test_create_category_success(self, auth_client):
        response = auth_client.post("/api/categories", json={
            "name": "开发工具",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "开发工具"
        assert data["children"] == []

    def test_create_category_with_parent(self, auth_client):
        parent_resp = auth_client.post("/api/categories", json={
            "name": "父分类",
        })
        parent_id = parent_resp.json()["id"]

        response = auth_client.post("/api/categories", json={
            "name": "子分类",
            "parent_id": parent_id,
        })
        assert response.status_code == 201
        assert response.json()["parent_id"] == parent_id

    def test_create_category_invalid_parent(self, auth_client):
        response = auth_client.post("/api/categories", json={
            "name": "无效分类",
            "parent_id": 99999,
        })
        assert response.status_code == 400


class TestListCategories:
    def test_list_categories_tree(self, auth_client):
        auth_client.post("/api/categories", json={"name": "根1"})
        auth_client.post("/api/categories", json={"name": "根2"})
        parent_resp = auth_client.post("/api/categories", json={"name": "父"})
        parent_id = parent_resp.json()["id"]
        auth_client.post("/api/categories", json={"name": "子", "parent_id": parent_id})

        response = auth_client.get("/api/categories")
        assert response.status_code == 200
        data = response.json()
        root_names = [c["name"] for c in data]
        assert "根1" in root_names
        assert "根2" in root_names
        assert "父" in root_names
        parent_cat = next(c for c in data if c["name"] == "父")
        assert len(parent_cat["children"]) == 1
        assert parent_cat["children"][0]["name"] == "子"


class TestUpdateCategory:
    def test_update_category_name(self, auth_client):
        create_resp = auth_client.post("/api/categories", json={"name": "原名"})
        cat_id = create_resp.json()["id"]

        response = auth_client.put(f"/api/categories/{cat_id}", json={"name": "新名"})
        assert response.status_code == 200
        assert response.json()["name"] == "新名"

    def test_update_category_circular_reference(self, auth_client):
        parent_resp = auth_client.post("/api/categories", json={"name": "父"})
        parent_id = parent_resp.json()["id"]
        child_resp = auth_client.post("/api/categories", json={
            "name": "子",
            "parent_id": parent_id,
        })
        child_id = child_resp.json()["id"]

        response = auth_client.put(f"/api/categories/{parent_id}", json={
            "parent_id": child_id,
        })
        assert response.status_code == 400
        assert "子分类" in response.json()["detail"]

    def test_update_category_self_reference(self, auth_client):
        create_resp = auth_client.post("/api/categories", json={"name": "自引用"})
        cat_id = create_resp.json()["id"]

        response = auth_client.put(f"/api/categories/{cat_id}", json={
            "parent_id": cat_id,
        })
        assert response.status_code == 400


class TestDeleteCategory:
    def test_delete_category_success(self, auth_client):
        create_resp = auth_client.post("/api/categories", json={"name": "待删除"})
        cat_id = create_resp.json()["id"]

        response = auth_client.delete(f"/api/categories/{cat_id}")
        assert response.status_code == 200

        list_resp = auth_client.get("/api/categories")
        names = [c["name"] for c in list_resp.json()]
        assert "待删除" not in names

    def test_delete_category_children_cascaded(self, auth_client):
        parent_resp = auth_client.post("/api/categories", json={"name": "父"})
        parent_id = parent_resp.json()["id"]
        auth_client.post("/api/categories", json={"name": "子", "parent_id": parent_id})

        auth_client.delete(f"/api/categories/{parent_id}")

        list_resp = auth_client.get("/api/categories")
        data = list_resp.json()
        names = [c["name"] for c in data]
        assert "父" not in names
        assert "子" not in names

    def test_delete_category_not_owner(self, auth_client, second_auth_client):
        create_resp = auth_client.post("/api/categories", json={"name": "我的分类"})
        cat_id = create_resp.json()["id"]

        response = second_auth_client.delete(f"/api/categories/{cat_id}")
        assert response.status_code == 403
