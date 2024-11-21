import boto3
import json
from django.conf import settings

class InventoryOptimizationQueue:
    def __init__(self, queue_url, region_name='eu-west-1'):
        self.sqs = boto3.client('sqs', region_name=region_name,
                                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        self.queue_url = queue_url

    def queue_product_id(self, product_id):
        """send product_id to queue for processing inventory level data"""
        try:
            message = {'product_id': product_id}
            response = self.sqs.send_message(
                QueueUrl=self.queue_url,
                MessageBody=json.dumps(message)
            )
            return response['MessageId']
        except Exception as e:
            print(f"Error queueing product {product_id}: {e}")
            return None