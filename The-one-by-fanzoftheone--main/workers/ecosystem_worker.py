from workers.opportunity_worker import process as process_opportunities
from workers.build_worker import build_approved
from agents.auditor.quality_auditor import audit_all
from marketplace.sync_engine import sync_marketplace


def run_once() -> dict:
    opp = process_opportunities()
    builds = build_approved()
    audits = audit_all()
    sync = sync_marketplace()
    return {
        'opportunities': opp,
        'builds': builds,
        'audits': audits,
        'marketplace': sync,
    }


if __name__ == '__main__':
    print(run_once())
