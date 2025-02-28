from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)

def calculate_metrics(data, domain):
    values = [entry[domain] for entry in data]
    if not values:
        return None
    
    mean_progress = np.mean(values)
    final_progress = values[-1]
    volatility = np.std(values)
    
    # Calculate trend
    if len(values) > 1:
        trend = (values[-1] - values[0]) / len(values)
    else:
        trend = 0
    
    return {
        'mean_progress': float(mean_progress),
        'final_progress': float(final_progress),
        'volatility': float(volatility),
        'trend': float(trend)
    }

def generate_insights(metrics, domain):
    if not metrics:
        return []
    
    insights = []
    
    # Volatility insights
    if metrics['volatility'] > 2.0:
        insights.append({
            'type': 'warning',
            'message': f'High volatility detected in {domain}. Consider establishing more consistent routines.'
        })
    elif metrics['volatility'] < 0.5:
        insights.append({
            'type': 'success',
            'message': f'Excellent stability in {domain}. Keep maintaining this consistent progress!'
        })
    
    # Progress insights
    if metrics['trend'] > 0.5:
        insights.append({
            'type': 'success',
            'message': f'Strong positive trend in {domain}. Your efforts are paying off!'
        })
    elif metrics['trend'] < -0.5:
        insights.append({
            'type': 'warning',
            'message': f'Declining trend in {domain}. Consider reviewing your approach.'
        })
    
    return insights

def generate_suggestions(metrics, domain):
    if not metrics:
        return []
    
    suggestions = []
    
    # Volatility-based suggestions
    if metrics['volatility'] > 2.0:
        suggestions.append({
            'domain': domain,
            'type': 'stability',
            'action': f'Create a daily routine for {domain.lower()} activities',
            'description': 'High variability can be reduced by establishing consistent habits.'
        })
    
    # Progress-based suggestions
    if metrics['trend'] < 0:
        suggestions.append({
            'domain': domain,
            'type': 'improvement',
            'action': f'Set smaller, achievable goals for {domain.lower()}',
            'description': 'Breaking down progress into smaller steps can help reverse negative trends.'
        })
    
    return suggestions

@app.route('/api/analyze', methods=['POST'])
def analyze_progress():
    data = request.json
    entries = data.get('entries', [])
    
    domains = ['health', 'mental', 'social', 'career', 'growth']
    analysis = {}
    
    for domain in domains:
        metrics = calculate_metrics(entries, domain)
        if metrics:
            analysis[domain] = {
                'metrics': metrics,
                'insights': generate_insights(metrics, domain),
                'suggestions': generate_suggestions(metrics, domain)
            }
    
    return jsonify({
        'status': 'success',
        'data': analysis
    })

if __name__ == '__main__':
    app.run(debug=True) 