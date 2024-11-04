from s3_manager_package_nci_23384069 import S3Manager
import json


def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        base64_string = body['image']
        category = body['category']
        name = body['name']
        bucket_name =  "cpp-23384069"

        # Create S3 Manager instance
        s3_manager = S3Manager()

        # Create object key
        object_key = f"{category}/{name}.txt"

        # Upload the base64 string to S3
        s3_manager.upload_base64_file(base64_string,bucket_name, object_key)

        return {
            'statusCode': 200,
            'body': f'Product image uploaded successfully'
        }

    except Exception as e:
        print(f"Error uploading Product image: {e}")
        return {
            'statusCode': 500,
            'body': 'Error uploading Product image'
        }