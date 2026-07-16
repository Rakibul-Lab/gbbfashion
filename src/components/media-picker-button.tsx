'use client'

import { useState } from 'react'
import { Images, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  MediaLibraryModal,
  type MediaAccept,
  type MediaFolder,
  type MediaItem,
} from '@/components/media-library-modal'

type Props = {
  onSelect: (url: string, item?: MediaItem) => void
  currentUrl?: string
  title?: string
  folder?: MediaFolder
  accept?: MediaAccept
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  loading?: boolean
}

/** Opens the shared WordPress-style media library. */
export function MediaPickerButton({
  onSelect,
  currentUrl = '',
  title = 'Media library',
  folder = 'all',
  accept = 'all',
  label = 'Select / Upload',
  variant = 'default',
  size = 'sm',
  className,
  disabled,
  loading,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || loading}
        onClick={() => setOpen(true)}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Images className="h-3.5 w-3.5 mr-1.5" />
        )}
        {label}
      </Button>
      <MediaLibraryModal
        open={open}
        onOpenChange={setOpen}
        onSelect={onSelect}
        currentUrl={currentUrl}
        title={title}
        folder={folder}
        accept={accept}
      />
    </>
  )
}
