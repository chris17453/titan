FROM python:2.7
ENV APP /app

RUN mkdir $APP
WORKDIR $APP

COPY requirements.txt .
COPY app app

RUN pip install -r requirements.txt

EXPOSE 5000

# Production
CMD [ "uwsgi", "--ini", "app.ini" ]

# Development
#CMD [ "python",  "app.py" ]
