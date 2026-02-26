import React, { useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/inputs/Input';
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/inputs/ProfilePhotoSelector';
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle SignUp Form Submit
  const handleSignUp = async (e) => {
    e.preventDefault();
  
    if (!fullName) {
      setError("Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }
  
    setError("");
  
    try {
      // 1️⃣ Register
      await axiosInstance.post("/register", { fullName, email, password });
  
      // 2️⃣ Auto-login after registration
      const loginResponse = await axiosInstance.post("/login", { email, password });
  
      // 3️⃣ Upload profile image if exists
      if (profilePic) {
        const formData = new FormData();
        formData.append("image", profilePic);
        await axiosInstance.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
  
      // 4️⃣ Update auth context and navigate
      login(loginResponse.data.user);
      navigate("/login");
  
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <AuthLayout>
      <div className='lg:w-full h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Create An Account</h3>
        <p className='text-xs text-slate-700 mt-1.25 mb-6'>
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp}>

          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John"
              type="text"
            />

            <Input value={email} onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />

            <div className='col-span-2'>
              <Input value={password} onChange={({ target }) => setPassword(target.value)}
                label="Password Address"
                placeholder="Min 8 characters"
                type="password"
              />
            </div>

          </div>

          {error && <p className='text-red-500  text-xs pb-2.5'>{error}</p>}

          <button type='submit' className='btn-primary'>
            SIGN UP
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Already have an account?{""}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp
