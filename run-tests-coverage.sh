#!/usr/bin/env bash
cd "$(dirname "$0")/backend" && pytest tests/ --cov --cov-report=term-missing
