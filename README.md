<h1 align="center">Welcome to NestJS Tickets App BE 👋</h1>

<p> This is the backend for the tickets app. It is a simple app that allows users to create tickets and allow admins to manage them.

It is built with NestJS, GraphQL for Querys, DynamoDB as a database and S3 for file storage.

This app use the AWS Services, so you will need to have an AWS account and configure the credentials in your environment. </p>

---
## Technologies
- NestJS
- GraphQL
- DynamoDB (AWS)
- Bucket S3 (AWS)
---
## Features
Users can:
- Sign up
- Login
- Update your profile
- Create a new ticket
- Update their own tickets
- Get their own tickets
- Filter and search their own tickets
- Delete their own tickets

Admins can:
- Get all users
- Get a specific user
- Update any user
- Block any user
- Get all tickets
- Filter and search all tickets
- Get a specific ticket
- Update any ticket
- Delete any ticket
- Restore any ticket
---
## Installation

```bash
$ yarn install
```
---
## Configuration

```bash
# Rename .env.example to .env and fill in the values for your environment

# Is necessary to have an AWS account and configure the credentials in your environment

```
---
## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```
---
## Endpoints and Queries examples

- You can also use the GraphQL Playground to test the queries and mutations in the browser. For example: http://localhost:3000/api

- This repository has a Postman collection with all the endpoints and queries examples, you can import it in your Postman app.

- This app has a simple frontend for test, you can find it here:
https://github.com/MaxiG-dev/tickets-app-fe


```bash
# All endpoints start with host and port, for example: http://localhost:3000

# All methods are POST in the API

# GraphQL endpoint and queries
```
### Auth service
```bash
/api
  POST
    # Sign up NOT require authentication token
    - Sign up
      mutation Signup($signupInput: SignupInput!) {
        signup(signupInput: $signupInput) {
          # You can specify the fields you want to return
          token
          user {
            email
            username
            rol
            isBlocked
          }
        }
      },
      # Example signupInput
      variables: {
        "signupInput": {
          email: "user@gmail.com",
          password: "password1234",
          username: "Example username"
        }
      }
```
```bash
/api
  POST
    # Login NOT require authentication token
    - Login
      mutation Login($loginInput: LoginInput!) {
        login(loginInput: $loginInput) {
          # You can specify the fields you want to return
          token
          user {
            email
            username
          }
        }
      },
      # Example loginInput
      variables: {
        "loginInput": {
          email: "user@gmail.com",
          password: "password1234"
        }
      }
```
```bash
/api
  POST
    # Revalidate REQUIRE authentication token
    - Revalidate
      query Revalidate {
        revalidate {
          # You can specify the fields you want to return
          token
          user {
            email
            username
            rol
            isBlocked
          }
        }
      }
```
### Users service
```bash
# All methods REQUIRE authentication token
# You can return all fields in the User entity
```
```bash
User entity fields:
  email: string
  username: string
  rol: [string]
  isBlocked: boolean
  tickets: Tickets[]
```
```bash
/api
  POST
    # Rol required: [user, admin]
    # Only admin can get other users
    - Get user
      query User($email: String!) {
        user(email: $email) {
         # User entity fields (you can specify the fields you want to return)
        }
      },
      # Example email
      variables: {
        email: "user@gmail.com"
      }
```
```bash
/api
  POST
    # Rol required: [admin]
    - Get all users
      query Users($pagination: Pagination) {
        users(pagination: $pagination) {
         # Users entity fields (you can specify the fields you want to return)
        }
      },
      # Example pagination (optional)
      # If you don't specify pagination, it will return all users
      variables: {
        pagination: {
          limit: 5,
          page: 1
        }
      }
```
```bash
/api
  POST
    # Rol required: [user, admin]
    # Users can only update their own data and can't change their rol
    # Admins can update all users data and set their rol
    - Update user
    mutation UpdateUser($updateUserInput: UpdateUserInput!) {
      updateUser(updateUserInput: $updateUserInput) {
        username,
        email,
        rol
      }
    },
    variables: {
      updateUserInput: {
        email: "user@gmail.com",
        username: "New username",
        # Only admins can change the rol
        rol: ["user"]
      }
    }
```
```bash
/api
  POST
    # Rol required: [admin]
    - Block user
    mutation BlockUser($blockInput: BlockInput!) {
      blockUser(blockInput: $blockInput) {
        email
        isBlocked
      }
    },
    variables: {
      blockInput: {
        email: "user@gmail.com",
        blockAction: true # true to block, false to unblock
      }
    }
```
### Tickets service
```bash
# All methods REQUIRE authentication token
# You can return all fields in the Ticket entity
Ticket entity fields:
  purchaseNumber: number
  title: string
  problem: string
  description: string
  status: string
  createdAt: number
  updatedAt: number
  # imageName (link to the image in S3)
  imageName: string
  # purchaseDetail (link to csv file in S3)
  purchaseDetail: string
  isDeleted: boolean
```
```bash
/api
  POST
    # Rol required: [user, admin]
    # This method create a new ticket and asign it to the user that create it
    - Create new ticket
    mutation CreateTicket($createTicketInput: CreateTicketInput!) {
      createTicket(createTicketInput: $createTicketInput) {
        # Ticket entity fields (you can specify the fields you want to return)
      }
    },
    variables: {
        createTicketInput: {
          title: "Title example",
          purchaseNumber: 142321,
          problem: "Problem example",
          description: "description example"
      }
    }
```
```bash
/api
  POST
    # Rol required: [user, admin]
    # Users only can update their own tickets, admins can update all tickets
    - Update a ticket
    mutation UpdateTicket($updateTicketInput: UpdateTicketInput!) {
      updateTicket(updateTicketInput: $updateTicketInput) {
        # Ticket entity fields (you can specify the fields you want to return)
      }
    },
    variables: {
        updateTicketInput: {
          # Email is required for admins, but not for users, because they can only update their own tickets.
          email:"user@gmail.com",
          title: "Title example",
          purchaseNumber: 142321,
          problem: "Problem example",
          description: "description example"
      }
    }
```
```bash
/api
  POST
    # Rol required: [user, admin]
    # Users can delete their own tickets, admins can delete all tickets and restore them.
    - Delete a ticket
    mutation DeleteTicket {
      deleteTicket(deleteInput: $deleteInput) {
          isDeleted
          purchaseNumber
      }
    },
    variables: {
      deleteInput: {
          purchaseNumber: 12345,
          deleteAction: true, # true to delete, false to restore
          email:"user@gmail.com"
      }
    }
```
```bash
/api
  POST
    # Rol required: [user, admin]
    # This method accept filters and pagination
    # This method return Users entity and Tickets entity inside the user entity
    # Users can only get their own tickets, admins can get all tickets.
    # Admins can use the includeDeleted param to get deleted tickets
    - Get a ticket
    query Tickets($filterInput: FilterInput, $pagination: Pagination) {
      tickets(filterInput: $filterInput, pagination: $pagination) {
          username,
          email,
          tickets {
              purchaseNumber,
              title,
              status,
              purchaseDetail,
              problem,
              description,
              createdAt,
              updatedAt,
              imageName,
              isDeleted
          }
        }
      },
      variables: {
        filterInput: {
          status: null, # Valid options: open, closed, in progress, resolved, awaiting customer response, awaiting vendor response
          purchaseNumber: null,
          filterParam: null, # This param search in the title, problem and description and return the tickets that match
          email: null, # This param search for particular user tickets
          includeDeleted: null # only admins can use this param
        },
        pagination: {
            limit: 5,
            page: 1
        }
      }
```

