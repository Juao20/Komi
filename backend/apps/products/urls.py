from django.urls import path

from apps.products import views

urlpatterns = [
    path("products/", views.ProductListCreateView.as_view(), name="product-list-create"),
    path("products/<uuid:public_id>/", views.ProductDetailView.as_view(), name="product-detail"),
    path("products/<uuid:public_id>/duplicate/", views.ProductDuplicateView.as_view(), name="product-duplicate"),
    path("products/<uuid:public_id>/archive/", views.ProductArchiveView.as_view(), name="product-archive"),
    path("categories/", views.CategoryListCreateView.as_view(), name="category-list-create"),
    path("public/stores/<slug:slug>/products/", views.PublicProductListView.as_view(), name="public-product-list"),
    path(
        "public/stores/<slug:slug>/products/<slug:product_slug>/",
        views.PublicProductDetailView.as_view(),
        name="public-product-detail",
    ),
    path(
        "public/stores/<slug:slug>/products/<slug:product_slug>/report/",
        views.PublicProductReportView.as_view(),
        name="public-product-report",
    ),
    path("public/stores/<slug:slug>/categories/", views.PublicCategoryListView.as_view(), name="public-category-list"),
]
