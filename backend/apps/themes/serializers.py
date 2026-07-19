from rest_framework import serializers

from apps.themes.models import StoreTheme


class StoreThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreTheme
        fields = ("accent_color", "font_family", "show_hero_banner", "show_social_links", "updated_at")
        read_only_fields = ("updated_at",)
