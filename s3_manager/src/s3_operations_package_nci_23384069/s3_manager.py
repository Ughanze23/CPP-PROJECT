import logging
import boto3
from botocore.exceptions import ClientError
import base64
import io

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")


class S3Manager:
    """Interact with AWS s3 resource"""

    def __init__(self) -> None:
        
        self.s3_client = self._create_s3_client()

    def _create_s3_client(self) -> object:
        """Creates a AWS s3 client object

        Returns:
        Object : returns a AWS s3 client object
        """
        try:
            s3_client = boto3.client('s3')
            logging.info(
                f"Successfully connected to AWS s3 resource"
            )
            return s3_client

        except ClientError as e:
            logging.error(f"Error connecting to AWS: {e}")
            raise e
            
    def create_s3_bucket(self,bucket_name,region=None) -> bool:
        """Create an S3 bucket in a specified region

        If a region is not specified, the bucket is created by default in the region (us-east-1).
        Args:
            bucket_name: Bucket to create
            region: String region to create bucket in, e.g., 'us-west-2'
        Returns: 
        bool: True if bucket created, else False
        """

        # Create bucket
        try:
            if region is None:
                self.s3_client.create_bucket(Bucket=bucket_name)
                logging.info(f"Bucket:{bucket_name} created successfully")
            else:
                self.s3_client = boto3.client('s3', region_name=region)
                location = {'LocationConstraint': region}
                self.s3_client.create_bucket(Bucket=bucket_name,
                                    CreateBucketConfiguration=location)
                logging.info(f"Bucket:{bucket_name} created successfully")
        except ClientError as e:
            logging.error(f"Error creating bucket:{bucket_name} :{e}")
            return False
        return True
    
    

    def list_buckets(self)-> None:
        """ Retrieve the list of existing buckets """
        
        response = self.s3_client.list_buckets()

        # Output the bucket names
        print('Existing buckets:')
        for bucket in response['Buckets']:
            print('\t', bucket["Name"])
    
    
    def upload_file(self,file_name, bucket, object_key=None) -> bool:
        """Upload a file to an S3 bucket

        Args:
        file_name: File to upload
        bucket: Bucket to upload to
        object_key: S3 object key. If not specified then file_name is used
        Returns: 
        bool: True if file was uploaded, else False
        """

        # If S3 key was not specified, use file_name
        if object_key is None:
            object_key = file_name

        # Upload the file
        try:
            self.s3_client.upload_file(file_name, bucket, object_key)
            logging.info(f"File: {file_name} successfully uploaded to bucket: {bucket}")
        except ClientError as e:
            logging.error(f"issue with uploading File {file_name}: {e}")
            return False
        return True
    
    def upload_base64_file(self, base64_string, bucket, object_key=None):
        """Upload a base64 encoded string to an S3 bucket

        Args:
            base64_string: The base64 encoded string to upload
            bucket: Bucket to upload to
            object_key: S3 object key. If not specified, a default key will be used

        Returns:
            bool: True if the file was uploaded successfully, False otherwise
        """

        # Decode the base64 string into bytes
        decoded_bytes = base64.b64decode(base64_string)

        # Create a BytesIO object to represent the file-like object
        file_obj = io.BytesIO(decoded_bytes)

        # If object key is not specified, use a default key
        if object_key is None:
            object_key = "base64_file"

        try:
            response = self.s3_client.upload_fileobj(file_obj, bucket, object_key)
            logging.info(f"Base64 string successfully uploaded to bucket: {bucket} as {object_key}")
            return True
        except ClientError as e:
            logging.error(f"Issue with uploading base64 string: {e}")
            return False
    
    
    def delete_object(self,region, bucket_name, object_key)-> None:
        """Delete a given object from an S3 bucket
        
        Args:
        region: bucket region
        bucket_name: name of the bucket
        object_key: object identifier in s3 bucket
        """
        try:
            self.s3_client.delete_object(Bucket=bucket_name, Key=object_key)
            logging.info(f"Object {object_key} deleted successfully")
            return True

        except Exception as e:
            logging.error(f"Error trying to delete object: {object_key} : {e}")
            return False

    def delete_bucket(self,region, bucket_name) -> None:
        """Delete a given S3 bucket

        Args:
        region : region of the bucket
        bucket_name: name of of the bucket
        """
  
        # first delete all the objects from a bucket, if any objects exist
        response = self.s3_client.list_objects_v2(Bucket=bucket_name)
        if response['KeyCount'] != 0:
            for content in response['Contents']:
                object_key = content['Key']
                logging.info('\t Deleting object...', object_key)
                self.s3_client.delete_object(Bucket=bucket_name, Key=object_key)


        # delete the bucket
        logging.info('\t Deleting bucket...', bucket_name)
        try:
            response = self.s3_client.delete_bucket(Bucket=bucket_name)
            logging.info(f"Bucket:{bucket_name} deleted successfully")
            return True
        except Exception as e:
            logging.error(f"Error deletiing bucket:{bucket_name}: {e}")
            return False
    
    def download_s3_object(self,bucket,object_key,destination_file_name) -> None:
        """Download an Object to filesystem
        
        Args:
        bucket: bucket name
        object: object identifier in s3 bucket
        destination_file_name: filename or path of downloaded file
        """
        try:
            self.s3_client.download_file(Bucket=bucket, Key=object_key, Filename=destination_file_name)
            logging.info(f"{object_key} downloaded successfully...")
        except Exception as e:
            logging.error(f"Error downloading file:{object_key} :{e}")

    def download_s3_object_to_base64(self, bucket, object_key) -> str:
        """Downloads an S3 object and returns its content as a base64 string

            Args:
                bucket: Bucket name
                object_key: Object identifier in S3 bucket

            Returns:
                str: The downloaded object content as a base64 string
         """

        try:
            # Create a BytesIO object to store the downloaded content
            file_obj = io.BytesIO()
            self.s3_client.download_fileobj(Bucket=bucket, Key=object_key, Fileobj=file_obj)
            file_obj.seek(0)  
            
            # Read the bytes from the file-like object
            bytes_data = file_obj.read()

            # Encode the bytes to a base64 string
            base64_string = base64.b64encode(bytes_data).decode('utf-8')

            return base64_string
        except Exception as e:
            logging.error(f"Error downloading object {object_key} from bucket {bucket}: {e}")
            return None


    def enable_versioning_on_bucket(self,bucket) -> None:
        """Version an S3 bucket 
        
        Args;
        bucket: name of bucket in S3
        """

        try:
            response = self.s3_client.put_bucket_versioning(
                Bucket=bucket,
                VersioningConfiguration={
                    'Status': 'Enabled'
                        },
                )
            logging.info(f"Versioning applied to bucket:{bucket}")
            print(response)
        except Exception as e:
            logging.error(f"Error versioning bucket: {bucket}: {e}")
        
    
    def list_objects_in_bucket(self,bucket) -> list:
        """list objects in s3 bucket
        
        Args:
        bucket: name of the bucket
        
        Returns:
        list : list of buckets in object
        """
        
        try:
            response = self.s3_client.list_objects_v2(Bucket=bucket)
            logging.info(f"{len(response.get("Contents",[]))} objects found in bucket:{bucket}")
            if response["KeyCount"] != 0:
                for index,content in enumerate(response["Contents"], start=1):
                    object_key = content["Key"]
                    print(f"{index}:{object_key}")
            
            else:
                print(f"The bucket:{bucket} is empty")
            return response.get('Contents',[])
        except Exception as e:
            logging.error(f"Error returning objects in bucket:{bucket} : {e}")
            return []
        