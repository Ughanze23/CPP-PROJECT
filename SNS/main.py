import argparse
from sns_manager import SnsManager
import logging

def main(topic_name, email):
    sns_manager = SnsManager()
    
    # Create a topic
    topic_arn = sns_manager.create_sns_topic(topic_name)
    if topic_arn:
        logging.info(f"Topic created with ARN: {topic_arn}")
        
        # Subscribe an email address
        if sns_manager.create_subscriber(topic_arn, email):
            logging.info(f"Subscription request for {email} sent successfully.")
        else:
            logging.error(f"Failed to subscribe {email}.")

if __name__ == "__main__":
    # Configure argument parser
    parser = argparse.ArgumentParser(description="Create an SNS topic and subscribe an email address.")
    parser.add_argument("--topic_name", required=True, help="Name of the SNS topic to create.")
    parser.add_argument("--email", required=True, help="Email address to subscribe to the SNS topic.")
    
    
    args = parser.parse_args()
    
    # Call the main function 
    main(args.topic_name, args.email)
