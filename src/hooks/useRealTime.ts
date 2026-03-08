import { useSocket } from '../context/SocketContext';

export const useRealTime = () => {
    return useSocket();
};
