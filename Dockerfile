#stage 1: build frontend
FROM node:18 as build-stage

WORKDIR /code

COPY ./frontend /code/frontend/

WORKDIR /code/frontend/

#install packages
RUN npm install

#build the frontend
RUN npm run build


#stage 2: build frontend
FROM python:3:12.4

#Set Environment Variables
ENV PYTHONDONTWRITEBYCODE 1
ENV PYTHONUNBUFFERRED 1

WORKDIR /code

#copy django projecet
COPY ./backend /code/backend/

RUN pip install -r ./backend/requirements.txt


#copy front end build to django project
COPY --from=build-stages ./code/frontend/build /code/backend/static/
COPY --from=build-stage ./code/frontend/build/static /code/backend/static/ 
COPY --from=build-stage ./code/frontend/build/index.html /code/backend/templates/index.html

#run django migration command
RUN python ./backend/manage.py migrate

#run django collectstatic command
RUN python ./backend/manage.py collectstatic --no-input

#Expose port
EXPOSE 80


WORKDIR /code/backend/

#run django server
CMD [ "gunicorn","crud.wsgi:application","--bind","0.0.0.0:8080" ]