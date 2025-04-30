import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="w-64 h-full bg-gray-800 text-white p-6">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <ul>
        <li>
          <Link to="/admin" className="block py-2 hover:bg-gray-700 rounded-md">Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/elections" className="block py-2 hover:bg-gray-700 rounded-md">Manage Elections</Link>
        </li>
        <li>
          <Link to="/admin/voters" className="block py-2 hover:bg-gray-700 rounded-md">Voters</Link>
        </li>
      </ul>
    </div>
  );
}
