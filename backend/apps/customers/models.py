from django.db import models

from apps.core.models import BaseModel


class Customer(BaseModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="customers")

    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=32)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "customers_customer"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["store", "phone_number"], name="unique_customer_phone_per_store"),
        ]
        indexes = [models.Index(fields=["store", "phone_number"])]

    def __str__(self):
        return self.full_name


class Address(BaseModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=60, blank=True)
    full_address = models.CharField(max_length=255)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=8, blank=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = "customers_address"
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.full_address} ({self.customer.full_name})"
