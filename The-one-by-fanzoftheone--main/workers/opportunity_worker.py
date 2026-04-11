import json
from pathlib import Path
from opportunities.opportunity_engine import collect
from opportunities.opportunity_ranker import rank


def process() -> dict:
    inbound = Path('opportunities/inbound')
    scored = Path('opportunities/scored')
    approved = Path('opportunities/approved')
    rejected = Path('opportunities/rejected')
    for p in (inbound, scored, approved, rejected):
        p.mkdir(parents=True, exist_ok=True)

    ideas = rank(collect())
    for idea in ideas:
        slug = idea['idea'].replace(' ', '_').replace('/', '_')
        target = approved if idea['score'] >= 70 else scored
        (target / f'{slug}.json').write_text(json.dumps(idea, indent=2))

    return {'processed': len(ideas), 'approved': len(list(approved.glob('*.json')))}


if __name__ == '__main__':
    print(process())
