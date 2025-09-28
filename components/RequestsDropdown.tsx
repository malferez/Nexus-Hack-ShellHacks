
import React from 'react';
import type { Request } from '../types';

interface RequestsDropdownProps {
  requests: Request[];
  onAccept: (request: Request) => void;
  onDecline: (requestId: number) => void;
  onClose: () => void;
}

const RequestsDropdown: React.FC<RequestsDropdownProps> = ({ requests, onAccept, onDecline, onClose }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-shell-card rounded-md shadow-2xl border border-fiu-blue/50 z-50">
      <div className="p-3 border-b border-fiu-blue">
        <h3 className="font-bold text-shell-text">Pending Requests</h3>
      </div>
      {requests.length === 0 ? (
        <p className="text-shell-text-secondary text-sm p-4 text-center">No new requests.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {requests.map(req => (
            <div key={req.id} className="p-3 border-b border-fiu-blue/50">
              <p className="text-sm text-shell-text-secondary mb-3">
                {req.type === 'invite' ? (
                  <>
                    <span className="font-bold text-shell-text">{req.team.name}</span> has invited you to join their team.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-shell-text">{req.fromUser.name}</span> wants to join your team, <span className="font-bold text-shell-text">{req.team.name}</span>.
                  </>
                )}
              </p>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => { onDecline(req.id); onClose(); }} 
                  className="px-3 py-1 text-xs font-semibold text-red-300 bg-red-800/50 rounded-md hover:bg-red-800/80"
                >
                  Decline
                </button>
                <button 
                  onClick={() => { onAccept(req); onClose(); }}
                  className="px-3 py-1 text-xs font-semibold text-green-300 bg-green-800/50 rounded-md hover:bg-green-800/80"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsDropdown;