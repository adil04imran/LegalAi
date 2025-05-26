import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        if (!formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/))
            newErrors.email = "Invalid email format.";
        if (!formData.phone.match(/^\d{10}$/))
            newErrors.phone = "Phone number must be 10 digits.";
        if (formData.password.length < 6)
            newErrors.password = "Password must be at least 6 characters.";
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (response.data && response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                alert('Signup successful!');
                navigate('/');
            } else {
                setErrors({ apiError: "Unexpected response from server." });
            }
        } catch (error) {
            console.error("Signup error:", error.response?.data || error.message);
            setErrors({ apiError: error.response?.data?.message || "Signup failed! Please try again." });
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Signup</h2>
                <form className='signup-form' onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder='Enter your name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className='input-field'
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}

                    <input
                        type="email"
                        name="email"
                        placeholder='Enter your email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className='input-field'
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}

                    <input
                        type="text"
                        name="phone"
                        placeholder='Enter your phone number'
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className='input-field'
                    />
                    {errors.phone && <p className="error-text">{errors.phone}</p>}

                    <input
                        type="password"
                        name="password"
                        placeholder='Enter your password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className='input-field'
                    />
                    {errors.password && <p className="error-text">{errors.password}</p>}

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder='Confirm your password'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className='input-field'
                    />
                    {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}

                    {errors.apiError && <p className="error-text">{errors.apiError}</p>}

                    <button className='signup-button' type="submit">Register</button>
                </form>
                <p><a href="/login" className="login-link">Have an account?</a></p>
            </div>
        </div>
    );
}
