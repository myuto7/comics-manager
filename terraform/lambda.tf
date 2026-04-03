# Lambda 関数のソースコードを ZIP に固める
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda_function.zip"
}

resource "aws_lambda_function" "line_notification" {
  function_name    = "${var.project_name}-line-notification"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"  # index.mjs の handler 関数を指す
  runtime          = "nodejs20.x"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  # タイムアウト: 30秒（SQS の visibility_timeout_seconds と合わせる）
  timeout = 30

  environment {
    variables = {
      LINE_CHANNEL_ACCESS_TOKEN = var.line_channel_access_token
    }
  }

  tags = {
    Project = var.project_name
  }
}

# SQS → Lambda のイベントソースマッピング
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.line_notification.arn
  function_name    = aws_lambda_function.line_notification.arn

  # 1件ずつ処理（バッチサイズを大きくするとエラー時に複数件が影響を受ける）
  batch_size = 1
}
