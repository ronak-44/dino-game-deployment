terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region                   = "us-east-2"
  shared_credentials_files = ["~/.aws/credentials"]
}

### Frontend Repo Definition
data "aws_ecr_repository" "dino-game-frontend" {
  name = "dino-game-frontend"
}

output "frontend_repository_url" {
  value = data.aws_ecr_repository.dino-game-frontend.repository_url
}

resource "aws_cloudwatch_log_group" "ecs_logs_frontend" {
  name              = "/ecs/dino-game-frontend"
  retention_in_days = 7  # Adjust retention period as needed
}

resource "aws_cloudwatch_log_group" "ecs_logs_backend" {
  name              = "/ecs/dino-game-backend"
  retention_in_days = 7  # Adjust retention period as needed
}

### Backend Repo Definition
data "aws_ecr_repository" "dino-game-backend" {
  name = "dino-game-backend"
}

output "backend_repository_url" {
  value = data.aws_ecr_repository.dino-game-backend.repository_url
}

### Cluster Definition
resource "aws_ecs_cluster" "terraform_test_cluster" {
  name = "terraform_test_cluster"
}

### Frontend Task Definition
resource "aws_ecs_task_definition" "terraform_frontend_task" {
  family                   = "terraform_frontend_task"
  container_definitions    = jsonencode([{
    name      = "terraform_frontend_task"
    image     = data.aws_ecr_repository.dino-game-frontend.repository_url
    essential = true
    portMappings = [{
      containerPort = 80
      hostPort      = 80
    }]
    memory = 512
    cpu    = 256
  }])
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = "512"
  cpu                      = "256"
  execution_role_arn       = aws_iam_role.terraform_frontend_ecsTaskExecutionRole.arn
}

### Backend Task Definition
resource "aws_ecs_task_definition" "terraform_backend_task" {
  family                   = "terraform_backend_task"
  container_definitions    = jsonencode([{
    name      = "dino-game-backend-container"
    image     = data.aws_ecr_repository.dino-game-backend.repository_url
    essential = true
    portMappings = [{
      containerPort = 5000
      hostPort      = 5000
      protocol      = "tcp"
    }]
    memory = 3072
    cpu    = 1024
    environment = [
      { name = "AWS_ACCESS_KEY_ID", value = "VALUE" },
      { name = "AWS_SECRET_ACCESS_KEY", value = "VALUE" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs_backend.name
        "awslogs-create-group"  = "true"
        "awslogs-region"        = "us-east-2"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = "3072"
  cpu                      = "1024"
  execution_role_arn       = aws_iam_role.terraform_backend_ecsTaskExecutionRole.arn
}

### IAM Role Definition for Frontend
resource "aws_iam_role" "terraform_frontend_ecsTaskExecutionRole" {
  name               = "terraform-frontend-ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

### IAM Role Definition for Backend
resource "aws_iam_role" "terraform_backend_ecsTaskExecutionRole" {
  name               = "terraform-backend-ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

### IAM Policy Document
data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

### IAM Role Policy Attachment for Frontend
resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy_frontend" {
  role       = aws_iam_role.terraform_frontend_ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

### IAM Role Policy Attachment for Backend
resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy_backend" {
  role       = aws_iam_role.terraform_backend_ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "dynamodb_full_access_policy_backend" {
  role       = aws_iam_role.terraform_backend_ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

### Frontend ECS Service Definition
resource "aws_ecs_service" "terraform_frontend_service" {
  name            = "terraform_frontend_service"
  cluster         = aws_ecs_cluster.terraform_test_cluster.id
  task_definition = aws_ecs_task_definition.terraform_frontend_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = [aws_default_subnet.default_subnet_a.id, aws_default_subnet.default_subnet_b.id, aws_default_subnet.default_subnet_c.id]
    assign_public_ip = true
  }
}

### Backend ECS Service Definition
resource "aws_ecs_service" "terraform_backend_service" {
  name            = "terraform_backend_service"
  cluster         = aws_ecs_cluster.terraform_test_cluster.id
  task_definition = aws_ecs_task_definition.terraform_backend_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = [aws_default_subnet.default_subnet_a.id, aws_default_subnet.default_subnet_b.id, aws_default_subnet.default_subnet_c.id]
    assign_public_ip = true
  }
}

### AWS Default VPC
resource "aws_default_vpc" "default_vpc" {
}

### AWS Default Subnets
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "us-east-2a"
}

resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "us-east-2b"
}

resource "aws_default_subnet" "default_subnet_c" {
  availability_zone = "us-east-2c"
}
