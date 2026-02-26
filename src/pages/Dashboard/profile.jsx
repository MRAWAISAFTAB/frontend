import React, { useState, useRef } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { LuUpload, LuTrash, LuCheck, LuLock } from 'react-icons/lu'
import axiosInstance from '../../utils/axiosInstance'

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:5000/${url.replace(/\\/g, "/")}`;
  };

  const [fullName, setFullName]       = useState(storedUser.fullName || '')
  const [email, setEmail]             = useState(storedUser.email || '')
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass]         = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [profilePic, setProfilePic]   = useState(null)
  const [previewUrl, setPreviewUrl]   = useState(getImageUrl(storedUser.profileImageUrl))
  const [profileMsg, setProfileMsg]   = useState('')
  const [passMsg, setPassMsg]         = useState('')
  const [passLoading, setPassLoading] = useState(false)

  const inputRef = useRef(null)

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePic(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setProfilePic(null)
    setPreviewUrl(null)
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    if (!fullName || !email) { setProfileMsg('Name and email are required'); return }
    const updated = { ...storedUser, fullName, email, profileImageUrl: previewUrl }
    localStorage.setItem('user', JSON.stringify(updated))
    setProfileMsg('Profile updated successfully!')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  // ✅ Now actually calls the API to change password
  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (!currentPass || !newPass || !confirmPass) { setPassMsg('All fields required'); return }
    if (newPass !== confirmPass) { setPassMsg('New passwords do not match'); return }
    if (newPass.length < 8) { setPassMsg('Password must be at least 8 characters'); return }

    setPassLoading(true)
    try {
      await axiosInstance.post('/change-password', {
        currentPassword: currentPass,
        newPassword: newPass,
      })
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
      setPassMsg('Password changed successfully!')
    } catch (err) {
      setPassMsg(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPassLoading(false)
      setTimeout(() => setPassMsg(''), 3000)
    }
  }

  return (
    <DashboardLayout>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-black'>Profile Settings</h2>
        <p className='text-xs text-slate-500 mt-1'>Manage your account details</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

        {/* ── Photo + Info card ── */}
        <div className='lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-purple-100/40 p-6'>
          <h3 className='text-sm font-semibold text-slate-700 mb-5'>Personal Information</h3>

          <div className='flex items-center gap-5 mb-6 pb-6 border-b border-slate-100'>
            <div className='relative'>
              {previewUrl ? (
                <img src={previewUrl} alt="profile" className='w-20 h-20 rounded-full object-cover' />
              ) : (
                <div className='w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-semibold text-primary'>
                  {initials}
                </div>
              )}
              <button
                type='button'
                onClick={() => inputRef.current.click()}
                className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-md hover:bg-violet-600 transition-colors'
              >
                <LuUpload className='text-xs' />
              </button>
              <input type='file' accept='image/*' ref={inputRef} onChange={handleImageChange} className='hidden' />
            </div>
            <div>
              <p className='text-sm font-medium text-slate-700'>{fullName || 'Your Name'}</p>
              <p className='text-xs text-slate-400 mb-2'>{email || 'your@email.com'}</p>
              {previewUrl && (
                <button onClick={handleRemoveImage}
                  className='flex items-center gap-1 text-xs text-rose-400 hover:text-rose-600 transition-colors'>
                  <LuTrash className='text-xs' /> Remove photo
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileSave} className='space-y-4'>
            <div>
              <label className='text-xs text-slate-500 mb-1 block'>Full Name</label>
              <input type='text' value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder='John Doe' className='input-box mb-0! mt-0!' />
            </div>
            <div>
              <label className='text-xs text-slate-500 mb-1 block'>Email Address</label>
              <input type='email' value={email} onChange={e => setEmail(e.target.value)}
                placeholder='john@example.com' className='input-box mb-0! mt-0!' />
            </div>

            {profileMsg && (
              <p className={`text-xs flex items-center gap-1.5 ${profileMsg.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>
                {profileMsg.includes('success') && <LuCheck />} {profileMsg}
              </p>
            )}

            <button type='submit' className='btn-primary mt-2!'>Save Changes</button>
          </form>
        </div>

        {/* ── Change Password card ── */}
        <div className='bg-white rounded-2xl border border-slate-100 shadow-sm shadow-purple-100/40 p-6 h-fit'>
          <div className='flex items-center gap-2 mb-5'>
            <LuLock className='text-primary' />
            <h3 className='text-sm font-semibold text-slate-700'>Change Password</h3>
          </div>

          <form onSubmit={handlePasswordSave} className='space-y-4'>
            <div>
              <label className='text-xs text-slate-500 mb-1 block'>Current Password</label>
              <input type='password' value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                placeholder='••••••••' className='input-box mb-0! mt-0!' />
            </div>
            <div>
              <label className='text-xs text-slate-500 mb-1 block'>New Password</label>
              <input type='password' value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder='Min 8 characters' className='input-box mb-0! mt-0!' />
            </div>
            <div>
              <label className='text-xs text-slate-500 mb-1 block'>Confirm New Password</label>
              <input type='password' value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                placeholder='Repeat password' className='input-box mb-0! mt-0!' />
            </div>

            {passMsg && (
              <p className={`text-xs flex items-center gap-1.5 ${passMsg.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>
                {passMsg.includes('success') && <LuCheck />} {passMsg}
              </p>
            )}

            <button type='submit' disabled={passLoading} className='btn-primary mt-2!'>
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default Profile