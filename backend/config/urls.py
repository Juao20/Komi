from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

api_v1_patterns = [
    path("auth/", include("apps.accounts.urls")),
    path("stores/", include("apps.stores.urls")),
    path("themes/", include("apps.themes.urls")),
    path("", include("apps.products.urls")),
    path("", include("apps.orders.urls")),
    path("", include("apps.customers.urls")),
    path("analytics/", include("apps.analytics.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("payments/", include("apps.payments.urls")),
    path("wallet/", include("apps.wallets.urls")),
    path("", include("apps.ai.urls")),
    path("backoffice/", include("apps.backoffice.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
