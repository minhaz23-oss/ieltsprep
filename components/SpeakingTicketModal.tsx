'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, Ticket } from 'lucide-react'

interface SpeakingTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  remainingTickets: number
  isLoading?: boolean
}

export default function SpeakingTicketModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  remainingTickets,
  isLoading = false 
}: SpeakingTicketModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Use Speaking Test Ticket?
            </h3>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800 dark:text-orange-200">
                Ticket Usage Warning
              </span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              You have <strong>{remainingTickets}</strong> speaking test ticket{remainingTickets !== 1 ? 's' : ''} remaining for today.
              Once used, you won't be able to take another AI speaking test until tomorrow.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Daily Reset
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your speaking test tickets reset every day at midnight. You get 1 free AI speaking test per day.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you ready to start your IELTS Speaking test with AI?
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting...
              </>
            ) : (
              <>
                <Ticket className="mr-2 h-4 w-4" />
                Use Ticket & Start
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}