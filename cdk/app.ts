#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "./pipeline-stack";

const app = new cdk.App();

new PipelineStack(app, "NodejsPipelineStack", {
  githubOwner: process.env.GITHUB_OWNER ?? "<your-github-owner>",
  githubRepo: process.env.GITHUB_REPO ?? "<your-repo-name>",
  githubBranch: process.env.GITHUB_BRANCH ?? "main",
  codestarConnectionArn: process.env.CODESTAR_CONNECTION_ARN ?? "<your-connection-arn>",
  appName: process.env.APP_NAME ?? "nodejs-app",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
  },
});
