# Custom Authorizer

Most vertical monaliths have a filter that can check for a session and the create some type of currentUser
object which is then available to the rest of the application. We can do the same type of thing with AWS Lambda by creating an authorizer function. Before the aptly named derp function is called, it will go the authorizer function. The authorizer function should check to make sure that the appropriate session token is available. It then passes back a user which is avaible to the derp function. To try this out, have serverless installed or install it with:
```npm i -g serverless```
Then, once deployed you can see the happy path with:
```curl -H "Authorization: derp" https://xxxxx..execute-api.us-west-2.amazonaws.com/sandbox/derp```
Using anything besides Authorization: derp in the header returns a 401.
```curl -H "Authorization: oof" https://xxxxx..execute-api.us-west-2.amazonaws.com/sandbox/derp```
The cool thing is that the event.requestContext.authorizer in the derp handler now has our hardcoded user. In reality, the authorizer function would do a look up from a databaser or DynamoDB and then put the user in the response which would be picked up by the derp function. The derp function might then check for roles within this object and might still return a 401 if the user is not authorized, but at least we now know who the user is. Also, for every authorization header passed to the authorizer function, it will be cached for one hour for faster authorizations!