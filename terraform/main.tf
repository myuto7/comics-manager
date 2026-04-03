terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # S3 バックエンド（事前に S3 バケットと DynamoDB テーブルの作成が必要）
  # 作成手順は README.md を参照
  backend "s3" {
    bucket         = "comics-manager-tfstate" # 作成した S3 バケット名に変更
    key            = "terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "comics-manager-tfstate-lock" # 作成した DynamoDB テーブル名に変更
    encrypt        = true
    profile        = "comics-manager-terraform"
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "comics-manager-terraform"
}
