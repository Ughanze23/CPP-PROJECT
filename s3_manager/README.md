S3Manager - A Python Package for Interacting with AWS S3

This Python package, S3Manager, provides a convenient way to interact with Amazon S3 buckets and objects. It offers functionalities for creating, managing, uploading, downloading, and deleting buckets and objects.

Installation

To install the S3Manager package, you can use pip

Bash
pip install pip install s3_manager_package_nci_23384069


Usage

1. Import the S3Manager Class:
from s3_manager_package_nci_23384069 import S3Manager

2. Create an S3Manager Object:
s3_manager = S3Manager()

3. Interact with S3 Buckets and Objects:
The S3Manager class provides various methods for managing S3 resources. Here are some examples:
* Creating a Bucket:
bucket_name = "my-bucket"
region = "us-west-2"  # Optional, defaults to us-east-1

s3_manager.create_s3_bucket(bucket_name, region)

* Listing Existing Buckets:
s3_manager.list_buckets()

* Uploading a File:
file_name = "data.txt"
bucket_name = "my-bucket"
object_key = "data/processed.txt"  # Optional, defaults to file_name

s3_manager.upload_file(file_name, bucket_name, object_key)

* Uploading a Base64 Encoded String:
base64_string = "your_base64_encoded_data"
bucket_name = "my-bucket"
object_key = "data.txt"  # Optional

s3_manager.upload_base64_file(base64_string, bucket_name, object_key)

* Downloading an Object (Saving to File):
bucket_name = "my-bucket"
object_key = "data.txt"
destination_file_name = "downloaded_data.txt"

s3_manager.download_s3_object(bucket_name, object_key, destination_file_name)
Downloading an Object (Returning Base64 String):
bucket_name = "my-bucket"
object_key = "data.txt"

base64_data = s3_manager.download_s3_object_to_base64(bucket_name, object_key)

if base64_data:
    print(f"Downloaded base64 data: {base64_data}")
else:
    print("Error downloading object")

* Deleting a Bucket:
bucket_name = "my-bucket"
region = "us-west-2"  # Optional, region where the bucket resides

s3_manager.delete_bucket(region, bucket_name)
