import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Users } from 'lucide-react'

const roleColor = { admin: 'destructive', farmer: 'default', customer: 'secondary' }
const statusColor = { active: 'default', inactive: 'secondary' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/users')
      .then(({ data }) => setUsers(data.data?.data || data.data || []))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load users.')
        setUsers([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}/status`)
      toast.success('Status updated')
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      load()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Users className="size-10 mx-auto mb-2 opacity-30" />
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleColor[u.role] || 'outline'} className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor[u.status] || 'outline'}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.phone || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => toggleStatus(u)}>
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
