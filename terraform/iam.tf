# ────────────────────────────────────────────────
# Lambda 実行ロール
# ────────────────────────────────────────────────
resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Action    = "sts:AssumeRole"
        Principal = { Service = "lambda.amazonaws.com" }
      }
    ]
  })

  tags = {
    Project = var.project_name
  }
}

# CloudWatch Logs への書き込み権限（基本実行ロール）
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# SQS からメッセージを受信・削除する権限
resource "aws_iam_role_policy" "lambda_sqs" {
  name = "${var.project_name}-lambda-sqs-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ]
        Resource = aws_sqs_queue.line_notification.arn
      }
    ]
  })
}

# ────────────────────────────────────────────────
# Next.js アプリ用 IAM ユーザー・ポリシー（SQS SendMessage のみ）
# ────────────────────────────────────────────────
resource "aws_iam_user" "app" {
  name = "${var.project_name}-sqs-sender"

  tags = {
    Project = var.project_name
  }
}

resource "aws_iam_policy" "app_sqs_send" {
  name        = "${var.project_name}-app-sqs-send"
  description = "Next.js アプリが LINE 通知用 SQS キューにメッセージを送信する権限"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.line_notification.arn
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "app_sqs_send" {
  user       = aws_iam_user.app.name
  policy_arn = aws_iam_policy.app_sqs_send.arn
}

# ────────────────────────────────────────────────
# Terraform 実行用 IAM ユーザー・ポリシー（最小権限）
# ────────────────────────────────────────────────
resource "aws_iam_user" "terraform" {
  name = "${var.project_name}-terraform"

  tags = {
    Project = var.project_name
  }
}

resource "aws_iam_policy" "terraform" {
  name        = "${var.project_name}-terraform-policy"
  description = "Terraform が使用するサービス（SQS/Lambda/S3/DynamoDB/IAM）への最小権限"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # SQS キューの作成・削除・設定管理
        Sid    = "SQSManage"
        Effect = "Allow"
        Action = [
          "sqs:CreateQueue",
          "sqs:DeleteQueue",
          "sqs:GetQueueAttributes",
          "sqs:SetQueueAttributes",
          "sqs:GetQueueUrl",
          "sqs:ListQueues",
          "sqs:TagQueue",
          "sqs:UntagQueue",
          "sqs:ListQueueTags",
        ]
        Resource = "*"
      },
      {
        # Lambda 関数の作成・更新・削除・トリガー設定
        Sid    = "LambdaManage"
        Effect = "Allow"
        Action = [
          "lambda:CreateFunction",
          "lambda:DeleteFunction",
          "lambda:GetFunction",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:CreateEventSourceMapping",
          "lambda:DeleteEventSourceMapping",
          "lambda:GetEventSourceMapping",
          "lambda:ListEventSourceMappings",
          "lambda:AddPermission",
          "lambda:RemovePermission",
          "lambda:GetPolicy",
          "lambda:TagResource",
          "lambda:UntagResource",
          "lambda:ListTags",
          "lambda:ListVersionsByFunction",
          "lambda:GetFunctionCodeSigningConfig",
        ]
        Resource = "*"
      },
      {
        # tfstate 保存用 S3 バケットへのアクセス（バックエンド専用）
        Sid    = "S3TfState"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketVersioning",
        ]
        Resource = "*"
      },
      {
        # tfstate ロック用 DynamoDB テーブルへのアクセス（バックエンド専用）
        Sid    = "DynamoDBTfLock"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable",
        ]
        Resource = "*"
      },
      {
        # Lambda 実行ロールの作成・アタッチに必要な IAM 権限
        Sid    = "IAMRoleForLambda"
        Effect = "Allow"
        Action = [
          "iam:GetRole",
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:GetRolePolicy",
          "iam:PassRole",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:TagRole",
          "iam:UntagRole",
        ]
        Resource = "*"
      },
      {
        # IAM ユーザー・ポリシーの管理（Terraform で IAM を管理するために必要）
        Sid    = "IAMUserPolicyForTerraform"
        Effect = "Allow"
        Action = [
          "iam:CreateUser",
          "iam:DeleteUser",
          "iam:GetUser",
          "iam:TagUser",
          "iam:UntagUser",
          "iam:CreatePolicy",
          "iam:DeletePolicy",
          "iam:GetPolicy",
          "iam:GetPolicyVersion",
          "iam:ListPolicyVersions",
          "iam:AttachUserPolicy",
          "iam:DetachUserPolicy",
          "iam:ListAttachedUserPolicies",
        ]
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_user_policy_attachment" "terraform" {
  user       = aws_iam_user.terraform.name
  policy_arn = aws_iam_policy.terraform.arn
}
