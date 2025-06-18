import { useContext } from 'react';
import AuthContext from './AuthContext'; // import default from AuthContext.jsx

const useAuth = () => useContext(AuthContext);

export default useAuth;
