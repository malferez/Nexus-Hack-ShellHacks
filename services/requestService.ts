
import type { Request } from '../types';

const REQUESTS_KEY = 'shellhacks_requests';

export function getRequests(): Request[] {
  const requestsJSON = localStorage.getItem(REQUESTS_KEY);
  return requestsJSON ? JSON.parse(requestsJSON) : [];
}

function saveRequests(requests: Request[]): void {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function createRequest(data: Omit<Request, 'id' | 'status'>): Request {
  const requests = getRequests();
  const newRequest: Request = {
    ...data,
    id: Date.now(),
    status: 'pending',
  };
  saveRequests([...requests, newRequest]);
  return newRequest;
}

export function deleteRequest(requestId: number): void {
  let requests = getRequests();
  requests = requests.filter(req => req.id !== requestId);
  saveRequests(requests);
}