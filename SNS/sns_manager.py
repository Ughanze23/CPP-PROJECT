import logging
import boto3
from botocore.exceptions import ClientError


logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")


class SnsManager:
    """Interact with AWS SNS resource"""

    def __init__(self) -> None:
        
        self.sns_client = self._create_sns_client()

    def _create_sns_client(self) -> object:
        """Creates a AWS sns client object

        Returns:
        Object : returns a AWS sns client object
        """
        try:
            sns_client = boto3.client('sns')
            logging.info(
                f"Successfully connected to AWS s3 resource"
            )
            return sns_client

        except ClientError as e:
            logging.error(f"Error connecting to AWS: {e}")
            raise e
        
    def create_sns_topic(self,topic_name) -> str:
        """Creates a sns topic
        
        Returns:
        str : returns a AWS sns topic arn
        """
        try:
            response = self.sns_client.create_topic(Name=topic_name)
            logging.info(f"Successfully created topic: {topic_name}")
            return response['TopicArn']
            
        except ClientError as e:
            logging.error(f"Error creating sns topic : {e}")
            return False

    def delete_sns_topic(self,topic_name):
        """deletes a sns topic"""

        try:
            topic_arn = self.create_sns_topic(topic_name)
        
        except ClientError as e:
            logging.error(f"Error deleteing sns topic {topic_name} : {e}")
        
    
    def create_subscriber(self, topic_arn: str, email: str) -> bool:
        """Subscribes an email address to an SNS topic.
        Returns:
        bool: True if the subscription is successful, False otherwise.
        """
        try:
            response = self.sns_client.subscribe(
                TopicArn=topic_arn,
                Protocol='email',
                Endpoint=email
            )
            subscription_arn = response.get('SubscriptionArn')
            if subscription_arn:
                logging.info(
                    f"Successfully subscribed {email} to topic {topic_arn}. SubscriptionArn: {subscription_arn}"
                )
                return True
            else:
                logging.warning(
                    f"Subscription request sent to {email}. Confirm the subscription via the email."
                )
                return True
        except ClientError as e:
            logging.error(f"Error subscribing {email} to topic {topic_arn}: {e}")
            return False

    
