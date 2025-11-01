"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Plus, Edit, Trash2, Save, X, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/file-upload"
import { useRouter } from "next/navigation"

interface Organization {
  id: string
  name: string
  description: string
  leaderName: string
  leaderRole: string
  contactEmail?: string
  imageUrl?: string
  dateCreated: string
}

export default function AdminOrganizationsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<Organization | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaderName: '',
    leaderRole: '',
    contactEmail: '',
    imageUrl: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }
    if (session) {
      loadOrganizations()
    }
  }, [session, status, router])

  const loadOrganizations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data)
      } else {
        throw new Error('Failed to load organizations')
      }
    } catch (error: any) {
      console.error('Error loading organizations:', error)
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const handleCreateOrganization = async () => {
    try {
      if (!formData.name || !formData.description || !formData.leaderName || !formData.leaderRole) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (name, description, leader name, leader role)",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const newOrg = await response.json()
        setOrganizations([newOrg, ...organizations])
        setFormData({
          name: '',
          description: '',
          leaderName: '',
          leaderRole: '',
          contactEmail: '',
          imageUrl: ''
        })
        toast({
          title: "Success",
          description: "Organization created successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create organization')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create organization",
        variant: "destructive"
      })
    }
  }

  const handleUpdateOrganization = async () => {
    try {
      if (!editingItem) return

      const response = await fetch('/api/organizations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingItem.id, ...formData })
      })
      
      if (response.ok) {
        const updatedOrg = await response.json()
        setOrganizations(organizations.map(org => org.id === editingItem.id ? updatedOrg : org))
        setIsEditing(false)
        setEditingItem(null)
        setFormData({
          name: '',
          description: '',
          leaderName: '',
          leaderRole: '',
          contactEmail: '',
          imageUrl: ''
        })
        toast({
          title: "Success",
          description: "Organization updated successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update organization')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update organization",
        variant: "destructive"
      })
    }
  }

  const handleDeleteOrganization = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return
    
    try {
      const response = await fetch(`/api/organizations?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setOrganizations(organizations.filter(org => org.id !== id))
        toast({
          title: "Success",
          description: "Organization deleted successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete organization')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete organization",
        variant: "destructive"
      })
    }
  }

  const startEditOrganization = (org: Organization) => {
    setEditingItem(org)
    setFormData({
      name: org.name,
      description: org.description,
      leaderName: org.leaderName,
      leaderRole: org.leaderRole,
      contactEmail: org.contactEmail || '',
      imageUrl: org.imageUrl || ''
    })
    setIsEditing(true)
  }

  const handleImageUpload = (file: any) => {
    if (file && file.url) {
      setFormData({ ...formData, imageUrl: file.url })
      toast({
        title: "Image Uploaded",
        description: "Organization image has been set"
      })
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Manage Organizations</h1>
          <p className="text-muted-foreground">Add, edit, or remove church organizations and sub-bodies</p>
        </div>

        {/* Add/Edit Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {isEditing ? 'Edit Organization' : 'Add New Organization'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="org-name">Organization Name *</Label>
                <Input
                  id="org-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Choir Department"
                />
              </div>
              <div>
                <Label htmlFor="org-leader-name">Leader Name *</Label>
                <Input
                  id="org-leader-name"
                  value={formData.leaderName}
                  onChange={(e) => setFormData({...formData, leaderName: e.target.value})}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <Label htmlFor="org-leader-role">Leader Role *</Label>
                <Input
                  id="org-leader-role"
                  value={formData.leaderRole}
                  onChange={(e) => setFormData({...formData, leaderRole: e.target.value})}
                  placeholder="e.g., Coordinator, President, Head"
                />
              </div>
              <div>
                <Label htmlFor="org-email">Contact Email</Label>
                <Input
                  id="org-email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  placeholder="organization@amazinggracechurch.org"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="org-description">Description *</Label>
              <Textarea
                id="org-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief overview of what this organization does..."
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Organization Image</Label>
              <FileUpload
                type="gallery"
                accept="image/*"
                maxSize={5}
                multiple={false}
                onUploadComplete={handleImageUpload}
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Organization"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleUpdateOrganization}>
                    <Save className="w-4 h-4 mr-2" />
                    Update Organization
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false)
                    setEditingItem(null)
                    setFormData({
                      name: '',
                      description: '',
                      leaderName: '',
                      leaderRole: '',
                      contactEmail: '',
                      imageUrl: ''
                    })
                  }}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleCreateOrganization}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Organization
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organizations List */}
        <Card>
          <CardHeader>
            <CardTitle>All Organizations ({organizations.length})</CardTitle>
            <CardDescription>
              Manage organizations displayed on the public organizations page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading organizations...</p>
                </div>
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No organizations added yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your first organization using the form above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                  <Card key={org.id} className="overflow-hidden">
                    {org.imageUrl ? (
                      <div className="relative w-full h-48 bg-muted">
                        <img
                          src={org.imageUrl}
                          alt={org.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {org.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm">
                          <strong>Leader:</strong> {org.leaderName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {org.leaderRole}
                        </p>
                        {org.contactEmail && (
                          <p className="text-sm text-muted-foreground">
                            {org.contactEmail}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditOrganization(org)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteOrganization(org.id, org.name)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

