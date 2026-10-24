"""Corre el robot de stock (cifrado). Necesita el secreto KEY del repositorio."""
import os, sys, io, base64, tarfile, tempfile, subprocess
k = os.environ.get('KEY', '').strip()
if not k:
    print('Falta el secreto KEY: no se actualiza el stock en esta vuelta.'); sys.exit(0)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
b = open(os.path.join(here, 'robot.bin'), 'rb').read()
raw = AESGCM(base64.urlsafe_b64decode(k + '=' * (-len(k) % 4))).decrypt(b[:12], b[12:], None)
d = tempfile.mkdtemp(); tarfile.open(fileobj=io.BytesIO(raw)).extractall(d)
r = subprocess.run([sys.executable, os.path.join(d, 'scrape.py')], cwd=root,
                   env={**os.environ, 'ROOT': root, 'QUIET': '1', 'IMG_KEY': k},
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print('Robot terminado' if r.returncode == 0 else 'El robot tuvo un error'); sys.exit(r.returncode)
