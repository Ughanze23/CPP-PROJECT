# CPP-PROJECT
# Cloud Platform Project (CPP)

> FMCG Order management cloud native web application leveraging AWS serverless architecture and event-driven design

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Ughanze23/CPP-PROJECT)
[![Project Report](https://img.shields.io/badge/Report-Google%20Drive-green)](https://drive.google.com/file/d/14_afWEFO1cCxO7o11jGpk5X13k4yfsXP/view?usp=drive_link)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [AWS Services Integration](#aws-services-integration)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Event-Driven Workflow](#event-driven-workflow)
- [Monitoring & Logging](#monitoring--logging)
- [Documentation](#documentation)
- [Cost Optimization](#cost-optimization)
- [Contributing](#contributing)

## 🎯 Overview

The Cloud Platform Programming Project (CPP) is a sophisticated inventory optimization system built on AWS serverless architecture. This project demonstrates enterprise-level cloud engineering practices, focusing on scalability, cost-efficiency, and event-driven microservices architecture.

The system intelligently manages inventory across multiple locations, processes real-time data streams, and provides actionable insights through automated optimization alerts. It showcases the power of AWS managed services in building resilient, scalable cloud applications.

### Key Objectives

- **Scalability**: Handle variable workloads with auto-scaling capabilities
- **Cost Efficiency**: Leverage serverless computing to minimize infrastructure costs
- **Real-time Processing**: Process inventory events in near real-time
- **Reliability**: 99.9% uptime with fault-tolerant architecture
- **Automation**: Fully automated deployment and operations

## 🏗️ Architecture

The application implements a serverless, event-driven architecture using AWS services:

### System Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│   Backend    │─────▶│     S3       │
│  (React/JS)  │      │   (Python)   │      │   Storage    │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │     SNS      │
                      │ Notification │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐      ┌──────────────┐
                      │     SQS      │─────▶│   Lambda     │
                      │    Queue     │      │  Functions   │
                      └──────────────┘      └──────┬───────┘
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │  Inventory   │
                                            │  Optimizer   │
                                            └──────────────┘
```

### Architecture Principles

- **Microservices**: Loosely coupled, independently deployable services
- **Event-Driven**: Asynchronous communication via SNS/SQS
- **Serverless**: No server management, pay-per-use pricing
- **Scalable**: Automatic scaling based on demand
- **Resilient**: Built-in redundancy and fault tolerance

## ✨ Features

### Core Functionality

#### Inventory Management
- Real-time inventory tracking across multiple locations
- Automated stock level monitoring and alerts
- Predictive analytics for demand forecasting
- Historical data analysis and reporting

#### Optimization Engine
- **Demand Forecasting**: Predict future inventory needs
- **Automated Reordering**: Trigger purchase orders based on thresholds
- **Stock Balancing**: Optimize distribution across locations
- **Cost Minimization**: Reduce holding and ordering costs
- **Performance Metrics**: Track KPIs and optimization success

#### Event Processing
- Real-time event ingestion via SQS
- Asynchronous processing with Lambda functions
- Event replay and dead-letter queue handling
- Message deduplication and ordering
- Scalable event processing pipeline

### Advanced Features

- **Notification System**: Real-time alerts via SNS (email, SMS, webhooks)
- **S3 Integration**: Secure storage for reports and data archives
- **API Gateway**: RESTful API with authentication and rate limiting
- **CloudWatch Integration**: Comprehensive monitoring and logging
- **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions

## 🔧 AWS Services Integration

### Amazon S3 (Simple Storage Service)
**Purpose**: Object storage for data, reports, and backups

**Implementation**:
- **Bucket Structure**: Organized by environment and data type
- **Lifecycle Policies**: Automatic archival to reduce costs
- **Versioning**: Maintain historical data versions
- **Encryption**: Server-side encryption (SSE-S3/KMS)
- **Access Control**: IAM policies and bucket policies

**Use Cases**:
- Storing inventory reports (CSV, JSON, Excel)
- Archiving transaction logs
- Hosting static web content
- Data lake for analytics

### Amazon SNS (Simple Notification Service)
**Purpose**: Pub/Sub messaging for event notifications

**Implementation**:
- **Topics**: Separate topics for different event types
- **Subscriptions**: Email, SMS, SQS, Lambda endpoints
- **Message Filtering**: Route messages based on attributes
- **Message Attributes**: Metadata for routing and processing
- **Delivery Retries**: Automatic retry with exponential backoff

**Use Cases**:
- Inventory threshold alerts
- Order confirmation notifications
- System health alerts
- Multi-channel communication

### Amazon SQS (Simple Queue Service)
**Purpose**: Message queuing for asynchronous processing

**Implementation**:
- **Standard Queues**: At-least-once delivery
- **FIFO Queues**: Exactly-once processing with ordering
- **Dead Letter Queues**: Handle failed messages
- **Visibility Timeout**: Prevent duplicate processing
- **Long Polling**: Reduce costs and latency

**Use Cases**:
- Decoupling microservices
- Buffering high-volume events
- Load leveling for Lambda functions
- Retry logic for failed operations

### AWS Lambda
**Purpose**: Serverless compute for event-driven processing

**Implementation**:
- **Multiple Functions**: Specialized functions for different tasks
- **Event Sources**: Triggered by SQS, S3, API Gateway, CloudWatch
- **Environment Variables**: Configuration management
- **Layers**: Shared dependencies and utilities
- **Error Handling**: Dead letter queues and CloudWatch alarms

**Functions**:
- `inventory_processor`: Process inventory update events
- `optimization_engine`: Run optimization algorithms
- `report_generator`: Generate and store reports
- `notification_handler`: Send notifications via SNS

### Additional AWS Services

- **IAM**: Identity and access management
- **CloudWatch**: Monitoring, logging, and alarms
- **API Gateway**: RESTful API management
- **Systems Manager**: Parameter store for secrets
- **CloudFormation/Terraform**: Infrastructure as Code

## 🛠️ Technology Stack

### Frontend
- **JavaScript/React**: Modern UI framework
- **HTML5/CSS3**: Responsive web design
- **Axios**: HTTP client for API calls
- **Chart.js**: Data visualization

### Backend
- **Python 3.8+**: Primary programming language
- **Flask/FastAPI**: Web framework for REST API
- **Boto3**: AWS SDK for Python
- **Pandas**: Data analysis and manipulation
- **NumPy**: Numerical computing
- **SQLAlchemy**: Database ORM (if using RDS)

### DevOps & Infrastructure
- **Docker**: Containerization for local development
- **GitHub Actions**: CI/CD automation
- **AWS CDK/CloudFormation**: Infrastructure as Code
- **Terraform**: Multi-cloud infrastructure management
- **pytest**: Testing framework

### Data & Analytics
- **JSON**: Data interchange format
- **CSV**: Report generation
- **Pandas**: Data processing
- **Scikit-learn**: Machine learning (optional)

## 📁 Project Structure

```
CPP-PROJECT/
├── .github/
│   └── workflows/              # CI/CD pipeline definitions
│       ├── deploy.yml          # Deployment workflow
│       └── test.yml            # Testing workflow
├── backend/                    # Backend application
│   ├── api/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── inventory.py        # Inventory endpoints
│   │   └── reports.py          # Report endpoints
│   ├── models/                 # Data models
│   ├── services/               # Business logic
│   └── requirements.txt        # Python dependencies
├── frontend/                   # Frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API services
│   │   └── utils/              # Utility functions
│   ├── public/                 # Static assets
│   └── package.json            # Node dependencies
├── SNS/                        # SNS configuration
│   ├── topics.json             # Topic definitions
│   └── subscriptions.json      # Subscription configurations
├── SQS/                        # SQS configuration
│   ├── queues.json             # Queue definitions
│   └── policies.json           # Access policies
├── s3_manager/                 # S3 management utilities
│   ├── __init__.py
│   ├── bucket_manager.py       # Bucket operations
│   └── lifecycle.py            # Lifecycle policies
├── my_lamda_functions/         # Lambda function code
│   ├── inventory_processor/    # Process inventory events
│   ├── optimization_engine/    # Run optimizations
│   ├── report_generator/       # Generate reports
│   └── requirements.txt        # Lambda dependencies
├── inventory_optimizer/        # Optimization algorithms
│   ├── __init__.py
│   ├── forecasting.py          # Demand forecasting
│   ├── optimizer.py            # Optimization logic
│   └── models.py               # ML models
├── .gitignore                  # Git ignore rules
├── Dockerfile                  # Container configuration
├── requirements.txt            # Project dependencies
├── update_ip.py                # IP update utility
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **AWS Account**: Active AWS account with appropriate permissions
- **AWS CLI**: Configured with credentials
- **Python**: Version 3.8 or higher
- **Node.js**: Version 14.x or higher
- **Docker**: For local development and testing
- **Git**: Version control

### AWS Setup

1. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region (e.g., us-east-1)
   ```

2. **Create Required Resources**
   ```bash
   # Create S3 bucket
   aws s3 mb s3://cpp-inventory-bucket-[unique-id]
   
   # Create SNS topic
   aws sns create-topic --name inventory-notifications
   
   # Create SQS queue
   aws sqs create-queue --queue-name inventory-events
   ```

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ughanze23/CPP-PROJECT.git
   cd CPP-PROJECT
   ```

2. **Backend Setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Configure environment variables
   # AWS_REGION=us-east-1
   # SNS_TOPIC_ARN=arn:aws:sns:...
   # SQS_QUEUE_URL=https://sqs...
   # S3_BUCKET_NAME=cpp-inventory-bucket
   ```

### Running Locally

#### Using Docker

```bash
# Build the Docker image
docker build -t cpp-project .

# Run the container
docker run -p 5000:5000 \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  cpp-project
```

#### Manual Execution

**Backend API:**
```bash
cd backend
python app.py
# Backend runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

## 📦 Deployment

### Lambda Deployment

1. **Package Lambda Functions**
   ```bash
   cd my_lamda_functions
   zip -r ../my_lamda_functions.zip .
   ```

2. **Deploy to AWS**
   ```bash
   aws lambda update-function-code \
     --function-name inventory-processor \
     --zip-file fileb://my_lamda_functions.zip
   ```

### Infrastructure as Code

**Using AWS CDK:**
```bash
cd infrastructure
cdk deploy
```

**Using Terraform:**
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### CI/CD Deployment

The GitHub Actions workflow automatically deploys to AWS:

1. Push to `main` branch triggers deployment
2. Runs tests and security scans
3. Builds and packages Lambda functions
4. Deploys to AWS using configured credentials
5. Runs smoke tests to verify deployment

## 📖 API Documentation

### Inventory Endpoints

#### Get All Inventory Items
```http
GET /api/inventory
```

**Response:**
```json
{
  "items": [
    {
      "id": "inv-001",
      "product": "Widget A",
      "quantity": 150,
      "location": "Warehouse-1",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Update Inventory
```http
POST /api/inventory/update
```

**Request Body:**
```json
{
  "productId": "inv-001",
  "quantity": 200,
  "location": "Warehouse-1"
}
```

#### Trigger Optimization
```http
POST /api/optimize
```

**Request Body:**
```json
{
  "locations": ["Warehouse-1", "Warehouse-2"],
  "parameters": {
    "forecastDays": 30,
    "safetyStock": 0.2
  }
}
```

### Report Endpoints

#### Generate Report
```http
POST /api/reports/generate
```

#### Download Report
```http
GET /api/reports/{reportId}
```

## 🔄 Event-Driven Workflow

### Typical Event Flow

1. **Inventory Update**
   - User updates inventory via frontend/API
   - Event published to SNS topic
   - SNS forwards to SQS queue

2. **Event Processing**
   - Lambda function triggered by SQS message
   - Processes inventory update
   - Updates database/storage
   - Sends confirmation

3. **Optimization Trigger**
   - Scheduled CloudWatch event
   - Lambda runs optimization algorithm
   - Generates recommendations
   - Stores results in S3

4. **Notification**
   - Critical thresholds detected
   - SNS sends notifications
   - Email/SMS to stakeholders
   - Dashboard updated

### Message Format

**SNS Message:**
```json
{
  "eventType": "inventory.updated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "productId": "inv-001",
    "quantity": 150,
    "location": "Warehouse-1"
  }
}
```

## 📊 Monitoring & Logging

### CloudWatch Metrics

- **Lambda Metrics**: Invocations, errors, duration, concurrent executions
- **SQS Metrics**: Messages sent, received, deleted, queue depth
- **API Metrics**: Request count, latency, error rate
- **Custom Metrics**: Business KPIs, optimization performance

### CloudWatch Logs

- **Application Logs**: Structured logging with JSON format
- **Lambda Logs**: Automatic log groups per function
- **API Gateway Logs**: Request/response logging
- **VPC Flow Logs**: Network traffic analysis (if applicable)

### Alarms

- High error rate on Lambda functions
- SQS queue depth exceeding threshold
- API latency above acceptable limits
- Cost anomalies detected

### Dashboards

Custom CloudWatch dashboards for:
- Real-time system health
- Business metrics and KPIs
- Cost and usage tracking
- Performance trends

## 💰 Cost Optimization

### Strategies Implemented

1. **Serverless Architecture**: Pay only for actual usage
2. **S3 Lifecycle Policies**: Automatic transition to cheaper storage tiers
3. **Lambda Optimization**: Efficient memory allocation and execution time
4. **SQS Batching**: Process messages in batches to reduce invocations
5. **Reserved Capacity**: For predictable workloads (if applicable)

### Cost Monitoring

- **AWS Cost Explorer**: Track spending by service
- **Budgets**: Set alerts for cost thresholds
- **Cost Allocation Tags**: Track costs by project/environment

### Estimated Monthly Costs

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| Lambda | 1M invocations | $0.20 |
| SQS | 1M requests | $0.40 |
| SNS | 100K notifications | $0.50 |
| S3 | 100GB storage | $2.30 |
| CloudWatch | Standard metrics | $3.00 |
| **Total** | | **~$6.40** |

*Costs are estimates based on AWS free tier and typical usage patterns*

## 📚 Documentation

Comprehensive documentation is available:

- **[Project Report](https://drive.google.com/file/d/14_afWEFO1cCxO7o11jGpk5X13k4yfsXP/view?usp=drive_link)**: Detailed academic report
- **API Documentation**: Interactive Swagger/OpenAPI docs at `/api/docs`
- **Architecture Diagrams**: AWS architecture diagrams
- **Lambda Functions**: Individual README in each function directory
- **Deployment Guide**: Step-by-step deployment instructions
- **Troubleshooting**: Common issues and solutions

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow coding standards (PEP 8 for Python, ESLint for JavaScript)
4. Write tests for new features
5. Update documentation
6. Commit changes (`git commit -m 'Add AmazingFeature'`)
7. Push to branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

### Development Guidelines

- Write clean, maintainable code
- Add comprehensive tests (aim for >80% coverage)
- Document all public APIs
- Follow Git commit message conventions
- Update CHANGELOG.md

## 📄 License

This project is part of academic coursework for the MSc in Cloud Computing program.

## 👨‍💻 Author

**Polycarp Ughanze**
- GitHub: [@Ughanze23](https://github.com/Ughanze23)
- Institution: National College of Ireland
- Program: MSc in Cloud Computing

## 🙏 Acknowledgments

- National College of Ireland for academic guidance
- AWS for educational credits and comprehensive documentation
- Open-source community for excellent libraries and tools
- Course instructors for valuable feedback and support

## 📞 Support

For questions or issues:
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Refer to comprehensive docs
- **AWS Support**: For AWS-specific questions

---

**Note**: This project demonstrates enterprise-level cloud architecture and serverless patterns. It is optimized for scalability, cost-efficiency, and operational excellence, showcasing best practices in AWS cloud engineering.

**Key Highlights**:
- ✅ Event-driven serverless architecture
- ✅ Real-time inventory optimization
- ✅ Fully automated CI/CD pipeline
- ✅ Comprehensive monitoring and logging
- ✅ Cost-optimized infrastructure
- ✅ Production-ready code quality
