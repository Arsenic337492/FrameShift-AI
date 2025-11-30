# AI.py
from groq import Groq
from config import GROQ_API_KEY
from prompts import DIRECTOR_SYSTEM_PROMPT, DIRECTOR_USER_TEMPLATE

client = Groq(api_key=GROQ_API_KEY)

MODEL_NAME = "llama-3.3-70b-versatile"


def generate_directing_plan(plot, duration, genre):
    user_prompt = DIRECTOR_USER_TEMPLATE.format(
        plot=plot,
        duration=duration,
        genre=genre
    )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": DIRECTOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )

    return response.choices[0].message.content
