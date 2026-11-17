import { ModuleInfo } from '../types';

export const CURRICULUM: ModuleInfo[] = [
  {
    id: 'foundations',
    num: '01',
    title: 'Foundations',
    color: 'sand',
    lessons: [
      { id: 'request-lifecycle', title: 'How a Request Travels', ready: true },
      { id: 'latency-throughput', title: 'Latency & Throughput', ready: true },
      { id: 'napkin-math', title: 'Napkin Math', ready: true }
    ]
  },
  {
    id: 'scaling',
    num: '02',
    title: 'Scaling',
    color: 'green',
    lessons: [
      { id: 'vertical-horizontal', title: 'Vertical vs Horizontal', ready: true },
      { id: 'load-balancing', title: 'Load Balancing', ready: true },
      { id: 'stateless', title: 'Stateless Services', ready: true },
      { id: 'caching', title: 'Caching Strategies', ready: true },
      { id: 'cdn', title: 'Content Delivery (CDN)', ready: true }
    ]
  },
  {
    id: 'data',
    num: '03',
    title: 'Data & Storage',
    color: 'violet',
    lessons: [
      { id: 'sql-nosql', title: 'SQL vs NoSQL', ready: true },
      { id: 'indexes', title: 'B-Trees & Indexes', ready: true },
      { id: 'replication', title: 'Replication & Failover', ready: true },
      { id: 'sharding', title: 'Database Sharding', ready: true },
      { id: 'consistent-hashing', title: 'Consistent Hashing', ready: true },
      { id: 'cap', title: 'CAP & Consistency', ready: true }
    ]
  },
  {
    id: 'communication',
    num: '04',
    title: 'Communication',
    color: 'orange',
    lessons: [
      { id: 'apis', title: 'REST, gRPC & GraphQL', ready: true },
      { id: 'queues', title: 'Message Queues', ready: true },
      { id: 'pubsub', title: 'Pub/Sub & Event Streams', ready: true },
      { id: 'realtime', title: 'Real-time & WebSockets', ready: true }
    ]
  },
  {
    id: 'reliability',
    num: '05',
    title: 'Reliability',
    color: 'blue',
    lessons: [
      { id: 'redundancy', title: 'Redundancy & Failover', ready: true },
      { id: 'rate-limiting', title: 'Rate Limiting', ready: true },
      { id: 'timeouts-retries', title: 'Timeouts & Exponential Backoff', ready: true },
      { id: 'observability', title: 'Metrics, Logs & Traces', ready: true }
    ]
  },
  {
    id: 'architecture',
    num: '06',
    title: 'Architecture',
    color: 'teal',
    lessons: [
      { id: 'microservices', title: 'Monolith vs Microservices', ready: true },
      { id: 'service-discovery', title: 'Service Discovery', ready: true },
      { id: 'sagas', title: 'Sagas & Distributed Tx', ready: true }
    ]
  },
  {
    id: 'security',
    num: '07',
    title: 'Security',
    color: 'rose',
    lessons: [
      { id: 'authentication', title: 'Authentication (OAuth/JWT)', ready: true },
      { id: 'authorization', title: 'Role & Attribute RBAC', ready: true },
      { id: 'encryption', title: 'TLS & Secrets in Transit', ready: true }
    ]
  },
  {
    id: 'whole-systems',
    num: '09',
    title: 'Whole Systems',
    color: 'slate',
    lessons: [
      { id: 'design-url-shortener', title: 'Design TinyURL', ready: true },
      { id: 'design-news-feed', title: 'Design Twitter / News Feed', ready: true },
      { id: 'design-chat', title: 'Design WhatsApp / Chat', ready: true }
    ]
  }
];

export function findLesson(id: string) {
  for (const mod of CURRICULUM) {
    const lesson = mod.lessons.find((l) => l.id === id);
    if (lesson) return { ...lesson, module: mod };
  }
  return null;
}

