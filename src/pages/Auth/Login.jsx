import React, { useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";


const Login = () => {
    const [email ,setEmail] = useState("");
    const [password ,setPassword] = useState("");
    const [error ,setError] = useState (null);

    const navigate = useNavigate(); 
    const { login } = useAuth();

  //  Handle Login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)){
      setError("Please Enter a valid email address");
      return;
    }

    if(!password){
      setError("Please Enter the Password");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post("/login", {
        email,
        password,
      });
    
      login(response.data.user);   // save user in context
      navigate("/dashboard");      // redirect
    
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <AuthLayout>
      <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center '>
       <h3 className='text-xl font-semibold text-black'>Welcome Back</h3>
       <p className='text-xs text-slate-700 mt-1.25 mb-6'>Please enter your details to login</p>

      <form onSubmit={handleLogin}>
        <Input value={email} onChange = {({target}) => setEmail(target.value)}
        label = "Email Address"
        placeholder = "john@example.com"
        type = "text"
        />
        <Input value={password} onChange = {({target}) => setPassword(target.value)}
        label = "Password Address"
        placeholder = "Min 8 characters"
        type = "password"
        />

        {error && <p className='text-red-500  text-xs pb-2.5'>{error}</p>}

        <button type='submit' className='btn-primary'>
          LOGIN
        </button>

        <p className='text-[13px] text-slate-800 mt-3'>
          Don't have an account?{""}
          <Link className="font-medium text-primary underline" to="/signup">
            SignUp
            </Link>    
        </p>
      </form>
      </div>
    </AuthLayout>
  )
}

export default Login
