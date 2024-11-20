import json
import psycopg2
import boto3
import logging
from botocore.exceptions import ClientError
from inventory_optimizer import InventoryOptimizer
import os
from datetime import datetime

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")

def lambda_handler(event, context):
    conn = None
    new_notifications_count = 0
    
    try:
        logging.info("Connecting to database...")
        conn = psycopg2.connect(
            dbname=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            host=os.environ['DB_HOST']
        )
        cursor = conn.cursor()
        logging.info("Database connection successful")
        
        for record in event['Records']:
            receipt_handle = record['receiptHandle']
            message = json.loads(record['body'])
            product_id = message['product_id']
            
            # Get current stock
            cursor.execute("""
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN status IN ('ADD', 'RETURN') THEN quantity
                        WHEN status IN ('REMOVE', 'ADJUST') THEN -quantity
                    END
                ), 0)
                FROM api_inventory 
                WHERE product_id = %s
            """, (product_id,))
            current_stock = cursor.fetchone()[0]
            
            # Get sales data
            cursor.execute("""
                SELECT created_at, quantity 
                FROM api_inventory 
                WHERE product_id = %s 
                AND status = 'REMOVE'
                AND created_at >= NOW() - INTERVAL '7 days'
            """, (product_id,))
            sales_data = cursor.fetchall()
            
            optimizer = InventoryOptimizer()
            recommendations = optimizer.generate_recommendations(
                product_id=product_id,
                sales_data=sales_data,
                current_stock=current_stock
            )
            
            if recommendations['needs_reorder']:
                logging.info(f"Creating notification for product {product_id}")
                cursor.execute("""
                    INSERT INTO api_notification 
                    (product_name_id, type, status, created_at, updated_at, notes)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    product_id,
                    'STOCK_ISSUE',
                    'OPEN',
                    datetime.now(),
                    datetime.now(),
                    f"Stock Alert: Current stock ({current_stock}) is below reorder point ({recommendations['reorder_point']}). "
                    f"Recommended order: {recommendations['recommended_order']} units"
                ))
                new_notifications_count += 1
            
            # Delete processed message
            sqs = boto3.client('sqs')
            sqs.delete_message(
                QueueUrl=os.environ['AWS_SQS_QUEUE_URL'],
                ReceiptHandle=receipt_handle
            )
            
            conn.commit()
        
        # Send SNS notification if new alerts were created
        if new_notifications_count > 0:
            sns_client = boto3.client('sns')
            topic_arn = os.environ['SNS_TOPIC_ARN']
            message = f"{new_notifications_count} product(s) require restocking."
            subject = "Stock Level Alert"
            
            logging.info(f"Sending SNS notification to topic: {topic_arn}")
            try:
                sns_client.publish(
                    TopicArn=topic_arn,
                    Message=message,
                    Subject=subject
                )
                logging.info("SNS notification sent successfully")
            except ClientError as e:
                logging.error(f"Failed to send SNS notification: {e}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Processing complete', 'notifications_created': new_notifications_count})
        }
        
    except Exception as e:
        logging.error(f"Error: {str(e)}", exc_info=True)
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
        
    finally:
        if conn:
            cursor.close()
            conn.close()
            logging.info("Database connection closed")