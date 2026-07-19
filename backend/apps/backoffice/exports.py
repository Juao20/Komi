import csv

from django.http import HttpResponse


class CSVExportMixin:
    """Adds `?export=csv` support to a ListAPIView: streams every row matching the
    current filters (ignoring pagination) instead of the usual paginated JSON body."""

    export_fields = ()
    export_headers = None
    export_filename = "export.csv"

    def list(self, request, *args, **kwargs):
        if request.query_params.get("export") == "csv":
            return self._export_csv()
        return super().list(request, *args, **kwargs)

    def _export_csv(self):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{self.export_filename}"'
        writer = csv.writer(response)
        writer.writerow(self.export_headers or self.export_fields)
        for obj in queryset.iterator():
            writer.writerow([self._resolve_field(obj, field) for field in self.export_fields])
        return response

    @staticmethod
    def _resolve_field(obj, field):
        value = obj
        for part in field.split("."):
            if value is None:
                return ""
            value = getattr(value, part, "")
        return value
