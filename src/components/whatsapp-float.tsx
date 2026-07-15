'use client'

import { useStoreCommerce } from '@/hooks/use-store-commerce'
import { whatsappChatUrl } from '@/lib/site-settings-client'
import { WhatsAppIconButton } from '@/components/whatsapp-icon'

export function WhatsAppFloat() {
  const { whatsappNumber, whatsappIconId, whatsappIconUrl } = useStoreCommerce()
  const href = whatsappChatUrl(
    whatsappNumber,
    'Hi GBB Fashion! I have a question about your products.'
  )

  if (!whatsappNumber) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIconButton
        iconId={whatsappIconId}
        iconUrl={whatsappIconUrl}
        size="md"
      />
    </a>
  )
}
