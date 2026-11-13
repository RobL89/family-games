"""Compare two exports of the family-games Sheet (.xlsx), tab by tab and row by row.

    python3 -I tools/sheet_compare.py <before.xlsx> <after.xlsx>

For the rule on changing the Sheet (back up, re-read, compare before and after): it lists tabs that
came or went, and in each tab the rows that went or came, compared cell by cell as text. Rows that
only moved up (because rows above them were deleted) count as unchanged. Exit 0 when the two are
the same. Exports hold the family's names: keep them in /tmp, never in the repo.
"""
import sys
from collections import Counter

import openpyxl


def cell(v):
    if v is None:
        return ''
    if hasattr(v, 'isoformat'):
        return v.isoformat()
    if isinstance(v, float) and v.is_integer():
        return str(int(v))  # 1.0 and 1 are the same number however the file was saved
    return str(v)


def tabs(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    out = {}
    for ws in wb.worksheets:
        rows = []
        for r in ws.iter_rows(values_only=True):
            row = tuple(cell(v) for v in r)
            while row and row[-1] == '':
                row = row[:-1]
            if row:
                rows.append(row)
        out[ws.title] = rows
    return out


def short(row, width=60):
    text = ' | '.join(row)
    return text if len(text) <= width else text[:width - 3] + '...'


def compare(before_path, after_path):
    before, after = tabs(before_path), tabs(after_path)
    same = True
    for name in sorted(set(before) | set(after)):
        if name not in after:
            same = False
            print(f'Tab gone: {name} ({len(before[name])} rows)')
            continue
        if name not in before:
            same = False
            print(f'Tab new: {name} ({len(after[name])} rows)')
            continue
        b, a = Counter(before[name]), Counter(after[name])
        gone, came = b - a, a - b
        if not gone and not came:
            print(f'{name}: unchanged ({len(before[name])} rows)')
            continue
        same = False
        print(f'{name}: {len(before[name])} rows -> {len(after[name])}')
        for row, n in gone.items():
            print(f'    gone{f" x{n}" if n > 1 else ""}: {short(row)}')
        for row, n in came.items():
            print(f'    new{f" x{n}" if n > 1 else ""}:  {short(row)}')
    print('\nThe same, cell by cell.' if same else '\nDifferent, as listed above.')
    return same


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    sys.exit(0 if compare(sys.argv[1], sys.argv[2]) else 1)
