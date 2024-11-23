# Stage 1: build frontend
FROM node:18 as build-stage

WORKDIR /code

COPY ./frontend /code/frontend/

WORKDIR /code/frontend/

# install packages
RUN npm install

# build the frontend
RUN CI=false npm run build


# Stage 2: build backend 
FROM python:3.12.4

# Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1    # Fixed typo in UNBUFFERED

WORKDIR /code

# copy django project
COPY ./backend /code/backend/

RUN pip install -r ./backend/requirements.txt


# copy frontend build to django project
COPY --from=build-stage ./code/frontend/build /code/backend/static/
COPY --from=build-stage ./code/frontend/build/static /code/backend/static/ 
COPY --from=build-stage ./code/frontend/build/index.html /code/backend/templates/index.html

WORKDIR /code/backend/  

# run django migration command
RUN python manage.py migrate  

# run django collectstatic command
RUN python manage.py collectstatic --no-input

# Expose port (should match the port you're binding to)
EXPOSE 80

# run django server
CMD ["gunicorn", "crud.wsgi:application", "--bind", "0.0.0.0:8080"]