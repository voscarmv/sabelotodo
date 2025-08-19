#!/bin/bash

sudo apt install postgresql postgresql-contrib
sudo su - postgres
read -p "Postgres username: " USER
read -p "Postgres password: " PASS
read -p "Database name: " DB
psql -c "create database $DB;"
psql -c "CREATE USER $USER WITH PASSWORD $PASS;"
psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB TO $USER;"
psql -d $DB -c "GRANT ALL ON SCHEMA public TO $USER;"
echo "db_url=postgres://$USER:$PASS@localhost/$DB" > .env
echo "Remember to change your .env file to your username, db name and password!"