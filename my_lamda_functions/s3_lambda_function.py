import boto3
import json
import base64

s3_client = boto3.client('s3')
name_prefix = "mycppproject23384069"

def lambda_handler(event, context):
    try:
 
        body = json.loads(event.get('body', '{}'))
        http_method = body.get('httpMethod')  # Get HTTP method

        if http_method == "POST" and body.get('option') == "category":
            try:
                name = body['name']
                bucket_name = f"{name_prefix}-{name}"

                # Create S3 bucket
                s3_client.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': 'eu-west-1'}
                )
                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': f"Bucket '{bucket_name}' created successfully"})
                }
            except Exception as e:
                print(f"Error creating bucket: {e}")
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': 'Error creating bucket'})
                }

        elif http_method == "POST" and body.get('option') == "product":
            try:
                base64_string = body['image']
                category = body['category']
                name = body['name']

                bucket_name = f"{name_prefix}-{category}"
                object_key = f"{name}.txt"

                # Decode and upload image to S3
                decoded_image = base64.b64decode(base64_string)
                s3_client.put_object(
                    Bucket=bucket_name,
                    Key=object_key,
                    Body=decoded_image,
                    ContentType='text/plain'
                )
                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'Product image uploaded successfully'})
                }
            except Exception as e:
                print(f"Error uploading product image: {e}")
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': 'Error uploading product image'})
                }

        elif http_method == "DELETE" and body.get('option') == "category":
            try:
                name = body['name']
                bucket_name = f"{name_prefix}-{name}"

                # First, delete all objects in the bucket
                response = s3_client.list_objects_v2(Bucket=bucket_name)
                if response.get('KeyCount', 0) > 0:
                    print(f"Deleting objects from bucket '{bucket_name}'...")
                    for content in response['Contents']:
                        object_key = content['Key']
                        print(f"Deleting object: {object_key}")
                        s3_client.delete_object(Bucket=bucket_name, Key=object_key)
                    print(f"All objects deleted from bucket '{bucket_name}'.")

                # Delete the bucket itself
                s3_client.delete_bucket(Bucket=bucket_name)
                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': f"Bucket '{bucket_name}' deleted successfully"})
                }
            except Exception as e:
                print(f"Error deleting bucket: {e}")
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': 'Error deleting bucket'})
                }

        elif http_method == "DELETE" and body.get('option') == "product":
            try:
                category = body['category']
                name = body['name']

                bucket_name = f"{name_prefix}-{category}"
                object_key = f"{name}.txt"

                # Delete object from S3 bucket
                s3_client.delete_object(Bucket=bucket_name, Key=object_key)
                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': f"Object '{object_key}' deleted successfully from bucket '{bucket_name}'"})
                }
            except Exception as e:
                print(f"Error deleting product object: {e}")
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': 'Error deleting product object'})
                }

        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid request or option'})
            }

    except Exception as e:
        print(f"Error processing request: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
