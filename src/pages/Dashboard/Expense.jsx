import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { LuPlus, LuDownload, LuTrash2, LuTrendingDown, LuX } from 'react-icons/lu'
import axiosInstance from '../../utils/axiosInstance'

const ICONS = ['🛒','🍕','🚗','🏠','👕','💊','📱','🎬','✈️','🎮']

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/20' onClick={onClose} />
      <div className='relative bg-white rounded-2xl w-full max-w-md shadow-xl shadow-purple-100 z-10'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <h3 className='text-sm font-semibold text-black'>{title}</h3>
          <button onClick={onClose} className='text-slate-400 hover:text-slate-600 transition-colors'>
            <LuX />
          </button>
        </div>
        <div className='p-6'>{children}</div>
      </div>
    </div>
  )
}

const Expense = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState({ icon: '🛒', cateory: '', amount: '', date: '' })
  const [error, setError]         = useState('')

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  // ✅ Fetch from MongoDB on mount
  useEffect(() => {
    axiosInstance.get('/expense/get')
      .then(res => setExpenses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ✅ Save to MongoDB
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.cateory || !form.amount || !form.date) {
      setError('All fields are required'); return
    }
    try {
      const res = await axiosInstance.post('/expense/add', form)
      setExpenses(prev => [res.data, ...prev])
      setForm({ icon: '🛒', cateory: '', amount: '', date: '' })
      setError('')
      setModalOpen(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense')
    }
  }

  // ✅ Delete from MongoDB
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/expense/${id}`)
      setExpenses(prev => prev.filter(e => e._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ Download from backend
  const handleDownload = async () => {
    try {
      const res = await axiosInstance.get('/expense/downloadexcel', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url
      a.download = 'expenses.xlsx'; a.click()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <DashboardLayout>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-xl font-semibold text-black'>Expenses</h2>
          <p className='text-xs text-slate-500 mt-1'>Track all your spending</p>
        </div>
        <div className='flex gap-2'>
          <button onClick={handleDownload}
            className='flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors'>
            <LuDownload /> Export
          </button>
          <button onClick={() => setModalOpen(true)}
            className='flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-lg bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-purple-600/15 transition-colors'>
            <LuPlus /> Add Expense
          </button>
        </div>
      </div>

      <div className='bg-white rounded-2xl p-5 border border-slate-100 shadow-sm shadow-purple-100/40 flex items-center gap-4 mb-6'>
        <div className='w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-xl shrink-0'>
          <LuTrendingDown className='text-rose-500' />
        </div>
        <div className='flex-1'>
          <p className='text-xs text-slate-400 uppercase tracking-widest'>Total Expenses</p>
          <p className='text-2xl font-semibold text-rose-500'>{fmt(total)}</p>
        </div>
        <p className='text-xs text-slate-400'>{expenses.length} transactions</p>
      </div>

      <div className='bg-white rounded-2xl border border-slate-100 shadow-sm shadow-purple-100/40 overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-100'>
          <h3 className='text-sm font-semibold text-slate-700'>All Expenses</h3>
        </div>
        {loading ? (
          <div className='text-center py-16 text-slate-400 text-sm'>Loading...</div>
        ) : expenses.length === 0 ? (
          <div className='text-center py-16 text-slate-400 text-sm'>No expenses added yet</div>
        ) : (
          <div className='divide-y divide-slate-50'>
            {expenses.map(item => (
              <div key={item._id} className='flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group'>
                <div className='w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0'>
                  {item.icon}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-slate-700'>{item.cateory}</p>
                  <p className='text-xs text-slate-400'>{fmtDate(item.date)}</p>
                </div>
                <span className='text-sm font-semibold text-rose-500'>−{fmt(item.amount)}</span>
                <button
                  onClick={() => handleDelete(item._id)}
                  className='opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all ml-2'
                >
                  <LuTrash2 className='text-sm' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
        <form onSubmit={handleAdd} className='space-y-4'>
          <div>
            <label className='text-xs text-slate-500 mb-2 block'>Pick an icon</label>
            <div className='flex flex-wrap gap-2'>
              {ICONS.map(icon => (
                <button key={icon} type='button' onClick={() => setForm({ ...form, icon })}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all
                    ${form.icon === icon ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1 block'>Category</label>
            <input type='text' placeholder='e.g. Food, Rent, Transport'
              value={form.cateory} onChange={e => setForm({ ...form, cateory: e.target.value })}
              className='input-box mb-0! mt-0!' />
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1 block'>Amount ($)</label>
            <input type='number' placeholder='0'
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              className='input-box mb-0! mt-0!' />
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1 block'>Date</label>
            <input type='date' value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className='input-box mb-0! mt-0!' />
          </div>

          {error && <p className='text-red-500 text-xs'>{error}</p>}

          <button type='submit' className='btn-primary mt-2!'>Add Expense</button>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

export default Expense