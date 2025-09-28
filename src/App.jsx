import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Label } from './components/ui/label'
import { Trash2, Plus, Calculator, DollarSign, TrendingUp, PieChart, Edit, FileText, Download } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import './App.css'

const EXPENSE_CATEGORIES = [
  'Video Production',
  'Creative Services', 
  'Equipment Rental',
  'Software & Licenses',
  'Talent & Crew',
  'Location & Studio',
  'Post-Production',
  'Marketing & Advertising',
  'Travel & Transportation',
  'Client Entertainment',
  'Other'
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

function App() {
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(0)
  const [budgetInput, setBudgetInput] = useState('')
  const [projectDuration, setProjectDuration] = useState(1)
  const [projectRevenue, setProjectRevenue] = useState(0)
  const [editingExpense, setEditingExpense] = useState(null)
  const [newExpense, setNewExpense] = useState({
    name: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    file: null
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses')
    const savedBudget = localStorage.getItem('budget')
    const savedDuration = localStorage.getItem('projectDuration')
    const savedRevenue = localStorage.getItem('projectRevenue')
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
    if (savedBudget) {
      setBudget(parseFloat(savedBudget))
    }
    if (savedDuration) {
      setProjectDuration(parseInt(savedDuration))
    }
    if (savedRevenue) {
      setProjectRevenue(parseFloat(savedRevenue))
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('budget', budget.toString())
  }, [budget])

  useEffect(() => {
    localStorage.setItem('projectDuration', projectDuration.toString())
  }, [projectDuration])

  useEffect(() => {
    localStorage.setItem('projectRevenue', projectRevenue.toString())
  }, [projectRevenue])

  const handleSetBudget = () => {
    const budgetValue = parseFloat(budgetInput)
    if (!isNaN(budgetValue) && budgetValue > 0) {
      setBudget(budgetValue)
      setBudgetInput('')
    }
  }

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.category && newExpense.amount && newExpense.date) {
      const expense = {
        id: Date.now(),
        name: newExpense.name,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        file: newExpense.file
      }
      setExpenses([...expenses, expense])
      setNewExpense({
        name: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        file: null
      })
    }
  }

  const handleEditExpense = (expense) => {
    setEditingExpense({
      ...expense,
      amount: expense.amount.toString()
    })
  }

  const handleUpdateExpense = () => {
    if (editingExpense.name && editingExpense.category && editingExpense.amount && editingExpense.date) {
      const updatedExpenses = expenses.map(expense =>
        expense.id === editingExpense.id
          ? {
              ...editingExpense,
              amount: parseFloat(editingExpense.amount)
            }
          : expense
      )
      setExpenses(updatedExpenses)
      setEditingExpense(null)
    }
  }

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const handleFileUpload = (e, isEditing = false) => {
    const file = e.target.files[0]
    if (file) {
      if (isEditing) {
        setEditingExpense({ ...editingExpense, file: file })
      } else {
        setNewExpense({ ...newExpense, file: file })
      }
    }
  }

  const generatePDF = () => {
    const printWindow = window.open('', '_blank')
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const budgetVariance = budget - totalExpenses
    const totalProjectExpenses = totalExpenses * projectDuration
    const totalProjectRevenue = projectRevenue * projectDuration
    const totalProfit = totalProjectRevenue - totalProjectExpenses

    printWindow.document.write(`
      <html>
        <head>
          <title>Creative Project Budget Summary</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Creative Project Budget Summary</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Project Overview</h2>
            <p><strong>Monthly Budget:</strong> ₪${budget.toFixed(2)}</p>
            <p><strong>Project Duration:</strong> ${projectDuration} month(s)</p>
            <p><strong>Monthly Revenue:</strong> ₪${projectRevenue.toFixed(2)}</p>
            <p><strong>Total Project Budget:</strong> ₪${(budget * projectDuration).toFixed(2)}</p>
            <p><strong>Total Project Revenue:</strong> ₪${totalProjectRevenue.toFixed(2)}</p>
          </div>

          <div class="summary">
            <h2>Financial Summary</h2>
            <p><strong>Monthly Expenses:</strong> ₪${totalExpenses.toFixed(2)}</p>
            <p><strong>Monthly Variance:</strong> <span class="${budgetVariance >= 0 ? 'positive' : 'negative'}">₪${budgetVariance.toFixed(2)}</span></p>
            <p><strong>Total Project Expenses:</strong> ₪${totalProjectExpenses.toFixed(2)}</p>
            <p><strong>Total Project Profit:</strong> <span class="${totalProfit >= 0 ? 'positive' : 'negative'}">₪${totalProfit.toFixed(2)}</span></p>
          </div>

          <h2>Expense Details</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Expense Name</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(expense => `
                <tr>
                  <td>${new Date(expense.date).toLocaleDateString()}</td>
                  <td>${expense.name}</td>
                  <td>${expense.category}</td>
                  <td>₪${expense.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetVariance = budget - totalExpenses
  const budgetUsage = budget > 0 ? (totalExpenses / budget) * 100 : 0

  // Project statistics
  const totalProjectExpenses = totalExpenses * projectDuration
  const totalProjectRevenue = projectRevenue * projectDuration
  const totalProfit = totalProjectRevenue - totalProjectExpenses

  const expensesByCategory = EXPENSE_CATEGORIES.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category)
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    return total > 0 ? { name: category, value: total } : null
  }).filter(Boolean)

  const monthlyData = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const existing = acc.find(item => item.month === month)
    if (existing) {
      existing.amount += expense.amount
    } else {
      acc.push({ month, amount: expense.amount })
    }
    return acc
  }, []).sort((a, b) => new Date(a.month) - new Date(b.month))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Calculator className="h-10 w-10 text-blue-600" />
            Creative Project Budget Tracker
          </h1>
          <p className="text-gray-600 text-lg">Manage budgets for marketing campaigns, video productions, and creative projects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Settings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Project Settings
                </CardTitle>
                <CardDescription>Configure your project parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="budget">Monthly Budget (₪)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="budget"
                        type="number"
                        placeholder="Enter budget amount"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleSetBudget} className="bg-blue-600 hover:bg-blue-700">
                        Set Budget
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="duration">Project Duration (months)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={projectDuration}
                      onChange={(e) => setProjectDuration(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue">Monthly Revenue (₪)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      placeholder="Expected monthly revenue"
                      value={projectRevenue}
                      onChange={(e) => setProjectRevenue(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add New Expense */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Add New Expense
                </CardTitle>
                <CardDescription>Record a new campaign or production expense</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Expense name"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  />
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expense-file">Attach File (optional)</Label>
                  <Input
                    id="expense-file"
                    type="file"
                    onChange={(e) => handleFileUpload(e)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleAddExpense} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardContent>
            </Card>

            {/* Expense List */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Expense List</CardTitle>
                <CardDescription>All recorded expenses for this campaign/project</CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No expenses recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              EXPENSE_CATEGORIES.indexOf(expense.category) % 2 === 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {expense.category}
                            </span>
                            <h3 className="font-semibold text-gray-900">{expense.name}</h3>
                            {expense.file && (
                              <FileText className="h-4 w-4 text-gray-500" title="Has attachment" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg text-gray-900">₪{expense.amount.toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Budget:</span>
                    <span className="font-semibold text-lg">₪{budget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Expenses:</span>
                    <span className="font-semibold text-lg">₪{totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly Variance:</span>
                      <span className={`font-semibold text-lg ${budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₪{budgetVariance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Budget Progress Bar */}
                {budget > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Budget Usage</span>
                      <span>{budgetUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          budgetUsage > 100 ? 'bg-red-500' : 
                          budgetUsage > 50 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Project Statistics */}
                {projectDuration > 1 && (
                  <div className="border-t pt-3 mt-4">
                    <h4 className="font-semibold mb-2">Project Statistics ({projectDuration} months)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Budget:</span>
                        <span>₪{(budget * projectDuration).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span>₪{totalProjectRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Expenses:</span>
                        <span>₪{totalProjectExpenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-600">Total Profit:</span>
                        <span className={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ₪{totalProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={generatePDF} className="w-full mt-4" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF Summary
                </Button>
              </CardContent>
            </Card>

            {/* Expenses by Category Chart */}
            {expensesByCategory.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₪${value.toFixed(2)}`, 'Amount']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Monthly Expenses Chart */}
            {monthlyData.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₪${value.toFixed(2)}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the expense details</DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Expense Name</Label>
                <Input
                  id="edit-name"
                  value={editingExpense.name}
                  onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editingExpense.category} onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-amount">Amount (₪)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-file">Update File (optional)</Label>
                <Input
                  id="edit-file"
                  type="file"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="mt-1"
                />
                {editingExpense.file && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current file: {editingExpense.file.name || 'Attached file'}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateExpense} className="flex-1">
                  Update Expense
                </Button>
                <Button variant="outline" onClick={() => setEditingExpense(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
