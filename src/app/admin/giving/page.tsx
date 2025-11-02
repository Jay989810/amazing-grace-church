"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DollarSign, Download, RefreshCw, CheckCircle, XCircle, Clock, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface GivingTransaction {
  id: string
  name: string
  email: string
  amount: number
  currency: string
  givingType: string
  message?: string
  paymentProvider: string
  paymentReference: string
  transactionId?: string
  status: 'pending' | 'successful' | 'failed' | 'cancelled'
  receiptSent: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminGivingPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [transactions, setTransactions] = useState<GivingTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [totalAmount, setTotalAmount] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }
    if (session) {
      loadTransactions()
    }
  }, [session, status, filterStatus, router])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const statusParam = filterStatus === 'all' ? '' : filterStatus
      const response = await fetch(`/api/giving/transactions${statusParam ? `?status=${statusParam}` : ''}`)
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
        
        // Calculate stats
        const successful = data.transactions.filter((t: GivingTransaction) => t.status === 'successful')
        const pending = data.transactions.filter((t: GivingTransaction) => t.status === 'pending')
        const failed = data.transactions.filter((t: GivingTransaction) => t.status === 'failed')
        
        const total = successful.reduce((sum: number, t: GivingTransaction) => sum + t.amount, 0)
        
        setStats({
          total: data.transactions.length,
          successful: successful.length,
          pending: pending.length,
          failed: failed.length
        })
        setTotalAmount(total)
      } else {
        throw new Error('Failed to load transactions')
      }
    } catch (error: any) {
      console.error('Error loading transactions:', error)
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Amount', 'Currency', 'Giving Type', 'Payment Provider', 'Reference', 'Status', 'Receipt Sent']
    const rows = transactions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.name,
      t.email,
      t.amount.toString(),
      t.currency,
      t.givingType,
      t.paymentProvider,
      t.paymentReference,
      t.status,
      t.receiptSent ? 'Yes' : 'No'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `giving-transactions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Transactions exported to CSV"
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    switch (status) {
      case 'successful':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Giving Transactions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and manage all giving transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.successful}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary break-words">
                ₦{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Label htmlFor="status-filter" className="text-sm sm:text-base whitespace-nowrap">Filter by Status:</Label>
                <Select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto"
                >
                  <option value="all">All</option>
                  <option value="successful">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={loadTransactions} disabled={loading} className="w-full sm:w-auto">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" onClick={exportToCSV} disabled={transactions.length === 0} className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Provider</th>
                      <th className="text-left p-3 font-medium">Reference</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3 text-sm font-medium">{transaction.name}</td>
                        <td className="p-3 text-sm">{transaction.email}</td>
                        <td className="p-3 text-sm font-semibold">
                          {transaction.currency} {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-sm">{transaction.givingType}</td>
                        <td className="p-3 text-sm capitalize">{transaction.paymentProvider}</td>
                        <td className="p-3 text-sm font-mono text-xs">{transaction.paymentReference}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 ${getStatusBadge(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {transaction.receiptSent ? (
                            <span title="Receipt sent">
                              <Mail className="w-4 h-4 text-green-500" />
                            </span>
                          ) : (
                            <span title="Receipt not sent">
                              <Mail className="w-4 h-4 text-gray-400" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


