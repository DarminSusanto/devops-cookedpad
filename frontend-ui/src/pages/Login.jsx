// /frontend-ui/src/pages/Login.jsx

// ... (semua import Anda SAMA) ...
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORT useAuth

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const auth = useAuth(); // <-- 2. PANGGIL HOOK AUTH

  // ... (fungsi handleChange SAMA) ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, formData);
      
      // 3. PANGGIL FUNGSI 'login' DARI CONTEXT
      auth.login(response.data.token); 
      
      setMessage('Login berhasil! Mengarahkan ke Home...');
      
      // 4. HAPUS RELOAD, LANGSUNG NAVIGASI
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  // ... (kode 'return' JSX Anda SAMA PERSIS) ...
}

export default Login;