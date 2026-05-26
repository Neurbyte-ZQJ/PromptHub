class TestCreatePrompt:
    def test_create_prompt_success(self, auth_client):
        response = auth_client.post("/api/prompts", json={
            "title": "测试提示词",
            "content": "这是一个测试提示词的内容",
            "scenario": "测试场景",
            "is_public": False,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "测试提示词"
        assert data["content"] == "这是一个测试提示词的内容"
        assert data["scenario"] == "测试场景"
        assert data["is_public"] is False
        assert len(data["versions"]) == 1
        assert data["versions"][0]["version_number"] == 1

    def test_create_prompt_with_new_tags(self, auth_client):
        response = auth_client.post("/api/prompts", json={
            "title": "带标签的提示词",
            "content": "内容",
            "new_tags": ["标签A", "标签B"],
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["tags"]) == 2
        tag_names = [t["name"] for t in data["tags"]]
        assert "标签A" in tag_names
        assert "标签B" in tag_names

    def test_create_prompt_with_categories(self, auth_client):
        cat_resp = auth_client.post("/api/categories", json={
            "name": "测试分类",
        })
        cat_id = cat_resp.json()["id"]

        response = auth_client.post("/api/prompts", json={
            "title": "带分类的提示词",
            "content": "内容",
            "category_ids": [cat_id],
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["categories"]) == 1
        assert data["categories"][0]["name"] == "测试分类"

    def test_create_prompt_requires_auth(self, client):
        response = client.post("/api/prompts", json={
            "title": "未认证提示词",
            "content": "内容",
        })
        assert response.status_code == 401


class TestListPrompts:
    def test_list_prompts_default(self, auth_client):
        for i in range(3):
            auth_client.post("/api/prompts", json={
                "title": f"提示词{i}",
                "content": f"内容{i}",
            })

        response = auth_client.get("/api/prompts")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_list_prompts_search(self, auth_client):
        auth_client.post("/api/prompts", json={
            "title": "Python助手",
            "content": "Python编程帮助",
        })
        auth_client.post("/api/prompts", json={
            "title": "JavaScript助手",
            "content": "JS编程帮助",
        })

        response = auth_client.get("/api/prompts", params={"search": "Python"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Python助手"

    def test_list_prompts_pagination(self, auth_client):
        for i in range(5):
            auth_client.post("/api/prompts", json={
                "title": f"提示词{i}",
                "content": f"内容{i}",
            })

        response = auth_client.get("/api/prompts", params={"page": 1, "page_size": 2})
        assert response.status_code == 200
        assert len(response.json()) == 2
        assert response.headers["X-Total-Count"] == "5"
        assert response.headers["X-Total-Pages"] == "3"

    def test_list_prompts_sort_by_title(self, auth_client):
        auth_client.post("/api/prompts", json={"title": "C提示词", "content": "c"})
        auth_client.post("/api/prompts", json={"title": "A提示词", "content": "a"})
        auth_client.post("/api/prompts", json={"title": "B提示词", "content": "b"})

        response = auth_client.get("/api/prompts", params={"sort_by": "title", "sort_order": "asc"})
        assert response.status_code == 200
        data = response.json()
        titles = [p["title"] for p in data]
        assert titles == sorted(titles)

    def test_list_prompts_only_sees_own_and_public(self, auth_client, second_auth_client):
        auth_client.post("/api/prompts", json={
            "title": "我的私有",
            "content": "私有内容",
            "is_public": False,
        })
        auth_client.post("/api/prompts", json={
            "title": "我的公开",
            "content": "公开内容",
            "is_public": True,
        })

        response = second_auth_client.get("/api/prompts")
        data = response.json()
        titles = [p["title"] for p in data]
        assert "我的公开" in titles
        assert "我的私有" not in titles


class TestGetPrompt:
    def test_get_prompt_success(self, auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "获取测试",
            "content": "内容",
        })
        prompt_id = create_resp.json()["id"]

        response = auth_client.get(f"/api/prompts/{prompt_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "获取测试"

    def test_get_prompt_not_found(self, auth_client):
        response = auth_client.get("/api/prompts/99999")
        assert response.status_code == 404

    def test_get_prompt_private_not_owner(self, auth_client, second_auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "私有提示词",
            "content": "内容",
            "is_public": False,
        })
        prompt_id = create_resp.json()["id"]

        response = second_auth_client.get(f"/api/prompts/{prompt_id}")
        assert response.status_code == 403

    def test_get_prompt_public_by_other(self, auth_client, second_auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "公开提示词",
            "content": "内容",
            "is_public": True,
        })
        prompt_id = create_resp.json()["id"]

        response = second_auth_client.get(f"/api/prompts/{prompt_id}")
        assert response.status_code == 200


class TestUpdatePrompt:
    def test_update_prompt_title(self, auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "原始标题",
            "content": "原始内容",
        })
        prompt_id = create_resp.json()["id"]

        response = auth_client.put(f"/api/prompts/{prompt_id}", json={
            "title": "更新标题",
        })
        assert response.status_code == 200
        assert response.json()["title"] == "更新标题"

    def test_update_prompt_creates_version(self, auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "版本测试",
            "content": "版本1",
        })
        prompt_id = create_resp.json()["id"]
        assert len(create_resp.json()["versions"]) == 1

        update_resp = auth_client.put(f"/api/prompts/{prompt_id}", json={
            "content": "版本2",
        })
        assert update_resp.status_code == 200
        versions = update_resp.json()["versions"]
        assert len(versions) == 2
        version_numbers = [v["version_number"] for v in versions]
        assert 2 in version_numbers

    def test_update_prompt_not_owner(self, auth_client, second_auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "他人提示词",
            "content": "内容",
        })
        prompt_id = create_resp.json()["id"]

        response = second_auth_client.put(f"/api/prompts/{prompt_id}", json={
            "title": "篡改",
        })
        assert response.status_code == 403


class TestDeletePrompt:
    def test_delete_prompt_success(self, auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "待删除",
            "content": "内容",
        })
        prompt_id = create_resp.json()["id"]

        response = auth_client.delete(f"/api/prompts/{prompt_id}")
        assert response.status_code == 200

        get_resp = auth_client.get(f"/api/prompts/{prompt_id}")
        assert get_resp.status_code == 404

    def test_delete_prompt_not_owner(self, auth_client, second_auth_client):
        create_resp = auth_client.post("/api/prompts", json={
            "title": "他人提示词",
            "content": "内容",
        })
        prompt_id = create_resp.json()["id"]

        response = second_auth_client.delete(f"/api/prompts/{prompt_id}")
        assert response.status_code == 403

    def test_delete_prompt_not_found(self, auth_client):
        response = auth_client.delete("/api/prompts/99999")
        assert response.status_code == 404
