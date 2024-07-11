from flask import Flask, jsonify, request
from flask_cors import CORS
import boto3
from datetime import datetime


# Initializing flask app
app = Flask(__name__)
CORS(app)




# AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
# AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
# REGION_NAME = os.getenv("REGION_NAME")

# def get_parameter(name):
#     ssm = boto3.client('ssm', region_name='us-east-2')  # Replace with your region
#     response = ssm.get_parameter(
#         Name=name,
#         WithDecryption=True
#     )
#     return response['Parameter']['Value']

# # Retrieve credentials from AWS Parameter Store
# REGION_NAME = get_parameter('/dino-game/aws/REGION_NAME')
# print(REGION_NAME )
# AWS_SECRET_ACCESS_KEY = get_parameter('/dino-game/aws/AWS_SECRET_ACCESS_KEY')
# AWS_ACCESS_KEY_ID = get_parameter('/dino-game/aws/AWS_ACCESS_KEY_ID')




# Initialize DynamoDB resource
# resource = boto3.resource(
#     'dynamodb', 
#     aws_access_key_id=AWS_ACCESS_KEY_ID, 
#     aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
#     region_name=REGION_NAME
# )
resource = boto3.resource(
    'dynamodb', region_name='us-east-2'
)
LeaderboardTable = resource.Table('Leaderboard')


#client = boto3.client('dynamodb', aws_access_key_id = AWS_ACCESS_KEY_ID, aws_secret_access_key = AWS_SECRET_ACCESS_KEY,region_name = REGION_NAME)
# resource = boto3.resource('dynamodb', aws_access_key_id = AWS_ACCESS_KEY_ID, aws_secret_access_key = AWS_SECRET_ACCESS_KEY,region_name = REGION_NAME)
# LeaderboardTable = resource.Table('Leaderboard')


@app.route('/')
def home():
    return "<h1>Hey lol2!</h1>"

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    # Replace with actual database call
    leaderboard = [
        {'rank': 1, 'score': 120},
        {'rank': 2, 'score': 90},
        {'rank': 3, 'score': 75}
    ]
    return jsonify(leaderboard)

@app.route('/write', methods=['POST'])
def write_to_dynamodb():
    data = request.get_json()
    
    # Add current timestamp
    data['CreatedAt'] = datetime.strftime(datetime.now(), '%Y-%m-%dT%H:%M:%SZ')

    
    # Ensure score is an integer
    data['Score'] = int(data['Score'])
    
    # Insert into DynamoDB
    LeaderboardTable.put_item(Item=data)
    
    return jsonify({"message": "Item inserted successfully"}), 200


@app.route('/read', methods=['GET'])
def read_from_dynamodb():
    response = LeaderboardTable.scan()
    items = response['Items']
    
    # Convert Decimal objects to float for JSON serialization
    for item in items:
        item['Score'] = int(item['Score'])
    
    # Sort items by Score in descending order
    sorted_items = sorted(items, key=lambda x: x['Score'], reverse=True)
    
    # Get top 3 items
    top_3_items = sorted_items[:3]
    
    return jsonify(top_3_items), 200
    
# Running app
if __name__ == '__main__':
    app.run(debug=True)
