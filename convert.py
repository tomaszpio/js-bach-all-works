#!/usr/bin/env python3
from bs4 import BeautifulSoup
import json

with open('source.json', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

entries = []
for row in soup.select('table.wikitable tr'):
    cells = row.find_all('td')
    if len(cells) != 8:
        continue
    if row.find(['h3', 'h4']):
        continue
    text = [cell.get_text(strip=True) for cell in cells]
    entry = dict(zip(['BWV','BC','Title','Forces','Key','Date','Genre','Notes'], text))
    entries.append(entry)

with open('bach_works.json', 'w', encoding='utf-8') as f:
    json.dump(entries, f, ensure_ascii=False, indent=2)
