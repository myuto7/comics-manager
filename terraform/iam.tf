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
# Next.js アプリ用 IAM ポリシー（SQS SendMessage のみ）
#
# 使い方:
#   terraform apply 後に出力される app_sqs_policy_arn を
#   既存の IAM ユーザーにアタッチしてください。
#
#   aws iam attach-user-policy \
#     --user-name <YOUR_IAM_USER> \
#     --policy-arn <app_sqs_policy_arn>
# ────────────────────────────────────────────────
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
