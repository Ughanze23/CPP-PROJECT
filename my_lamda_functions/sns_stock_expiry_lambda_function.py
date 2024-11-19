import psycopg2
import boto3
import logging
from botocore.exceptions import ClientError
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")

def lambda_handler(event, context):
    conn = None
    try:
        # Connect to the database
        logging.info("Connecting to the database...")
        conn = psycopg2.connect(
            host="database-1.cvhifpi70v8r.us-east-1.rds.amazonaws.com",
            database="cpp",
            user="postgres",
            password="$uperBoy2024",
            port="5432"
        )
        cursor = conn.cursor()
        logging.info("Database connection successful.")

        # Check inventory table for expiry dates within 30 days
        today = datetime.now().date()
        expiry_threshold = today + timedelta(days=30)

        logging.info(f"Querying inventory for items expiring between {today} and {expiry_threshold}.")
        query = """
            SELECT i.id as inv_id, i.batch_id, i.expiry_date, p.id as product_id 
            FROM api_inventory i
            INNER JOIN api_product p ON i.product_id = p.id
            WHERE i.expiry_date BETWEEN %s AND %s
        """
        cursor.execute(query, (today, expiry_threshold))
        inventory_records = cursor.fetchall()
        logging.info(f"Retrieved {len(inventory_records)} records from inventory.")

        # Count of records to be inserted
        new_notifications_count = 0

        # Check if record exists in notifications table
        for inv_id, batch_id, expiry_date, product_id in inventory_records:
            logging.debug(f"Checking if batch_id {inv_id} already exists in notifications.")
            cursor.execute("SELECT batch_id_id FROM api_notification WHERE batch_id_id = %s", (inv_id,))
            if not cursor.fetchone():
                logging.info(f"Inserting new notification for batch_id {inv_id}.")
                cursor.execute("""
                    INSERT INTO api_notification 
                    (batch_id_id, type, product_name_id, status, created_at, updated_at, notes)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    inv_id,
                    "STOCK_EXPIRY",
                    product_id,
                    "OPEN",
                    datetime.now(),
                    datetime.now(),
                    "Create plan to clear out stock."
                ))
                new_notifications_count += 1

        # Commit the transaction
        conn.commit()
        logging.info(f"Inserted {new_notifications_count} new notifications into the database.")

        # Send email notification if new records were added
        if new_notifications_count > 0:
            sns_client = boto3.client('sns')
            topic_arn = "arn:aws:sns:eu-west-1:339712727128:MyStockLevelTopic"
            message = f"{new_notifications_count} item(s) in our warehouse are expiring in 30 days."
            subject = "Stock Expiry Alert"

            logging.info(f"Sending SNS notification to topic: {topic_arn}")
            try:
                sns_client.publish(
                    TopicArn=topic_arn,
                    Message=message,
                    Subject=subject
                )
                logging.info("SNS notification sent successfully.")
            except ClientError as e:
                logging.error(f"Failed to send SNS notification: {e}")
    except Exception as e:
        logging.error(f"Error: {str(e)}", exc_info=True)
    finally:
        if conn:
            cursor.close()
            conn.close()
            logging.info("Database connection closed.")
