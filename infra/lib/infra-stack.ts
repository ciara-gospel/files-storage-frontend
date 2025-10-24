import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as s3 from 'aws-cdk-lib/aws-s3';
// import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
// import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
// import * as iam from 'aws-cdk-lib/aws-iam';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new cdk.aws_s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    //create a website deployment for my dist content
    new cdk.aws_s3_deployment.BucketDeployment(this, 'DeployWebsite', {
      sources: [cdk.aws_s3_deployment.Source.asset('dist')],
      destinationBucket: websiteBucket,
    });

    const originAccessIdentity = new cdk.aws_cloudfront.OriginAccessIdentity(this, 'OAI', {})

    // origin access control (OAC)//
    // const oac = new cloudfront.CfnOriginAccessControl(this, 'OAC', {
    //   originAccessControlConfig: {
    //     name: 'WebsiteOAC',
    //     originAccessControlOriginType: 's3',
    //     signingBehavior: 'always',
    //     signingProtocol: 'sigv4',
    //   },
    // });

    const s3Origin = origins.S3BucketOrigin.withOriginAccessIdentity(websiteBucket, {
      originAccessIdentity
    })

    // cloudfront distribution//
    const cloudFrontDist = new cdk.aws_cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: s3Origin,
        compress: true,
        viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    //connect OAC to the distribution//
    // const cfnDist = distribution.node.defaultChild as cloudfront.CfnDistribution;
    // cfnDist.addPropertyOverride(
    //   'DistributionConfig.origins.0.OriginAccessControlId',
    //   oac.getAtt('Id'),
    // );

    //authorize cloudfront to read the bucket//
    websiteBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [originAccessIdentity.grantPrincipal],
      }),
    );

    // invalidation of cloudfront + site deployment//
    new cdk.aws_s3_deployment.BucketDeployment(this, 'DeployWebsiteWithCF', {
      sources: [cdk.aws_s3_deployment.Source.asset('dist')],
      destinationBucket: websiteBucket,
      distribution: cloudFrontDist,
      distributionPaths: ['/*'], //empty all the cache automatically
    });

    // output: bucket + url cloudfront//
    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: cloudFrontDist.domainName,
    });
  }
}
