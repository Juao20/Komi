from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products import selectors, services
from apps.products.filters import ProductFilter
from apps.products.serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductReportSerializer,
    ProductWriteSerializer,
    PublicProductDetailSerializer,
    PublicProductListSerializer,
)
from apps.stores.mixins import StoreScopedMixin
from apps.stores.selectors import get_published_store_by_slug


class ProductListCreateView(StoreScopedMixin, ListAPIView):
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "sku"]
    ordering_fields = ["created_at", "price", "name", "stock"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return selectors.get_products_for_store(self.store)

    def post(self, request):
        serializer = ProductWriteSerializer(data=request.data, context={"store": self.store})
        serializer.is_valid(raise_exception=True)
        product = services.create_product(store=self.store, **serializer.validated_data)
        return Response(ProductDetailSerializer(product).data, status=status.HTTP_201_CREATED)


class ProductDetailView(StoreScopedMixin, APIView):
    def get_object(self, public_id):
        product = selectors.get_product_by_public_id(self.store, public_id)
        if product is None:
            raise NotFound("Product not found.")
        return product

    def get(self, request, public_id):
        return Response(ProductDetailSerializer(self.get_object(public_id)).data)

    def patch(self, request, public_id):
        product = self.get_object(public_id)
        serializer = ProductWriteSerializer(
            data=request.data, partial=True, context={"store": self.store}
        )
        serializer.is_valid(raise_exception=True)
        product = services.update_product(product=product, **serializer.validated_data)
        return Response(ProductDetailSerializer(product).data)

    def delete(self, request, public_id):
        services.delete_product(product=self.get_object(public_id))
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductDuplicateView(StoreScopedMixin, APIView):
    def post(self, request, public_id):
        product = selectors.get_product_by_public_id(self.store, public_id)
        if product is None:
            raise NotFound("Product not found.")
        new_product = services.duplicate_product(product=product)
        return Response(ProductDetailSerializer(new_product).data, status=status.HTTP_201_CREATED)


class ProductArchiveView(StoreScopedMixin, APIView):
    def post(self, request, public_id):
        product = selectors.get_product_by_public_id(self.store, public_id)
        if product is None:
            raise NotFound("Product not found.")
        product = services.archive_product(product=product)
        return Response(ProductDetailSerializer(product).data)


class CategoryListCreateView(StoreScopedMixin, ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return selectors.get_categories_for_store(self.store)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = services.create_category(store=self.store, **serializer.validated_data)
        return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)


def _get_published_store_or_404(slug):
    store = get_published_store_by_slug(slug)
    if store is None:
        raise NotFound("This store doesn't exist or isn't published yet.")
    return store


class PublicProductListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicProductListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name"]
    ordering_fields = ["created_at", "price", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        store = _get_published_store_or_404(self.kwargs["slug"])
        return selectors.get_active_products_for_store(store)


class PublicProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug, product_slug):
        store = _get_published_store_or_404(slug)
        product = selectors.get_active_product_by_slug(store, product_slug)
        if product is None:
            raise NotFound("Product not found.")
        return Response(PublicProductDetailSerializer(product).data)


class PublicCategoryListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        store = _get_published_store_or_404(self.kwargs["slug"])
        return selectors.get_categories_with_active_products(store)


class PublicProductReportView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, slug, product_slug):
        store = _get_published_store_or_404(slug)
        product = selectors.get_active_product_by_slug(store, product_slug)
        if product is None:
            raise NotFound("Product not found.")
        serializer = ProductReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.report_product(product=product, **serializer.validated_data)
        return Response(status=status.HTTP_201_CREATED)
