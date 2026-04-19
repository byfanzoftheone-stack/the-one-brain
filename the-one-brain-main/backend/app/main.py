import uvicorn
from .main_impl import app

if __name__ == '__main__':
    uvicorn.run('app.main_impl:app', host='0.0.0.0', port=8787, reload=False)
