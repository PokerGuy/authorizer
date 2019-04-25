

module.exports.derp = async (event, context) => {
  console.log(event.requestContext.authorizer); // This has the value of the user which was put in there by the authorizer
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
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
  }
  response.policyDocument = policyDocument;
  const user = {lastName: "Ever", firstName: "Greatest", stuff: "something"};
  response.context = user;
  return response;
};

module.exports.authorizer = (event, context, callback) => { // NOTE: The authorizer function CANNOT do async yet
  console.log(`Client token: ${event.authorizationToken}`);
  console.log(`Method ARN: ${event.methodArn}`);
  if (event.authorizationToken === "derp") {
    const policy = generatePolicy("Allow", event.methodArn);
    console.log("SUCCESS, generating policy:");
    console.log(JSON.stringify(policy));
    return callback(null, policy);
  } else {
    console.log("FAIL, should return a 401");
      return callback('Unauthorized');
  }
};
