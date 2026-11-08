import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { WebSocket } from 'ws';

export const wsGatewayPlugin: FastifyPluginAsync = fp(async (server) => {
  // Map of projectId -> Set of WebSocket clients
  const projectSubscribers = new Map<string, Set<WebSocket>>();

  // Subscribe to all project event channels via Redis psubscribe
  await server.redisSub.psubscribe('events:project:*');

  server.redisSub.on('pmessage', (_pattern: string, channel: string, message: string) => {
    // channel format: events:project:<projectId>
    const parts = channel.split(':');
    const projectId = parts[2];
    if (!projectId) return;

    const clients = projectSubscribers.get(projectId);
    if (!clients || clients.size === 0) return;

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  server.get('/ws', { websocket: true }, (socket: WebSocket) => {
    const subscribedProjects = new Set<string>();

    socket.on('message', (data: Buffer | string) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === 'subscribe' && typeof payload.projectId === 'string') {
          const { projectId } = payload;
          subscribedProjects.add(projectId);

          if (!projectSubscribers.has(projectId)) {
            projectSubscribers.set(projectId, new Set());
          }
          projectSubscribers.get(projectId)?.add(socket);

          socket.send(
            JSON.stringify({
              type: 'subscribed',
              projectId,
              timestamp: new Date().toISOString(),
            })
          );
        } else if (payload.type === 'unsubscribe' && typeof payload.projectId === 'string') {
          const { projectId } = payload;
          subscribedProjects.delete(projectId);
          projectSubscribers.get(projectId)?.delete(socket);
        }
      } catch (err: unknown) {
        server.log.warn({ err }, 'Malformed WebSocket message received');
      }
    });

    socket.on('close', () => {
      for (const projectId of subscribedProjects) {
        projectSubscribers.get(projectId)?.delete(socket);
        if (projectSubscribers.get(projectId)?.size === 0) {
          projectSubscribers.delete(projectId);
        }
      }
      subscribedProjects.clear();
    });

    socket.on('error', (err: Error) => {
      server.log.warn({ err }, 'WebSocket client error');
    });
  });
});
