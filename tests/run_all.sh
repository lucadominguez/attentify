#!/usr/bin/env bash
cd /mnt/c/Users/Lenovo/Desktop/AI/Browser-Daemon
for t in scoring_test context_diag ui_smoke prefs_diag scanner_diag yt_shelf_test dynamic_test flow_test title_block_test daemon_link_test; do
  echo "### $t"
  timeout 120 python3 "tests/$t.py" 2>&1 | tail -1
done
