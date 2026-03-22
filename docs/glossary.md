# ProRx Analytics — Terminology & Glossary

> Quick reference for all abbreviations, terms, and business concepts used in the "At a Glance" reports.

## Business Entities

| Term | Meaning |
|------|---------|
| **ProRx (PRORX)** | The compounding pharmacy that manufactures the vials. Appears as lot prefix. |
| **PerfectRx** | The distributor/fulfillment partner that receives and sells the vials. |

## Product Terms

| Term | Meaning |
|------|---------|
| **SKU** | Stock Keeping Unit — unique product ID (drug name + strength + volume) |
| **Lot** | A single manufactured batch, e.g., `PRORX01072026@4` |
| **BUD** | Beyond-Use Date — the expiration date; vials must not be used after this |
| **Vial** | Individual unit of compounded medication |

## Quality & Compliance

| Term | Meaning |
|------|---------|
| **AQL** | Acceptable Quality Level — statistical sampling inspection standard |
| **AQS** | Acceptable Quality Score — defect scoring during inspection |
| **API** | Active Pharmaceutical Ingredient — the main drug substance |
| **Quarantine** | Lots held/blocked from release due to quality failure |
| **Low Phenol Potency** | Preservative (phenol) tested below acceptable strength |
| **Out of Spec** | Test results outside acceptable specification range |
| **Crimping Issues** | Problems with the aluminum crimp seal on vials |
| **Recrimp** | Fix: re-seal vials with new crimp caps |
| **Plate Check** | Final microbial/sterility plate check |
| **#DIV/0!** | Excel error — appears when 30-day run rate is 0 |

## Pipeline Stages

| Stage | Meaning |
|-------|---------|
| **On Schedule** | Planned for production (not yet filled) |
| **Pending Release** | Filled, going through QA (inspection → AQL → testing → plate check) |
| **Released** | Passed QA, available to ship |
| **Quarantine** | Failed QA, held for investigation |
| **Shipped** | Sent to PerfectRx |

## Inventory Metrics

| Term | Meaning |
|------|---------|
| **30-Day Run Rate** | Average units consumed/sold per 30 days at PerfectRx |
| **Days Supply** | Current stock ÷ daily run rate = how many days stock lasts |
| **In Transit** | Vials currently being shipped (not yet received) |

## Drug Products in the System

| Drug | Category |
|------|----------|
| **Tirzepatide** | GLP-1/GIP agonist (weight loss) — highest volume |
| **Semaglutide** | GLP-1 agonist (weight loss) |
| **Sermorelin** | Growth hormone-releasing peptide |
| **NAD+** | Nicotinamide Adenine Dinucleotide (wellness IV/injection) |
| **Glutathione** | Antioxidant injection |
| **Gonadorelin** | GnRH analog injection |
| **MIC** | Methionine-Inositol-Choline (lipotropic injection) |
| **Tri-Mix** | Combination injectable |
| **Cyanocobalamin** | Vitamin B12 injection |
| **Phenylephrine** | Vasoconstrictor injection |
