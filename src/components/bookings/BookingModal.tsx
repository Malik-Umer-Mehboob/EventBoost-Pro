import React, { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { EventData } from '../../api/eventApi';
import { Users, Calendar } from 'lucide-react';
import CheckoutButton from './CheckoutButton';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ event, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  if (!event) return null;

  const availableTickets = event.ticketQuantity - (event.soldTickets || 0);
  const totalPrice = event.ticketPrice * quantity;
  
  const isOwner = user?._id === (event.organizer?._id || event.createdBy?._id);
  const isAdmin = user?.role === 'admin';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-navy-700">
        <div className="relative h-48 overflow-hidden border-b border-navy-600">
          <img 
            src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent" />
          <div className="absolute bottom-6 left-8 right-8">
            <h2 className="text-2xl font-black text-navy-100 leading-tight tracking-tight">{event.title}</h2>
            <p className="text-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4" />
              {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6 bg-navy-700">
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-navy-900 border border-navy-600">
                <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest leading-none mb-2 text-center">Price Per Ticket</p>
                <p className="text-xl font-black text-gold text-center">${event.ticketPrice}</p>
             </div>
             <div className="p-4 rounded-2xl bg-navy-900 border border-navy-600">
                <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest leading-none mb-2 text-center">Availability</p>
                <p className="text-xl font-black text-emerald-400 text-center">{availableTickets} Left</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-navy-900 rounded-2xl border border-navy-600">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gold" />
                    <span className="font-black text-[10px] uppercase tracking-widest text-navy-200">Select Quantity</span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-xl border border-navy-600 bg-navy-800 flex items-center justify-center font-black text-navy-100 hover:border-gold hover:text-gold transition-all"
                    >
                        -
                    </button>
                    <span className="font-black text-lg w-4 text-center text-navy-100">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
                        className="w-8 h-8 rounded-xl border border-navy-600 bg-navy-800 flex items-center justify-center font-black text-navy-100 hover:border-gold hover:text-gold transition-all"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="pt-6 border-t border-navy-600">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-navy-500 font-black uppercase text-[10px] tracking-widest mb-1">Total Bill</p>
                        <h3 className="text-4xl font-black text-gold tracking-tight">${totalPrice}</h3>
                    </div>
                </div>

                <CheckoutButton 
                    eventId={event._id!} 
                    quantity={quantity} 
                    price={event.ticketPrice} 
                    isOwner={isOwner}
                    isAdmin={isAdmin}
                />
            </div>
          </div>

          <p className="text-[10px] text-navy-500 text-center font-medium leading-relaxed">
            Instant booking. Professional PDF tickets with QR codes will be sent to your email after successful payment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
