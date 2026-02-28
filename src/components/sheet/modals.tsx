/**
 * Sheet Operation Modals
 * Dialogs for paste and delete operations
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * Paste Modal
 */
interface PasteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: 'insert' | 'update' | 'replace') => void;
  availablePages: string[];
  currentPage: string;
  clipboardInfo?: {
    rowCount: number;
    columnCount: number;
    sourcePageName: string;
  };
  isLoading?: boolean;
}

export function PasteModal({
  open,
  onOpenChange,
  onConfirm,
  availablePages,
  currentPage,
  clipboardInfo,
  isLoading = false,
}: PasteModalProps) {
  const [mode, setMode] = useState<'insert' | 'update' | 'replace'>('insert');
  const [targetPage, setTargetPage] = useState(currentPage);

  const handleConfirm = () => {
    onConfirm(mode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Paste Rows</DialogTitle>
          <DialogDescription>
            Choose how to paste {clipboardInfo?.rowCount || 0} rows from clipboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Target Page Selection */}
          <div className="space-y-2">
            <Label htmlFor="target-page" className="font-semibold">
              Target Page
            </Label>
            <Select value={targetPage} onValueChange={setTargetPage}>
              <SelectTrigger id="target-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePages.map((page) => (
                  <SelectItem key={page} value={page}>
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {targetPage === clipboardInfo?.sourcePageName && (
              <p className="text-xs text-orange-600">
                ℹ️ Pasting to the same page as source
              </p>
            )}
          </div>

          {/* Paste Mode Selection */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <Label className="font-semibold">Paste Mode</Label>
            <RadioGroup value={mode} onValueChange={(v: any) => setMode(v)}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="insert" id="mode-insert" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="mode-insert" className="font-normal cursor-pointer">
                    Insert (Add new rows)
                  </Label>
                  <p className="text-xs text-gray-600">
                    Creates new rows with new IDs. Non-destructive.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="update" id="mode-update" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="mode-update" className="font-normal cursor-pointer">
                    Update (Modify existing)
                  </Label>
                  <p className="text-xs text-gray-600">
                    Updates rows with matching IDs. Only updates matching rows.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="replace" id="mode-replace" className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="mode-replace" className="font-normal cursor-pointer">
                    Replace (Delete all, then insert)
                  </Label>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-red-600" />
                    Warning: Deletes all rows in target page
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-blue-900">
                <p className="font-semibold text-sm">Paste Details:</p>
                <ul className="text-xs mt-1 space-y-0.5">
                  <li>• Rows to paste: {clipboardInfo?.rowCount}</li>
                  <li>• Columns: {clipboardInfo?.columnCount}</li>
                  <li>• Source: {clipboardInfo?.sourcePageName}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Pasting...' : 'Paste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Delete Modal
 */
interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (hard: boolean) => void;
  rowsToDelete: number;
  isLoading?: boolean;
}

export function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  rowsToDelete,
  isLoading = false,
}: DeleteModalProps) {
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('hard');
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (deleteType === 'hard' && !confirmed) {
      return; // Require confirmation checkbox for hard delete
    }
    onConfirm(deleteType === 'hard');
    onOpenChange(false);
    setConfirmed(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            Delete {rowsToDelete} Rows
          </DialogTitle>
          <DialogDescription>
            Choose deletion method. Hard delete is permanent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Delete Type Selection */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <Label className="font-semibold">Delete Type</Label>
            <RadioGroup value={deleteType} onValueChange={(v: any) => setDeleteType(v)}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="soft" id="delete-soft" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="delete-soft" className="font-normal cursor-pointer">
                    Soft Delete (Recommended)
                  </Label>
                  <p className="text-xs text-gray-600">
                    Marks rows as deleted. Can be recovered. Status changed to "deleted".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="hard" id="delete-hard" className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="delete-hard" className="font-normal cursor-pointer">
                    Hard Delete (Permanent)
                  </Label>
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Removes rows permanently. Cannot be undone.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Hard Delete Confirmation */}
          {deleteType === 'hard' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-red-900 text-sm">Permanent Deletion</p>
                  <p className="text-xs text-red-800 mb-3">
                    You are about to permanently delete {rowsToDelete} rows. This action
                    cannot be undone.
                  </p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="confirm-delete"
                      checked={confirmed}
                      onCheckedChange={(checked) => setConfirmed(checked === true)}
                    />
                    <Label
                      htmlFor="confirm-delete"
                      className="text-xs font-medium text-red-900 cursor-pointer"
                    >
                      I understand this is permanent
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-semibold text-sm">Rows to delete: {rowsToDelete}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="destructive"
            disabled={isLoading || (deleteType === 'hard' && !confirmed)}
          >
            {isLoading ? 'Deleting...' : `Delete (${deleteType})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
