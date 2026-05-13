import * as cdk from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as elasticbeanstalk from "aws-cdk-lib/aws-elasticbeanstalk";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface PipelineStackProps extends cdk.StackProps {
  githubOwner: string;
  githubRepo: string;
  githubBranch?: string;
  codestarConnectionArn: string;
  appName?: string;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const {
      githubOwner,
      githubRepo,
      githubBranch = "main",
      codestarConnectionArn,
      appName = "nodejs-app",
    } = props;

    // ── Elastic Beanstalk ──────────────────────────────────────────────────────

    const ebInstanceRole = new iam.Role(this, "EBInstanceRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSElasticBeanstalkWebTier"),
      ],
    });

    const ebInstanceProfile = new iam.CfnInstanceProfile(
      this,
      "EBInstanceProfile",
      { roles: [ebInstanceRole.roleName] }
    );

    const ebApp = new elasticbeanstalk.CfnApplication(this, "EBApplication", {
      applicationName: appName,
    });

    const ebEnv = new elasticbeanstalk.CfnEnvironment(this, "EBEnvironment", {
      applicationName: ebApp.applicationName!,
      environmentName: `${appName}-env`,
      solutionStackName: "64bit Amazon Linux 2023 v6.10.3 running Node.js 20",
      optionSettings: [
        {
          namespace: "aws:autoscaling:launchconfiguration",
          optionName: "IamInstanceProfile",
          value: ebInstanceProfile.ref,
        },
        {
          namespace: "aws:elasticbeanstalk:environment",
          optionName: "EnvironmentType",
          value: "SingleInstance", // change to LoadBalanced for production
        },

      ],
    });

    ebEnv.addDependency(ebApp);

    // ── Artifact bucket ────────────────────────────────────────────────────────

    const artifactBucket = new s3.Bucket(this, "ArtifactBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    // ── CodeBuild ──────────────────────────────────────────────────────────────

    const buildProject = new codebuild.PipelineProject(this, "BuildProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL,
      },
      cache: codebuild.Cache.bucket(artifactBucket, { prefix: "codebuild-cache" }),
    });

    // ── Pipeline artifacts ─────────────────────────────────────────────────────

    const sourceOutput = new codepipeline.Artifact("SourceOutput");
    const buildOutput = new codepipeline.Artifact("BuildOutput");

    // ── CodePipeline ───────────────────────────────────────────────────────────

    new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: `${appName}-pipeline`,
      artifactBucket,
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipeline_actions.CodeStarConnectionsSourceAction({
              actionName: "GitHub_Source",
              owner: githubOwner,
              repo: githubRepo,
              branch: githubBranch,
              connectionArn: codestarConnectionArn,
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "CodeBuild",
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: "Deploy",
          actions: [
            new codepipeline_actions.ElasticBeanstalkDeployAction({
              actionName: "EB_Deploy",
              applicationName: appName,
              environmentName: `${appName}-env`,
              input: buildOutput,
            }),
          ],
        },
      ],
    });

    // ── Outputs ────────────────────────────────────────────────────────────────

    new cdk.CfnOutput(this, "EBEndpoint", {
      value: ebEnv.attrEndpointUrl,
      description: "Elastic Beanstalk environment URL",
    });
  }
}
