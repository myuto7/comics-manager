output "sqs_queue_url" {
  description = "SQS キュー URL（Next.js の AWS_SQS_QUEUE_URL に設定する値）"
  value       = aws_sqs_queue.line_notification.url
}

output "sqs_queue_arn" {
  description = "SQS キュー ARN"
  value       = aws_sqs_queue.line_notification.arn
}

output "lambda_function_name" {
  description = "Lambda 関数名"
  value       = aws_lambda_function.line_notification.function_name
}

output "lambda_function_arn" {
  description = "Lambda 関数 ARN"
  value       = aws_lambda_function.line_notification.arn
}

output "app_sqs_policy_arn" {
  description = "Next.js アプリ用 IAM ポリシー ARN（SQS SendMessage 権限）"
  value       = aws_iam_policy.app_sqs_send.arn
}
