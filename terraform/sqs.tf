resource "aws_sqs_queue" "line_notification" {
  name = "${var.project_name}-line-notification"

  # Lambda がメッセージを処理する最大時間（Lambda のタイムアウトと合わせる）
  visibility_timeout_seconds = 30

  # メッセージ保持期間: 1日
  message_retention_seconds = 86400

  tags = {
    Project = var.project_name
  }
}
