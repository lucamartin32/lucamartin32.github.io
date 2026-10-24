"""Falla (y GitHub te manda un mail) si alguna tienda no se pudo leer en esta vuelta."""
import json, sys
d = json.load(open('data/catalogo.json'))
bad = [k for k, v in d.get('estado', {}).items() if not v.get('ok')]
if bad:
    print('No se pudo leer:', ', '.join(bad), '- la web oculta esas tiendas si siguen fallando más de 6 horas.')
    sys.exit(1)
print('Todas las tiendas OK:', {k: v.get('productos') for k, v in d['estado'].items()})
