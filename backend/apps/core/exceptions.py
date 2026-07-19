from rest_framework.views import exception_handler


class ServiceError(Exception):
    """Raised by service-layer functions on a business-rule violation."""

    def __init__(self, message, code="service_error", status_code=400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


def komi_exception_handler(exc, context):
    from rest_framework import status
    from rest_framework.response import Response

    if isinstance(exc, ServiceError):
        return Response(
            {"detail": exc.message, "code": exc.code},
            status=exc.status_code,
        )

    response = exception_handler(exc, context)

    if response is None:
        return response

    response.data = {"detail": response.data, "code": getattr(exc, "default_code", "error")}
    return response
