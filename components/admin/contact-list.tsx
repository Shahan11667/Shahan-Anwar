"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Calendar, User, MessageSquare } from 'lucide-react'

interface Contact {
  _id: string
  name: string
  email: string
  message: string
  createdAt: string
}

interface ContactListProps {
  contacts: Contact[]
}

const ContactList = ({ contacts }: ContactListProps) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (contacts.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">Contact Messages</h2>
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No contact messages yet.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Contact Messages ({contacts.length})</h2>
      
      <div className="grid gap-4">
        {contacts.map((contact, index) => (
          <motion.div
            key={contact._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedContact?._id === contact._id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedContact(selectedContact?._id === contact._id ? null : contact)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {getInitials(contact.name)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-1" />
                        {contact.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(contact.createdAt)}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {contact.message.length > 100 
                        ? `${contact.message.substring(0, 100)}...` 
                        : contact.message
                      }
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              {selectedContact?._id === contact._id && (
                <CardContent className="pt-0">
                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Full Message
                    </h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {contact.message}
                    </p>
                    <div className="flex justify-end mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={`mailto:${contact.email}?subject=Re: Your message from portfolio`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Reply
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ContactList
