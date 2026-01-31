'use client';

import { IconFilter, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface PermissionFiltersProps {
  onFilterChange: (filters: PermissionFilterValues) => void;
  currentFilters: PermissionFilterValues;
}

export interface PermissionFilterValues {
  name: string;
  resource: string;
  action: string;
}

export function PermissionFilters({ onFilterChange, currentFilters }: PermissionFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<PermissionFilterValues>(currentFilters);

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: PermissionFilterValues = {
      name: '',
      resource: 'all',
      action: 'all',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters =
    filters.name !== '' ||
    filters.resource !== 'all' ||
    filters.action !== 'all';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconFilter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {[
                filters.name !== '',
                filters.resource !== 'all',
                filters.action !== 'all',
              ].filter(Boolean).length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Permissions</DialogTitle>
          <DialogDescription>Apply filters to narrow down the permission list.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Permission Name</Label>
            <Input
              id="name"
              placeholder="Search by name..."
              value={filters.name}
              onChange={(e) =>
                setFilters({ ...filters, name: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="resource">Resource</Label>
            <Select
              value={filters.resource}
              onValueChange={(value) =>
                setFilters({ ...filters, resource: value })
              }
            >
              <SelectTrigger id="resource">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="addon">Addon</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="language">Language</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="permission">Permission</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="setting">Setting</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="yacht">Yacht</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="action">Action</Label>
            <Select
              value={filters.action}
              onValueChange={(value) =>
                setFilters({ ...filters, action: value })
              }
            >
              <SelectTrigger id="action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleResetFilters}>
            <IconX className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
