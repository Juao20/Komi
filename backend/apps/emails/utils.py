from django.template import TemplateDoesNotExist
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def render_email_template(template_name, context):
    html_body = render_to_string(f"emails/{template_name}.html", context)
    try:
        text_body = render_to_string(f"emails/{template_name}.txt", context)
    except TemplateDoesNotExist:
        text_body = strip_tags(html_body)
    return html_body, text_body
