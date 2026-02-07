import json
import re
import sqlite3
from pathlib import Path
from typing import Any, Dict, List


# =========================
# CONFIG — edit these
# =========================
INPUT_FOLDER = Path("/Users/razbuxboim/Desktop/Raz-market-app/data_collection/code/api/json")  # ✅ folder containing the JSON files
OUTPUT_DB = INPUT_FOLDER / "income_statements.db"  # ✅ db will be created here if missing

TABLE_PREFIX = "income_statement_"  # results: income_statement_AAPL_annual, etc.


# =========================
# HELPERS
# =========================
def sanitize_symbol(s: str) -> str:
    """Safe SQLite table suffix: A-Z, 0-9, underscore."""
    s = (s or "").upper().strip()
    s = re.sub(r"[^A-Z0-9_]", "_", s)
    return s if s else "UNKNOWN"


def load_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def infer_columns_preserve_order(reports: List[Dict[str, Any]]) -> List[str]:
    """
    Preserve column order as it appears in JSON objects.
    If later rows include new keys, they are appended at the end.
    """
    cols: List[str] = []
    seen = set()
    for r in reports:
        for k in r.keys():
            if k not in seen:
                seen.add(k)
                cols.append(k)
    return cols


def create_table(conn: sqlite3.Connection, table_name: str, columns: List[str]) -> None:
    """
    Table schema:
      id (pk), symbol, row_order,
      all JSON keys as TEXT columns,
      raw_json TEXT
    """
    ddl_cols = [
        "id INTEGER PRIMARY KEY AUTOINCREMENT",
        "symbol TEXT NOT NULL",
        "row_order INTEGER NOT NULL",
    ]

    for c in columns:
        if c in {"id", "symbol"}:
            continue
        ddl_cols.append(f'"{c}" TEXT')  # keep key name exactly

    ddl_cols.append("raw_json TEXT")

    # Safe reruns: if fiscalDateEnding exists, replace duplicates
    unique_clause = ""
    if "fiscalDateEnding" in columns:
        unique_clause = ', UNIQUE(symbol, "fiscalDateEnding") ON CONFLICT REPLACE'

    ddl = f"""
    CREATE TABLE IF NOT EXISTS "{table_name}" (
      {", ".join(ddl_cols)}
      {unique_clause}
    );
    """
    conn.execute(ddl)


def insert_reports(
    conn: sqlite3.Connection,
    table_name: str,
    symbol: str,
    reports: List[Dict[str, Any]],
    columns: List[str],
) -> None:
    if not reports:
        return

    insert_cols = ["symbol", "row_order"]
    for c in columns:
        if c in {"id", "symbol"}:
            continue
        insert_cols.append(c)
    insert_cols.append("raw_json")

    col_sql = ", ".join(
        f'"{c}"' if c not in {"symbol", "row_order", "raw_json"} else c
        for c in insert_cols
    )
    placeholders = ", ".join(["?"] * len(insert_cols))

    sql = f'INSERT INTO "{table_name}" ({col_sql}) VALUES ({placeholders});'

    rows = []
    for i, r in enumerate(reports):
        row = [symbol, i]  # ✅ keeps exact JSON array order
        for c in columns:
            if c in {"id", "symbol"}:
                continue
            row.append(r.get(c))
        row.append(json.dumps(r, ensure_ascii=False))
        rows.append(tuple(row))

    conn.executemany(sql, rows)


def import_one_json_file(conn: sqlite3.Connection, json_path: Path) -> None:
    payload = load_json(json_path)

    # Symbol from JSON (preferred), fallback from filename
    symbol = sanitize_symbol(payload.get("symbol") or json_path.stem.split("_")[-1])

    annual = payload.get("annualReports") or []
    quarterly = payload.get("quarterlyReports") or []

    # Skip files that don't match expected structure
    if not isinstance(annual, list) or not isinstance(quarterly, list):
        return
    if not annual and not quarterly:
        return

    annual_cols = infer_columns_preserve_order(annual)
    quarterly_cols = infer_columns_preserve_order(quarterly)

    annual_table = f"{TABLE_PREFIX}{symbol}_annual"
    quarterly_table = f"{TABLE_PREFIX}{symbol}_quarterly"

    create_table(conn, annual_table, annual_cols)
    create_table(conn, quarterly_table, quarterly_cols)

    # Re-run safe: remove previous rows for this symbol only (then re-insert)
    conn.execute(f'DELETE FROM "{annual_table}" WHERE symbol = ?;', (symbol,))
    conn.execute(f'DELETE FROM "{quarterly_table}" WHERE symbol = ?;', (symbol,))

    insert_reports(conn, annual_table, symbol, annual, annual_cols)
    insert_reports(conn, quarterly_table, symbol, quarterly, quarterly_cols)


def main():
    # ✅ ensure folder exists
    if not INPUT_FOLDER.exists():
        raise SystemExit(f"Input folder not found: {INPUT_FOLDER.resolve()}")

    # ✅ create DB directory if needed (db file itself is created on connect)
    OUTPUT_DB.parent.mkdir(parents=True, exist_ok=True)

    # ✅ choose which json files to import
    json_files = sorted(INPUT_FOLDER.glob("*.json"))
    if not json_files:
        raise SystemExit(f"No .json files found in: {INPUT_FOLDER.resolve()}")

    with sqlite3.connect(OUTPUT_DB) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")

        imported = 0
        for jf in json_files:
            try:
                payload = load_json(jf)
            except Exception:
                continue

            # only import income-statement shaped files
            if "annualReports" in payload or "quarterlyReports" in payload:
                print(f"Importing: {jf.name}")
                import_one_json_file(conn, jf)
                imported += 1

        conn.commit()

    print(f"\n✅ Done. Imported {imported} JSON file(s).")
    print(f"✅ SQLite DB path: {OUTPUT_DB.resolve()}")
    print('Tables: income_statement_<SYMBOL>_annual and income_statement_<SYMBOL>_quarterly')


if __name__ == "__main__":
    main()
