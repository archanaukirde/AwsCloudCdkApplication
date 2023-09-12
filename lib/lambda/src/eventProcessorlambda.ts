// index.js
const { request } = require('graphql-request');

export const handler = async (event:any) => {
  // Define the GraphQL endpoint URL
  const endpoint = process.env.ENDPOINT;

  // Define the GraphQL query
  const query = `
  query MyQuery {
    hello(name: "archana")
  }
  `;

  try {
    // Make the GraphQL request
    const response = await request(endpoint, query);

    // Handle the response from the AppSync API
    console.log('GraphQL response:', response);

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    // Handle errors
    console.error('Error:', error);

    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
