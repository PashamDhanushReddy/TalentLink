set -o errexit
pip install -r requirements.txt
cd talentlink || exit 1
python manage.py collectstatic --no-input
python manage.py migrate
