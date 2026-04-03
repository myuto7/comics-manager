variable "aws_region" {
  description = "AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "リソース名のプレフィックス"
  type        = string
  default     = "comics-manager"
}

variable "line_channel_access_token" {
  description = "LINE Messaging API の Channel Access Token"
  type        = string
  sensitive   = true
}
