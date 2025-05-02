import { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { verifyBiometric } from '../services/biometricService';
import io from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const socket = io('https://ovs-backend-1.onrender.com');

export default function Elections() {
  const [elections, setElections] = useState([]);
  const [hasVoted, setHasVoted] = useState({});
  const [results, setResults] = useState({});
  const [candidates, setCandidates] = useState({});
  const [fingerprintError, setFingerprintError] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await API.get('/elections');
      setElections(res.data);
    } catch (err) {
      toast.error('Failed to fetch elections');
    }
  };

  const fetchElectionStats = async (electionId) => {
    try {
      const res = await API.get(`/admin/election-stats/${electionId}`);
      const stats = res.data.reduce((acc, c) => {
        acc[c.name] = Number(c.votes);
        return acc;
      }, {});

      setResults((prev) => ({ ...prev, [electionId]: stats }));
      setCandidates((prev) => ({
        ...prev,
        [electionId]: res.data.map((c) => ({ name: c.name, id: c.id, votes: c.votes })),
      }));

      const voteRes = await API.get(`/vote/check/${electionId}`);
      setHasVoted((prev) => ({ ...prev, [electionId]: voteRes.data.hasVoted }));
    } catch (err) {
      toast.error('Failed to fetch election stats');
    }
  };

  useEffect(() => {
    elections.forEach((election) => {
      const now = new Date();
      const hasStarted = new Date(election.start_date) <= now;
      const hasEnded = new Date(election.end_date) <= now;

      if (hasStarted || hasEnded) {
        fetchElectionStats(election.id);
      }
    });
  }, [elections]);

  const startFingerprintLogin = async () => {
    if (!window.PublicKeyCredential) {
      toast.error('WebAuthn not supported on this browser.');
      return false;
    }

    try {
      const authenticated = await verifyBiometric();
      return authenticated;
    } catch (error) {
      setFingerprintError('Fingerprint authentication failed.');
      toast.error('Fingerprint authentication failed.');
      return false;
    }
  };

  const handleVote = async (candidateId, electionId) => {

    try {
      await API.post(`/elections/${electionId}/vote`, { candidateId });
      toast.success('Vote cast!');
      fetchElectionStats(electionId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Voting failed');
    }
  };

  const totalVotes = (electionId) => Object.values(results[electionId] || {}).reduce((acc, val) => acc + val, 0);

  const now = new Date();
  const ongoingElections = elections.filter((e) => new Date(e.start_date) <= now && new Date(e.end_date) > now);
  const endedElections = elections.filter((e) => new Date(e.end_date) <= now);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow rounded-lg mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Live Elections</h2>

      {/* Ongoing Elections */}
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Ongoing Elections</h3>
      <ul className="space-y-2 mb-6">
        {ongoingElections.map((election) => (
          <li key={election.id} className="border-b py-4">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-blue-400 text-lg font-semibold">{election.title}</span>
              <span className="text-sm text-green-500">Ongoing</span>
            </div>

            <h4 className="mt-2 text-gray-700 dark:text-gray-200">Candidates</h4>
            <ul className="space-y-2">
              {candidates[election.id]?.map((candidate) => (
                <li key={candidate.id} className="flex items-center justify-between px-4 py-2 border border-gray-200 dark:border-gray-700 rounded">
                  <span className="text-gray-800 dark:text-gray-100">{candidate.name}</span>
                  <button
                    onClick={() => handleVote(candidate.id, election.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
                    disabled={hasVoted[election.id]}
                  >
                    {hasVoted[election.id] ? 'Voted' : 'Vote'}
                  </button>
                </li>
              ))}
            </ul>

            {fingerprintError && (
              <div className="text-red-500 text-sm mt-2">{fingerprintError}</div>
            )}

            <h4 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">Live Results:</h4>
            <ul className="space-y-2 mb-4">
              {Object.entries(results[election.id] || {}).map(([name, votes]) => (
                <li key={name} className="text-gray-700 dark:text-gray-100">
                  {name}: {votes} votes ({((votes / totalVotes(election.id)) * 100 || 0).toFixed(1)}%)
                </li>
              ))}
            </ul>

            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded p-4 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={candidates[election.id]}>
                  <XAxis dataKey="name" stroke="#8884d8" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="votes">
                    {candidates[election.id]?.map((entry, index) => (
                      <Cell key={index} fill="#3b82f6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </li>
        ))}
      </ul>

      {/* Ended Elections */}
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8">Ended Elections</h3>
      <ul className="space-y-2 mb-6">
        {endedElections.map((election) => (
          <li key={election.id} className="border-b py-4">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-blue-400 text-lg font-semibold">{election.title}</span>
              <span className="text-sm text-red-500">Ended</span>
            </div>

            <h4 className="mt-2 text-gray-700 dark:text-gray-200">Candidates</h4>
            <ul className="space-y-2">
              {candidates[election.id]?.map((candidate) => (
                <li key={candidate.id} className="flex items-center justify-between px-4 py-2 border border-gray-200 dark:border-gray-700 rounded">
                  <span className="text-gray-800 dark:text-gray-100">{candidate.name}</span>
                </li>
              ))}
            </ul>

            <h4 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">Results:</h4>
            <ul className="space-y-2 mb-4">
              {Object.entries(results[election.id] || {}).map(([name, votes]) => (
                <li key={name} className="text-gray-700 dark:text-gray-100">
                  {name}: {votes} votes ({((votes / totalVotes(election.id)) * 100 || 0).toFixed(1)}%)
                </li>
              ))}
            </ul>

            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded p-4 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={candidates[election.id]}>
                  <XAxis dataKey="name" stroke="#8884d8" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="votes">
                    {candidates[election.id]?.map((entry, index) => (
                      <Cell key={index} fill="#3b82f6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
