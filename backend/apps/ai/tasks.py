from celery import shared_task


@shared_task
def generate_daily_briefing_task(store_id):
    from apps.ai.services import AIService
    from apps.stores.models import Store

    store = Store.objects.filter(pk=store_id).first()
    if store is None:
        return
    AIService().get_daily_briefing(store=store)


@shared_task
def generate_all_daily_briefings_task():
    """Pre-generates each published store's daily briefing once — meant to run on a
    schedule (e.g. Celery Beat, early morning) so merchants never wait on page load."""
    from apps.stores.choices import StoreStatus
    from apps.stores.models import Store

    for store_id in Store.objects.filter(status=StoreStatus.PUBLISHED).values_list("id", flat=True):
        generate_daily_briefing_task.delay(store_id)
