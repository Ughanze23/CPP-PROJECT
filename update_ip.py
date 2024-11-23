import boto3
import requests
import json

def get_github_ip_ranges():
    """Fetch GitHub Actions IP ranges from GitHub API"""
    response = requests.get('https://api.github.com/meta')
    return response.json()['actions']

def update_security_group(security_group_id, region='us-east-1'):
    """Update security group with GitHub Actions IP ranges"""
    ec2 = boto3.client('ec2', region_name=region)
    
    # Get existing rules to avoid duplicates
    existing_rules = []
    sg_info = ec2.describe_security_groups(GroupIds=[security_group_id])
    
    if sg_info['SecurityGroups']:
        for rule in sg_info['SecurityGroups'][0]['IpPermissions']:
            if rule.get('IpRanges'):
                existing_rules.extend([r['CidrIp'] for r in rule['IpRanges']])

    # Get GitHub IP ranges
    github_ranges = get_github_ip_ranges()
    
    # Add new IP ranges
    for ip_range in github_ranges:
        if ip_range not in existing_rules:
            try:
                ec2.authorize_security_group_ingress(
                    GroupId=security_group_id,
                    IpPermissions=[
                        {
                            'IpProtocol': 'tcp',
                            'FromPort': 443,  # Adjust ports as needed
                            'ToPort': 443,
                            'IpRanges': [
                                {
                                    'CidrIp': ip_range,
                                    'Description': 'GitHub Actions'
                                }
                            ]
                        }
                    ]
                )
                print(f"Added rule for {ip_range}")
            except ec2.exceptions.ClientError as e:
                if e.response['Error']['Code'] == 'InvalidPermission.Duplicate':
                    print(f"Rule for {ip_range} already exists")
                else:
                    print(f"Error adding {ip_range}: {str(e)}")

if __name__ == "__main__":
    # Replace with your security group ID
    SECURITY_GROUP_ID = 'sg-031699e0b573f66b4'
    # Replace with your desired AWS region
    AWS_REGION = 'eu-west-1'
    
    update_security_group(SECURITY_GROUP_ID, AWS_REGION)