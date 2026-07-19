from django.conf import settings
from django.core.exceptions import ValidationError

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


def validate_image_file(file):
    max_size = getattr(settings, "MAX_UPLOAD_SIZE_MB", 5) * 1024 * 1024
    if file.size > max_size:
        raise ValidationError(f"Image must be smaller than {settings.MAX_UPLOAD_SIZE_MB}MB.")

    content_type = getattr(file, "content_type", None)
    if content_type and content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationError("Only JPEG, PNG and WEBP images are allowed.")
