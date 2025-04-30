import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [newCandidates, setNewCandidates] = useState(['']);
  const [editElection, setEditElection] = useState(null);
  const [editCandidates, setEditCandidates] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedElectionForStats, setSelectedElectionForStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const fetchElections = async () => {
    setLoading(true);
    try {
      const res = await API.get('/elections');
      setElections(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElectionStats = async (electionId) => {
    try {
      const res = await API.get(`/admin/election-stats/${electionId}`);
      setChartData(res.data);
    } catch (err) {
      console.error('Error fetching election stats:', err);
      setError('Failed to load election stats.');
    }
  };

  useEffect(() => {
    if (selectedElectionForStats?.id) {
      fetchElectionStats(selectedElectionForStats.id);
    }
  }, [selectedElectionForStats]);

  const handleAddCandidate = () => {
    setNewCandidates([...newCandidates, '']);
  };

  const handleCandidateChange = (index, value) => {
    const updated = [...newCandidates];
    updated[index] = value;
    setNewCandidates(updated);
  };

  const handleCreateElection = async () => {
    const { title, description, start_date, end_date } = newElection;
    if (!title.trim() || newCandidates.length < 2) {
      setError('Please fill out all fields, and add at least 2 candidates.');
      return;
    }
    try {
      const res = await API.post('/admin/create-election', {
        title,
        description,
        start_date,
        end_date,
        candidates: newCandidates,
      });
      fetchElections();
      setElections((prev) => [...prev, res.data]);
      setNewElection({ title: '', description: '', start_date: '', end_date: '' });
      setNewCandidates(['']);
      setError(null);
    } catch (err) {
      setError('Failed to create election.');
      console.error('Error creating election:', err);
    }
  };

  const handleCancelElection = async (id) => {
    try {
      await API.delete(`/admin/cancel-election/${id}`);
      setElections((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError('Failed to cancel election.');
      console.error('Error canceling election:', err);
    }
  };

  const handleEditClick = (election) => {
    const now = new Date();
    const startDate = new Date(election.start_date);
    if (startDate <= now) return;
    setEditElection({ ...election });
    setEditCandidates(election.candidates || []);
  };

  const handleEditSave = async () => {
    try {
      const res = await API.put(`/admin/edit-election/${editElection.id}`, {
        ...editElection,
        candidates: editCandidates,
      });
      setElections((prev) =>
        prev.map((e) => (e.id === res.data.id ? res.data : e))
      );
      setEditElection(null);
      setEditCandidates([]);
    } catch (err) {
      setError('Failed to edit election.');
      console.error('Error editing election:', err);
    }
  };

  const safeFormatDateTime = (date) => {
    const validDate = new Date(date);
    return isNaN(validDate) ? 'Invalid Date' : format(validDate, 'PPP p');
  };

  const isFormValid = newElection.title.trim() && newElection.start_date && newElection.end_date && newCandidates.length >= 2;

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white">
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-lg">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-2xl hover:bg-red-600 transition"
        >
          Logout
        </button>
      </nav>

      <div className="mt-6 space-y-4">
        <div className="max-w-lg mx-auto">
          <input
            type="text"
            value={newElection.title}
            onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
            placeholder="Election Title"
            className="p-3 border rounded-lg w-full mb-4 dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="text"
            value={newElection.description}
            onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
            placeholder="Description"
            className="p-3 border rounded-lg w-full mb-4 dark:bg-gray-700 dark:border-gray-600"
          />

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
              <input
                type="datetime-local"
                value={newElection.start_date}
                onChange={(e) => setNewElection({ ...newElection, start_date: e.target.value })}
                className="p-3 border rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
              <input
                type="datetime-local"
                value={newElection.end_date}
                onChange={(e) => setNewElection({ ...newElection, end_date: e.target.value })}
                className="p-3 border rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold">Candidates</h3>
            {newCandidates.map((candidate, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={candidate}
                  onChange={(e) => handleCandidateChange(index, e.target.value)}
                  placeholder={`Candidate ${index + 1}`}
                  className="p-2 border rounded-lg w-full dark:bg-gray-600 dark:border-gray-500"
                />
                {newCandidates.length > 1 && (
                  <button
                    onClick={() => setNewCandidates((prev) => prev.filter((_, i) => i !== index))}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddCandidate}
              className="mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Candidate
            </button>
          </div>

          <button
            onClick={handleCreateElection}
            className={`w-full mt-4 p-3 ${isFormValid ? 'bg-green-600' : 'bg-gray-500'} text-white rounded-lg hover:bg-green-700`}
            disabled={!isFormValid}
          >
            Create Election
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Elections</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading elections...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : elections.length === 0 ? (
        <p className="text-center text-gray-500">No elections available.</p>
      ) : (
        <div className="space-y-4">
          {elections.map((election) => {
            const isUpcoming = new Date(election.start_date) > new Date();
            return (
              <div key={election.id} className="flex justify-between items-center p-4 mb-2 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <div>
                  <h3 className="font-bold text-lg">{election.title}</h3>
                  <p className="text-sm">{election.description}</p>
                  <p className="text-sm text-gray-500">
                    {election.candidates.map((c, i) => (
                      <span key={i} className="mr-2">
                        {c.name}
                        {i < election.candidates.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                  <p className="text-xs text-gray-500">
                    {safeFormatDateTime(election.start_date)} - {safeFormatDateTime(election.end_date)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isUpcoming && (
                    <button
                      onClick={() => handleEditClick(election)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedElectionForStats(election)}
                    className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                  >
                    View Stats
                  </button>
                  <button
                    onClick={() => handleCancelElection(election.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {editElection && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-700 dark:text-white">
          <h2 className="text-xl font-bold mb-4">Edit Election</h2>

          <input
            type="text"
            value={editElection.title}
            onChange={(e) => setEditElection({ ...editElection, title: e.target.value })}
            placeholder="Election Title"
            className="p-2 border rounded-lg w-full mb-3 dark:bg-gray-600 dark:border-gray-500"
          />

          <input
            type="text"
            value={editElection.description}
            onChange={(e) => setEditElection({ ...editElection, description: e.target.value })}
            placeholder="Description"
            className="p-2 border rounded-lg w-full mb-3 dark:bg-gray-600 dark:border-gray-500"
          />

          {/* Start Date */}
          <label className="block mb-1 font-semibold">Start Date</label>
          <input
            type="date"
            value={editElection.start_date?.slice(0, 10)} // trimming time if present
            onChange={(e) => setEditElection({ ...editElection, start_date: e.target.value })}
            className="p-2 border rounded-lg w-full mb-3 dark:bg-gray-600 dark:border-gray-500"
          />

          {/* End Date */}
          <label className="block mb-1 font-semibold">End Date</label>
          <input
            type="date"
            value={editElection.end_date?.slice(0, 10)}
            onChange={(e) => setEditElection({ ...editElection, end_date: e.target.value })}
            className="p-2 border rounded-lg w-full mb-3 dark:bg-gray-600 dark:border-gray-500"
          />

          <h3 className="text-lg font-semibold mb-2">Candidates</h3>
          {editCandidates.map((name, index) => (
            <input
              key={index}
              type="text"
              value={name}
              onChange={(e) => {
                const updated = [...editCandidates];
                updated[index] = e.target.value;
                setEditCandidates(updated);
              }}
              className="p-2 border rounded-lg w-full mb-2 dark:bg-gray-600 dark:border-gray-500"
            />
          ))}

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleEditSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditElection(null);
                setEditCandidates([]);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {selectedElectionForStats && chartData.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Election Stats: {selectedElectionForStats.title}</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke='#8884d8' />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Bar dataKey="votes" fill="#8884d8" />
              <Bar></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-4 text-center text-gray-500">No election stats available.</p>
      )}
    </div>
  );
}
