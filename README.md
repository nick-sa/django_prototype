# iOLE

## installation

create a `venv` with

```bash
python -m venv venv
```

source it
(on Unix system:)
```bash
source venv/bin/activate
```

install the requirements
```bash
pip install -r requirements.txt
```

## Setup the development DB

create the `sqlite` for django with

```bash
python manage.py migrate
```

then, seed the DB with demo data with

```bash
python manage.py load_ltown_network
```

## Start the server

```bash
python manage.py runserver
```