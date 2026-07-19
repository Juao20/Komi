from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    has_store = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "public_id",
            "email",
            "full_name",
            "phone_number",
            "avatar_url",
            "is_email_verified",
            "has_store",
            "is_staff",
            "created_at",
        )
        read_only_fields = ("public_id", "email", "is_email_verified", "is_staff", "created_at")

    def get_has_store(self, obj):
        return hasattr(obj, "store")


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    full_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=32, required=False, allow_blank=True)


class KomiTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class VerifyEmailSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ConfirmPasswordResetSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
