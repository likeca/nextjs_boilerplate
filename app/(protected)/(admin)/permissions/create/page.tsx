'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/use-permission';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createPermission } from '@/actions/permissions/create-permission';
import { IconArrowLeft } from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RESOURCES = [
  'activity',
  'addon',
  'banner',
  'blog',
  'booking',
  'category',
  'event',
  'language',
  'offer',
  'permission',
  'role',
  'setting',
  'user',
  'yacht',
];

const ACTIONS = ['create', 'read', 'update', 'delete'];

export default function CreatePermissionPage() {
  const router = useRouter();
  const { isLoading: checkingPermission, hasPermission } = usePermission('permission', 'create');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await createPermission(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.push('/permissions');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-generate permission name based on resource and action
  const handleResourceOrActionChange = (field: 'resource' | 'action', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Auto-generate name if both resource and action are set
    if (newFormData.resource && newFormData.action) {
      newFormData.name = `${newFormData.resource}:${newFormData.action}`;
    }
    
    setFormData(newFormData);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
                <Breadcrumb className="mb-6">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/permissions">Permissions</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Create Permission</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold">Create Permission</h1>
                    <p className="text-sm text-muted-foreground">Define a new system permission</p>
                  </div>
                  <div>
                    <Button size="sm" variant="outline" onClick={() => router.push('/permissions')}>
                      <IconArrowLeft className="mr-2 h-4 w-4" />
                      Back to Permissions
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Permission Details</CardTitle>
                      <CardDescription>Enter the permission information below</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="resource">
                            Resource <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.resource}
                            onValueChange={(value) => handleResourceOrActionChange('resource', value)}
                          >
                            <SelectTrigger id="resource">
                              <SelectValue placeholder="Select a resource" />
                            </SelectTrigger>
                            <SelectContent>
                              {RESOURCES.map((resource) => (
                                <SelectItem key={resource} value={resource} className="capitalize">
                                  {resource}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="action">
                            Action <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.action}
                            onValueChange={(value) => handleResourceOrActionChange('action', value)}
                          >
                            <SelectTrigger id="action">
                              <SelectValue placeholder="Select an action" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTIONS.map((action) => (
                                <SelectItem key={action} value={action} className="capitalize">
                                  {action}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Permission Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., activity:create"
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Auto-generated from resource and action, but can be customized
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe what this permission allows..."
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={submitting}>
                          {submitting ? 'Creating...' : 'Create Permission'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/permissions')}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </div>
            </div>
          </div>
        </div>
  );
}
