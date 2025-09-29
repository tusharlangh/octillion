from pdfminer.high_level import extract_text

file_path = "sample.pdf"
text = extract_text(file_path)

print(text)