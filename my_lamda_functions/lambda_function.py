import boto3
import json
import base64

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    try:
        # Parse the body from the event
        body = event['body']
        base64_string = body['image']
        category = body['category']
        name = body['name']
        bucket_name = "mycppproject23384069"

        # Decode the base64 string
        decoded_image = base64.b64decode(base64_string)

        # Create object key (S3 path)
        object_key = f"{category}/{name}.txt"

        # Upload the file to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key=object_key,
            Body=decoded_image,
            ContentType='text/plain'
        )

        return {
            'statusCode': 200,
            'body': 'Product image uploaded successfully'
        }

    except Exception as e:
        print(f"Error uploading Product image: {e}")
        return {
            'statusCode': 500,
            'body': 'Error uploading Product image'
        }
