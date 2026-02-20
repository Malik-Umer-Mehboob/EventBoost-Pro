import React from 'react';
import { EventData } from '../api/eventApi';

interface EventCardProps {
  event: EventData;
  onDelete?: (id: string) => void;
  onEdit?: (event: EventData) => void;
  onRegister?: (id: string) => void;
  isOwner?: boolean;
  isAdmin?: boolean;
  isRegistered?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onDelete, 
  onEdit, 
  onRegister, 
  isOwner, 
  isAdmin,
  isRegistered 
}) => {
  return (
    <div className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
        <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
          {new Date(event.date).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
      <div className="text-sm text-gray-500 space-y-1 mb-4">
        <p><span className="font-semibold">Location:</span> {event.location}</p>
        <p><span className="font-semibold">Organizer:</span> {event.createdBy?.name || 'Unknown'}</p>
        <p><span className="font-semibold">Attendees:</span> {event.attendees?.length || 0}</p>
      </div>
      
      <div className="flex gap-2 mt-auto">
        {onRegister && !isRegistered && !isOwner && !isAdmin && (
          <button 
            onClick={() => onRegister(event._id!)}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Register Now
          </button>
        )}
        {isRegistered && (
            <span className="flex-1 text-center bg-gray-100 text-gray-600 px-4 py-2 rounded">
                Registered
            </span>
        )}
        {(isOwner || isAdmin) && onEdit && (
          <button 
            onClick={() => onEdit(event)}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
        )}
        {(isOwner || isAdmin) && onDelete && (
          <button 
            onClick={() => onDelete(event._id!)}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
