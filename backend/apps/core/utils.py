from django.utils.text import slugify


def generate_unique_slug(model_class, value, slug_field="slug", instance=None, extra_filters=None):
    """Generates a unique slug for `model_class`, appending -2, -3, ... on collision.

    `extra_filters` scopes uniqueness (e.g. per-store) instead of globally.
    """
    base_slug = slugify(value)[:200] or "item"
    slug = base_slug
    queryset = model_class.objects.all()
    if extra_filters:
        queryset = queryset.filter(**extra_filters)
    if instance is not None and instance.pk:
        queryset = queryset.exclude(pk=instance.pk)

    counter = 2
    while queryset.filter(**{slug_field: slug}).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug
