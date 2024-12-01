# Stage 1: build frontend
FROM node:18 as build-stage

WORKDIR /code

COPY ./frontend /code/frontend/

WORKDIR /code/frontend/

# install packages
RUN npm install

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
# build the frontend
RUN CI=false npm run build


# Stage 2: build backend 
FROM python:3.12.4

# Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /code

# copy django project
COPY ./backend /code/backend/

RUN pip install -r ./backend/requirements.txt

# copy frontend build to django project
COPY --from=build-stage ./code/frontend/build /code/backend/static/
COPY --from=build-stage ./code/frontend/build/static /code/backend/static/ 
COPY --from=build-stage ./code/frontend/build/index.html /code/backend/templates/index.html

WORKDIR /code/backend/

# Define build arguments for environment variables
ARG SECRET_KEY
ARG AWS_SQS_QUEUE_URL
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION
ARG AWS_SHIPMENT_SQS_QUEUE_URL
ARG DB_USER
ARG DB_PASSWORD
ARG DB_HOST



# Set environment variables from build arguments
ENV SECRET_KEY=${SECRET_KEY} \
    AWS_SQS_QUEUE_URL=${AWS_SQS_QUEUE_URL} \
    AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \ 
    AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
    AWS_REGION=${AWS_REGION} \
    AWS_SHIPMENT_SQS_QUEUE_URL=${AWS_SHIPMENT_SQS_QUEUE_URL}\
    DB_USER=${DB_USER}\
    DB_PASSWORD=${DB_PASSWORD}\
    DB_HOST=${DB_HOST}


# run django migration command
RUN python manage.py migrate  

RUN python manage.py collectstatic --no-input

# Expose port
EXPOSE 80

# run django server
CMD ["gunicorn", "crud.wsgi:application", "--bind", "0.0.0.0:8080"]