
import logging
import boto3
from botocore.exceptions import ClientError



class MyMessageQueue:
    """create and Delete queue"""
    
    def create_queue(self, queue_name):
        
        try:
            sqs_client = boto3.client('sqs')
            response = sqs_client.create_queue(QueueName=queue_name)
     
        
        except ClientError as e:
            logging.error(e)
            return False
        return True
        
    
    def delete_queue(self, queue_name):
        
        try:
            sqs_client = boto3.client('sqs')
            # retrive the URL of an existing Amazon SQS queue
            response = sqs_client.get_queue_url(QueueName=queue_name)
            queue_url = response['QueueUrl']
            response = sqs_client.delete_queue(QueueUrl=queue_url)
        
            
        except ClientError as e:
            logging.error(e)
            return False
        return True
        
        
        
