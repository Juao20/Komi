from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.stores import selectors, services
from apps.stores.serializers import CreateStoreSerializer, PublicStoreSerializer, StoreSerializer


class CreateStoreView(APIView):
    def post(self, request):
        serializer = CreateStoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        store = services.create_store(owner=request.user, **serializer.validated_data)
        return Response(StoreSerializer(store).data, status=status.HTTP_201_CREATED)


class MyStoreView(RetrieveUpdateAPIView):
    serializer_class = StoreSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        store = selectors.get_store_for_user(self.request.user)
        if store is None:
            raise NotFound("You don't have a store yet.")
        return store

    def perform_update(self, serializer):
        services.update_store(store=serializer.instance, **serializer.validated_data)


class PublishStoreView(APIView):
    def post(self, request):
        store = selectors.get_store_for_user(request.user)
        if store is None:
            raise NotFound("You don't have a store yet.")
        store = services.publish_store(store=store)
        return Response(StoreSerializer(store).data)


class PublicStoreDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        store = selectors.get_published_store_by_slug(slug)
        if store is None:
            raise NotFound("This store doesn't exist or isn't published yet.")
        return Response(PublicStoreSerializer(store).data)
