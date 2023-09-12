const axios = require('axios');

exports.handler = async (event:any) => {
  try {
    const response = await axios.get('https://api.example.com/');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error; // return the response data from the error object
  }
}                            