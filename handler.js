

module.exports.derp = async (event, context) => {
  if (event.requestContext.authorizer.user) {
      const user = JSON.parse(event.requestContext.authorizer.user);
      console.log("The user calling the API is:");
      console.log(user);
      // Remember, by the definition in the serverless.yml the user will be cached up to 1 hour, therefore, if you make
      // a change to a user, it might not take effect for an hour. If this is an issue, set the timeout to 5 minutes or lower
  }
  /*
  Code to handle authorization of the authenticated user goes here, if the user should not access the API, return a status code 401
   */
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'The derp function says bonjour!'
    })
  };
};

const generatePolicy = (effect, resource) => {
  let response = {};
  let policyDocument = {};
  if (effect && resource) {
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    let statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    const wildcardPath = resource.split(':');
    statementOne.Resource = `${wildcardPath[0]}:${wildcardPath[1]}:${wildcardPath[2]}:${wildcardPath[3]}:*/*/*/*`;
    policyDocument.Statement[0] = statementOne;
  }
  response.policyDocument = policyDocument;
  const user = {user: JSON.stringify({lastName: "Ever", firstName: "Greatest", stuff: "something"})};
  response.context = user;
  return response;
};

module.exports.authorizer = (event, context, callback) => { // NOTE: The authorizer function CANNOT do async yet
  console.log(`Client token: ${event.authorizationToken}`);
  console.log(`Method ARN: ${event.methodArn}`);
  //  0 :      1        :   2  :     3      :           4
  // arn:aws:execute-api:region:AWS ACCOUNT:APIGATEWAYRESTAPI/STAGE/VERB/FUNCTION
  // If you use 1 AWS account and multiple stages, probably don't want to wildcard the stage portion of the ARN for security purposes!
  // If there are multiple functions, remember the authorizer caches the response, so it will probably make sense
  // to wildcard some of the policy document that way the same authorizer can be used for different functions
  // let the authorizer by the authenticator that passes back a user, let the function then authorize based on the user and/or the user's roles
  if (event.authorizationToken === "derp") {
    // Ideally, lookup a user session from the authorizationToken or call callback('Unauthorized') if the session cannot be found
    const policy = generatePolicy("Allow", event.methodArn);
    console.log("SUCCESS, generating policy:");
    console.log(JSON.stringify(policy));
    return callback(null, policy);
  } else {
    console.log("FAIL, should return a 401");
      return callback('Unauthorized');
  }
};
