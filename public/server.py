from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'filmDirectorAI'))

from AI import generate_directing_plan

app = Flask(__name__)
CORS(app)

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    theme = data.get('theme', '')
    plot = data.get('plot', '')
    genre = data.get('genre', 'Drama')
    duration = data.get('duration', '10:00')
    
    final_plot = plot if plot else theme
    
    try:
        result = generate_directing_plan(final_plot, duration, genre)
        
        return jsonify({
            'success': True,
            'result': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
