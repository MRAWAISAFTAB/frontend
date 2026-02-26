import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { LuTrendingUp, LuTrendingDown, LuWallet } from 'react-icons/lu'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import axiosInstance from '../../utils/axiosInstance'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className='bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs shadow-lg shadow-purple-100'>
      <p className='text-slate-400 mb-1'>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className='font-medium'>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

const StatCard = ({ label, value, icon, iconBg, valueColor }) => (
  <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm shadow-purple-100/40 flex items-center gap-4'>
    <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div>
      <p className='text-xs text-slate-400 uppercase tracking-widest mb-1'>{label}</p>
      <p className={`text-2xl font-semibold ${valueColor}`}>{fmt(value)}</p>
    </div>
  </div>
)

const Home = () => {
  const [incomes,  setIncomes]  = useState([])
  const [expenses, setExpenses] = useState([])

  // ✅ Fetch both from MongoDB on mount
  useEffect(() => {
    axiosInstance.get('/income/get').then(res => setIncomes(res.data)).catch(console.error)
    axiosInstance.get('/expense/get').then(res => setExpenses(res.data)).catch(console.error)
  }, [])

  const totalIncome  = incomes.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const balance      = totalIncome - totalExpense

  const chartData = useMemo(() => {
    const map = {}
    const monthLabel = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short' })

    incomes.forEach(i => {
      const m = monthLabel(i.date)
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 }
      map[m].income += Number(i.amount)
    })
    expenses.forEach(e => {
      const m = monthLabel(e.date)
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 }
      map[m].expense += Number(e.amount)
    })

    const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return Object.values(map).sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
  }, [incomes, expenses])

  const recentTransactions = useMemo(() => {
    const all = [
      ...incomes.map(i  => ({ ...i,  name: i.source,  type: 'income'  })),
      ...expenses.map(e => ({ ...e,  name: e.cateory, type: 'expense' })),
    ]
    return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)
  }, [incomes, expenses])

  return (
    <DashboardLayout>
      <div className='mb-8'>
        <h2 className='text-xl font-semibold text-black'>Dashboard Overview</h2>
        <p className='text-xs text-slate-500 mt-1'>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <StatCard label="Total Balance" value={balance}
          icon={<LuWallet className='text-primary' />}
          iconBg="bg-purple-50" valueColor="text-primary" />
        <StatCard label="Total Income" value={totalIncome}
          icon={<LuTrendingUp className='text-emerald-500' />}
          iconBg="bg-emerald-50" valueColor="text-emerald-600" />
        <StatCard label="Total Expense" value={totalExpense}
          icon={<LuTrendingDown className='text-rose-500' />}
          iconBg="bg-rose-50" valueColor="text-rose-500" />
      </div>

      {/* Chart + Transactions */}
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-4'>
        <div className='lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm shadow-purple-100/40'>
          <h3 className='text-sm font-semibold text-slate-700 mb-6'>Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f5ff' }} />
              <Bar dataKey="income"  name="Income"  fill="#875cf5" radius={[5,5,0,0]} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm shadow-purple-100/40'>
          <h3 className='text-sm font-semibold text-slate-700 mb-4'>Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className='text-xs text-slate-400 text-center py-8'>No transactions yet</p>
          ) : (
            <div className='flex flex-col gap-1'>
              {recentTransactions.map(tx => (
                <div key={tx._id} className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors'>
                  <div className='w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-base shrink-0'>
                    {tx.icon}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium text-slate-700 truncate'>{tx.name}</p>
                    <p className='text-[11px] text-slate-400'>
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Home