### Rest API Services
```bash
# All methods REQUIRE authentication token
```
```bash
/api/ticket/create
  POST
    # Rol required: [user, admin]
    # This method can create a new ticket whit a csv file and an image
    - Create new ticket whit files
    form-data:
      title: "Title example",
      purchaseNumber: 142321,
      problem: "Problem example",
      description: "description example"
      purchaseDetail: file.csv # optional
      image: file.jpg (only jpg, jpeg and png) # optional
```
```bash
/api/ticket/update
  POST
    # Rol required: [user, admin]
    # This method can create a new ticket whit a csv file and an image
    - Create new ticket whit files
    form-data:
      # Email is required for admins, but not for users, because they can only update their own tickets.
      email:"user@gmail.com", # optional for users
      title: "Title example", # optional
      purchaseNumber: 142321, # optional
      problem: "Problem example", # optional
      description: "description example" # optional
      purchaseDetail: file.csv # optional
      image: file.jpg (only jpg, jpeg and png) # optional
      status: "open" # optional

/api/seed
  POST
    # This method create 25 users and asign tickets to them
```
---
## 🧪 Test cases

```bash
# Unauthorized
- Try create a new ticket without token
- Try update a ticket without token
- Try delete a ticket without token
- Try get a ticket without token

- Try get all tickets whitout admin rol
- Try get a different login user ticket whitout admin rol
- Try edit a different login user ticket whitout admin rol
- Try delete a different login user ticket whitout admin rol
- Try restore a ticket whitout admin rol
```

