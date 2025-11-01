"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Heart, CheckCircle, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function GivePage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    givingType: 'Tithe',
    message: '',
    paymentProvider: 'flutterwave'
  })

  // Check for success status from URL params
  useEffect(() => {
    const status = searchParams.get('status')
    const ref = searchParams.get('ref')
    
    if (status === 'success' && ref) {
      toast({
        title: "Thank you for your giving!",
        description: "Your payment was successful. A receipt has been sent to your email.",
        variant: "default"
      })
      // Reset form after successful payment
      setFormData({
        name: '',
        email: '',
        amount: '',
        givingType: 'Tithe',
        message: '',
        paymentProvider: 'flutterwave'
      })
      setPaymentInitiated(false)
    }
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.email || !formData.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    const amountNum = parseFloat(formData.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/giving/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          amount: amountNum,
          givingType: formData.givingType,
          message: formData.message,
          paymentProvider: formData.paymentProvider,
          currency: 'NGN'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      setPaymentData(data)
      setPaymentInitiated(true)

      // Redirect to payment gateway
      if (formData.paymentProvider === 'flutterwave' && data.paymentData?.paymentLink) {
        window.location.href = data.paymentData.paymentLink
      } else if (formData.paymentProvider === 'paystack' && data.paymentData?.authorizationUrl) {
        window.location.href = data.paymentData.authorizationUrl
      } else {
        throw new Error('Payment link not available')
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error)
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive"
      })
      setIsSubmitting(false)
      setPaymentInitiated(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Give Cheerfully — Support the Work of God
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            "Each of you should give what you have decided in your heart to give, 
            not reluctantly or under compulsion, for God loves a cheerful giver." 
            <span className="block mt-2 text-lg font-semibold">— 2 Corinthians 9:7</span>
          </p>
        </div>

        {/* Payment Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Make a Donation</CardTitle>
            <CardDescription>
              Fill in your details below to proceed with your giving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="amount">Amount (NGN) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="givingType">Giving Type *</Label>
                  <Select
                    id="givingType"
                    value={formData.givingType}
                    onChange={(e) => setFormData({ ...formData, givingType: e.target.value })}
                    disabled={isSubmitting}
                  >
                    <option value="Tithe">Tithe</option>
                    <option value="Offering">Offering</option>
                    <option value="Building Fund">Building Fund</option>
                    <option value="Missions">Missions</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message or Note (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message or note..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="paymentProvider">Payment Method *</Label>
                <Select
                  id="paymentProvider"
                  value={formData.paymentProvider}
                  onChange={(e) => setFormData({ ...formData, paymentProvider: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="flutterwave">Flutterwave</option>
                  <option value="paystack">Paystack</option>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Choose your preferred payment gateway. Both are secure and support card, bank transfer, and mobile money.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || paymentInitiated}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : paymentInitiated ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Redirecting to Payment...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                🔒 Your payment information is secure and encrypted. 
                We use industry-standard payment processors to ensure your data is protected.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transparent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All transactions are recorded and tracked. You'll receive an automated receipt via email.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We use trusted payment gateways (Flutterwave & Paystack) with bank-level security.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impactful</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your giving supports the work of God, missions, building projects, and church operations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

