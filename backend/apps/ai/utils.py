MAX_QUESTION_LENGTH = 500


def sanitize_question(text: str) -> str:
    return text.strip()[:MAX_QUESTION_LENGTH]
