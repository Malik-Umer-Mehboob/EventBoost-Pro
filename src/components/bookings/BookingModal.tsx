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
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-[#162333]">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-8 right-8">
            <h2 className="text-2xl font-black text-white leading-tight">{event.title}</h2>
            <p className="text-white/80 text-sm font-medium flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6 bg-[#162333]">
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-[#1A2B3D] border border-[#2E4A63]">
                <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-widest leading-none mb-1 text-center">Price Per Ticket</p>
                <p className="text-xl font-black text-[#C9A84C] text-center">${event.ticketPrice}</p>
             </div>
             <div className="p-4 rounded-2xl bg-[#1A2B3D] border border-[#2E4A63]">
                <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-widest leading-none mb-1 text-center">Available</p>
                <p className="text-xl font-black text-emerald-400 text-center">{availableTickets} Left</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#1A2B3D] rounded-2xl border border-[#2E4A63]">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#C9A84C]" />
                    <span className="font-bold text-[#B8C5D3]">Select Quantity</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full border border-[#2E4A63] flex items-center justify-center font-bold text-[#B8C5D3] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
                    >
                        -
                    </button>
                    <span className="font-black text-lg w-4 text-center text-[#EDF2F7]">{quantity}</span>
                    <button
                        onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
                        className="w-8 h-8 rounded-full border border-[#2E4A63] flex items-center justify-center font-bold text-[#B8C5D3] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-[#2E4A63]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-[#5A7A94] font-bold uppercase text-[10px] tracking-widest mb-1">Total Bill</p>
                        <h3 className="text-4xl font-black text-[#C9A84C]">${totalPrice}</h3>
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

          <p className="text-[10px] text-[#5A7A94] text-center font-medium leading-relaxed">
            Instant booking. Professional PDF tickets with QR codes will be sent to your email after successful payment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
