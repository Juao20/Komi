class EmailBackendBase:
    """Every email provider integration implements this. apps.emails.services.EmailService
    is the only caller — nothing else in the codebase should import a backend directly."""

    def send(self, *, to, subject, html_body, text_body, from_email=None, reply_to=None):
        raise NotImplementedError
