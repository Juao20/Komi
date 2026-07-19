import logging
import re

import cloudinary
import cloudinary.uploader
from django.conf import settings

logger = logging.getLogger(__name__)

_PUBLIC_ID_PATTERN = re.compile(r"/upload/(?:v\d+/)?(?P<public_id>.+?)\.[a-zA-Z0-9]+$")


def configure():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_STORAGE["CLOUD_NAME"],
        api_key=settings.CLOUDINARY_STORAGE["API_KEY"],
        api_secret=settings.CLOUDINARY_STORAGE["API_SECRET"],
        secure=True,
    )


def extract_public_id(url):
    if not url or "res.cloudinary.com" not in url:
        return None
    match = _PUBLIC_ID_PATTERN.search(url)
    return match.group("public_id") if match else None


def delete_image(url):
    public_id = extract_public_id(url)
    if not public_id:
        return
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception:
        logger.warning("Failed to delete Cloudinary asset %s", public_id, exc_info=True)


def delete_images(urls):
    for url in urls:
        delete_image(url)
