from opportunities.opportunity_ranker import score_opportunity


def run(opportunity: dict) -> dict:
    score = score_opportunity(opportunity)
    return {
        'status': 'scored',
        'idea': opportunity.get('idea') or opportunity.get('name'),
        'score': score,
        'recommended': score >= 70,
    }
