from flask import Flask, request, jsonify
from PIL import Image, ImageFilter, ImageOps
import pytesseract
import tempfile
import os
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Gemini setup
genai.configure(api_key="AIzaSyAUSin_MGLIiuJzYPHwHk39O6L_9jlWoyc")
model = genai.GenerativeModel("gemini-1.5-flash")  # You can also try "gemini-1.5-pro"

@app.route('/analyze', methods=['POST'])
def analyze_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    # Save the uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_img:
        file.save(temp_img.name)
        temp_img_path = temp_img.name

    try:
        # Open and process the image safely
        with Image.open(temp_img_path) as img:
            img = ImageOps.grayscale(img)
            img = img.filter(ImageFilter.SHARPEN)
            extracted_text = pytesseract.image_to_string(img, lang='eng+tel+hin')

        prompt = extracted_text + '''

above is the data of a legal document, with the information given, structure the below things:

Client name  
PII data (PAN, GSTIN)  
Nature of notice (Return mismatch, Late filing, Under-reporting, etc.)  
Deadlines and penalties  
Reporting officer/office  
Relevant legal sections (e.g., Section 143(1), 271A)  

Keep the numbers normally.  
Respond only in JSON format and in english.
'''

        response = model.generate_content(prompt)
        return jsonify({"json": response.text.strip()})

    except Exception as e:
        return jsonify({"error": "Gemini API Error", "details": str(e)}), 500

    finally:
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
