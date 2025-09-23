from app import create_app
from app.utils import test_oracle_connection
from app import create_app
test_oracle_connection()

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
