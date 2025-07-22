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

then create the `sqlite` for django with

```bash
python manage.py migrate
```