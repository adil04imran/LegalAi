import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './login.css';

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); // Initialize navigate for redirection

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
            alert('Login successful!');
            localStorage.setItem('authToken', response.data.token);
            navigate('/');
        } catch (error) {
            console.error(error.response?.data || error.message);
            alert('Invalid email or password');
        }
    };

    return (
        <div className="login-main">
            <div className="login-main-two">
                <div className="login-card">
                    <h2>Login</h2>
                    <form className='login-form' onSubmit={handleSubmit}>
                        <input type="email" name="email" placeholder='Enter your email' onChange={handleChange} required className='id-and-pass'/>
                        <input type={showPassword ? "text" : "password"} name="password" className='id-and-pass' placeholder='Enter your password' onChange={handleChange} required />
                        <div className="show-pass">
                            <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
                            <p>Show Password?</p>
                        </div>
                        <button className='login-button' type="submit">Login</button>
                    </form>
                    <p><a href="/signup" className="signup-link">Don't have an account?</a></p>
                </div>
            </div>
        </div>
    );
}