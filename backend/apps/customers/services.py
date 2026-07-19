from apps.customers.models import Address, Customer


def get_or_create_customer(*, store, full_name, phone_number, email=""):
    customer, created = Customer.objects.get_or_create(
        store=store,
        phone_number=phone_number,
        defaults={"full_name": full_name, "email": email},
    )
    if not created and (full_name or email) and (customer.full_name != full_name or customer.email != email):
        customer.full_name = full_name or customer.full_name
        customer.email = email or customer.email
        customer.save(update_fields=["full_name", "email"])
    return customer


def update_customer(*, customer, **fields):
    for field, value in fields.items():
        setattr(customer, field, value)
    customer.save(update_fields=list(fields.keys()) + ["updated_at"])
    return customer


def add_address(*, customer, full_address, label="", city="", country="", is_default=False):
    if is_default:
        customer.addresses.update(is_default=False)
    return Address.objects.create(
        customer=customer,
        full_address=full_address,
        label=label,
        city=city,
        country=country,
        is_default=is_default,
    )
