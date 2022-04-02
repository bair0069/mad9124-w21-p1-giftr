MAD9124 Final Project

# GIFTR

 The Brief



Each registered user can create a list of people for whom they are collecting gift ideas.
 The user can then add one or more gift ideas for each person on their list.

The person and their gift ideas can be shared with one or more other registered users. 
Those users can view and update the gift ideas, but cannot delete the user. Only the owner can delete a Person from their list.

authenticated users perform basic CRUD operations on two primary resources: people and gifts.
 The Person model represents the people for whom you are collecting gift ideas and will have an array of embedded Gift models.
  It will also have a belongsTo relationship with the owning Usermodel.

The API will also allow for Person objects to be "shared" with other User(s). This sharing feature may or may not be implemented on the client side.

The PoC will also need to support user registration, authentication and password updates. Since this is at the proof of concept stage, the App will be free, so the registration process does not need to consider credit cards for payments.
#
Core Requirements

    Implement basic user user management functions
        registration
        authentication with JWT
        change password
        get current logged-in user

    Protected API routes require a valid JWT in the Authorization header.

    All HTTP requests must have a header attribute of x-api-key set with the value being your college username, e.g.

fetch('/auth/users/me', {
  headers: {
    // other headers
    'x-api-key': 'mckennr'
  }
  // other fetch options
})

    Middleware functions should be employed to avoid repetitive route handler code.

    Single resource requests should return any related resources as fully populated embedded documents.

    Resource list requests should return an array of the primary resource objects only, without populating any related objects.

    All requests containing user/client supplied data should be sanitized to protect against XSS and Query Injection attacks.

    All schema validation errors should be caught and returned to the client in the standard JSON:API error format.

#
Response Payload

    All responses will be in the form of a JSON formatted object.
    This payload object must include one of (but not both at the same time) a data property or an errors property.
    For "list" routes, the data property must be populated an array of zero or more of the requested resource objects.
    For "retrieve" routes, the data property must be populated with a single resource object.
    If the requested single resource, or sub-resource (embedded document) does not exist, a 404 error response should be sent.
    Error responses will conform to the JSON:API standard.

#
Example Data Response

GET /auth/users/me

{
  "data": {
    "firstName": "Yo-Yo",
    "lastName": "Ma",
    "email": "me@yoyoma.com"
  }
}

#
Example Errors Response

POST /auth/users

{
  "errors": [
    {
      "status": "Bad Request",
      "code": "400",
      "title": "Validation Error",
      "detail": "minnie.mouse@disney is not a valid email address.",
      "source": {"pointer": "/data/attributes/email"}
    }
  ]
}

#
Auth Routes

The user management actions will be exposed separately from the main API routes and will use the /auth route prefix.
Action 	Method 	Resource Path 	Example Request Payload
Register User 	POST 	/auth/users 	{
  "firstName": "Yo-Yo",
  "lastName": "Ma",
  "email": "me@yo-yoma.com",
  "password": "myPassword"
}
Get Logged-in User 	GET 	/auth/users/me 	
Update Password 	PATCH 	/auth/users/me 	{ "password": "newPassword" }
Login User 	POST 	/auth/tokens 	{
  "email": "me@yo-yoma.com",
  "password": "myPassword"
}
#
API Routes

The primary application capabilities will be grouped under the /api resource route prefix. Some routes will be unrestricted, while others will be limited to authorized users. Access to routes relating to creating, updating or deleting gift ideas for a particular Person object will be limited to authenticated users who are either the owner or in the sharedWith list for that Person. Deleting a Person object will be restricted exclusively to its owner.

The client application must send a valid JWT in the Authorization header property for all /api routes.
#
Person Routes
Action 	Method 	Resource Path 	Notes
List all people 	GET 	/api/people 	Gift ideas not populated
Get details for a person 	GET 	/api/people/:id 	Gift ideas fully populated
Create a person 	POST 	/api/people 	
Replace a person 	PUT 	/api/people/:id 	
Update a person 	PATCH 	/api/people/:id 	
Remove a person 	DELETE 	/api/people/:id 	Only the owner

Users should only see and be able to act on their own people.

All gift ideas for a given person should be returned as an array of embedded documents with the requested Person object.
#
Gift Routes
Action 	Method 	Resource Path 	Notes
Create a gift 	POST 	/api/people/:id/gifts 	
Update a gift 	PATCH 	/api/people/:id/gifts/:giftId 	
Remove a gift 	DELETE 	/api/people/:id/gifts/:giftId 	

Users should only see and be able to act on gifts associated to their people.
#
Resource Schema

There are three required model classes. Their schema requirements are listed below.

Remember

Mongoose will automatically create the _id property for all objects.
#
Person
Property 	Type 	Required 	Max (length/value) 	Default
name 	String 	true 	254 	
birthDate 	Date 	true 		
owner 	ObjectId, ref: 'User' 	true 		Current user
sharedWith 	[ ObjectId, ref: 'User' ] 			
gifts 	[ Gift ] 			
imageUrl 	String 		1024 	
createdAt 	Date 			Date.now()
updatedAt 	Date 			Date.now()

The createdAt and updatedAt properties should be set automatically by the database

(opens new window). Any client supplied data for these two properties should be discarded.

The gifts property takes an array of zero or more Gift sub-documents

(opens new window).
The sharedWith property takes an array of zero or more User IDs.
The owner property takes a single User ID.
#
Gift
Property 	Type 	Required 	Min 	Max 	Default
name 	String 	true 	4 	64 	
price 	Number (integer in cents) 		100 		1000
imageUrl 	String 		1024 		
store 	Object 				
store.name 	String 			254 	
store.productURL 	String 			1024 	
#
User
Property 	Type 	Required 	Max Length 	Default 	Unique
firstName 	String 	true 	64 		
lastName 	String 	true 	64 		
email 	String 	true 	512 		true
password 	String 	true 	70 		

The email property must be a correctly formatted email, and must be unique in the database. This check should be done with a custom schema validator function.

The password property must be encrypted using the bcrypt library. This should be done in a schema.pre('save') method. The password property should always be redacted from response data and never returned to the client.
#
Logistics

    Create a new private GitHub repository called mad9124-w21-p1-giftr, and import this GitHub starter repo

(opens new window) for the initial project structure.
Invite your professor (rlmckenney) as a collaborator on your repo.
Clone the repo to your laptop.
Update the package.json with your author info.
Install dependencies with NPM.
Build the project on your laptop.
Test each route with Postman, making sure to test both valid and invalid data.
Make git commits as you complete each requirement.
When everything is complete, push the final commit back up to GitHub
Deploy your application containers to AWS Fargate with an Application Load Balancer
Submit both URLs on Brightspace: the GitHub code repo URL and the URL to your AWS application.