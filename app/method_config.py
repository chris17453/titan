FROM python:2
ENV APP /app

RUN mkdir $APP
WORKDIR $APP

COPY requirements.txt .
RUN pip install -r requirements.txt

EXPOSE 5000

CMD [ "uwsgi", "--ini", "app.ini" ]