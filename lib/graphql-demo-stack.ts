import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';

import * as appsync from 'aws-cdk-lib/aws-appsync';
// import { LambdaDataSource, MappingTemplate, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { SchemaFile } from 'aws-cdk-lib/aws-appsync';
import path = require('path');

export class GraphqlDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appSynAcpi=new appsync.GraphqlApi(this,'Policyapi',{
      name: 'my-api',
      // schema: SchemaFile.fromAsset('schema.graphql'),
      schema:SchemaFile.fromAsset(path.join(__dirname, 'graphql', 'schema.graphql')),
      // schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM,
        },
      },
    });
//............
const eventProcessor = new Function(this, 'MyLambdaFunction', {
  runtime: Runtime.NODEJS_14_X,
      // code: Code.fromAsset(path.join(__dirname, 'lambda', 'dist')),
      // code: Code.fromAsset(path.join(__dirname, 'lambda', 'src')),
      code: Code.fromAsset( path.join(__dirname, 'lambda', 'src','dist')),
  handler: 'eventProcessorlambda.handler',
  role: new iam.Role(this, 'LambdaRole', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  }),
  environment:{
    ENDPOINT:appSynAcpi.graphqlUrl,
    API_ID:appSynAcpi.apiId
  }
});

// Grant permissions to Lambda function to call AppSync API
const policy = new iam.PolicyStatement({
  actions: ['appsync:GraphQL'],
  resources: [appSynAcpi.arn],
});
eventProcessor.addToRolePolicy(policy);

// Output the AppSync API endpoint URL
new cdk.CfnOutput(this, 'AppSyncAPIEndpoint', {
  value: appSynAcpi.graphqlUrl,
});
//...........
    // Define your Lambda function as a data source
    const lambdaFunction = new Function(this, 'MyLambda', {
      // code: Code.fromAsset(path.join(__dirname, 'lambda', 'dist')),
      code: Code.fromAsset(path.join(__dirname, 'lambda', 'src')),
      runtime: Runtime.NODEJS_14_X,
      handler: 'lambda.handler',
      environment: {
        PRIVATE_API_CLIENT_ID: 'my-client-id',
        PRIVATE_API_CLIENT_SECRET: 'my-client-secret',
      },
      // Add environment variables or other configuration as needed
    });
    

    const lambdaDataSource = new appsync.LambdaDataSource(this, 'MyLambdaDataSource', {
      api: appSynAcpi,
      name: 'MyLambdaDataSourceName',
      lambdaFunction: lambdaFunction,
    });

    
       
    appSynAcpi.createResolver('resolver',{
      typeName: 'Query',
      fieldName: 'hello',
      dataSource: lambdaDataSource,
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        path.join(__dirname, 'graphql', 'request.vtl')
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        path.join(__dirname, 'graphql', 'response.vtl')),
    });


  }}
