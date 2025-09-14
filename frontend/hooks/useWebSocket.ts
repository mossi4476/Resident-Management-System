import { useEffect, useCallback } from 'react';
import { webSocketService } from '../lib/websocket';

export const useWebSocket = () => {
  useEffect(() => {
    console.log('🔌 useWebSocket: Connecting to WebSocket...');
    // Connect when component mounts
    webSocketService.connect();

    // Disconnect when component unmounts
    return () => {
      console.log('🔌 useWebSocket: Disconnecting from WebSocket...');
      webSocketService.disconnect();
    };
  }, []);

  const onComplaintCreated = useCallback((handler: (data: any) => void) => {
    webSocketService.on('complaint.created', handler);
    return () => webSocketService.off('complaint.created', handler);
  }, []);

  const onComplaintUpdated = useCallback((handler: (data: any) => void) => {
    webSocketService.on('complaint.updated', handler);
    return () => webSocketService.off('complaint.updated', handler);
  }, []);

  const onComplaintDeleted = useCallback((handler: (data: any) => void) => {
    webSocketService.on('complaint.deleted', handler);
    return () => webSocketService.off('complaint.deleted', handler);
  }, []);

  return {
    isConnected: webSocketService.isConnected(),
    onComplaintCreated,
    onComplaintUpdated,
    onComplaintDeleted,
    joinRoom: webSocketService.joinRoom.bind(webSocketService),
    leaveRoom: webSocketService.leaveRoom.bind(webSocketService),
  };
};
