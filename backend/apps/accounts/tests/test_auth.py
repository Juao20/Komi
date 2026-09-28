from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.test import TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from apps.core.testing import make_user


class PasswordResetTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = make_user()

    def test_reset_revokes_existing_sessions(self):
        client = APIClient()
        login = client.post("/api/v1/auth/login/", {"email": self.user.email, "password": "S3cure-pass!"}, format="json")
        self.assertEqual(login.status_code, 200)
        refresh = login.data["refresh"]
        self.user.refresh_from_db()  # login updates last_login, which reset tokens depend on

        response = client.post(
            "/api/v1/auth/password/reset/confirm/",
            {
                "uid": urlsafe_base64_encode(force_bytes(self.user.pk)),
                "token": default_token_generator.make_token(self.user),
                "new_password": "An0ther-S3cure-pass",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)

        refreshed = client.post("/api/v1/auth/token/refresh/", {"refresh": refresh}, format="json")
        self.assertEqual(refreshed.status_code, 401)


class LoginThrottleTests(TestCase):
    def setUp(self):
        cache.clear()
        make_user()

    def test_brute_force_is_throttled(self):
        client = APIClient()
        payload = {"email": "merchant@komi.test", "password": "wrong"}
        codes = [client.post("/api/v1/auth/login/", payload, format="json").status_code for _ in range(11)]
        self.assertEqual(codes[:10], [401] * 10)
        self.assertEqual(codes[10], 429)
