#!/usr/bin/env python3

print("Testing Python installation...")
print("Python is working!")

try:
    from flask import Flask
    print("✅ Flask is available")
except ImportError:
    print("❌ Flask not installed - run: pip install -r requirements.txt")

try:
    from openpyxl import load_workbook
    print("✅ openpyxl is available")
except ImportError:
    print("❌ openpyxl not installed - run: pip install -r requirements.txt")

print("\nIf you see checkmarks above, you can run:")
print("python app.py")
print("\nThen open: http://localhost:5000")

input("Press Enter to continue...")