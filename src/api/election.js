import axios from 'axios';

// Define the base URL for your API
const BASE_URL = 'https://ovs-backend-1.onrender.com/api'; // Update with your actual API URL

// Function to get the list of elections for a specific user (e.g., from a backend)
export const getUserElections = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/elections`);
    return response.data; // Assuming the response contains the elections data
  } catch (error) {
    console.error('Error fetching user elections:', error);
    throw error;
  }
};

// Function to create a new election (e.g., when an admin creates a new election)
export const createElection = async (electionData) => {
  try {
    const response = await axios.post(`${BASE_URL}/elections`, electionData);
    return response.data; // Return the created election data
  } catch (error) {
    console.error('Error creating election:', error);
    throw error;
  }
};

// Function to edit an existing election (e.g., when an admin updates election details)
export const editElection = async (electionId, electionData) => {
  try {
    const response = await axios.put(`${BASE_URL}/elections/${electionId}`, electionData);
    return response.data; // Return the updated election data
  } catch (error) {
    console.error('Error editing election:', error);
    throw error;
  }
};

// Function to cancel an election (e.g., when an admin cancels an ongoing election)
export const cancelElection = async (electionId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/elections/${electionId}`);
    return response.data; // Return the response after deletion
  } catch (error) {
    console.error('Error canceling election:', error);
    throw error;
  }
};

// Function to vote in an election (this is crucial for your voting system)
export const castVote = async (electionId, voteData) => {
  const token = localStorage.getItem('token');
  try {
    // Removed the biometric verification
    const response = await axios.post(`${BASE_URL}/elections/${electionId}/vote`, voteData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
};

// Function to get election results (admin feature for monitoring results)
export const getElectionResults = async (electionId) => {
  try {
    const response = await axios.get(`${BASE_URL}/elections/${electionId}/results`);
    return response.data; // Assuming the response contains the results data
  } catch (error) {
    console.error('Error fetching election results:', error);
    throw error;
  }
};

export const getElectionById = async (electionId) => {
  try {
    const response = await axios.get(`${BASE_URL}/elections/${electionId}`);
    console.log('full response from /elections/:id', response);
    return response.data; // Assuming the response contains the election data
  } catch (error) {
    console.error('Error fetching election by ID:', error);
    throw error;
  }
};
