def lambda_handler(event, context):
    conn = None
    new_notifications_count = 0
    
    try:
      
        conn = psycopg2.connect(
            dbname=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            host=os.environ['DB_HOST'],
            port="5432"
        )
        cursor = conn.cursor()
        logging.info("Database connection successful")
        
        for record in event['Records']:
            receipt_handle = record['receiptHandle']
            message = json.loads(record['body'])
            product_id = message['product_id']
            
            # Simplified current stock query
            cursor.execute("""
                SELECT SUM(quantity) 
                FROM api_inventory 
                WHERE product_id = %s
                GROUP BY product_id
            """, (product_id,))
            current_stock_result = cursor.fetchone()
            current_stock = current_stock_result[0] if current_stock_result else 0
            
            # Get sales data from order items
            cursor.execute("""
                SELECT oi.quantity 
                FROM api_orderitem oi
                JOIN api_order o ON oi.order_id = o.id
                WHERE oi.product_id = %s 
                AND o.status = 'DELIVERED'
                AND o.order_date >= NOW() - INTERVAL '7 days'
            """, (product_id,))
            delivered_quantities = cursor.fetchall()
            
            optimizer = InventoryOptimizer()
            recommendations = optimizer.generate_recommendations(
                product_id=product_id,
                delivered_quantities=delivered_quantities,
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
                    f"Recommended order: {recommendations['recommended_order']} units based on 7-day sales average of {recommendations['daily_average_usage']} units/day"
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
            message = f"{new_notifications_count} product(s) require restocking based on recent sales analysis."
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
                
    except Exception as e:
        logging.error(f"Error: {str(e)}", exc_info=True)
        if conn:
            conn.rollback()
        
    finally:
        if conn:
            cursor.close()
            conn.close()
            logging.info("Database connection closed")