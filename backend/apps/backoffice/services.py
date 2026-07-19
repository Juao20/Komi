from apps.stores.choices import StoreStatus


def suspend_store(store):
    store.status = StoreStatus.SUSPENDED
    store.save(update_fields=["status"])
    return store


def activate_store(store):
    store.status = StoreStatus.PUBLISHED if store.published_at else StoreStatus.DRAFT
    store.save(update_fields=["status"])
    return store


def suspend_user(user):
    user.is_active = False
    user.save(update_fields=["is_active"])
    return user


def activate_user(user):
    user.is_active = True
    user.save(update_fields=["is_active"])
    return user


def resolve_report(report):
    from apps.products.choices import ProductReportStatus

    report.status = ProductReportStatus.REVIEWED
    report.save(update_fields=["status"])
    return report


def dismiss_report(report):
    from apps.products.choices import ProductReportStatus

    report.status = ProductReportStatus.DISMISSED
    report.save(update_fields=["status"])
    return report
