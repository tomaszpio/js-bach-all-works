import json
import re
from collections import OrderedDict, defaultdict
import requests
from bs4 import BeautifulSoup

URL = 'http://kbpp.org.pl/kantaty_wg_swieta'

resp = requests.get(URL)
resp.raise_for_status()
soup = BeautifulSoup(resp.text, 'html.parser')

def polish_name(td):
    parts = list(td.stripped_strings)
    if not parts:
        return ''
    return parts[-1]

def cantatas(td):
    return [a.get_text(strip=True) for a in td.find_all('a')]

def season_for(name):
    l = name.lower()
    if 'adwent' in l:
        return 'Adwent'
    if any(k in l for k in ['wigilia', 'boże narodzenie', 'świąt bożego narodzenia', 'sylwester', 'nowy rok', 'objawienie', 'epifania', 'niedziela po objawieniu', 'oktawie bożego narodzenia', 'epif', 'obrzezanie pańskie']):
        return 'Okres Bożego Narodzenia'
    if any(k in l for k in ['siedemdziesiątnicy', 'mięsopustna', 'starozapustna', 'zapustna']):
        return 'Przedpoście'
    if any(k in l for k in ['wielkiego postu', 'męki pańskiej', 'popielec', 'zapustny', 'wielki czwartek', 'wielki piątek', 'wielka sobota']):
        return 'Wielki Post'
    if 'wielkanoc' in l:
        return 'Wielkanoc'
    if any(k in l for k in ['quasimodogeniti', 'misericordias', 'jubilate', 'kantate', 'rogate']):
        return 'Okres wielkanocny'
    if any(k in l for k in ['himmelfahrt', 'wniebowstąp']):
        return 'Wniebowstąpienie'
    if any(k in l for k in ['pfingst', 'zesłaniu ducha świętego', 'zesłanie ducha', 'pięćdziesiątnicy']):
        return 'Zesłanie Ducha Świętego'
    if 'trinitatis' in l or 'zesłaniu ducha świętego' in l or 'niedziela po zesłaniu ducha świętego' in l or 'so.n.trin' in l:
        return 'Okres po Zesłaniu Ducha'
    if any(k in l for k in ['pokuty', 'wieczności', 'reformacji', 'oczyszczenie maryi', 'narodzenia  jana', 'nawiedzenia maryi', 'michała archanioła', 'mikołaja', 'dowolny okres', 'dowolne okazje', 'środy', 'święto', 'urodziny', 'śluby', 'pogrzeb', 'wybór rady miejskiej']):
        return 'Święta i okazje'
    return 'Inne'

rows = soup.select('table tr')[1:]  # skip header
seasons = defaultdict(list)
for tr in rows:
    tds = tr.find_all('td')
    if len(tds) != 2:
        continue
    name = polish_name(tds[0])
    works = cantatas(tds[1])
    season = season_for(name)
    seasons[season].append({'name': name, 'children': [{'name': w} for w in works]})

season_order = ['Adwent', 'Okres Bożego Narodzenia', 'Przedpoście', 'Wielki Post', 'Wielkanoc', 'Okres wielkanocny', 'Wniebowstąpienie', 'Zesłanie Ducha Świętego', 'Okres po Zesłaniu Ducha', 'Święta i okazje', 'Inne']
children = [ {'name': season, 'children': seasons.get(season, [])} for season in season_order if seasons.get(season) ]

data = {'name': 'Rok liturgiczny', 'children': children}

with open('liturgical_year.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
