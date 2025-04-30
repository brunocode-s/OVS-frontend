import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { castVote, getElectionById } from '../api/election';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Modal for confirmation
const VoteConfirmationModal = ({ candidate, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-400 bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Confirm Your Vote</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to vote for <strong>{candidate.name}</strong>?
        </p>
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
          >
            Confirm Vote
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ElectionDetails() {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await getElectionById(id);
        setElection(res);

        const voteRes = await axios.get(`/api/vote/check/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setHasVoted(voteRes.data.hasVoted);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Election not found' : 'Failed to load election details');
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [id]);

  const handleVote = async (candidateId) => {
    setVoting(true);
    try {
      await castVote(id, { candidateId });
      toast.success('✅ Vote cast successfully!');
      setHasVoted(true);
      const refreshed = await getElectionById(id);
      setElection(refreshed);
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Voting failed.');
    } finally {
      setVoting(false);
    }
  };

  const handleVoteConfirmation = (candidateId) => {
    if (hasVoted) {
      toast.error('You have already voted!');
      return;
    }

    if (hasEnded) {
      toast.error('Voting is closed.');
      return;
    }

    setSelectedCandidateId(candidateId);
    setShowModal(true);
  };

  const confirmVote = async () => {
    if (hasVoted || hasEnded) {
      toast.error('Voting is closed.');
      setShowModal(false);
      return;
    }

    const candidate = election.candidates.find((c) => c.id === selectedCandidateId);
    if (!candidate) {
      toast.error('Candidate not found.');
      setShowModal(false);
      return;
    }

    await handleVote(candidate.id);  // Confirm the vote
    setShowModal(false);
  };

  const cancelVote = () => setShowModal(false);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="spinner-border animate-spin w-8 h-8 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!election) return <div className="p-6">No election found.</div>;
  if (!election.candidates?.length) return <div className="p-6">No candidates available for this election.</div>;

  const now = new Date();
  const hasStarted = new Date(election.start_date) <= now;
  const hasEnded = new Date(election.end_date) <= now;
  const showVoting = hasStarted && !hasEnded && !hasVoted;

  const candidateData = election.candidates.map((c) => ({
    ...c,
    votes: isNaN(Number(c.votes)) ? 0 : Number(c.votes),
  }));

  const totalVotes = candidateData.reduce((acc, c) => acc + c.votes, 0);

  const getVotePercentage = (votes) => {
    return totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{election.title}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Start:</strong> {format(new Date(election.start_date), 'MMM dd, yyyy h:mm a')}</p>
      <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>End:</strong> {format(new Date(election.end_date), 'MMM dd, yyyy h:mm a')}</p>
      <p className="text-gray-600 dark:text-gray-300 mb-4"><strong>Description:</strong> {election.description || 'No description provided.'}</p>

      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Live Poll</h2>
      <ul className="mb-4">
        {candidateData.map((candidate) => (
          <li key={candidate.id} className="text-gray-700 dark:text-gray-100">
            {candidate.name}: {candidate.votes} votes ({getVotePercentage(candidate.votes)}%)
          </li>
        ))}
      </ul>

      <div className="h-64 w-full sm:w-3/4 mx-auto bg-gray-100 dark:bg-gray-800 rounded p-4 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={candidateData}>
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="votes" fill="#3b82f6">
              {candidateData.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showVoting && (
        <>
          <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">Cast Your Vote</h3>
          <ul>
            {candidateData.map((candidate) => (
              <li key={candidate.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-md mb-2">
                <span className="text-gray-800">{candidate.name}</span>
                <button
                  onClick={() => handleVoteConfirmation(candidate.id)}
                  disabled={voting}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Vote
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {hasVoted && <p className="text-green-600 mt-4">🗳️ You have already voted.</p>}
      {hasEnded && <p className="text-red-500 mt-4">⏳ This election has ended.</p>}

      {showModal && selectedCandidateId && (
        <VoteConfirmationModal
          candidate={candidateData.find((c) => c.id === selectedCandidateId)}
          onConfirm={confirmVote}
          onCancel={cancelVote}
        />
      )}
    </div>
  );
}
